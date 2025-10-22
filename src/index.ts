import express from "express";
import cors from "cors";
import cron from "node-cron";
import dotenv from "dotenv";
import path from "path";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { initializeIndexer, indexNewEvents } from "./services/eventListener";
import { logger } from "./utils/logger";
import apiRoutes from "./api/routes";

// Charger le .env depuis le dossier indexer/ (fonctionne en dev et après compilation)
const envPath = path.resolve(__dirname, "../../indexer/.env");
dotenv.config({ path: envPath });
logger.info(`Loading .env from: ${envPath}`);

const app = express();
const PORT = parseInt(process.env.PORT || "3001", 10);
const HOST = process.env.HOST || "0.0.0.0";

// Middleware
app.use(cors());
app.use(express.json());

// Routes API
app.use("/api", apiRoutes);

// Fonction principale
async function main() {
  try {
    logger.info("🚀 Starting RWA Indexer...");

    // Connexion à la base de données
    await connectDatabase();

    // Initialiser l'indexer
    await initializeIndexer();

    // Indexer immédiatement au démarrage
    logger.info("🔄 Running initial indexing...");
    await indexNewEvents();

    // Configurer le cron job (toutes les minutes)
    cron.schedule("* * * * *", async () => {
      logger.info("⏰ Cron job triggered - Indexing new events...");
      try {
        await indexNewEvents();
      } catch (error) {
        logger.error("❌ Cron job error:", error);
      }
    });

    logger.info("✅ Cron job scheduled (every minute)");

    // Démarrer le serveur API
    const HOST = process.env.HOST || "0.0.0.0";
    app.listen(PORT, HOST, () => {
      logger.info(`🌐 API Server running on http://${HOST}:${PORT}`);
      logger.info(`📊 Health check: http://${HOST}:${PORT}/api/health`);
      logger.info(`💱 Swaps API: http://${HOST}:${PORT}/api/swaps`);
      logger.info(`📈 Stats API: http://${HOST}:${PORT}/api/stats`);
    });

  } catch (error) {
    logger.error("❌ Failed to start indexer:", error);
    process.exit(1);
  }
}

// Gestion de l'arrêt propre
process.on("SIGINT", async () => {
  logger.info("\n👋 Shutting down gracefully...");
  await disconnectDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("\n👋 Shutting down gracefully...");
  await disconnectDatabase();
  process.exit(0);
});

// Démarrer l'application
main();