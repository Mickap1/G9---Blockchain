"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const node_cron_1 = __importDefault(require("node-cron"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const database_1 = require("./config/database");
const eventListener_1 = require("./services/eventListener");
const logger_1 = require("./utils/logger");
const routes_1 = __importDefault(require("./api/routes"));
const contracts_1 = require("./config/contracts");
// Charger le .env depuis le dossier indexer/ (fonctionne en dev et après compilation)
const envPath = path_1.default.resolve(__dirname, "../../indexer/.env");
dotenv_1.default.config({ path: envPath });
logger_1.logger.info(`Loading .env from: ${envPath}`);
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT || "3001", 10);
const HOST = process.env.HOST || "0.0.0.0";
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes API
app.use("/api", routes_1.default);
// Fonction principale
async function main() {
    try {
        logger_1.logger.info("🚀 Starting RWA Indexer v2.0 (with correct contract addresses)...");
        // Afficher les adresses des contrats pour debugging
        logger_1.logger.info("📋 Contract Addresses:");
        logger_1.logger.info(`   DEX: ${contracts_1.CONTRACTS.dex}`);
        logger_1.logger.info(`   Fungible Token: ${contracts_1.CONTRACTS.fungibleToken}`);
        logger_1.logger.info(`   NFT Token: ${contracts_1.CONTRACTS.nftToken}`);
        logger_1.logger.info(`   Oracle: ${contracts_1.CONTRACTS.oracle}`);
        logger_1.logger.info(`   KYC Registry: ${contracts_1.CONTRACTS.kycRegistry}`);
        // Connexion à la base de données
        await (0, database_1.connectDatabase)();
        // Initialiser l'indexer
        await (0, eventListener_1.initializeIndexer)();
        // Indexer immédiatement au démarrage
        logger_1.logger.info("🔄 Running initial indexing...");
        await (0, eventListener_1.indexNewEvents)();
        // Configurer le cron job (toutes les minutes)
        node_cron_1.default.schedule("* * * * *", async () => {
            logger_1.logger.info("⏰ Cron job triggered - Indexing new events...");
            try {
                await (0, eventListener_1.indexNewEvents)();
            }
            catch (error) {
                logger_1.logger.error("❌ Cron job error:", error);
            }
        });
        logger_1.logger.info("✅ Cron job scheduled (every minute)");
        // Démarrer le serveur API
        const HOST = process.env.HOST || "0.0.0.0";
        app.listen(PORT, HOST, () => {
            logger_1.logger.info(`🌐 API Server running on http://${HOST}:${PORT}`);
            logger_1.logger.info(`📊 Health check: http://${HOST}:${PORT}/api/health`);
            logger_1.logger.info(`💱 Swaps API: http://${HOST}:${PORT}/api/swaps`);
            logger_1.logger.info(`📈 Stats API: http://${HOST}:${PORT}/api/stats`);
        });
    }
    catch (error) {
        logger_1.logger.error("❌ Failed to start indexer:", error);
        process.exit(1);
    }
}
// Gestion de l'arrêt propre
process.on("SIGINT", async () => {
    logger_1.logger.info("\n👋 Shutting down gracefully...");
    await (0, database_1.disconnectDatabase)();
    process.exit(0);
});
process.on("SIGTERM", async () => {
    logger_1.logger.info("\n👋 Shutting down gracefully...");
    await (0, database_1.disconnectDatabase)();
    process.exit(0);
});
// Démarrer l'application
main();
//# sourceMappingURL=index.js.map