import dotenv from "dotenv";
import path from "path";
import { connectDatabase, disconnectDatabase, getDatabase } from "../config/database";
import { logger } from "../utils/logger";

/**
 * Script pour nettoyer complètement la base de données MongoDB
 * et forcer une réindexation depuis le début.
 * 
 * Usage:
 *   npx ts-node src/scripts/reset-database.ts
 */

async function resetDatabase() {
  try {
    // Charger le .env depuis le dossier indexer/
    const envPath = path.resolve(__dirname, "../../../indexer/.env");
    dotenv.config({ path: envPath });
    logger.info(`Loading .env from: ${envPath}`);

    logger.info("🗑️  Connecting to database...");
    await connectDatabase();
    
    const db = getDatabase();
    
    logger.info("🧹 Dropping all collections...");
    
    // Liste de toutes les collections à supprimer
    const collections = [
      "swaps",
      "token_transfers",
      "nft_mints",
      "nft_valuations",
      "transfers",
      "oracle_updates",
      "metadata"
    ];
    
    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).drop();
        logger.info(`✅ Dropped collection: ${collectionName}`);
      } catch (error: any) {
        if (error.message.includes("ns not found")) {
          logger.info(`⚠️  Collection ${collectionName} doesn't exist, skipping`);
        } else {
          throw error;
        }
      }
    }
    
    logger.info("✅ Database reset complete!");
    logger.info("📊 The indexer will re-index all events from the last 1000 blocks on next restart.");
    
    await disconnectDatabase();
    process.exit(0);
    
  } catch (error) {
    logger.error("❌ Error resetting database:", error);
    process.exit(1);
  }
}

resetDatabase();
