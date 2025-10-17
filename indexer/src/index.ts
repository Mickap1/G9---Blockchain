import { initDatabase, getLastIndexedBlock } from "./db/sqlite";
import { startEventListeners } from "./indexer/eventListeners";
import { startServer } from "./api/server";
import { provider } from "./config/contracts";

async function main() {
  console.log("🚀 Starting Indexer...\n");

  // 1. Initialize database
  initDatabase();

  // 2. Get last indexed block
  const lastBlock = getLastIndexedBlock();
  const currentBlock = await provider.getBlockNumber();
  
  console.log(`📊 Last indexed block: ${lastBlock}`);
  console.log(`📊 Current block: ${currentBlock}`);
  console.log(`📊 Blocks behind: ${currentBlock - lastBlock}\n`);

  // 3. Start event listeners
  await startEventListeners(lastBlock || currentBlock - 1000);

  // 4. Start API server
  startServer(3001);

  console.log("\n✅ Indexer fully operational!");
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});