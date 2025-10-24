import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("\n💧 Adding More Liquidity to DEX...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 ETH Balance:", ethers.formatEther(balance), "ETH\n");

  // Load deployments
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-addresses.json`);
  
  const addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const dexAddress = addresses.dex;
  const tokenAddress = addresses.fungibleToken;

  console.log("📋 Contracts:");
  console.log("   DEX:", dexAddress);
  console.log("   Token:", tokenAddress);

  const dex = await ethers.getContractAt("SimpleDEX", dexAddress);
  const token = await ethers.getContractAt("FungibleAssetToken", tokenAddress);

  // Check current pool
  const poolInfo = await dex.getPoolInfo();
  console.log("\n📊 Current Pool:");
  console.log("   Token Reserve:", ethers.formatEther(poolInfo._reserveToken));
  console.log("   ETH Reserve:", ethers.formatEther(poolInfo._reserveETH));
  console.log("   Token Price:", ethers.formatEther(poolInfo._tokenPrice), "ETH per token");

  // Add more liquidity - adjust these amounts
  const ethToAdd = ethers.parseEther("0.05");  // 0.05 ETH (modifiable)
  const currentRatio = Number(poolInfo._reserveToken) / Number(poolInfo._reserveETH);
  const tokensNeeded = Number(ethers.formatEther(ethToAdd)) * currentRatio;
  const tokenAmount = ethers.parseEther(tokensNeeded.toString());

  console.log("\n💧 Adding liquidity:");
  console.log("   ETH:", ethers.formatEther(ethToAdd));
  console.log("   Tokens needed:", tokensNeeded.toFixed(6));

  // Check balances
  const tokenBalance = await token.balanceOf(deployer.address);
  const ethBalance = await ethers.provider.getBalance(deployer.address);

  if (tokenBalance < tokenAmount) {
    console.log("\n❌ Insufficient token balance!");
    console.log("   Need:", ethers.formatEther(tokenAmount));
    console.log("   Have:", ethers.formatEther(tokenBalance));
    return;
  }

  if (ethBalance < ethToAdd) {
    console.log("\n❌ Insufficient ETH balance!");
    console.log("   Need:", ethers.formatEther(ethToAdd));
    console.log("   Have:", ethers.formatEther(ethBalance));
    return;
  }

  // Approve
  console.log("\n🔓 Approving tokens...");
  const approveTx = await token.approve(dexAddress, tokenAmount);
  await approveTx.wait();
  console.log("✅ Approved");

  // Add liquidity
  console.log("\n💧 Adding liquidity...");
  const addLiquidityTx = await dex.addLiquidity(tokenAmount, {
    value: ethToAdd
  });

  const receipt = await addLiquidityTx.wait();
  console.log("✅ Liquidity added!");
  console.log("   Transaction hash:", receipt?.hash);

  // Display new pool info
  const newPoolInfo = await dex.getPoolInfo();
  console.log("\n📊 New Pool Information:");
  console.log("   Token Reserve:", ethers.formatEther(newPoolInfo._reserveToken));
  console.log("   ETH Reserve:", ethers.formatEther(newPoolInfo._reserveETH));
  console.log("   Total Liquidity:", ethers.formatEther(newPoolInfo._totalLiquidity));
  console.log("   Token Price:", ethers.formatEther(newPoolInfo._tokenPrice), "ETH per token");

  console.log("\n✅ Done!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Failed:");
    console.error(error);
    process.exit(1);
  });
