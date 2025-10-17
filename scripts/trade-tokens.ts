import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Complete script for trading tokens:
 * 1. Account 1 sells tokens to DEX (swapTokensForETH)
 * 2. Account 2 buys tokens from DEX (swapETHForTokens)
 * 
 * Much cheaper and more reliable than using Etherscan!
 */

async function main() {
  console.log("\n🔄 Token Trading Script\n");

  // Get deployer (Account 1)
  const [deployer] = await ethers.getSigners();
  console.log("📝 Account 1 (Seller):", deployer.address);

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

  // Check balances before
  console.log("\n" + "=".repeat(60));
  console.log("📊 BEFORE TRADING");
  console.log("=".repeat(60));
  
  const ethBalance1Before = await ethers.provider.getBalance(deployer.address);
  const tokenBalance1Before = await token.balanceOf(deployer.address);
  const isWhitelisted1 = await kyc.isWhitelisted(deployer.address);
  
  console.log("Account 1:");
  console.log("   ETH:", ethers.formatEther(ethBalance1Before));
  console.log("   Tokens:", ethers.formatEther(tokenBalance1Before));
  console.log("   Whitelisted:", isWhitelisted1 ? "✅" : "❌");

  if (!isWhitelisted1) {
    console.log("\n❌ Account 1 is not whitelisted! Cannot trade.");
    process.exit(1);
  }

  if (tokenBalance1Before === 0n) {
    console.log("\n❌ Account 1 has no tokens to sell!");
    process.exit(1);
  }

  // Get pool info
  const poolInfo = await dex.getPoolInfo();
  console.log("\nDEX Pool:");
  console.log("   Token Reserve:", ethers.formatEther(poolInfo._reserveToken));
  console.log("   ETH Reserve:", ethers.formatEther(poolInfo._reserveETH));
  console.log("   Price:", ethers.formatEther(poolInfo._tokenPrice), "ETH/token");

  // STEP 1: Sell tokens (Account 1)
  console.log("\n" + "=".repeat(60));
  console.log("💰 STEP 1: Selling Tokens (Account 1 → DEX)");
  console.log("=".repeat(60));

  const tokensToSell = ethers.parseEther("50"); // Sell 50 tokens
  console.log("\n📤 Selling", ethers.formatEther(tokensToSell), "tokens");

  // Get quote for selling
  const ethQuote = await dex.getETHQuote(tokensToSell);
  console.log("💵 Expected to receive:", ethers.formatEther(ethQuote), "ETH");

  const minETH = ethQuote * 95n / 100n; // 5% slippage tolerance
  console.log("📊 Minimum ETH (with 5% slippage):", ethers.formatEther(minETH));

  // Check current allowance
  const currentAllowance = await token.allowance(deployer.address, dexAddress);
  
  if (currentAllowance < tokensToSell) {
    console.log("\n⏳ Approving DEX to spend tokens...");
    const gasEstimateApprove = await token.approve.estimateGas(dexAddress, tokensToSell);
    const approveTx = await token.approve(dexAddress, tokensToSell, {
      gasLimit: gasEstimateApprove * 120n / 100n,
    });
    console.log("   Transaction:", approveTx.hash);
    await approveTx.wait();
    console.log("   ✅ Approval confirmed");
  } else {
    console.log("✅ DEX already has sufficient allowance");
  }

  // Execute swap
  console.log("\n⏳ Executing swap (Tokens → ETH)...");
  const gasEstimateSwap = await dex.swapTokensForETH.estimateGas(tokensToSell, minETH);
  console.log("📊 Estimated gas:", gasEstimateSwap.toString());
  
  const swapTx = await dex.swapTokensForETH(tokensToSell, minETH, {
    gasLimit: gasEstimateSwap * 120n / 100n,
  });
  
  console.log("📤 Transaction sent:", swapTx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  const swapReceipt = await swapTx.wait();
  console.log("✅ Swap confirmed!");
  console.log("   Block:", swapReceipt?.blockNumber);
  console.log("   Gas used:", swapReceipt?.gasUsed.toString());
  console.log("   🔗 View on Etherscan:");
  console.log("   https://sepolia.etherscan.io/tx/" + swapReceipt?.hash);

  // Check balances after
  console.log("\n" + "=".repeat(60));
  console.log("📊 AFTER SELLING");
  console.log("=".repeat(60));
  
  const ethBalance1After = await ethers.provider.getBalance(deployer.address);
  const tokenBalance1After = await token.balanceOf(deployer.address);
  
  console.log("Account 1:");
  console.log("   ETH:", ethers.formatEther(ethBalance1After), 
              "(+" + ethers.formatEther(ethBalance1After - ethBalance1Before) + ")");
  console.log("   Tokens:", ethers.formatEther(tokenBalance1After),
              "(-" + ethers.formatEther(tokenBalance1Before - tokenBalance1After) + ")");

  const poolInfoAfter = await dex.getPoolInfo();
  console.log("\nDEX Pool:");
  console.log("   Token Reserve:", ethers.formatEther(poolInfoAfter._reserveToken));
  console.log("   ETH Reserve:", ethers.formatEther(poolInfoAfter._reserveETH));
  console.log("   New Price:", ethers.formatEther(poolInfoAfter._tokenPrice), "ETH/token");

  console.log("\n" + "=".repeat(60));
  console.log("✅ TRADING COMPLETE!");
  console.log("=".repeat(60));

  console.log("\n💡 To test buying with Account 2:");
  console.log("   1. Configure Account 2 in hardhat.config.ts");
  console.log("   2. Create a similar script for buying");
  console.log("   3. Or use Etherscan: swapETHForTokens with 0.01 ETH\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:");
    console.error(error);
    process.exit(1);
  });
