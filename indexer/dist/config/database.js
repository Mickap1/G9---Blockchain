"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
exports.getDatabase = getDatabase;
const mongodb_1 = require("mongodb");
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "rwa_indexer";
let db = null;
let client = null;
async function connectDatabase() {
    if (db)
        return db;
    try {
        client = new mongodb_1.MongoClient(MONGODB_URI);
        await client.connect();
        db = client.db(DB_NAME);
        console.log("✅ Connected to MongoDB");
        // Créer les indexes pour optimiser les requêtes
        await createIndexes();
        return db;
    }
    catch (error) {
        console.error("❌ MongoDB connection error:", error);
        throw error;
    }
}
async function createIndexes() {
    if (!db)
        return;
    // Index pour les swaps
    await db.collection("swaps").createIndex({ timestamp: -1 });
    await db.collection("swaps").createIndex({ buyer: 1 });
    await db.collection("swaps").createIndex({ seller: 1 });
    // Index pour les transferts
    await db.collection("transfers").createIndex({ timestamp: -1 });
    await db.collection("transfers").createIndex({ from: 1 });
    await db.collection("transfers").createIndex({ to: 1 });
    // Index pour les prix
    await db.collection("prices").createIndex({ timestamp: -1 });
    await db.collection("prices").createIndex({ tokenAddress: 1, tokenId: 1 });
    console.log("✅ Database indexes created");
}
async function disconnectDatabase() {
    if (client) {
        await client.close();
        console.log("👋 Disconnected from MongoDB");
    }
}
function getDatabase() {
    if (!db) {
        throw new Error("Database not connected. Call connectDatabase() first.");
    }
    return db;
}
//# sourceMappingURL=database.js.map