import { ethers, EventLog } from "ethers";
import { contracts, provider } from "../config/contracts";
import { getDatabase } from "../config/database";
import { logger } from "../utils/logger";

interface BlockRange {
  fromBlock: number;
  toBlock: number;
}

// Stockage du dernier bloc indexé
let lastIndexedBlock: number = 0;

export async function initializeIndexer(): Promise<void> {
  const db = getDatabase();
  
  // Récupérer le dernier bloc indexé depuis la DB
  const lastBlock = await db.collection("metadata").findOne({ key: "lastIndexedBlock" });
  
  if (lastBlock) {
    lastIndexedBlock = lastBlock.value;
    logger.info(`📍 Resuming from block ${lastIndexedBlock}`);
  } else {
    // Commencer il y a 1000 blocs (environ 3h30 sur Sepolia)
    const currentBlock = await provider.getBlockNumber();
    lastIndexedBlock = currentBlock - 1000;
    logger.info(`🆕 Starting fresh from block ${lastIndexedBlock}`);
  }
}

export async function indexNewEvents(): Promise<void> {
  try {
    const currentBlock = await provider.getBlockNumber();
    
    if (currentBlock <= lastIndexedBlock) {
      logger.info(`⏸️  No new blocks. Current: ${currentBlock}, Last indexed: ${lastIndexedBlock}`);
      return;
    }

    const fromBlock = lastIndexedBlock + 1;
    const toBlock = currentBlock;
    
    logger.info(`🔍 Indexing blocks ${fromBlock} to ${toBlock}`);

    // Indexer tous les événements en parallèle
    await Promise.all([
      indexDEXEvents({ fromBlock, toBlock }),
      indexTokenTransfers({ fromBlock, toBlock }),
      indexNFTEvents({ fromBlock, toBlock }),
      indexOracleEvents({ fromBlock, toBlock }),
    ]);

    // Mettre à jour le dernier bloc indexé
    await updateLastIndexedBlock(toBlock);
    lastIndexedBlock = toBlock;

    logger.info(`✅ Indexed blocks ${fromBlock} to ${toBlock}`);
  } catch (error) {
    logger.error("❌ Error indexing events:", error);
    throw error;
  }
}

async function indexDEXEvents(range: BlockRange): Promise<void> {
  const db = getDatabase();
  
  // TokensPurchased events
  const purchaseFilter = contracts.dex.filters.TokensPurchased();
  const purchaseEvents = await contracts.dex.queryFilter(purchaseFilter, range.fromBlock, range.toBlock);
  
  for (const event of purchaseEvents) {
    if (!(event instanceof EventLog)) continue;
    const args = event.args;
    
    // 🎉 LOG DÉTAILLÉ DE L'ÉVÉNEMENT
    logger.info(`🔔 NOUVEAU SWAP DÉTECTÉ !`);
    logger.info(`   Type: ACHAT (BUY)`);
    logger.info(`   Acheteur: ${args.buyer}`);
    logger.info(`   ETH envoyé: ${ethers.formatEther(args.ethIn)} ETH`);
    logger.info(`   Tokens reçus: ${ethers.formatEther(args.tokensOut)} tokens`);
    logger.info(`   Bloc: ${event.blockNumber}`);
    logger.info(`   TX: https://sepolia.etherscan.io/tx/${event.transactionHash}`);
    
    await db.collection("swaps").insertOne({
      type: "buy",
      buyer: args.buyer,
      ethIn: args.ethIn.toString(),
      tokensOut: args.tokensOut.toString(),
      timestamp: Number(args.timestamp),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      createdAt: new Date(),
    });
  }
  
  // TokensSold events
  const sellFilter = contracts.dex.filters.TokensSold();
  const sellEvents = await contracts.dex.queryFilter(sellFilter, range.fromBlock, range.toBlock);
  
  for (const event of sellEvents) {
    if (!(event instanceof EventLog)) continue;
    const args = event.args;
    
    // 🎉 LOG DÉTAILLÉ DE L'ÉVÉNEMENT
    logger.info(`🔔 NOUVEAU SWAP DÉTECTÉ !`);
    logger.info(`   Type: VENTE (SELL)`);
    logger.info(`   Vendeur: ${args.seller}`);
    logger.info(`   Tokens vendus: ${ethers.formatEther(args.tokensIn)} tokens`);
    logger.info(`   ETH reçu: ${ethers.formatEther(args.ethOut)} ETH`);
    logger.info(`   Bloc: ${event.blockNumber}`);
    logger.info(`   TX: https://sepolia.etherscan.io/tx/${event.transactionHash}`);
    
    await db.collection("swaps").insertOne({
      type: "sell",
      seller: args.seller,
      tokensIn: args.tokensIn.toString(),
      ethOut: args.ethOut.toString(),
      timestamp: Number(args.timestamp),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      createdAt: new Date(),
    });
  }
  
  // LiquidityAdded events
  const addLiquidityFilter = contracts.dex.filters.LiquidityAdded();
  const addLiquidityEvents = await contracts.dex.queryFilter(addLiquidityFilter, range.fromBlock, range.toBlock);
  
  for (const event of addLiquidityEvents) {
    if (!(event instanceof EventLog)) continue;
    const args = event.args;
    await db.collection("liquidity").insertOne({
      type: "add",
      provider: args.provider,
      tokenAmount: args.tokenAmount.toString(),
      ethAmount: args.ethAmount.toString(),
      liquidityMinted: args.liquidityMinted.toString(),
      timestamp: Number(args.timestamp),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      createdAt: new Date(),
    });
  }

  logger.info(`📊 Indexed ${purchaseEvents.length} buys, ${sellEvents.length} sells, ${addLiquidityEvents.length} liquidity adds`);
}

