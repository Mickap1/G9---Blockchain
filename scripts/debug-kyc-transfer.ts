import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("\n🔍 Deep KYC Check for Token Transfers...\n");

  const [deployer] = await ethers.getSigners();

  // Load deployments
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-addresses.json`);
  
  const addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const kycAddress = addresses.kycRegistry;
  const dexAddress = addresses.dex;
  const tokenAddress = addresses.fungibleToken;

  console.log("📋 Contracts:");
  console.log("   KYC Registry:", kycAddress);
  console.log("   DEX:", dexAddress);
  console.log("   Token:", tokenAddress);
  console.log("   User:", deployer.address);

  const kyc = await ethers.getContractAt("KYCRegistry", kycAddress);
  const token = await ethers.getContractAt("FungibleAssetToken", tokenAddress);

  // Test 1: Check KYC status
  console.log("\n✅ TEST 1: KYC Status Check");
  
  const userWhitelisted = await kyc.isWhitelisted(deployer.address);
  const userBlacklisted = await kyc.isBlacklisted(deployer.address);
  const dexWhitelisted = await kyc.isWhitelisted(dexAddress);
  const dexBlacklisted = await kyc.isBlacklisted(dexAddress);

  console.log("\n   User:", deployer.address);
  console.log("     - isWhitelisted:", userWhitelisted);
  console.log("     - isBlacklisted:", userBlacklisted);

  console.log("\n   DEX:", dexAddress);
  console.log("     - isWhitelisted:", dexWhitelisted);
  console.log("     - isBlacklisted:", dexBlacklisted);

  // Test 2: Check _kycData directly
  console.log("\n✅ TEST 2: Direct _kycData Check");
  
  const userData = await kyc.getKYCData(deployer.address);
  const dexData = await kyc.getKYCData(dexAddress);

  console.log("\n   User _kycData:");
  console.log("     - status:", userData.status.toString(), "(2 = Approved)");
  console.log("     - approvalDate:", new Date(Number(userData.approvalDate) * 1000).toLocaleString());
  console.log("     - expiryDate:", userData.expiryDate.toString() === "0" ? "No expiry" : new Date(Number(userData.expiryDate) * 1000).toLocaleString());

  console.log("\n   DEX _kycData:");
  console.log("     - status:", dexData.status.toString(), "(2 = Approved)");
  console.log("     - approvalDate:", new Date(Number(dexData.approvalDate) * 1000).toLocaleString());
  console.log("     - expiryDate:", dexData.expiryDate.toString() === "0" ? "No expiry" : new Date(Number(dexData.expiryDate) * 1000).toLocaleString());

  // Test 3: Token balance and allowance
  console.log("\n✅ TEST 3: Token Balance & Allowance");
  
  const userBalance = await token.balanceOf(deployer.address);
  const dexBalance = await token.balanceOf(dexAddress);
  const allowance = await token.allowance(deployer.address, dexAddress);

  console.log("\n   User token balance:", ethers.formatEther(userBalance));
  console.log("   DEX token balance:", ethers.formatEther(dexBalance));
  console.log("   Allowance (User -> DEX):", ethers.formatEther(allowance));

  // Test 4: Simulate transfer
  console.log("\n✅ TEST 4: Simulate Transfer (User -> DEX)");
  
  try {
    // Try to simulate a transfer of 1 token
    const testAmount = ethers.parseEther("1");
    
    await token.transfer.staticCall(dexAddress, testAmount, {
      from: deployer.address
    });
    
    console.log("   ✅ Transfer simulation SUCCESSFUL");
    console.log("   → Transferring tokens to DEX should work!");
  } catch (error: any) {
    console.log("   ❌ Transfer simulation FAILED");
    console.log("   Error:", error.message);
    
    // Try to decode the error
    if (error.data) {
      console.log("   Error data:", error.data);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("CONCLUSION:");
  console.log("=".repeat(60));
  
  if (!userWhitelisted) {
    console.log("❌ USER is NOT whitelisted - this is the problem!");
  } else if (!dexWhitelisted) {
    console.log("❌ DEX is NOT whitelisted - this is the problem!");
  } else {
    console.log("✅ Both User and DEX are whitelisted");
    console.log("   If swaps still fail, check:");
    console.log("   1. Gas limits");
    console.log("   2. Slippage tolerance");
    console.log("   3. Pool liquidity");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
