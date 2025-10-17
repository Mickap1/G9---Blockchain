# Deployment Scripts

This folder contains deployment scripts for all blockchain contracts in the project.

## 📋 Available Scripts

### Individual Contract Deployment

#### 1️⃣ `deploy-kyc.ts` - Deploy KYCRegistry

Deploys the KYCRegistry contract (independent, no dependencies).

```bash
# Ethereum Sepolia
npm run deploy:kyc:sepolia

# Polygon Amoy
npm run deploy:kyc:amoy
```

**Features:**
- ✅ Deploys KYCRegistry
- ✅ Grants all roles to deployer (DEFAULT_ADMIN, ADMIN)
- ✅ Automatic contract verification on Etherscan/PolygonScan
- ✅ Saves deployment info to `deployments/{network}-kyc-registry.json`

#### 2️⃣ `deploy-fungible.ts` - Deploy FungibleAssetToken

Deploys the FungibleAssetToken (ERC-20) contract for fractional asset ownership.

```bash
# Ethereum Sepolia
npm run deploy:fungible:sepolia

# Polygon Amoy
npm run deploy:fungible:amoy
```

**Requirements:**
- ⚠️ KYCRegistry must be deployed first

**Features:**
- ✅ Deploys FungibleAssetToken with asset metadata
- ✅ Configurable: name, symbol, max supply, asset details
- ✅ Automatic contract verification
- ✅ Displays token economics (price per token)
- ✅ Saves deployment info to `deployments/{network}-fungible-token.json`

**Default Configuration:**
- **Token Name:** Tokenized Real Estate Shares
- **Symbol:** TRES
- **Max Supply:** 1,000,000 tokens
- **Asset:** Premium Commercial Building - Paris La Défense
- **Total Value:** 50M EUR
- **Location:** 1 Parvis de La Défense, 92800 Puteaux, France

#### 3️⃣ `deploy-nft.ts` - Deploy NFTAssetToken

Deploys the NFTAssetToken (ERC-721) contract for unique asset tokenization.

```bash
# Ethereum Sepolia
npm run deploy:nft:sepolia

# Polygon Amoy
npm run deploy:nft:amoy
```

**Requirements:**
- ⚠️ KYCRegistry must be deployed first

**Features:**
- ✅ Deploys NFTAssetToken collection
- ✅ Configurable: name, symbol, asset type, description
- ✅ Automatic contract verification
- ✅ Displays OpenSea testnet URL
- ✅ Saves deployment info to `deployments/{network}-nft-token.json`

**Default Configuration:**
- **Collection Name:** Tokenized GIA Diamonds
- **Symbol:** TDMD
- **Asset Type:** Precious Stones
- **Description:** GIA certified diamonds with blockchain provenance

### Complete Deployment

#### 4️⃣ `deploy-all.ts` - Deploy All Contracts

Deploys all 3 contracts in the correct order with a single command.

```bash
# Ethereum Sepolia
npm run deploy:all:sepolia

# Polygon Amoy
npm run deploy:all:amoy
```

**Deployment Order:**
1. 🔒 KYCRegistry (independent)
2. 💰 FungibleAssetToken (requires KYC)
3. 💎 NFTAssetToken (requires KYC)

**Features:**
- ✅ One-command deployment of entire system
- ✅ Automatic contract verification for all 3 contracts
- ✅ Comprehensive deployment summary
- ✅ Saves master deployment info to `deployments/{network}-all-contracts.json`
- ✅ Also creates individual deployment files for each contract
- ✅ 30-second wait for blockchain indexing before verification

---

### Demo Deployment

#### 🎨 `deploy-nft-demo.ts` - Deploy with Sample NFTs

Demo deployment that creates sample NFTs after deploying contracts.

```bash
# Ethereum Sepolia
npm run deploy:demo:sepolia

# Polygon Amoy
npm run deploy:demo:amoy
```

**Features:**
- ✅ Deploys KYCRegistry and NFTAssetToken
- ✅ Mints 2 sample diamond NFTs
- ✅ Demonstrates batch minting
- ✅ Shows OpenSea integration
- ✅ Perfect for testing and demonstrations

## 🗂️ Deployment Files

All deployment scripts save their outputs to the `deployments/` folder:

```
deployments/
├── sepolia-kyc-registry.json      # KYCRegistry on Sepolia
├── sepolia-fungible-token.json    # FungibleAssetToken on Sepolia
├── sepolia-nft-token.json         # NFTAssetToken on Sepolia
├── sepolia-all-contracts.json     # All contracts on Sepolia
├── amoy-kyc-registry.json         # KYCRegistry on Amoy
├── amoy-fungible-token.json       # FungibleAssetToken on Amoy
├── amoy-nft-token.json            # NFTAssetToken on Amoy
└── amoy-all-contracts.json        # All contracts on Amoy
```

