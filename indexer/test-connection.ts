import dotenv from "dotenv";
import path from "path";
import { connectDatabase } from "../src/config/database";

// Charger le .env
dotenv.config({ path: path.join(__dirname, ".env") });

console.log("🔍 Testing MongoDB connection...");
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✓ Found" : "✗ Missing");
if (process.env.MONGODB_URI) {
  console.log("   Value:", process.env.MONGODB_URI.substring(0, 50) + "...");
}
console.log("DB_NAME:", process.env.DB_NAME || "rwa_indexer (default)");

async function test() {
  try {
    console.log("\n📡 Connecting to MongoDB...");
    const db = await connectDatabase();
    console.log("✅ Connected successfully!");
    console.log("📊 Database name:", db.databaseName);
    
    // Test une opération simple
    const collections = await db.listCollections().toArray();
    console.log(`📁 Collections found: ${collections.length}`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Connection failed:");
    console.error(error);
    process.exit(1);
  }
}

test();
