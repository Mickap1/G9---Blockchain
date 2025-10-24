import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script to add initial liquidity to the new DEX
 * Uses smaller amounts to avoid insufficient funds error
 */

async function main() {
  console.log("\n💧 Adding Initial Liquidity to New DEX...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 ETH Balance:", ethers.formatEther(balance), "ETH\n");

  // Load deployments
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-addresses.json`);
  
  if (!fs.existsSync(deploymentsPath)) {
    console.log("❌ No deployments found!");
    process.exit(1);
  }

  const addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const dexAddress = addresses.dex;
  const tokenAddress = addresses.fungibleToken;

  console.log("📋 Contracts:");
  console.log("   DEX:", dexAddress);
  console.log("   Token:", tokenAddress);

  // Get contracts
  const dex = await ethers.getContractAt("SimpleDEX", dexAddress);
  const token = await ethers.getContractAt("FungibleAssetToken", tokenAddress);

  // Check token balance
  const tokenBalance = await token.balanceOf(deployer.address);
  console.log("\n📊 Current balances:");
  console.log("   Tokens:", ethers.formatEther(tokenBalance));

  // Set smaller amounts for liquidity
  const liquidityTokenAmount = ethers.parseEther("100");  // 100 tokens
  const liquidityETHAmount = ethers.parseEther("0.001");  // 0.001 ETH

  if (tokenBalance < liquidityTokenAmount) {
    console.log("\n❌ Insufficient token balance!");
    console.log("   Need:", ethers.formatEther(liquidityTokenAmount), "tokens");
    console.log("   Have:", ethers.formatEther(tokenBalance), "tokens");
    process.exit(1);
  }

  if (balance < liquidityETHAmount) {
    console.log("\n❌ Insufficient ETH balance!");
    console.log("   Need:", ethers.formatEther(liquidityETHAmount), "ETH");
    console.log("   Have:", ethers.formatEther(balance), "ETH");
    process.exit(1);
  }

  // Approve DEX to spend tokens
  console.log("\n🔓 Approving DEX to spend tokens...");
  const approveTx = await token.approve(dexAddress, liquidityTokenAmount);
  await approveTx.wait();
  console.log("✅ Approval granted");

  // Add liquidity
  console.log("\n💧 Adding liquidity:");
  console.log("   Tokens:", ethers.formatEther(liquidityTokenAmount));
  console.log("   ETH:", ethers.formatEther(liquidityETHAmount));

  const addLiquidityTx = await dex.addLiquidity(liquidityTokenAmount, {
    value: liquidityETHAmount
  });

  const receipt = await addLiquidityTx.wait();
  console.log("\n✅ Liquidity added!");
  console.log("   Transaction hash:", receipt?.hash);

  // Display pool info
  const poolInfo = await dex.getPoolInfo();
  console.log("\n📊 Pool Information:");
  console.log("   Token Reserve:", ethers.formatEther(poolInfo._reserveToken));
  console.log("   ETH Reserve:", ethers.formatEther(poolInfo._reserveETH));
  console.log("   Total Liquidity:", ethers.formatEther(poolInfo._totalLiquidity));
  console.log("   Token Price:", ethers.formatEther(poolInfo._tokenPrice), "ETH per token");

  console.log("\n✅ Done! Pool is ready for trading.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Failed:");
    console.error(error);
    process.exit(1);
  });
