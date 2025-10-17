import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script optimized for Account 2 to buy tokens from DEX
 * Much cheaper than using Etherscan (0.001 ETH vs 0.0315 ETH)
 */

async function main() {
  console.log("\n🛒 Buying Tokens with Account 2 (via DEX)\n");

  // CONFIGURATION
  const ACCOUNT_2_ADDRESS = "0x9c57A18cA8740358b800E35A8467e92aC6879269";
  const ETH_TO_SPEND = ethers.parseEther("0.005"); // Buy with 0.005 ETH

  console.log("📝 Account 2:", ACCOUNT_2_ADDRESS);
  console.log("💰 ETH to spend:", ethers.formatEther(ETH_TO_SPEND), "ETH");

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
  
  console.log("\n📋 Contract Addresses:");
  console.log("   Token:", tokenAddress);
  console.log("   DEX:", dexAddress);
  console.log("   KYC:", kycAddress);

  // Get contracts
  const token = await ethers.getContractAt("FungibleAssetToken", tokenAddress);
  const kyc = await ethers.getContractAt("KYCRegistry", kycAddress);
  const dex = await ethers.getContractAt("SimpleDEX", dexAddress);

  // Check Account 2 status
  console.log("\n" + "=".repeat(60));
  console.log("👤 ACCOUNT 2 STATUS");
  console.log("=".repeat(60));
  
  const ethBalance = await ethers.provider.getBalance(ACCOUNT_2_ADDRESS);
  const tokenBalance = await token.balanceOf(ACCOUNT_2_ADDRESS);
  const isWhitelisted = await kyc.isWhitelisted(ACCOUNT_2_ADDRESS);
  
  console.log("💰 ETH Balance:", ethers.formatEther(ethBalance), "ETH");
  console.log("🪙 Token Balance:", ethers.formatEther(tokenBalance), "FAT");
  console.log("✅ KYC Status:", isWhitelisted ? "✅ WHITELISTED" : "❌ NOT WHITELISTED");

  if (!isWhitelisted) {
    console.log("\n❌ Account 2 is NOT whitelisted! Cannot trade.");
    console.log("   Run: npx hardhat run scripts/whitelist-account.ts --network sepolia");
    process.exit(1);
  }

  if (ethBalance < ETH_TO_SPEND) {
    console.log("\n❌ Insufficient ETH balance!");
    console.log("   Need:", ethers.formatEther(ETH_TO_SPEND), "ETH");
    console.log("   Have:", ethers.formatEther(ethBalance), "ETH");
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
  console.log("   Will receive:", ethers.formatEther(tokenQuote), "FAT");
  console.log("   Price per token:", ethers.formatEther(ETH_TO_SPEND / tokenQuote * ethers.parseEther("1")), "ETH");

  // Set minimum tokens with 3% slippage tolerance
  const minTokens = tokenQuote * 97n / 100n;
  console.log("   Minimum tokens (3% slippage):", ethers.formatEther(minTokens), "FAT");

  // Buy tokens
  console.log("\n" + "=".repeat(60));
  console.log("🛒 BUYING TOKENS");
  console.log("=".repeat(60));

  console.log("\n⚠️  IMPORTANT:");
  console.log("   This script needs to be signed by Account 2");
  console.log("   Current signer:", (await ethers.provider.getSigner()).address);
  console.log("\n   If this is NOT Account 2, you have 2 options:");
  console.log("   1. Add PRIVATE_KEY_2 to .env and update hardhat.config.ts");
  console.log("   2. Use Etherscan with these optimized parameters:");
  console.log("\n   📋 Etherscan Parameters:");
  console.log("   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("   Contract: https://sepolia.etherscan.io/address/" + dexAddress + "#writeContract");
  console.log("   Function: swapETHForTokens");
  console.log("   minTokens:", minTokens.toString());
  console.log("   payableAmount:", ethers.formatEther(ETH_TO_SPEND));
  console.log("   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("   Gas Settings (in MetaMask Advanced):");
  console.log("   - Gas Limit: 120000");
  console.log("   - Max Priority Fee: 1 Gwei");
  console.log("   - Max Fee: 20 Gwei");
  console.log("   Expected cost: ~0.0024 ETH (instead of 0.0315 ETH)");
  console.log("\n   Connect Account 2 in MetaMask and use these exact values!\n");

  // Check if current signer can execute
  const [currentSigner] = await ethers.getSigners();
  const currentAddress = await currentSigner.getAddress();
  
  if (currentAddress.toLowerCase() === ACCOUNT_2_ADDRESS.toLowerCase()) {
    console.log("✅ Current signer matches Account 2! Proceeding with transaction...\n");
    
    // Estimate gas
    const gasEstimate = await dex.swapETHForTokens.estimateGas(minTokens, {
      value: ETH_TO_SPEND
    });
    console.log("📊 Estimated gas:", gasEstimate.toString());
    
    // Execute swap
    console.log("⏳ Executing swap (ETH → Tokens)...");
    const swapTx = await dex.swapETHForTokens(minTokens, {
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
    const newEthBalance = await ethers.provider.getBalance(ACCOUNT_2_ADDRESS);
    const newTokenBalance = await token.balanceOf(ACCOUNT_2_ADDRESS);
    
    console.log("\n" + "=".repeat(60));
    console.log("📊 AFTER BUYING");
    console.log("=".repeat(60));
    console.log("Account 2:");
    console.log("   ETH:", ethers.formatEther(newEthBalance),
                "(-" + ethers.formatEther(ethBalance - newEthBalance) + ")");
    console.log("   Tokens:", ethers.formatEther(newTokenBalance),
                "(+" + ethers.formatEther(newTokenBalance - tokenBalance) + ")");

    console.log("\n✅ Purchase complete! Tokens received: " + 
                ethers.formatEther(newTokenBalance - tokenBalance) + " FAT");
  } else {
    console.log("ℹ️  Script completed with instructions for manual execution.");
  }

  console.log("\n💡 To view your tokens in MetaMask:");
  console.log("   1. Switch to Account 2 in MetaMask");
  console.log("   2. Add custom token: " + tokenAddress);
  console.log("   3. Symbol: FAT, Decimals: 18\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:");
    console.error(error);
    process.exit(1);
  });
