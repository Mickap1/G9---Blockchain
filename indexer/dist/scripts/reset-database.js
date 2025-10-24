"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
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
        const envPath = path_1.default.resolve(__dirname, "../../../indexer/.env");
        dotenv_1.default.config({ path: envPath });
        logger_1.logger.info(`Loading .env from: ${envPath}`);
        logger_1.logger.info("🗑️  Connecting to database...");
        await (0, database_1.connectDatabase)();
        const db = (0, database_1.getDatabase)();
        logger_1.logger.info("🧹 Dropping all collections...");
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
                logger_1.logger.info(`✅ Dropped collection: ${collectionName}`);
            }
            catch (error) {
                if (error.message.includes("ns not found")) {
                    logger_1.logger.info(`⚠️  Collection ${collectionName} doesn't exist, skipping`);
                }
                else {
                    throw error;
                }
            }
        }
        logger_1.logger.info("✅ Database reset complete!");
        logger_1.logger.info("📊 The indexer will re-index all events from the last 1000 blocks on next restart.");
        await (0, database_1.disconnectDatabase)();
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error("❌ Error resetting database:", error);
        process.exit(1);
    }
}
resetDatabase();
//# sourceMappingURL=reset-database.js.map