async function indexTokenTransfers(range: BlockRange): Promise<void> {
  const db = getDatabase();
  
  const filter = contracts.fungibleToken.filters.Transfer();
  const events = await contracts.fungibleToken.queryFilter(filter, range.fromBlock, range.toBlock);
  
  for (const event of events) {
    if (!(event instanceof EventLog)) continue;
    const args = event.args;
    
    // Ignorer les mint (from = 0x0) et burn (to = 0x0) déjà trackés ailleurs
    if (args.from === ethers.ZeroAddress || args.to === ethers.ZeroAddress) {
      continue;
    }
    
    // 🎉 LOG DÉTAILLÉ DU TRANSFERT
    logger.info(`🔔 NOUVEAU TRANSFERT DE TOKENS DÉTECTÉ !`);
    logger.info(`   De: ${args.from}`);
    logger.info(`   Vers: ${args.to}`);
    logger.info(`   Montant: ${ethers.formatEther(args.value)} tokens`);
    logger.info(`   Bloc: ${event.blockNumber}`);
    logger.info(`   TX: https://sepolia.etherscan.io/tx/${event.transactionHash}`);
    
    await db.collection("transfers").insertOne({
      tokenType: "fungible",
      from: args.from,
      to: args.to,
      value: args.value.toString(),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      createdAt: new Date(),
    });
  }
  
  logger.info(`💸 Indexed ${events.length} token transfers`);
}

async function indexNFTEvents(range: BlockRange): Promise<void> {
  const db = getDatabase();
  
  // AssetMinted events
  const mintFilter = contracts.nftToken.filters.AssetMinted();
  const mintEvents = await contracts.nftToken.queryFilter(mintFilter, range.fromBlock, range.toBlock);
  
  for (const event of mintEvents) {
    if (!(event instanceof EventLog)) continue;
    const args = event.args;
    
    // 🎉 LOG DÉTAILLÉ DU MINT NFT
    logger.info(`🔔 NOUVEAU NFT MINTÉ !`);
    logger.info(`   Token ID: #${args.tokenId}`);
    logger.info(`   Owner: ${args.owner}`);
    logger.info(`   Nom: ${args.name}`);
    logger.info(`   Valuation: ${ethers.formatEther(args.valuation)} ETH`);
    logger.info(`   Bloc: ${event.blockNumber}`);
    logger.info(`   TX: https://sepolia.etherscan.io/tx/${event.transactionHash}`);
    
    await db.collection("nft_mints").insertOne({
      tokenId: Number(args.tokenId),
      owner: args.owner,
      name: args.name,
      valuation: args.valuation.toString(),
      timestamp: Number(args.timestamp),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      createdAt: new Date(),
    });
  }
  
  // AssetValuationUpdated events
  const valuationFilter = contracts.nftToken.filters.AssetValuationUpdated();
  const valuationEvents = await contracts.nftToken.queryFilter(valuationFilter, range.fromBlock, range.toBlock);
  
  for (const event of valuationEvents) {
    if (!(event instanceof EventLog)) continue;
    const args = event.args;
    await db.collection("nft_valuations").insertOne({
      tokenId: Number(args.tokenId),
      newValuation: args.newValuation.toString(),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      createdAt: new Date(),
    });
  }
  
  // NFT Transfers
  const transferFilter = contracts.nftToken.filters.Transfer();
  const transferEvents = await contracts.nftToken.queryFilter(transferFilter, range.fromBlock, range.toBlock);
  
  for (const event of transferEvents) {
    if (!(event instanceof EventLog)) continue;
    const args = event.args;
    
    // Ignorer mint et burn
    if (args.from === ethers.ZeroAddress || args.to === ethers.ZeroAddress) {
      continue;
    }
    
    await db.collection("transfers").insertOne({
      tokenType: "nft",
      from: args.from,
      to: args.to,
      tokenId: Number(args.tokenId),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      createdAt: new Date(),
    });
  }
  
  logger.info(`💎 Indexed ${mintEvents.length} NFT mints, ${valuationEvents.length} valuations, ${transferEvents.length} transfers`);
}

async function indexOracleEvents(range: BlockRange): Promise<void> {
  const db = getDatabase();
  
  const filter = contracts.oracle.filters.PriceUpdated();
  const events = await contracts.oracle.queryFilter(filter, range.fromBlock, range.toBlock);
  
  for (const event of events) {
    if (!(event instanceof EventLog)) continue;
    const args = event.args;
    await db.collection("prices").insertOne({
      tokenAddress: args.tokenAddress,
      tokenId: Number(args.tokenId),
      oldPrice: args.oldPrice.toString(),
      newPrice: args.newPrice.toString(),
      timestamp: Number(args.timestamp),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      createdAt: new Date(),
    });
  }
  
  logger.info(`📈 Indexed ${events.length} price updates`);
}

async function updateLastIndexedBlock(blockNumber: number): Promise<void> {
  const db = getDatabase();
  await db.collection("metadata").updateOne(
    { key: "lastIndexedBlock" },
    { $set: { key: "lastIndexedBlock", value: blockNumber, updatedAt: new Date() } },
    { upsert: true }
  );
}