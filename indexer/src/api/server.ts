import express from "express";
import cors from "cors";
import { db } from "../db/sqlite";

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Get KYC events for a user
app.get("/api/kyc/:address", (req, res) => {
  const events = db.prepare(`
    SELECT * FROM kyc_events 
    WHERE user_address = ? 
    ORDER BY timestamp DESC
  `).all(req.params.address);
  
  res.json(events);
});

// Get token transfers for a user
app.get("/api/transfers/:address", (req, res) => {
  const transfers = db.prepare(`
    SELECT * FROM token_transfers 
    WHERE from_address = ? OR to_address = ?
    ORDER BY timestamp DESC
    LIMIT 100
  `).all(req.params.address, req.params.address);
  
  res.json(transfers);
});

// Get DEX trades for a user
app.get("/api/trades/:address", (req, res) => {
  const trades = db.prepare(`
    SELECT * FROM dex_trades 
    WHERE user_address = ?
    ORDER BY timestamp DESC
    LIMIT 100
  `).all(req.params.address);
  
  res.json(trades);
});

// Get all DEX trades (recent)
app.get("/api/trades", (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const trades = db.prepare(`
    SELECT * FROM dex_trades 
    ORDER BY timestamp DESC
    LIMIT ?
  `).all(limit);
  
  res.json(trades);
});

// Get oracle price history
app.get("/api/prices/:tokenAddress/:tokenId", (req, res) => {
  const prices = db.prepare(`
    SELECT * FROM oracle_prices 
    WHERE token_address = ? AND token_id = ?
    ORDER BY timestamp DESC
    LIMIT 100
  `).all(req.params.tokenAddress, parseInt(req.params.tokenId));
  
  res.json(prices);
});

// Get latest price
app.get("/api/prices/:tokenAddress/:tokenId/latest", (req, res) => {
  const price = db.prepare(`
    SELECT * FROM oracle_prices 
    WHERE token_address = ? AND token_id = ?
    ORDER BY timestamp DESC
    LIMIT 1
  `).get(req.params.tokenAddress, parseInt(req.params.tokenId));
  
  res.json(price || { error: "No price data found" });
});

// Statistics
app.get("/api/stats", (req, res) => {
  const stats = {
    totalKYCEvents: db.prepare("SELECT COUNT(*) as count FROM kyc_events").get(),
    totalTransfers: db.prepare("SELECT COUNT(*) as count FROM token_transfers").get(),
    totalTrades: db.prepare("SELECT COUNT(*) as count FROM dex_trades").get(),
    totalPriceUpdates: db.prepare("SELECT COUNT(*) as count FROM oracle_prices").get(),
    lastIndexedBlock: db.prepare("SELECT last_indexed_block FROM indexer_state WHERE id = 1").get(),
  };
  
  res.json(stats);
});

export function startServer(port: number = 3001) {
  app.listen(port, () => {
    console.log(`🚀 API Server running on http://localhost:${port}`);
  });
}