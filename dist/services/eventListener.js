"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeIndexer = initializeIndexer;
exports.indexNewEvents = indexNewEvents;
const ethers_1 = require("ethers");
const contracts_1 = require("../config/contracts");
const database_1 = require("../config/database");
const logger_1 = require("../utils/logger");
// Stockage du dernier bloc indexé
let lastIndexedBlock = 0;
async function initializeIndexer() {
    const db = (0, database_1.getDatabase)();
    // Récupérer le dernier bloc indexé depuis la DB
    const lastBlock = await db.collection("metadata").findOne({ key: "lastIndexedBlock" });
    if (lastBlock) {
        lastIndexedBlock = lastBlock.value;
        logger_1.logger.info(`📍 Resuming from block ${lastIndexedBlock}`);
    }
    else {
        // Commencer il y a 1000 blocs (environ 3h30 sur Sepolia)
        const currentBlock = await contracts_1.provider.getBlockNumber();
        lastIndexedBlock = currentBlock - 1000;
        logger_1.logger.info(`🆕 Starting fresh from block ${lastIndexedBlock}`);
    }
}
async function indexNewEvents() {
    try {
        const currentBlock = await contracts_1.provider.getBlockNumber();
        if (currentBlock <= lastIndexedBlock) {
            logger_1.logger.info(`⏸️  No new blocks. Current: ${currentBlock}, Last indexed: ${lastIndexedBlock}`);
            return;
        }
        const fromBlock = lastIndexedBlock + 1;
        const toBlock = currentBlock;
        logger_1.logger.info(`🔍 Indexing blocks ${fromBlock} to ${toBlock}`);
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
        logger_1.logger.info(`✅ Indexed blocks ${fromBlock} to ${toBlock}`);
    }
    catch (error) {
        logger_1.logger.error("❌ Error indexing events:", error);
        throw error;
    }
}
async function indexDEXEvents(range) {
    const db = (0, database_1.getDatabase)();
    // TokensPurchased events
    const purchaseFilter = contracts_1.contracts.dex.filters.TokensPurchased();
    const purchaseEvents = await contracts_1.contracts.dex.queryFilter(purchaseFilter, range.fromBlock, range.toBlock);
    for (const event of purchaseEvents) {
        if (!(event instanceof ethers_1.EventLog))
            continue;
        const args = event.args;
        // 🎉 LOG DÉTAILLÉ DE L'ÉVÉNEMENT
        logger_1.logger.info(`🔔 NOUVEAU SWAP DÉTECTÉ !`);
        logger_1.logger.info(`   Type: ACHAT (BUY)`);
        logger_1.logger.info(`   Acheteur: ${args.buyer}`);
        logger_1.logger.info(`   ETH envoyé: ${ethers_1.ethers.formatEther(args.ethIn)} ETH`);
        logger_1.logger.info(`   Tokens reçus: ${ethers_1.ethers.formatEther(args.tokensOut)} tokens`);
        logger_1.logger.info(`   Bloc: ${event.blockNumber}`);
        logger_1.logger.info(`   TX: https://sepolia.etherscan.io/tx/${event.transactionHash}`);
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
    const sellFilter = contracts_1.contracts.dex.filters.TokensSold();
    const sellEvents = await contracts_1.contracts.dex.queryFilter(sellFilter, range.fromBlock, range.toBlock);
    for (const event of sellEvents) {
        if (!(event instanceof ethers_1.EventLog))
            continue;
        const args = event.args;
        // 🎉 LOG DÉTAILLÉ DE L'ÉVÉNEMENT
        logger_1.logger.info(`🔔 NOUVEAU SWAP DÉTECTÉ !`);
        logger_1.logger.info(`   Type: VENTE (SELL)`);
        logger_1.logger.info(`   Vendeur: ${args.seller}`);
        logger_1.logger.info(`   Tokens vendus: ${ethers_1.ethers.formatEther(args.tokensIn)} tokens`);
        logger_1.logger.info(`   ETH reçu: ${ethers_1.ethers.formatEther(args.ethOut)} ETH`);
        logger_1.logger.info(`   Bloc: ${event.blockNumber}`);
        logger_1.logger.info(`   TX: https://sepolia.etherscan.io/tx/${event.transactionHash}`);
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
    const addLiquidityFilter = contracts_1.contracts.dex.filters.LiquidityAdded();
    const addLiquidityEvents = await contracts_1.contracts.dex.queryFilter(addLiquidityFilter, range.fromBlock, range.toBlock);
    for (const event of addLiquidityEvents) {
        if (!(event instanceof ethers_1.EventLog))
            continue;
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
    logger_1.logger.info(`📊 Indexed ${purchaseEvents.length} buys, ${sellEvents.length} sells, ${addLiquidityEvents.length} liquidity adds`);
}
async function indexTokenTransfers(range) {
    const db = (0, database_1.getDatabase)();
    const filter = contracts_1.contracts.fungibleToken.filters.Transfer();
    const events = await contracts_1.contracts.fungibleToken.queryFilter(filter, range.fromBlock, range.toBlock);
    for (const event of events) {
        if (!(event instanceof ethers_1.EventLog))
            continue;
        const args = event.args;
        // Ignorer les mint (from = 0x0) et burn (to = 0x0) déjà trackés ailleurs
        if (args.from === ethers_1.ethers.ZeroAddress || args.to === ethers_1.ethers.ZeroAddress) {
            continue;
        }
        // 🎉 LOG DÉTAILLÉ DU TRANSFERT
        logger_1.logger.info(`🔔 NOUVEAU TRANSFERT DE TOKENS DÉTECTÉ !`);
        logger_1.logger.info(`   De: ${args.from}`);
        logger_1.logger.info(`   Vers: ${args.to}`);
        logger_1.logger.info(`   Montant: ${ethers_1.ethers.formatEther(args.value)} tokens`);
        logger_1.logger.info(`   Bloc: ${event.blockNumber}`);
        logger_1.logger.info(`   TX: https://sepolia.etherscan.io/tx/${event.transactionHash}`);
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
    logger_1.logger.info(`💸 Indexed ${events.length} token transfers`);
}
async function indexNFTEvents(range) {
    const db = (0, database_1.getDatabase)();
    // AssetMinted events
    const mintFilter = contracts_1.contracts.nftToken.filters.AssetMinted();
    const mintEvents = await contracts_1.contracts.nftToken.queryFilter(mintFilter, range.fromBlock, range.toBlock);
    for (const event of mintEvents) {
        if (!(event instanceof ethers_1.EventLog))
            continue;
        const args = event.args;
        // 🎉 LOG DÉTAILLÉ DU MINT NFT
        logger_1.logger.info(`🔔 NOUVEAU NFT MINTÉ !`);
        logger_1.logger.info(`   Token ID: #${args.tokenId}`);
        logger_1.logger.info(`   Owner: ${args.owner}`);
        logger_1.logger.info(`   Nom: ${args.name}`);
        logger_1.logger.info(`   Valuation: ${ethers_1.ethers.formatEther(args.valuation)} ETH`);
        logger_1.logger.info(`   Bloc: ${event.blockNumber}`);
        logger_1.logger.info(`   TX: https://sepolia.etherscan.io/tx/${event.transactionHash}`);
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
    const valuationFilter = contracts_1.contracts.nftToken.filters.AssetValuationUpdated();
    const valuationEvents = await contracts_1.contracts.nftToken.queryFilter(valuationFilter, range.fromBlock, range.toBlock);
    for (const event of valuationEvents) {
        if (!(event instanceof ethers_1.EventLog))
            continue;
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
    const transferFilter = contracts_1.contracts.nftToken.filters.Transfer();
    const transferEvents = await contracts_1.contracts.nftToken.queryFilter(transferFilter, range.fromBlock, range.toBlock);
    for (const event of transferEvents) {
        if (!(event instanceof ethers_1.EventLog))
            continue;
        const args = event.args;
        // Ignorer mint et burn
        if (args.from === ethers_1.ethers.ZeroAddress || args.to === ethers_1.ethers.ZeroAddress) {
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
    logger_1.logger.info(`💎 Indexed ${mintEvents.length} NFT mints, ${valuationEvents.length} valuations, ${transferEvents.length} transfers`);
}
async function indexOracleEvents(range) {
    const db = (0, database_1.getDatabase)();
    const filter = contracts_1.contracts.oracle.filters.PriceUpdated();
    const events = await contracts_1.contracts.oracle.queryFilter(filter, range.fromBlock, range.toBlock);
    for (const event of events) {
        if (!(event instanceof ethers_1.EventLog))
            continue;
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
    logger_1.logger.info(`📈 Indexed ${events.length} price updates`);
}
async function updateLastIndexedBlock(blockNumber) {
    const db = (0, database_1.getDatabase)();
    await db.collection("metadata").updateOne({ key: "lastIndexedBlock" }, { $set: { key: "lastIndexedBlock", value: blockNumber, updatedAt: new Date() } }, { upsert: true });
}
