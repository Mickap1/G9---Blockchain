# 💱 SimpleDEX - KYC-Compliant Decentralized Exchange

> A simple yet powerful Automated Market Maker (AMM) for trading tokenized assets with built-in KYC compliance.

---

## 📋 Overview

**SimpleDEX** is a decentralized exchange that enables KYC-verified users to trade FungibleAssetToken for ETH using an Automated Market Maker (AMM) model with the constant product formula `x * y = k`.

### ✨ Key Features

- ✅ **KYC-Compliant Trading**: Only whitelisted users can trade
- 💧 **Liquidity Pools**: Token/ETH pools with LP tokens
- 📊 **Automated Market Making**: Constant product formula (Uniswap v2 style)
- 💰 **Trading Fees**: 0.3% fee distributed to liquidity providers
- 🛡️ **Security**: ReentrancyGuard, Pausable, Role-based access control
- 🚫 **Blacklist Protection**: Blacklisted addresses cannot trade or provide liquidity

---

## 🏗️ Architecture

### Constant Product Formula

```
x * y = k

Where:
- x = Token reserves
- y = ETH reserves
- k = Constant (invariant)
```

When a user swaps `Δx` tokens for `Δy` ETH:

```
(x + Δx) * (y - Δy) = k
```

### Trading Fee

All swaps include a **0.3% fee** that stays in the pool, benefiting liquidity providers:

```
Effective Input = Input Amount × 0.997 (99.7%)
```

---

## 📖 Contract API

### Core Functions

#### 🏊 Liquidity Management

##### `addLiquidity(uint256 tokenAmount) payable`

Add liquidity to the pool and receive LP tokens.

**Parameters:**
- `tokenAmount`: Amount of tokens to add
- `msg.value`: Amount of ETH to add (sent with transaction)

**Returns:**
- `liquidityMinted`: Amount of LP tokens minted

**Requirements:**
- Caller must be KYC-verified (whitelisted and not blacklisted)
- Contract must not be paused
- Token amount and ETH amount must be > 0
- Caller must approve DEX to spend tokens
- For non-initial liquidity, must maintain current pool ratio

**Example:**

```javascript
// Approve tokens first
await token.approve(dexAddress, ethers.parseEther("1000"));

// Add liquidity: 1000 tokens + 1 ETH
const tx = await dex.addLiquidity(
  ethers.parseEther("1000"),
  { value: ethers.parseEther("1") }
);
```

##### `removeLiquidity(uint256 liquidityAmount)`

Remove liquidity from the pool by burning LP tokens.

**Parameters:**
- `liquidityAmount`: Amount of LP tokens to burn

**Returns:**
- `tokenAmount`: Amount of tokens returned
- `ethAmount`: Amount of ETH returned

**Requirements:**
- Caller must be KYC-verified
- Must have sufficient LP tokens

**Example:**

```javascript
const lpBalance = await dex.liquidity(userAddress);

// Remove 50% of liquidity
const tx = await dex.removeLiquidity(lpBalance / 2n);
```

---

#### 💱 Trading Functions

##### `swapETHForTokens(uint256 minTokens) payable`

Buy tokens with ETH.

**Parameters:**
- `minTokens`: Minimum tokens to receive (slippage protection)
- `msg.value`: Amount of ETH to spend

**Returns:**
- `tokenAmount`: Amount of tokens received

**Requirements:**
- Caller must be KYC-verified
- Contract must not be paused
- Pool must be initialized
- Output must be ≥ minTokens

**Example:**

```javascript
// Get quote first
const quote = await dex.getTokenQuote(ethers.parseEther("1"));
const minTokens = quote * 95n / 100n; // 5% slippage tolerance

// Swap 1 ETH for tokens
const tx = await dex.swapETHForTokens(minTokens, {
  value: ethers.parseEther("1")
});
```

##### `swapTokensForETH(uint256 tokenAmount, uint256 minETH)`

Sell tokens for ETH.

**Parameters:**
- `tokenAmount`: Amount of tokens to sell
- `minETH`: Minimum ETH to receive (slippage protection)

**Returns:**
- `ethAmount`: Amount of ETH received

**Requirements:**
- Caller must be KYC-verified
- Contract must not be paused
- Pool must be initialized
- Caller must approve DEX to spend tokens
- Output must be ≥ minETH

**Example:**

```javascript
const tokenAmount = ethers.parseEther("100");

// Get quote first
const quote = await dex.getETHQuote(tokenAmount);
const minETH = quote * 95n / 100n; // 5% slippage tolerance

// Approve tokens
await token.approve(dexAddress, tokenAmount);

// Swap tokens for ETH
const tx = await dex.swapTokensForETH(tokenAmount, minETH);
```

---

#### 📊 View Functions

##### `getTokenQuote(uint256 ethAmount)`

Get estimated tokens for a given ETH amount.

**Parameters:**
- `ethAmount`: Amount of ETH to spend

**Returns:**
- `tokenAmount`: Estimated tokens to receive (including 0.3% fee)

**Example:**

