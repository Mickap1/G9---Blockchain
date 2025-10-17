import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script to whitelist a new account in the KYC Registry
 * This is cheaper and more reliable than using Etherscan
 */

async function main() {
  console.log("\n🔐 Whitelisting New Account in KYC...\n");

  // CONFIGURATION : Compte 2 de l'utilisateur
  const ACCOUNT_2_ADDRESS = "0x9c57A18cA8740358b800E35A8467e92aC6879269";
  
  if (!ethers.isAddress(ACCOUNT_2_ADDRESS)) {
    console.log("❌ ERROR: Invalid Ethereum address!");
    process.exit(1);
  }

  // Get deployer (Account 1 - Owner)
  const [deployer] = await ethers.getSigners();
  console.log("📝 Account 1 (Owner):", deployer.address);
  console.log("📝 Account 2 (To whitelist):", ACCOUNT_2_ADDRESS);

  // Load deployments
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-addresses.json`);
  
  if (!fs.existsSync(deploymentsPath)) {
    console.log("❌ No deployments found!");
    process.exit(1);
  }
  
  const addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const kycAddress = addresses.kycRegistry;
  
  if (!kycAddress) {
    console.log("❌ KYC Registry address not found!");
    process.exit(1);
  }
  
  console.log("📋 KYC Registry:", kycAddress);

  // Get KYC contract
  const kyc = await ethers.getContractAt("KYCRegistry", kycAddress);
  
  // Check if already whitelisted
  const isAlreadyWhitelisted = await kyc.isWhitelisted(ACCOUNT_2_ADDRESS);
  
  if (isAlreadyWhitelisted) {
    console.log("\n✅ Account 2 is ALREADY whitelisted!");
    console.log("   No action needed.\n");
    process.exit(0);
  }
  
  console.log("\n⏳ Whitelisting Account 2...");
  
  // Set expiry to 1 year from now (in seconds)
  const oneYearFromNow = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
  console.log("📅 KYC expiry date:", new Date(oneYearFromNow * 1000).toLocaleDateString());
  
  // Estimate gas first
  const gasEstimate = await kyc.approveKYC.estimateGas(ACCOUNT_2_ADDRESS, oneYearFromNow);
  console.log("📊 Estimated gas:", gasEstimate.toString());
  
  // Execute with proper gas limit
  const tx = await kyc.approveKYC(ACCOUNT_2_ADDRESS, oneYearFromNow, {
    gasLimit: gasEstimate * 120n / 100n, // Add 20% buffer
  });
  
  console.log("📤 Transaction sent:", tx.hash);
  console.log("⏳ Waiting for confirmation...");
  
  const receipt = await tx.wait();
  
  console.log("✅ Transaction confirmed!");
  console.log("   Block:", receipt?.blockNumber);
  console.log("   Gas used:", receipt?.gasUsed.toString());
  
  // Verify whitelisting
  const isNowWhitelisted = await kyc.isWhitelisted(ACCOUNT_2_ADDRESS);
  
  console.log("\n" + "=".repeat(60));
  if (isNowWhitelisted) {
    console.log("✅ SUCCESS: Account 2 is now WHITELISTED!");
  } else {
    console.log("❌ ERROR: Whitelisting failed!");
  }
  console.log("=".repeat(60));
  
  console.log("\n📖 Next steps:");
  console.log("   1. Account 2 can now receive and send tokens");
  console.log("   2. Account 2 can trade on the DEX");
  console.log("   3. Use scripts/trade-tokens.ts to test trading\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:");
    console.error(error);
    process.exit(1);
  });
