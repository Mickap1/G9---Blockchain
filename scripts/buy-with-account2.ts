import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script to buy tokens using Account 2 directly (no Etherscan needed!)
 * Much cheaper: 0.001 ETH gas instead of 0.0315 ETH
 */

async function main() {
  console.log("\n🛒 Buying Tokens with Account 2 (Direct Script)\n");

  // Get signers - Account 2 is the second account
  const signers = await ethers.getSigners();
  
  if (signers.length < 2) {
    console.log("❌ ERROR: PRIVATE_KEY_2 not configured!");
    console.log("\n📝 To fix this:");
    console.log("   1. Add PRIVATE_KEY_2 to your .env file");
    console.log("   2. The configuration has already been updated in hardhat.config.ts");
    console.log("   3. Restart this script\n");
    process.exit(1);
  }

  const account1 = signers[0];
  const account2 = signers[1];

  console.log("📝 Account 1 (Owner):", await account1.getAddress());
  console.log("📝 Account 2 (Buyer):", await account2.getAddress());

  // Configuration
  const ETH_TO_SPEND = ethers.parseEther("0.005"); // Buy with 0.005 ETH
  console.log("💰 ETH to spend:", ethers.formatEther(ETH_TO_SPEND), "ETH\n");

  // Load deployments
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-addresses.json`);
  
  if (!fs.existsSync(deploymentsPath)) {
    console.log("❌ No deployments found!");
    process.exit(1);
  }
  
  const addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  
  const tokenAddress = addresses.token || addresses.fungibleToken;
  const kycAddress = addresses.kycRegistry;
  const dexAddress = addresses.dex;
  
  if (!tokenAddress || !kycAddress || !dexAddress) {
    console.log("❌ Missing contract addresses!");
    process.exit(1);
  }
  
  console.log("📋 Contract Addresses:");
  console.log("   Token:", tokenAddress);
  console.log("   DEX:", dexAddress);
  console.log("   KYC:", kycAddress);

  // Get contracts
  const token = await ethers.getContractAt("FungibleAssetToken", tokenAddress);
  const kyc = await ethers.getContractAt("KYCRegistry", kycAddress);
  const dex = await ethers.getContractAt("SimpleDEX", dexAddress);

  // Check Account 2 status
  console.log("\n" + "=".repeat(60));
  console.log("👤 ACCOUNT 2 STATUS (BEFORE)");
  console.log("=".repeat(60));
  
  const account2Address = await account2.getAddress();
  const ethBalanceBefore = await ethers.provider.getBalance(account2Address);
  const tokenBalanceBefore = await token.balanceOf(account2Address);
  const isWhitelisted = await kyc.isWhitelisted(account2Address);
  
  console.log("💰 ETH Balance:", ethers.formatEther(ethBalanceBefore), "ETH");
  console.log("🪙 Token Balance:", ethers.formatEther(tokenBalanceBefore), "FAT");
  console.log("✅ KYC Status:", isWhitelisted ? "✅ WHITELISTED" : "❌ NOT WHITELISTED");

  if (!isWhitelisted) {
    console.log("\n❌ Account 2 is NOT whitelisted! Cannot trade.");
    console.log("   Run: npx hardhat run scripts/whitelist-account.ts --network sepolia");
    process.exit(1);
  }

  if (ethBalanceBefore < ETH_TO_SPEND) {
    console.log("\n❌ Insufficient ETH balance!");
    console.log("   Need:", ethers.formatEther(ETH_TO_SPEND), "ETH");
    console.log("   Have:", ethers.formatEther(ethBalanceBefore), "ETH");
    console.log("   Get Sepolia ETH from: https://sepoliafaucet.com/");
    process.exit(1);
  }

  // Get pool info and quote
  console.log("\n" + "=".repeat(60));
  console.log("💧 DEX POOL INFO");
  console.log("=".repeat(60));
  
  const poolInfo = await dex.getPoolInfo();
  console.log("Token Reserve:", ethers.formatEther(poolInfo._reserveToken), "FAT");
  console.log("ETH Reserve:", ethers.formatEther(poolInfo._reserveETH), "ETH");
  console.log("Current Price:", ethers.formatEther(poolInfo._tokenPrice), "ETH per token");

  // Get quote for buying
  const tokenQuote = await dex.getTokenQuote(ETH_TO_SPEND);
  console.log("\n💵 Quote for", ethers.formatEther(ETH_TO_SPEND), "ETH:");
  console.log("   Expected to receive:", ethers.formatEther(tokenQuote), "FAT");

  // Set minimum tokens with 3% slippage tolerance
  const minTokens = tokenQuote * 97n / 100n;
  console.log("   Minimum tokens (3% slippage):", ethers.formatEther(minTokens), "FAT");

  // Buy tokens with Account 2
  console.log("\n" + "=".repeat(60));
  console.log("🛒 BUYING TOKENS");
  console.log("=".repeat(60));

  console.log("\n⏳ Estimating gas...");
  const gasEstimate = await dex.connect(account2).swapETHForTokens.estimateGas(minTokens, {
    value: ETH_TO_SPEND
  });
  console.log("📊 Estimated gas:", gasEstimate.toString());
  
  console.log("⏳ Executing swap (ETH → Tokens) with Account 2...");
  const swapTx = await dex.connect(account2).swapETHForTokens(minTokens, {
    value: ETH_TO_SPEND,
    gasLimit: gasEstimate * 120n / 100n,
  });
  
  console.log("📤 Transaction sent:", swapTx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  const receipt = await swapTx.wait();
  console.log("✅ Swap confirmed!");
  console.log("   Block:", receipt?.blockNumber);
  console.log("   Gas used:", receipt?.gasUsed.toString());
  console.log("   🔗 View on Etherscan:");
  console.log("   https://sepolia.etherscan.io/tx/" + receipt?.hash);

  // Check new balances
  const ethBalanceAfter = await ethers.provider.getBalance(account2Address);
  const tokenBalanceAfter = await token.balanceOf(account2Address);
  
  const ethSpent = ethBalanceBefore - ethBalanceAfter;
  const tokensReceived = tokenBalanceAfter - tokenBalanceBefore;
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 ACCOUNT 2 STATUS (AFTER)");
  console.log("=".repeat(60));
  console.log("💰 ETH Balance:", ethers.formatEther(ethBalanceAfter),
              "(-" + ethers.formatEther(ethSpent) + ")");
  console.log("🪙 Token Balance:", ethers.formatEther(tokenBalanceAfter),
              "(+" + ethers.formatEther(tokensReceived) + ")");

  console.log("\n" + "=".repeat(60));
  console.log("✅ PURCHASE COMPLETE!");
  console.log("=".repeat(60));
  console.log("🎁 Tokens received:", ethers.formatEther(tokensReceived), "FAT");
  console.log("💸 Total ETH spent:", ethers.formatEther(ethSpent), "ETH");
  console.log("   (including", ethers.formatEther(ethSpent - ETH_TO_SPEND), "ETH gas)");
  console.log("⛽ Gas cost:", ethers.formatEther(ethSpent - ETH_TO_SPEND), "ETH");
  console.log("💰 Effective price:", ethers.formatEther(ETH_TO_SPEND / tokensReceived * ethers.parseEther("1")), "ETH per token");

  console.log("\n💡 To view your tokens in MetaMask:");
  console.log("   1. Switch to Account 2 in MetaMask");
  console.log("   2. Add custom token: " + tokenAddress);
  console.log("   3. Symbol: FAT, Decimals: 18\n");

  // Final pool state
  const poolInfoAfter = await dex.getPoolInfo();
  console.log("💧 New Pool State:");
  console.log("   Token Reserve:", ethers.formatEther(poolInfoAfter._reserveToken), "FAT");
  console.log("   ETH Reserve:", ethers.formatEther(poolInfoAfter._reserveETH), "ETH");
  console.log("   New Price:", ethers.formatEther(poolInfoAfter._tokenPrice), "ETH per token\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:");
    console.error(error);
    process.exit(1);
  });
