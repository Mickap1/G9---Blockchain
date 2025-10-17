import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script to check the status of two accounts before trading
 * Verifies KYC status, token balances, and ETH balances
 */

async function main() {
  console.log("\n🔍 Checking Accounts Status for Trading...\n");

  // Get deployer (Account 1)
  const [deployer] = await ethers.getSigners();
  
  // Prompt for Account 2 address
  console.log("📝 Account 1 (Current deployer):", deployer.address);
  console.log("\n⚠️  Please provide Account 2 address:");
  console.log("   (The address you want to test trading with)\n");
  
  // For now, we'll just check Account 1
  // User will need to provide Account 2 address manually
  
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
  
  // Get contracts
  const token = await ethers.getContractAt("FungibleAssetToken", tokenAddress);
  const kyc = await ethers.getContractAt("KYCRegistry", kycAddress);
  const dex = await ethers.getContractAt("SimpleDEX", dexAddress);
  
  console.log("📋 Contract Addresses:");
  console.log("   Token (FAT):", tokenAddress);
  console.log("   KYC Registry:", kycAddress);
  console.log("   SimpleDEX:", dexAddress);
  
  // Check Account 1
  console.log("\n" + "=".repeat(60));
  console.log("👤 ACCOUNT 1 (Deployer):", deployer.address);
  console.log("=".repeat(60));
  
  const ethBalance1 = await ethers.provider.getBalance(deployer.address);
  const tokenBalance1 = await token.balanceOf(deployer.address);
  const isWhitelisted1 = await kyc.isWhitelisted(deployer.address);
  
  console.log("💰 ETH Balance:", ethers.formatEther(ethBalance1), "ETH");
  console.log("🪙 Token Balance:", ethers.formatEther(tokenBalance1), "FAT");
  console.log("✅ KYC Status:", isWhitelisted1 ? "✅ WHITELISTED" : "❌ NOT WHITELISTED");
  
  // Check DEX pool
  console.log("\n" + "=".repeat(60));
  console.log("💧 DEX POOL STATUS");
  console.log("=".repeat(60));
  
  const poolInfo = await dex.getPoolInfo();
  console.log("Token Reserve:", ethers.formatEther(poolInfo._reserveToken), "FAT");
  console.log("ETH Reserve:", ethers.formatEther(poolInfo._reserveETH), "ETH");
  console.log("Current Price:", ethers.formatEther(poolInfo._tokenPrice), "ETH per token");
  
  // Check if DEX is whitelisted
  const isDexWhitelisted = await kyc.isWhitelisted(dexAddress);
  console.log("DEX KYC Status:", isDexWhitelisted ? "✅ WHITELISTED" : "❌ NOT WHITELISTED");
  
  console.log("\n" + "=".repeat(60));
  console.log("📊 SUMMARY");
  console.log("=".repeat(60));
  
  let readyToTrade = true;
  
  if (!isWhitelisted1) {
    console.log("❌ Account 1 is NOT whitelisted - Cannot trade");
    readyToTrade = false;
  } else {
    console.log("✅ Account 1 is whitelisted");
  }
  
  if (tokenBalance1 === 0n) {
    console.log("⚠️  Account 1 has NO tokens - Nothing to sell");
  } else {
    console.log("✅ Account 1 has", ethers.formatEther(tokenBalance1), "tokens to sell");
  }
  
  if (!isDexWhitelisted) {
    console.log("❌ DEX is NOT whitelisted - Trading will fail");
    readyToTrade = false;
  } else {
    console.log("✅ DEX is whitelisted");
  }
  
  if (poolInfo._reserveToken === 0n || poolInfo._reserveETH === 0n) {
    console.log("❌ DEX pool is EMPTY - Cannot trade");
    readyToTrade = false;
  } else {
    console.log("✅ DEX pool has liquidity");
  }
  
  console.log("\n" + "=".repeat(60));
  
  if (readyToTrade) {
    console.log("✅ READY TO TRADE!");
    console.log("\n📖 Next steps:");
    console.log("   1. Make sure Account 2 has:");
    console.log("      - Some Sepolia ETH (for gas + buying tokens)");
    console.log("      - Is whitelisted in KYC");
    console.log("   2. Use Etherscan Write Contract to trade");
    console.log("\n🔗 Etherscan Links:");
    console.log("   Token:", `https://sepolia.etherscan.io/address/${tokenAddress}#writeContract`);
    console.log("   DEX:", `https://sepolia.etherscan.io/address/${dexAddress}#writeContract`);
  } else {
    console.log("❌ NOT READY TO TRADE - Fix issues above first");
  }
  
  console.log("\n💡 To whitelist Account 2:");
  console.log(`   await kyc.approveKYC("ACCOUNT_2_ADDRESS")`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:");
    console.error(error);
    process.exit(1);
  });