```javascript
const quote = await dex.getTokenQuote(ethers.parseEther("1"));
console.log(`1 ETH → ${ethers.formatEther(quote)} tokens`);
```

##### `getETHQuote(uint256 tokenAmount)`

Get estimated ETH for a given token amount.

**Parameters:**
- `tokenAmount`: Amount of tokens to sell

**Returns:**
- `ethAmount`: Estimated ETH to receive (including 0.3% fee)

##### `getTokenPrice()`

Get current token price in wei per token.

**Returns:**
- `price`: Price in wei (10^18 wei = 1 ETH)

**Example:**

```javascript
const price = await dex.getTokenPrice();
console.log(`Price: ${ethers.formatEther(price)} ETH per token`);
```

##### `getPoolInfo()`

Get complete pool information.

**Returns:**
- `_reserveToken`: Token reserves in pool
- `_reserveETH`: ETH reserves in pool
- `_totalLiquidity`: Total LP tokens issued
- `_tokenPrice`: Current token price in ETH

**Example:**

```javascript
const info = await dex.getPoolInfo();
console.log({
  tokenReserve: ethers.formatEther(info._reserveToken),
  ethReserve: ethers.formatEther(info._reserveETH),
  totalLiquidity: ethers.formatEther(info._totalLiquidity),
  price: ethers.formatEther(info._tokenPrice)
});
```

##### `getUserLiquidity(address user)`

Get user's liquidity position.

**Parameters:**
- `user`: Address to check

**Returns:**
- `userLiquidity`: LP tokens owned
- `sharePercent`: Share of pool in basis points (10000 = 100%)
- `tokenShare`: Claimable token amount
- `ethShare`: Claimable ETH amount

**Example:**

```javascript
const info = await dex.getUserLiquidity(userAddress);
console.log({
  lpTokens: ethers.formatEther(info.userLiquidity),
  share: `${info.sharePercent / 100}%`,
  tokens: ethers.formatEther(info.tokenShare),
  eth: ethers.formatEther(info.ethShare)
});
```

---

#### 🛡️ Admin Functions

##### `pause()`

Pause all trading and liquidity operations (emergency only).

**Requirements:**
- Caller must have PAUSER_ROLE

##### `unpause()`

Resume normal operations.

**Requirements:**
- Caller must have PAUSER_ROLE

---

## 📊 Events

### LiquidityAdded

```solidity
event LiquidityAdded(
    address indexed provider,
    uint256 tokenAmount,
    uint256 ethAmount,
    uint256 liquidityMinted,
    uint256 timestamp
);
```

### LiquidityRemoved

```solidity
event LiquidityRemoved(
    address indexed provider,
    uint256 tokenAmount,
    uint256 ethAmount,
    uint256 liquidityBurned,
    uint256 timestamp
);
```

### TokensPurchased

```solidity
event TokensPurchased(
    address indexed buyer,
    uint256 ethIn,
    uint256 tokensOut,
    uint256 timestamp
);
```

### TokensSold

```solidity
event TokensSold(
    address indexed seller,
    uint256 tokensIn,
    uint256 ethOut,
    uint256 timestamp
);
```

---

## 🚀 Deployment Guide

### Prerequisites

1. Deploy `KYCRegistry`
2. Deploy `FungibleAssetToken`
3. Ensure deployer is whitelisted

### Deploy DEX

```bash
npx hardhat run scripts/deploy-dex.ts --network sepolia
```

### Post-Deployment

1. **Whitelist the DEX contract itself**:

```javascript
await kycRegistry.batchApproveKYC(
  [dexAddress],
  futureExpiryTimestamp
);
```

2. **Add initial liquidity**:

```javascript
const tokenAmount = ethers.parseEther("10000");
const ethAmount = ethers.parseEther("10");

await token.approve(dexAddress, tokenAmount);
await dex.addLiquidity(tokenAmount, { value: ethAmount });
```

---

## 💡 Usage Examples

### Complete Trading Flow

```javascript
import { ethers } from "ethers";

// Connect to contracts
const dex = await ethers.getContractAt("SimpleDEX", dexAddress);
const token = await ethers.getContractAt("FungibleAssetToken", tokenAddress);

// 1. Check if user is whitelisted
const isWhitelisted = await kycRegistry.isWhitelisted(userAddress);
if (!isWhitelisted) {
  throw new Error("User must complete KYC first");
}

// 2. Get price quote
const ethIn = ethers.parseEther("1"); // 1 ETH
const tokensOut = await dex.getTokenQuote(ethIn);
console.log(`You will receive ~${ethers.formatEther(tokensOut)} tokens`);

// 3. Calculate slippage tolerance (5%)
const minTokens = tokensOut * 95n / 100n;

// 4. Execute swap
const tx = await dex.swapETHForTokens(minTokens, {
  value: ethIn,
  gasLimit: 300000
});

await tx.wait();
console.log("Swap successful!");
```

### Becoming a Liquidity Provider

