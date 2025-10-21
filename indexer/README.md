# 🔗 RWA Indexer - Blockchain Event Indexer

Real-time blockchain indexer for tokenized Real-World Assets (RWA). Automatically syncs on-chain events to MongoDB every minute.

## 📋 Overview

This indexer monitors Sepolia testnet for events from:
- **DEX (SimpleDEX)**: Token swaps and liquidity operations
- **Fungible Tokens**: ERC20 transfers
- **NFT Tokens**: Asset minting, valuations, and transfers  
- **Oracle**: Price updates

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Sepolia RPC URL (Infura, Alchemy, or public node)

### Installation

```bash
cd indexer
npm install
```

### Configuration

Create a `.env` file in the `indexer/` directory:

```bash
# Blockchain
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=rwa_indexer

# API Server
PORT=3001

# Logging
LOG_LEVEL=info
```

### Run

```bash
# Development mode (with hot-reload)
npm run dev

# Production mode
npm run build
npm start
```

## 📊 API Endpoints

Once running, the API is available at `http://localhost:3001`:

### Health Check
```http
GET /api/health
```
Returns server status and timestamp.

### Swaps
```http
GET /api/swaps?limit=50&skip=0
```
Returns all token swaps (buys/sells) with pagination.

```http
GET /api/swaps/:address
```
Returns swaps for a specific address.

### Transfers
```http
GET /api/transfers?limit=50
```
Returns all token transfers (fungible & NFT).

### NFTs
```http
GET /api/nfts
```
Returns all minted NFT assets.

### Prices
```http
GET /api/prices?limit=100
```
Returns price update history from Oracle.

### Statistics
```http
GET /api/stats
```
Returns aggregated statistics (total swaps, volume, etc.).

## 🔄 How it Works

1. **On Startup**: Connects to MongoDB and retrieves the last indexed block
2. **Initial Sync**: Indexes last 1000 blocks to catch up
3. **Cron Job**: Runs every minute to index new blocks
4. **Event Processing**: 
   - Queries blockchain for events in block range
   - Parses event data
   - Stores in MongoDB collections
   - Updates last indexed block

## 📁 MongoDB Collections

- `swaps`: DEX token purchases and sales
- `liquidity`: Liquidity additions/removals
- `transfers`: ERC20 and NFT transfers
- `nft_mints`: NFT asset minting events
- `nft_valuations`: NFT valuation updates
- `prices`: Oracle price updates
- `metadata`: Indexer state (last indexed block)

## 🧪 Testing

Test MongoDB connection:
```bash
npx ts-node test-connection.ts
```

Test API endpoints:
```bash
# Health check
curl http://localhost:3001/api/health

# Get swaps
curl http://localhost:3001/api/swaps

# Get stats
curl http://localhost:3001/api/stats
```

## 🛠️ Development

### Project Structure

```
indexer/
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── .env                  # Environment variables
└── test-connection.ts    # MongoDB test script

../src/                   # Source code (shared with main project)
├── index.ts              # Main entry point
├── api/
│   └── routes.ts         # API routes
├── config/
│   ├── contracts.ts      # Contract addresses & ABIs
│   └── database.ts       # MongoDB connection
├── services/
│   └── eventListener.ts  # Event indexing logic
└── utils/
    └── logger.ts         # Winston logger

```

### Adding New Events

1. Add event ABI to `src/config/contracts.ts`
2. Create indexing function in `src/services/eventListener.ts`
3. Call it in `indexNewEvents()`
4. Add API route in `src/api/routes.ts`

## 🐛 Troubleshooting

### Connection Errors

If you see `ECONNREFUSED localhost:27017`:
- Check that `.env` file exists in `indexer/` directory
- Verify `MONGODB_URI` is correct
- Ensure `dotenv.config()` is called before importing `database.ts`

### No Events Indexed

If always showing `0` events:
- Verify contract addresses in `src/config/contracts.ts`
- Check RPC URL is working: test with `curl`
- Ensure there are actual transactions in the block range

### TypeScript Errors

If seeing `Property 'args' does not exist`:
- Ensure `EventLog` is imported from `ethers`
- Add `if (!(event instanceof EventLog)) continue;` before accessing `event.args`

## 📝 Notes

- Indexer resumes from last indexed block on restart
- Block range limited to prevent RPC rate limiting
- Indexes run in parallel for better performance
- MongoDB indexes created automatically for query optimization

## 🤝 Contributing

When modifying the indexer:
1. Test locally first
2. Check logs for errors
3. Verify data in MongoDB
4. Test API endpoints

## 📄 License

MIT
