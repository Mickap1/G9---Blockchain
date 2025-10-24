"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const router = express_1.default.Router();
// GET /api/swaps - Récupérer tous les swaps
router.get("/swaps", async (req, res) => {
    try {
        const db = (0, database_1.getDatabase)();
        const limit = parseInt(req.query.limit) || 50;
        const skip = parseInt(req.query.skip) || 0;
        const swaps = await db
            .collection("swaps")
            .find()
            .sort({ timestamp: -1 })
            .limit(limit)
            .skip(skip)
            .toArray();
        const total = await db.collection("swaps").countDocuments();
        res.json({
            success: true,
            data: swaps,
            pagination: {
                total,
                limit,
                skip,
                hasMore: skip + limit < total,
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch swaps" });
    }
});
// GET /api/swaps/:address - Swaps d'une adresse
router.get("/swaps/:address", async (req, res) => {
    try {
        const db = (0, database_1.getDatabase)();
        const address = req.params.address.toLowerCase();
        const swaps = await db
            .collection("swaps")
            .find({
            $or: [
                { buyer: address },
                { seller: address },
            ],
        })
            .sort({ timestamp: -1 })
            .limit(100)
            .toArray();
        res.json({ success: true, data: swaps });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch user swaps" });
    }
});
// GET /api/transfers - Tous les transferts de tokens
router.get("/transfers", async (req, res) => {
    try {
        const db = (0, database_1.getDatabase)();
        const limit = parseInt(req.query.limit) || 50;
        const transfers = await db
            .collection("transfers")
            .find()
            .sort({ blockNumber: -1 })
            .limit(limit)
            .toArray();
        res.json({ success: true, data: transfers });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch transfers" });
    }
});
// GET /api/nfts - Tous les NFTs mintés
router.get("/nfts", async (req, res) => {
    try {
        const db = (0, database_1.getDatabase)();
        const nfts = await db
            .collection("nft_mints")
            .find()
            .sort({ timestamp: -1 })
            .toArray();
        res.json({ success: true, data: nfts });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch NFTs" });
    }
});
// GET /api/prices - Historique des prix
router.get("/prices", async (req, res) => {
    try {
        const db = (0, database_1.getDatabase)();
        const tokenAddress = req.query.tokenAddress;
        const tokenId = req.query.tokenId ? parseInt(req.query.tokenId) : undefined;
        const query = {};
        if (tokenAddress)
            query.tokenAddress = tokenAddress.toLowerCase();
        if (tokenId !== undefined)
            query.tokenId = tokenId;
        const prices = await db
            .collection("prices")
            .find(query)
            .sort({ timestamp: -1 })
            .limit(100)
            .toArray();
        res.json({ success: true, data: prices });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch prices" });
    }
});
// GET /api/stats - Statistiques globales
router.get("/stats", async (req, res) => {
    try {
        const db = (0, database_1.getDatabase)();
        const [totalSwaps, totalTransfers, totalNFTs, totalPriceUpdates,] = await Promise.all([
            db.collection("swaps").countDocuments(),
            db.collection("transfers").countDocuments(),
            db.collection("nft_mints").countDocuments(),
            db.collection("prices").countDocuments(),
        ]);
        // Volume total de trading (ETH)
        const swaps = await db.collection("swaps").find().toArray();
        let totalVolumeETH = 0n;
        for (const swap of swaps) {
            if (swap.type === "buy") {
                totalVolumeETH += BigInt(swap.ethIn);
            }
            else {
                totalVolumeETH += BigInt(swap.ethOut);
            }
        }
        res.json({
            success: true,
            data: {
                totalSwaps,
                totalTransfers,
                totalNFTs,
                totalPriceUpdates,
                totalVolumeETH: totalVolumeETH.toString(),
            },
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch stats" });
    }
});
// GET /api/liquidity - Historique de liquidité
router.get("/liquidity", async (req, res) => {
    try {
        const db = (0, database_1.getDatabase)();
        const liquidity = await db
            .collection("liquidity")
            .find()
            .sort({ timestamp: -1 })
            .limit(100)
            .toArray();
        res.json({ success: true, data: liquidity });
    }
    catch (error) {
        res.status(500).json({ success: false, error: "Failed to fetch liquidity" });
    }
});
// GET /api/health - Health check
router.get("/health", (req, res) => {
    res.json({ success: true, status: "healthy", timestamp: new Date() });
});
exports.default = router;