Each JSON file contains:
- Contract address
- Network information
- Deployer address
- Timestamp
- Explorer URL
- Constructor parameters
- Granted roles

## 🔧 Customization

### Modify Deployment Parameters

Edit the scripts to customize your deployment:

**FungibleAssetToken (`deploy-fungible.ts`):**
```typescript
const TOKEN_NAME = "Your Token Name";
const TOKEN_SYMBOL = "SYMB";
const MAX_SUPPLY = ethers.parseUnits("1000000", 18);
const ASSET_NAME = "Your Asset";
const ASSET_TYPE = "Asset Type";
const LOCATION = "Asset Location";
const TOTAL_VALUE = ethers.parseUnits("1000000", 18);
const DOCUMENT_URI = "ipfs://...";
```

**NFTAssetToken (`deploy-nft.ts`):**
```typescript
const COLLECTION_NAME = "Your Collection";
const COLLECTION_SYMBOL = "COLL";
const ASSET_TYPE = "Your Asset Type";
const COLLECTION_DESCRIPTION = "Description of your collection";
```

## 🌐 Supported Networks

### Ethereum Sepolia
- **Chain ID:** 11155111
- **RPC:** https://sepolia.infura.io/v3/{YOUR_INFURA_KEY}
- **Explorer:** https://sepolia.etherscan.io
- **Faucet:** https://sepoliafaucet.com

### Polygon Amoy (Mumbai replacement)
- **Chain ID:** 80002
- **RPC:** https://rpc-amoy.polygon.technology
- **Explorer:** https://amoy.polygonscan.com
- **Faucet:** https://faucet.polygon.technology

## ⚙️ Configuration

All scripts require environment variables in `.env`:

```env
# Required for all deployments
INFURA_API_KEY=your_infura_key_here
PRIVATE_KEY=your_private_key_here

# Required for contract verification
ETHERSCAN_API_KEY=your_etherscan_key_here
POLYGONSCAN_API_KEY=your_polygonscan_key_here
```

## 📝 Post-Deployment Steps

After deploying contracts:

### 1. Approve KYC for Users

```solidity
// Get KYC contract
const kyc = await ethers.getContractAt("KYCRegistry", kycAddress);

// Approve addresses
await kyc.approveKYC(userAddress);
```

### 2. Mint Fungible Tokens

```solidity
// Get Fungible Token contract
const token = await ethers.getContractAt("FungibleAssetToken", tokenAddress);

// Mint tokens to approved addresses
await token.mint(recipient, ethers.parseUnits("1000", 18));
```

### 3. Mint NFTs

```solidity
// Get NFT contract
const nft = await ethers.getContractAt("NFTAssetToken", nftAddress);

// Mint individual NFT
await nft.mintAsset(
  recipient,
  "Diamond #1",
  ethers.parseUnits("50000", 18), // Valuation
  "ipfs://QmTokenURI...",
  "ipfs://QmCertURI..."
);

// Batch mint multiple NFTs
await nft.batchMintAssets(
  [recipient1, recipient2],
  ["Diamond #2", "Diamond #3"],
  [ethers.parseUnits("60000", 18), ethers.parseUnits("70000", 18)],
  ["ipfs://QmURI2...", "ipfs://QmURI3..."],
  ["ipfs://QmCert2...", "ipfs://QmCert3..."]
);
```

### 4. View on Block Explorers

- **Etherscan:** Contract addresses automatically verified
- **OpenSea:** NFTs visible at `https://testnets.opensea.io/assets/{network}/{contract}/{tokenId}`

## 🚀 Quick Start

Deploy entire system to Sepolia:

```bash
# 1. Set up environment variables
cp .env.example .env
# Edit .env with your keys

# 2. Compile contracts
npm run compile

# 3. Run tests (optional but recommended)
npm test

# 4. Deploy all contracts
npm run deploy:all:sepolia

# 5. Check deployment files
cat deployments/sepolia-all-contracts.json
```

## 🐛 Troubleshooting

### "KYCRegistry not found"
- **Issue:** Trying to deploy fungible/NFT without KYC
- **Solution:** Deploy KYCRegistry first or use `deploy:all`

### "Verification failed"
- **Issue:** Etherscan API rate limiting
- **Solution:** Wait and verify manually with provided command

### "Insufficient funds"
- **Issue:** Not enough ETH/MATIC for deployment
- **Solution:** Get testnet tokens from faucets

### "Network not configured"
- **Issue:** Missing network in hardhat.config.ts
- **Solution:** Check network name matches config

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Etherscan API](https://docs.etherscan.io)
- [Sepolia Testnet Guide](https://sepolia.dev)
- [Polygon Amoy Testnet](https://docs.polygon.technology/tools/faucets/)

---

**Need help?** Check the main [README.md](../README.md) or project documentation in [docs/](../docs/)
