import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(__dirname, "../../data/indexer.db");
export const db = new Database(dbPath);

// Créer les tables
export function initDatabase() {
  // Table pour les événements KYC
  db.exec(`
    CREATE TABLE IF NOT EXISTS kyc_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      user_address TEXT NOT NULL,
      data TEXT,
      block_number INTEGER,
      transaction_hash TEXT,
      timestamp INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table pour les transferts de tokens
  db.exec(`
    CREATE TABLE IF NOT EXISTS token_transfers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_address TEXT NOT NULL,
      to_address TEXT NOT NULL,
      amount TEXT NOT NULL,
      block_number INTEGER,
      transaction_hash TEXT,
      timestamp INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table pour les trades DEX
  db.exec(`
    CREATE TABLE IF NOT EXISTS dex_trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trade_type TEXT NOT NULL,
      user_address TEXT NOT NULL,
      token_amount TEXT,
      eth_amount TEXT,
      block_number INTEGER,
      transaction_hash TEXT,
      timestamp INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table pour les changements de prix Oracle
  db.exec(`
    CREATE TABLE IF NOT EXISTS oracle_prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token_address TEXT NOT NULL,
      token_id INTEGER,
      old_price TEXT,
      new_price TEXT,
      block_number INTEGER,
      transaction_hash TEXT,
      timestamp INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Table pour tracker le dernier bloc indexé
  db.exec(`
    CREATE TABLE IF NOT EXISTS indexer_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      last_indexed_block INTEGER NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✅ Database initialized");
}

// Obtenir le dernier bloc indexé
export function getLastIndexedBlock(): number {
  const row = db.prepare("SELECT last_indexed_block FROM indexer_state WHERE id = 1").get() as { last_indexed_block: number } | undefined;
  return row?.last_indexed_block || 0;
}

// Mettre à jour le dernier bloc indexé
export function updateLastIndexedBlock(blockNumber: number) {
  db.prepare(`
    INSERT INTO indexer_state (id, last_indexed_block, updated_at)
    VALUES (1, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      last_indexed_block = excluded.last_indexed_block,
      updated_at = datetime('now')
  `).run(blockNumber);
}