```javascript
// 1. Decide on amounts (must maintain pool ratio after first LP)
const tokenAmount = ethers.parseEther("1000");
const ethAmount = ethers.parseEther("1");

// 2. Approve tokens
await token.approve(dexAddress, tokenAmount);

// 3. Add liquidity
const tx = await dex.addLiquidity(tokenAmount, {
  value: ethAmount
});

const receipt = await tx.wait();
console.log("Liquidity added!");

// 4. Check your position
const position = await dex.getUserLiquidity(userAddress);
console.log(`You own ${position.sharePercent / 100}% of the pool`);
```

### Removing Liquidity

```javascript
// 1. Check LP balance
const lpBalance = await dex.liquidity(userAddress);

// 2. Remove all or partial liquidity
const tx = await dex.removeLiquidity(lpBalance); // Remove 100%

const receipt = await tx.wait();

// Parse return values from event
const event = receipt.logs.find(log => 
  log.fragment?.name === "LiquidityRemoved"
);

console.log(`Received: ${event.args.tokenAmount} tokens and ${event.args.ethAmount} ETH`);
```

---

## ⚠️ Important Notes

### KYC Requirements

**CRITICAL**: The DEX contract itself must be whitelisted in the KYC registry because it receives tokens during swaps and liquidity operations.

```javascript
// After deploying DEX
await kycRegistry.batchApproveKYC([dexAddress], expiryDate);
```

### Price Impact

Large trades will experience significant price impact due to the constant product formula:

```javascript
// Small trade: ~0.3% price impact (mostly fees)
await dex.swapETHForTokens(minTokens, {
  value: ethers.parseEther("0.1")
});

// Large trade: High price impact + fees
await dex.swapETHForTokens(minTokens, {
  value: ethers.parseEther("5") // 50% of pool!
});
```

**Recommendation**: For large trades, split into smaller chunks.

### LP Token Value

LP tokens represent your share of the pool. As fees accumulate, your LP tokens become worth more:

```javascript
// Initial: Add 1000 tokens + 1 ETH
// Receive: 1000 LP tokens (first provider)

// After many trades with 0.3% fees...
// Pool now: 1100 tokens + 1.1 ETH (10% growth)

// Remove liquidity:
// Burn 1000 LP tokens → Receive 1100 tokens + 1.1 ETH
// You made 100 tokens + 0.1 ETH profit from fees!
```

### Slippage Protection

Always set a minimum output to protect against:
- Front-running
- Price volatility
- Large pending trades

```javascript
// ❌ BAD: No slippage protection
await dex.swapETHForTokens(0, { value: ethAmount });

// ✅ GOOD: 5% slippage tolerance
const quote = await dex.getTokenQuote(ethAmount);
const minOut = quote * 95n / 100n;
await dex.swapETHForTokens(minOut, { value: ethAmount });
```

---

## 🔒 Security Features

- ✅ **ReentrancyGuard**: Prevents reentrancy attacks
- ✅ **Pausable**: Emergency stop mechanism
- ✅ **KYC Verification**: All operations check whitelist/blacklist
- ✅ **Integer Overflow Protection**: Solidity 0.8.x built-in checks
- ✅ **Access Control**: Role-based admin functions

---

## 🧪 Testing

Run the comprehensive test suite:

```bash
npx hardhat test test/SimpleDEX.test.ts
```

**39 tests covering**:
- Deployment
- Liquidity addition/removal
- Swaps (ETH→Token and Token→ETH)
- KYC enforcement
- Slippage protection
- View functions
- Admin functions
- Edge cases & security

---

## 📚 Related Documentation

- [KYCRegistry API](./KYCRegistry.md)
- [FungibleAssetToken API](./FungibleAssetToken.md)
- [Deployment Guide](./deployment-guide.md)
- [Usage Guide](./usage-guide.md)

---

## 🆘 Troubleshooting

### "NotWhitelisted" Error

**Problem**: Transaction reverts with `NotWhitelisted()`

**Solutions**:
1. Complete KYC: `await kycRegistry.submitKYC(dataURI)`
2. Wait for approval: Admin must call `approveKYC()`
3. **For DEX contract**: Admin must whitelist the DEX address

### "RecipientNotWhitelisted" Error

**Problem**: Token transfer fails during liquidity addition

**Solution**: Whitelist the DEX contract address:

```javascript
const dexAddress = await dex.getAddress();
await kycRegistry.batchApproveKYC([dexAddress], expiryDate);
```

### "SlippageExceeded" Error

**Problem**: Price moved too much between quote and execution

**Solutions**:
- Increase slippage tolerance (e.g., 5% → 10%)
- Split trade into smaller amounts
- Check for pending large trades

### "PoolNotInitialized" Error

**Problem**: Trying to swap before anyone added liquidity

**Solution**: Add initial liquidity first:

```javascript
await dex.addLiquidity(tokenAmount, { value: ethAmount });
```

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check the [FAQ](./faq.md)
- Review test cases in `test/SimpleDEX.test.ts`

---

**Built with ❤️ for Epitech Blockchain Project 2025-2026**
