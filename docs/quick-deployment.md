# Quick Deployment Guide

This guide will help you deploy the blockchain contracts in minutes.

## 🎯 Prerequisites

Before deploying, ensure you have:

- ✅ Node.js v18+ installed
- ✅ Git repository cloned
- ✅ Dependencies installed: `npm install`
- ✅ Testnet ETH/MATIC in your wallet
- ✅ Environment variables configured

## 📝 Step 1: Configure Environment

Create `.env` file in project root:

```env
# Blockchain RPC
INFURA_API_KEY=your_infura_api_key_here

# Deployer Wallet (NEVER commit this!)
PRIVATE_KEY=your_private_key_here

# Block Explorer APIs (for verification)
ETHERSCAN_API_KEY=your_etherscan_api_key_here
POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
```

### Get API Keys

1. **Infura API Key** (Required)
   - Visit: https://www.infura.io
   - Sign up and create a project
   - Copy your API key

2. **Etherscan API Key** (For Sepolia)
   - Visit: https://etherscan.io/apis
   - Sign up and create an API key
   - Copy your API key

3. **PolygonScan API Key** (For Amoy)
   - Visit: https://polygonscan.com/apis
   - Sign up and create an API key
   - Copy your API key

### Get Testnet Tokens

**Ethereum Sepolia:**
- https://sepoliafaucet.com
- https://www.alchemy.com/faucets/ethereum-sepolia

**Polygon Amoy:**
- https://faucet.polygon.technology

> ⚠️ **Security:** Never commit your `.env` file or share your private key!

## 🚀 Step 2: Deploy Contracts

### Option A: Deploy All Contracts (Recommended)

Deploy all 3 contracts with a single command:

```bash
# For Ethereum Sepolia
npm run deploy:all:sepolia

# For Polygon Amoy
npm run deploy:all:amoy
```

This will deploy:
1. KYCRegistry
2. FungibleAssetToken (ERC-20)
3. NFTAssetToken (ERC-721)

**Expected output:**
```
🚀 DEPLOYING ALL CONTRACTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Network: sepolia
📍 Chain ID: 11155111
📍 Deployer: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0
💰 Balance: 0.5 ETH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣  DEPLOYING KYCRegistry
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ KYCRegistry deployed: 0x1234...
🔗 View: https://sepolia.etherscan.io/address/0x1234...

2️⃣  DEPLOYING FungibleAssetToken
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Token:       Tokenized Real Estate Shares (TRES)
Max Supply:  1000000.0 tokens
Asset:       Premium Commercial Building - Paris La Défense
Location:    1 Parvis de La Défense, 92800 Puteaux, France
Value:       50000000.0 EUR
KYC:         0x1234...

✅ FungibleAssetToken deployed: 0x5678...
🔗 View: https://sepolia.etherscan.io/address/0x5678...

3️⃣  DEPLOYING NFTAssetToken
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Collection:  Tokenized GIA Diamonds (TDMD)
Type:        Precious Stones
Description: GIA certified diamonds with blockchain provenance
KYC:         0x1234...

✅ NFTAssetToken deployed: 0x9ABC...
🔗 View: https://sepolia.etherscan.io/address/0x9ABC...

⏳ Waiting 30 seconds for blockchain indexing...
🔍 Verifying contracts on block explorer...

Verifying KYCRegistry...
✅ KYCRegistry verified

Verifying FungibleAssetToken...
✅ FungibleAssetToken verified

Verifying NFTAssetToken...
✅ NFTAssetToken verified

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ALL CONTRACTS DEPLOYED SUCCESSFULLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💾 Deployment info saved to: deployments/sepolia-all-contracts.json
```

### Option B: Deploy Individual Contracts

Deploy contracts one by one:

```bash
# 1. Deploy KYCRegistry first (required by others)
npm run deploy:kyc:sepolia

# 2. Deploy FungibleAssetToken (ERC-20)
npm run deploy:fungible:sepolia

# 3. Deploy NFTAssetToken (ERC-721)
npm run deploy:nft:sepolia
```

### Option C: Deploy Demo with Sample NFTs

Deploy with pre-minted sample NFTs for testing:

```bash
npm run deploy:demo:sepolia
```

## 📂 Step 3: Check Deployment Files

All deployment information is saved in the `deployments/` folder:

```bash
# View all deployed contracts
cat deployments/sepolia-all-contracts.json

# View specific contract
cat deployments/sepolia-kyc-registry.json
cat deployments/sepolia-fungible-token.json
cat deployments/sepolia-nft-token.json
```

**Example deployment file:**
```json
{
  "contract": "KYCRegistry",
  "address": "0x1234567890abcdef...",
  "network": "sepolia",
  "chainId": 11155111,
  "deployer": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0",
  "deployedAt": "2024-01-15T10:30:00.000Z",
  "explorerUrl": "https://sepolia.etherscan.io/address/0x1234..."
}
```

