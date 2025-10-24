import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("\n🔍 DEBUG: DEX Add Liquidity Requirements\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Account:", deployer.address);

  // Load deployments
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-addresses.json`);
  
  const addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const dexAddress = addresses.dex;
  const tokenAddress = addresses.fungibleToken;
  const kycAddress = addresses.kycRegistry;

  console.log("📋 Contracts:");
  console.log("   DEX:", dexAddress);
  console.log("   Token:", tokenAddress);
  console.log("   KYC:", kycAddress);

  const dex = await ethers.getContractAt("SimpleDEX", dexAddress);
  const token = await ethers.getContractAt("FungibleAssetToken", tokenAddress);
  const kyc = await ethers.getContractAt("KYCRegistry", kycAddress);

  // Check 1: KYC Status
  console.log("\n✅ CHECK 1: KYC Status");
  const isWhitelisted = await kyc.isWhitelisted(deployer.address);
  const kycData = await kyc.getKYCData(deployer.address);
  console.log("   isWhitelisted:", isWhitelisted);
  console.log("   KYC Status:", kycData.status.toString());
  console.log("   Expiry Date:", new Date(Number(kycData.expiryDate) * 1000).toLocaleDateString());

  // Check 2: DEX pointing to correct KYC
  console.log("\n✅ CHECK 2: DEX Configuration");
  const dexKycAddress = await dex.kycRegistry();
  const dexTokenAddress = await dex.token();
  console.log("   DEX KYC Registry:", dexKycAddress);
  console.log("   Expected KYC:", kycAddress);
  console.log("   Match:", dexKycAddress.toLowerCase() === kycAddress.toLowerCase());
  console.log("   DEX Token:", dexTokenAddress);
  console.log("   Expected Token:", tokenAddress);
  console.log("   Match:", dexTokenAddress.toLowerCase() === tokenAddress.toLowerCase());

  // Check 3: Token Balance & Allowance
  console.log("\n✅ CHECK 3: Token Balance & Allowance");
  const tokenBalance = await token.balanceOf(deployer.address);
  const allowance = await token.allowance(deployer.address, dexAddress);
  console.log("   Token Balance:", ethers.formatEther(tokenBalance));
  console.log("   Allowance to DEX:", ethers.formatEther(allowance));

  // Check 4: ETH Balance
  console.log("\n✅ CHECK 4: ETH Balance");
  const ethBalance = await ethers.provider.getBalance(deployer.address);
  console.log("   ETH Balance:", ethers.formatEther(ethBalance));

  // Check 5: DEX is not paused
  console.log("\n✅ CHECK 5: DEX State");
  const isPaused = await dex.paused();
  console.log("   Is Paused:", isPaused);

  // Check 6: Pool reserves
  console.log("\n✅ CHECK 6: Pool Reserves");
  const reserveToken = await dex.reserveToken();
  const reserveETH = await dex.reserveETH();
  console.log("   Token Reserve:", ethers.formatEther(reserveToken));
  console.log("   ETH Reserve:", ethers.formatEther(reserveETH));

  // Try to simulate the call
  console.log("\n✅ CHECK 7: Simulating addLiquidity call");
  const liquidityTokenAmount = ethers.parseEther("100");
  const liquidityETHAmount = ethers.parseEther("0.001");

  try {
    await dex.addLiquidity.staticCall(liquidityTokenAmount, {
      value: liquidityETHAmount,
      from: deployer.address
    });
    console.log("   ✅ Static call successful! Transaction should work.");
  } catch (error: any) {
    console.log("   ❌ Static call failed!");
    console.log("   Error:", error.message);
    
    // Try to decode the error
    if (error.data) {
      console.log("   Error data:", error.data);
    }
  }

  console.log("\n" + "=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
