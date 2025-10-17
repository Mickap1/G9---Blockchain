# 🏗️ Tokenized Asset Management Platform

> A blockchain-based platform for tokenizing real-world assets (RWAs) with on-chain KYC compliance and secure trading capabilities.

**Epitech Project 2025-2026** | Final Year Blockchain Project

---

# 🏗️ Tokenized Asset Management Platform

> A complete blockchain-based platform for tokenizing real-world assets (RWAs) with on-chain KYC compliance, supporting both fungible (ERC-20) and non-fungible (ERC-721) tokenization.

**Epitech Project 2025-2026** | Final Year Blockchain Project

[![Tests](https://img.shields.io/badge/tests-129%20passing-success)](./test)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.0-yellow)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.0.0-purple)](https://www.openzeppelin.com/)

---

## 📚 Documentation Complète

📖 **[Accéder à la documentation complète →](./docs/README.md)**

### Guides Rapides
- 🚀 [Guide de Déploiement](./docs/deployment-guide.md) - Déployer sur Sepolia/Amoy
- 📖 [Guide d'Utilisation](./docs/usage-guide.md) - Interagir avec les contrats
- 🔍 [Vérification Automatique](./docs/auto-verification.md) - Vérifier sur Etherscan
- ❓ [FAQ](./docs/faq.md) - Questions fréquentes

### API des Contrats
-  [KYCRegistry](./docs/KYCRegistry.md) - Système de vérification KYC complet
- 🪙 [FungibleAssetToken](./docs/FungibleAssetToken.md) - Token ERC-20 pour actifs fractionnés
- 💎 NFTAssetToken - Token ERC-721 pour actifs uniques (documentation en cours)

---

## 📋 Project Overview

This platform enables the **tokenization of real-world assets** such as:
- 🏢 **Real Estate** (fractional ownership via ERC-20)
- 💎 **Precious Stones** (unique diamonds via ERC-721)
- 🎨 **Artwork** (individual pieces via ERC-721)
- 📊 **Company Shares** (fungible tokens via ERC-20)

### ✅ Completed Features (Phase 1, 2 & 3) - 60% Complete 🎯

#### 🪙 **Tokenization** (100% Complete)
- ✅ **Fungible Assets (ERC-20)**: FungibleAssetToken with supply management, pricing, and metadata
- ✅ **Non-Fungible Assets (ERC-721)**: NFTAssetToken with individual asset tracking and valuation
- ✅ **Batch Operations**: Efficient batch minting for both token types
- ✅ **Asset Metadata**: Complete on-chain data (name, valuation, certificates, dates)

#### 🔐 **On-Chain KYC & Compliance** (100% Complete)
- ✅ **KYC System**: Submission, approval, rejection, and expiration management
- ✅ **Whitelist**: Only approved addresses can hold/trade tokens
- ✅ **Blacklist**: Revoke access even with approved KYC (security priority)
- ✅ **Transfer Enforcement**: KYC checks enforced in `_update()` hook
- ✅ **Role-Based Access**: Separate roles for KYC admin, minter, pauser

#### 🛡️ **Security & Safety**
- ✅ **Pausable Transfers**: Emergency pause for both token types
- ✅ **Access Control**: OpenZeppelin's battle-tested AccessControl
- ✅ **Blacklist Priority**: Blacklist checked before whitelist (security first)
- ✅ **Custom Errors**: Gas-efficient error handling
- ✅ **Event Emissions**: Complete audit trail for all operations

#### 🧪 **Testing & Quality** (168 Tests Passing)
- ✅ **KYCRegistry**: 87 comprehensive tests
- ✅ **FungibleAssetToken**: 36 tests covering all scenarios
- ✅ **NFTAssetToken**: 106 tests including edge cases and integration
- ✅ **SimpleDEX**: 39 tests for trading and liquidity
- ✅ **100% Core Functionality Coverage**

#### � **On-Chain DEX Trading** (100% Complete) ✨ NEW
- ✅ **SimpleDEX Contract**: Custom AMM with KYC enforcement
- ✅ **Constant Product Formula**: x * y = k (Uniswap v2 style)
- ✅ **Liquidity Pools**: Token/ETH pools with LP tokens
- ✅ **Trading Fees**: 0.3% fee distributed to liquidity providers
- ✅ **KYC-Compliant**: Only whitelisted users can trade/provide liquidity
- ✅ **Slippage Protection**: Min output parameters on all swaps
- ✅ **Security**: ReentrancyGuard, Pausable, role-based access

### 🚧 Remaining Work (Phase 4-5)

#### 🔄 **Real-Time Indexer** (Not Started)
- ⏳ Event Listener Backend
- ⏳ Database Synchronization
- ⏳ API for Frontend

#### 🌐 **Price Oracle** (Not Started)
- ⏳ Asset Price Feeds
- ⏳ On-Chain Price Updates
---

## 📋 Project Overview

This platform enables the tokenization of real-world assets such as real estate, artwork, and precious commodities. It implements:

- ✅ **Tokenization** of fungible (ERC-20) assets with KYC compliance
- ✅ **On-chain KYC & Compliance** with whitelisting/blacklisting mechanisms
- ✅ **Role-based Access Control** for secure operations
- ✅ **Pausable Transfers** for emergency situations
- ✅ **Comprehensive Testing** with 87 unit tests

---

## 🛠️ Technology Stack

### Blockchain & Smart Contracts

| Technology | Version | Purpose |
|------------|---------|---------|
| **Solidity** | ^0.8.20 | Smart contract programming language |
| **Hardhat** | ^2.22.0 | Ethereum development environment |
| **OpenZeppelin** | ^5.0.0 | Secure, audited smart contract libraries |
| **Ethers.js** | ^6.4.0 | Ethereum library for JavaScript/TypeScript |

### Development Tools

| Technology | Version | Purpose |
|------------|---------|---------|
| **TypeScript** | ~5.0.0 | Type-safe development |
| **Chai** | ^4.2.0 | Testing framework |
| **Hardhat Toolbox** | ^5.0.0 | All-in-one plugin for Hardhat |
| **Solidity Coverage** | ^0.8.0 | Code coverage for smart contracts |
| **Hardhat Gas Reporter** | ^1.0.8 | Gas usage analysis |

### Blockchain Networks

| Network | Chain ID | Purpose | Status |
|---------|----------|---------|--------|
| **Ethereum Sepolia** | 11155111 | Primary testnet deployment | ✅ Active |
| **Polygon Amoy** | 80002 | Alternative testnet | ✅ Active |
| **Hardhat Network** | 31337 | Local development & testing | ✅ Active |
| ~~**Polygon Mumbai**~~ | ~~80001~~ | ~~Deprecated~~ | ❌ Sunset |

> **Note**: Mumbai testnet was deprecated in April 2024. All deployments migrated to Amoy.

---

## 📦 Project Structure

```
G-ING-910-PAR-9-1-blockchain-14/
│
├── contracts/                      # ✅ Solidity smart contracts
│   ├── KYCregistry.sol            # ✅ KYC & compliance management
│   ├── FungibleAssetToken.sol     # ✅ ERC-20 for fractional assets
│   └── NFTAssetToken.sol          # ✅ ERC-721 for unique assets
│
├── test/                           # ✅ Test files (TypeScript)
│   ├── KYCRegistry.test.ts        # ✅ 87 tests passing
│   ├── FungibleAssetToken.test.ts # ✅ 36 tests passing
│   └── NFTAssetToken.test.ts      # ✅ 106 tests passing
│
├── scripts/                        # ✅ Deployment & utility scripts
│   ├── deploy-kyc.ts              # ✅ Deploy KYCRegistry individually
│   ├── deploy-fungible.ts         # ✅ Deploy FungibleAssetToken individually
│   ├── deploy-nft.ts              # ✅ Deploy NFTAssetToken individually
│   ├── deploy-all.ts              # ✅ Deploy all contracts at once
│   ├── deploy-testnet.ts          # ✅ Legacy deployment script
│   ├── deploy-nft-demo.ts         # ✅ Deploy NFT demo with sample assets
│   └── README.md                  # ✅ Deployment scripts documentation
│
├── deployments/                    # ✅ Deployed contract addresses
│   ├── sepolia-addresses.json     # ✅ Sepolia testnet deployments
│   └── sepolia-nft-demo.json      # ✅ NFT demo deployment info
│
├── docs/                           # ✅ Complete documentation
│   ├── README.md                  # ✅ Documentation hub
│   ├── quick-deployment.md        # ✅ Quick start deployment guide
│   ├── deployment-guide.md        # ✅ Detailed deployment guide
│   ├── usage-guide.md             # ✅ How to use contracts
│   ├── auto-verification.md       # ✅ Contract verification guide
│   ├── faq.md                     # ✅ FAQ
│   ├── KYCRegistry.md             # ✅ KYC API docs
│   ├── FungibleAssetToken.md      # ✅ Fungible token API docs
│   └── STRUCTURE.md               # ✅ Project structure
│
├── artifacts/                      # 🔧 Compiled contracts (generated)
├── cache/                          # 🔧 Hardhat cache (generated)
├── typechain-types/                # 🔧 TypeScript types (generated)
│
├── hardhat.config.ts               # ✅ Hardhat configuration
├── tsconfig.json                   # ✅ TypeScript configuration
├── package.json                    # ✅ Dependencies & scripts
├── .env.example                    # ✅ Environment variables template
└── README.md                       # ✅ This file
```

---

## ⚡ Quick Start

Deploy all contracts to Sepolia testnet in 3 steps:

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (add your keys to .env)
cp .env.example .env

# 3. Deploy everything
npm run deploy:all:sepolia
```

**That's it!** Your contracts are now deployed and verified. See [`docs/quick-deployment.md`](docs/quick-deployment.md) for details.

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))
- **npm** >= 9.0.0 (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **MetaMask** or another Web3 wallet ([Install](https://metamask.io/))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/EpitechPGE45-2025/G-ING-910-PAR-9-1-blockchain-14.git
cd G-ING-910-PAR-9-1-blockchain-14
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your values
```

Required environment variables:
```env
PRIVATE_KEY=your_wallet_private_key_here
INFURA_API_KEY=your_infura_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
```

> ⚠️ **Security:** Never commit your `.env` file. Use testnet wallets only.

4. **Compile smart contracts**

```bash
npm run compile
```

Expected output:
```
✨ Compiled X Solidity files successfully
```

---

## 🧪 Testing

### ✅ Current Test Status: **129 Tests Passing** (4s)

| Contract | Tests | Status |
|----------|-------|--------|
| **KYCRegistry** | 87 | ✅ All passing |
| **FungibleAssetToken** | 36 | ✅ All passing |
| **NFTAssetToken** | 106 | ✅ All passing |
| **Total** | **229** | **✅ 100%** |

### Run all tests

```bash
npm test
# or
npx hardhat test
```

Expected output:
```
  129 passing (4s)
```

### Run tests with coverage

```bash
npm run test:coverage
```

### Run tests with gas reporting

```bash
npm run test:gas
```

### Test a specific contract

```bash
npx hardhat test test/KYCRegistry.test.ts           # 87 tests
npx hardhat test test/FungibleAssetToken.test.ts    # 36 tests
npx hardhat test test/NFTAssetToken.test.ts         # 106 tests
```

### Test Features Coverage

✅ **KYCRegistry.test.ts**
- Deployment & initialization
- KYC submission, approval, rejection
- Whitelist & blacklist management
- Batch operations
- Role management
- Edge cases & events
- Integration scenarios

✅ **FungibleAssetToken.test.ts**
- ERC-20 standard compliance
- KYC-enforced transfers
- Minting with supply limits
- Batch minting
- Burning & pausable
- Price per token calculations
- Ownership percentages

✅ **NFTAssetToken.test.ts**
- ERC-721 standard compliance
- Unique asset minting
- Asset data tracking (valuation, certificates)
- Batch minting
- KYC-enforced transfers
- Blacklist priority tests
- Admin functions (valuation updates, deactivation)
- View functions (tokensOfOwner, collection value)
- Integration scenarios

---

## 🌐 Deployment

### Deployment Scripts

We provide **4 deployment scripts** for maximum flexibility:

#### 🔹 Individual Contract Deployment

Deploy contracts one by one:

```bash
# Deploy KYCRegistry
npm run deploy:kyc:sepolia        # Ethereum Sepolia
npm run deploy:kyc:amoy           # Polygon Amoy

# Deploy FungibleAssetToken (requires KYC)
npm run deploy:fungible:sepolia
npm run deploy:fungible:amoy

# Deploy NFTAssetToken (requires KYC)
npm run deploy:nft:sepolia
npm run deploy:nft:amoy
```

#### 🚀 All-in-One Deployment

Deploy all 3 contracts with a single command:

```bash
# Deploys: KYCRegistry → FungibleAssetToken → NFTAssetToken
npm run deploy:all:sepolia
npm run deploy:all:amoy
```

#### 🎨 Demo Deployment

Deploy with sample NFTs for testing:

```bash
npm run deploy:demo:sepolia
npm run deploy:demo:amoy
```

### Deployment Features

All deployment scripts include:
- ✅ Automatic contract verification on Etherscan/PolygonScan
- ✅ Role assignment (ADMIN, MINTER, PAUSER)
- ✅ Comprehensive deployment summary
- ✅ Save deployment info to `deployments/*.json`
- ✅ Network detection and explorer URLs
- ✅ Post-deployment instructions

📚 **Detailed guides:**
- Quick start: [`docs/quick-deployment.md`](docs/quick-deployment.md)
- Full guide: [`docs/deployment-guide.md`](docs/deployment-guide.md)
- Scripts docs: [`scripts/README.md`](scripts/README.md)

### ✅ Successfully Deployed Contracts

#### **Ethereum Sepolia Testnet**

| Contract | Address | Verification |
|----------|---------|--------------|
| **KYCRegistry** | `0xD1FbE41b66f3215ebE1c2703d9f8450De23F7446` | ✅ [View on Etherscan](https://sepolia.etherscan.io/address/0xD1FbE41b66f3215ebE1c2703d9f8450De23F7446) |
| **FungibleAssetToken** | `0x8B5927CBBb1AE0eA68577b7bBe60318F8CE09eE4` | ✅ [View on Etherscan](https://sepolia.etherscan.io/address/0x8B5927CBBb1AE0eA68577b7bBe60318F8CE09eE4) |
| **NFTAssetToken** | See `deployments/` folder | ✅ Verified |

All contracts are **verified and readable** on Etherscan!

### Local Development

```bash
# Start a local Hardhat node
npm run node

# In another terminal, deploy to local network
npm run deploy:local
```

### Testnet Deployment

#### 🔷 Ethereum Sepolia (Recommended)

1. **Get testnet ETH** from faucets:
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
   - [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia)

2. **Configure .env**:
```bash
PRIVATE_KEY="your_private_key_here"
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
ETHERSCAN_API_KEY="your_etherscan_api_key"
```

3. **Deploy with auto-verification**:
```bash
npx hardhat run scripts/deploy-testnet.ts --network sepolia
```

The script will:
- ✅ Deploy KYCRegistry
- ✅ Deploy FungibleAssetToken (example: "Paris Tower A Shares")
- ✅ Wait 30 seconds for blockchain indexing
- ✅ Automatically verify both contracts on Etherscan
- ✅ Save addresses to `deployments/sepolia-addresses.json`

4. **Deploy NFT Demo** (optional):
```bash
npx hardhat run scripts/deploy-nft-demo.ts --network sepolia
```

This will:
- ✅ Deploy KYCRegistry + NFTAssetToken
- ✅ Mint 3 sample diamond NFTs
- ✅ Display collection info and portfolio
- ✅ Save to `deployments/sepolia-nft-demo.json`

#### 🟣 Polygon Amoy (Alternative)

1. **Get testnet MATIC**:
   - [Polygon Faucet](https://faucet.polygon.technology/)

2. **Configure .env**:
```bash
AMOY_RPC_URL="https://rpc-amoy.polygon.technology/"
POLYGONSCAN_API_KEY="your_polygonscan_api_key"
```

3. **Deploy**:
```bash
npx hardhat run scripts/deploy-testnet.ts --network amoy
# or
npx hardhat run scripts/deploy-nft-demo.ts --network amoy
```

### Manual Verification

If auto-verification fails:

```bash
# Verify KYCRegistry
npx hardhat verify --network sepolia <KYC_ADDRESS>

# Verify FungibleAssetToken
npx hardhat verify --network sepolia <TOKEN_ADDRESS> \
  "Paris Tower A Shares" \
  "PATA" \
  <KYC_ADDRESS> \
  1000000 \
  "5000000000000000000000000" \
  "Real Estate" \
  "Fractional ownership of Paris commercial building" \
  "ipfs://..."
```

📖 **[Complete Deployment Guide →](./docs/deployment-guide.md)**  
🔍 **[Auto-Verification Guide →](./docs/auto-verification.md)**

---

## 📖 Technology Explanations

### Why Solidity?

**Solidity** is the most widely-used language for writing Ethereum smart contracts. We chose Solidity because:

- ✅ **Industry Standard**: Used by 95%+ of Ethereum projects
- ✅ **Mature Ecosystem**: Extensive libraries, tools, and documentation
- ✅ **Security**: OpenZeppelin provides battle-tested, audited contracts
- ✅ **EVM Compatibility**: Works on Ethereum, Polygon, Arbitrum, etc.

**Version 0.8.20**: Latest stable version with built-in overflow protection.

### Why Hardhat?

**Hardhat** is a professional-grade development environment for Ethereum. Key advantages:

- ✅ **TypeScript Support**: Type-safe development out of the box
- ✅ **Built-in Network**: Local blockchain for fast testing
- ✅ **Console.log in Solidity**: Debug contracts easily
- ✅ **Plugin Ecosystem**: Toolbox includes ethers, chai-matchers, coverage, gas reporter
- ✅ **Stack Traces**: Detailed error messages for failed transactions

**Alternative considered**: Foundry (faster but Solidity-based tests, steeper learning curve)

### Why OpenZeppelin?

**OpenZeppelin Contracts** is the gold standard for secure smart contracts:

- ✅ **Audited Code**: All contracts professionally audited
- ✅ **Battle-Tested**: Used by Uniswap, Aave, Compound, etc.
- ✅ **Modular**: Inherit only what you need (AccessControl, ERC20, ERC721)
- ✅ **Upgradeable Patterns**: Support for proxy contracts
- ✅ **Community Standard**: Expected by auditors and investors

**Key contracts we use**:
- `AccessControl.sol`: Role-based permissions (KYC_ADMIN, MINTER_ROLE)
- `ERC20.sol`: Fungible token standard
- `ERC721.sol`: Non-fungible token standard
- `Pausable.sol`: Emergency pause functionality

### Why Polygon (Mumbai Testnet)?

**Polygon** is an Ethereum Layer 2 scaling solution. We chose it because:

- ✅ **Low Fees**: ~$0.01 per transaction (vs $5-50 on Ethereum)
- ✅ **Fast Finality**: 2-second block times (vs 12s on Ethereum)
- ✅ **EVM Compatible**: Same Solidity code works on both chains
- ✅ **RWA Focus**: Used by JPMorgan, Franklin Templeton for real-world assets
- ✅ **Mature DeFi**: Uniswap, Aave, QuickSwap available

**Mumbai Testnet**: Free test MATIC, perfect for development and demos.

### Why Ethers.js?

**Ethers.js** is a lightweight, complete Ethereum library:

- ✅ **TypeScript First**: Excellent type definitions
- ✅ **Small Bundle Size**: 88KB (vs 1.1MB for Web3.js)
- ✅ **Modern API**: Promise-based, async/await support
- ✅ **ENS Support**: Built-in support for Ethereum Name Service
- ✅ **Hardhat Integration**: Seamless integration via `hardhat-ethers`

**Version 6.x**: Latest major version with improved performance and API.

### Why TypeScript?

**TypeScript** adds static typing to JavaScript:

- ✅ **Catch Errors Early**: Type checking at compile time
- ✅ **Better IDE Support**: Autocomplete, refactoring, navigation
- ✅ **Self-Documenting**: Types serve as inline documentation
- ✅ **Safer Refactoring**: Rename variables with confidence
- ✅ **Contract Type Generation**: Typechain generates types from ABIs

**Typechain**: Automatically generates TypeScript types from smart contracts.

---

## 🔐 Security Considerations

### Private Key Management

⚠️ **NEVER** commit your private key to Git!

- Use `.env` for local development (already in `.gitignore`)
- For production, use **hardware wallets** (Ledger, Trezor)
- For CI/CD, use **GitHub Secrets** or **AWS Secrets Manager**

## 🎯 Recent Accomplishments

### October 17, 2025 - Major Updates ✨

#### **Bug Fixes & Improvements**
- ✅ Fixed NFTAssetToken shadowing warning (renamed `tokenURI` param to `uri`)
- ✅ Corrected blacklist priority in both token contracts (security fix)
- ✅ Fixed KYCCheckFailed event test compatibility
- ✅ Migrated from deprecated Mumbai to Sepolia/Amoy testnets
- ✅ Fixed Etherscan API V2 configuration

#### **Test Suite Completion**
- ✅ Completed NFTAssetToken.test.ts (106 tests)
- ✅ Added Role Management tests
- ✅ Added Edge Cases tests (empty strings, zero values, large numbers)
- ✅ Added Events verification tests
- ✅ Added Integration Scenarios (full lifecycle, multi-user, KYC changes)
- ✅ Added ERC-721 Interface Compliance tests
- ✅ **Result**: 129 tests passing, 0 failures

#### **Deployment Enhancements**
- ✅ Created `deploy-nft-demo.ts` with sample diamond NFTs
- ✅ Added automatic contract verification (30s delay + verify)
- ✅ Multi-network support (Sepolia/Amoy) with dynamic URLs
- ✅ Removed minimum balance requirement for easier testing
- ✅ Enhanced deployment logging with explorer links

#### **Documentation**
- ✅ Created [auto-verification.md](./docs/auto-verification.md)
- ✅ Updated all guides for Sepolia/Amoy
- ✅ Added comprehensive README with test status
- ✅ Documented deployed contract addresses

---

## 📊 Smart Contract Details

### **KYCRegistry.sol**
- **Purpose**: On-chain KYC and compliance management
- **Size**: ~300 lines
- **Tests**: 87 passing
- **Key Features**:
  - Submit, approve, reject, revoke KYC
  - Whitelist with expiration dates
  - Blacklist with priority over whitelist
  - Batch approval operations
  - Role-based access control

### **FungibleAssetToken.sol**
- **Purpose**: ERC-20 for fractional real-world assets
- **Size**: ~350 lines
- **Tests**: 36 passing
- **Key Features**:
  - Supply cap with minting limits
  - Price per token calculation
  - KYC-enforced transfers
  - Asset metadata (type, description, documents)
  - Batch minting
  - Burn & pause functionality

### **NFTAssetToken.sol**
- **Purpose**: ERC-721 for unique real-world assets
- **Size**: ~390 lines
- **Tests**: 106 passing
- **Key Features**:
  - Individual asset data (name, valuation, certificate)
  - KYC-enforced transfers
  - Batch minting
  - Asset deactivation/reactivation
  - Valuation updates
  - Collection & ownership value tracking
  - Sequential token IDs

---

## 🔐 Security Considerations

### Private Key Management

⚠️ **NEVER** commit your private key to Git!

- Use `.env` for local development (already in `.gitignore`)
- For production, use **hardware wallets** (Ledger, Trezor)
- For CI/CD, use **GitHub Secrets** or **AWS Secrets Manager**

### Smart Contract Security

- ✅ All contracts use OpenZeppelin audited libraries
- ✅ **Blacklist Priority**: Blacklisted addresses blocked even if whitelisted
- ✅ **Reentrancy Protection**: Following Checks-Effects-Interactions pattern
- ✅ **Access Control**: Role-based permissions for all sensitive functions
- ✅ **Pausable**: Emergency stop mechanism for both token types
- ✅ **Custom Errors**: Gas-efficient error handling (Solidity 0.8.20)
- ✅ **Event Emissions**: Complete audit trail for all state changes

### Testing & Auditing

- ✅ **129 tests** covering normal flows, edge cases, and attack vectors
- ✅ **100% critical path coverage**: All transfer logic tested
- ✅ **Integration tests**: Multi-contract interaction scenarios
- ⏳ **External audit**: Recommended before mainnet deployment

---

## 🤝 Contributing

This is an Epitech academic project. Contributions are welcome for:

- 🐛 Bug fixes
- 📝 Documentation improvements
- ✨ New features (after Phase 1-2 completion)
- 🧪 Additional test cases

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

---

## 📜 License

This project is developed as part of the Epitech curriculum.

---

## 👥 Team

**Epitech Paris - Promo 2026**  
Final Year Blockchain Project

---

## 📞 Support

- 📖 [Documentation](./docs/README.md)
- ❓ [FAQ](./docs/faq.md)
- 🐛 [Report Issues](https://github.com/EpitechPGE45-2025/G-ING-910-PAR-9-1-blockchain-14/issues)

---

## 🗺️ Roadmap

### ✅ Phase 1: Core Tokenization (Complete)
- ✅ KYCRegistry smart contract
- ✅ FungibleAssetToken (ERC-20)
- ✅ NFTAssetToken (ERC-721)
- ✅ Comprehensive test suite

### ✅ Phase 2: Deployment & Testing (Complete)
- ✅ Sepolia testnet deployment
- ✅ Contract verification on Etherscan
- ✅ Deployment scripts with auto-verification
- ✅ 129 tests passing

### ⏳ Phase 3: Trading (In Progress)
- ⏳ Uniswap V2/V3 integration
- ⏳ Liquidity pool creation
- ⏳ KYC-compliant DEX wrapper

### ⏳ Phase 4: Indexer & API (Planned)
- ⏳ Event listener backend
- ⏳ PostgreSQL/MongoDB database
- ⏳ REST API for frontend
- ⏳ Real-time synchronization

### ⏳ Phase 5: Oracle & Frontend (Planned)
- ⏳ Price oracle integration
- ⏳ React/Next.js frontend
- ⏳ Wallet connection (MetaMask, WalletConnect)
- ⏳ Asset management dashboard

---

**Built with ❤️ for Epitech Blockchain Project**