## 🔍 Step 4: Verify Deployment

### Check on Block Explorer

1. Click the explorer URL from the deployment output
2. Verify contract is deployed
3. Check "Contract" tab shows verified source code
4. Review constructor parameters

### Test Basic Functions

Connect to your deployed contracts:

```javascript
// scripts/test-deployment.ts
import { ethers } from "hardhat";

async function main() {
  // Load deployment addresses
  const deployment = require("../deployments/sepolia-all-contracts.json");
  
  // Connect to contracts
  const kyc = await ethers.getContractAt("KYCRegistry", deployment.contracts.KYCRegistry.address);
  const fungible = await ethers.getContractAt("FungibleAssetToken", deployment.contracts.FungibleAssetToken.address);
  const nft = await ethers.getContractAt("NFTAssetToken", deployment.contracts.NFTAssetToken.address);
  
  // Check basic info
  console.log("KYC Registry:", await kyc.getAddress());
  console.log("Fungible Token:", await fungible.name(), await fungible.symbol());
  console.log("NFT Collection:", await nft.name(), await nft.symbol());
}

main();
```

## 🎮 Step 5: Interact with Contracts

### 1. Approve KYC for Users

```bash
# Using Hardhat console
npx hardhat console --network sepolia
```

```javascript
// In console
const kyc = await ethers.getContractAt("KYCRegistry", "0x1234...");
await kyc.approveKYC("0xUserAddress...");
console.log("KYC approved!");
```

### 2. Mint Fungible Tokens

```javascript
const fungible = await ethers.getContractAt("FungibleAssetToken", "0x5678...");
await fungible.mint("0xRecipient...", ethers.parseUnits("100", 18));
console.log("Tokens minted!");
```

### 3. Mint NFTs

```javascript
const nft = await ethers.getContractAt("NFTAssetToken", "0x9ABC...");
await nft.mintAsset(
  "0xRecipient...",
  "Diamond #1 - 2.5ct VS1",
  ethers.parseUnits("75000", 18),
  "ipfs://QmTokenURI...",
  "ipfs://QmCertURI..."
);
console.log("NFT minted!");
```

## 🌐 View on OpenSea

After minting NFTs, view them on OpenSea testnet:

**Ethereum Sepolia:**
```
https://testnets.opensea.io/assets/sepolia/{nft_contract_address}/{token_id}
```

**Polygon Amoy:**
```
https://testnets.opensea.io/assets/amoy/{nft_contract_address}/{token_id}
```

> ⏰ **Note:** NFTs may take 5-10 minutes to appear on OpenSea after minting

## 🐛 Troubleshooting

### Issue: "Insufficient funds for gas"

**Solution:**
- Get more testnet tokens from faucets
- Check your wallet has enough ETH/MATIC

### Issue: "Network not configured"

**Solution:**
- Verify network name in command matches `hardhat.config.ts`
- Check RPC URL is correct in config
- Ensure INFURA_API_KEY is set

### Issue: "Verification failed"

**Solution:**
- Wait and try again (Etherscan rate limits)
- Verify manually using provided command
- Check API key is correct

### Issue: "KYCRegistry not found"

**Solution:**
- Deploy KYCRegistry first: `npm run deploy:kyc:sepolia`
- Or use `deploy:all` to deploy everything

### Issue: "Nonce too high"

**Solution:**
- Wait a few blocks and try again
- Reset account in MetaMask (Settings → Advanced → Reset Account)

## 📊 Next Steps

After successful deployment:

1. ✅ **Test locally**: Run `npm test` to verify contracts work
2. ✅ **Approve KYC**: Add users to whitelist
3. ✅ **Mint tokens**: Create fungible tokens and NFTs
4. ✅ **Test transfers**: Try transferring between KYC-approved addresses
5. ✅ **Phase 3**: Begin DEX integration for trading

## 📚 Additional Resources

- [Main README](../README.md)
- [Deployment Scripts Documentation](../scripts/README.md)
- [Contract Documentation](../docs/)
- [Testing Guide](../docs/usage-guide.md)
- [FAQ](../docs/faq.md)

## 💡 Pro Tips

1. **Always test locally first**: Run `npm test` before deploying
2. **Use Sepolia for Ethereum**: It's the most stable testnet
3. **Save deployment files**: Keep `deployments/*.json` in version control
4. **Verify immediately**: Auto-verification works best right after deployment
5. **Monitor gas costs**: Deployment can cost 0.01-0.05 testnet ETH

---

**Ready to deploy?** Start with:
```bash
npm run deploy:all:sepolia
```

Good luck! 🚀
