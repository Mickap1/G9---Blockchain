import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script to check KYC configuration and whitelist the deployer
 */

async function main() {
  console.log("\n🔍 Checking KYC Configuration...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployer:", deployer.address);

  // Load deployments
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-addresses.json`);
  
  if (!fs.existsSync(deploymentsPath)) {
    console.log("❌ No deployments found!");
    process.exit(1);
  }
  
  const addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const nftAddress = addresses.nft;
  const currentKycAddress = addresses.kycRegistry;
  
  console.log("\n📋 Addresses:");
  console.log("   NFT:", nftAddress);
  console.log("   Current KYC Registry:", currentKycAddress);

  // Get NFT contract
  const nft = await ethers.getContractAt("NFTAssetToken", nftAddress);
  const nftKycAddress = await nft.kycRegistry();
  
  console.log("   NFT's KYC Registry:", nftKycAddress);

  if (nftKycAddress.toLowerCase() !== currentKycAddress.toLowerCase()) {
    console.log("\n⚠️  WARNING: NFT contract uses a different KYC registry!");
    console.log("   NFT KYC:", nftKycAddress);
    console.log("   Current KYC:", currentKycAddress);
    console.log("\n   We need to whitelist the deployer in the NFT's KYC registry.");
  }

  // Connect to the NFT's KYC registry
  const kyc = await ethers.getContractAt("KYCRegistry", nftKycAddress);
  
  console.log("\n" + "=".repeat(60));
  console.log("🔐 KYC STATUS CHECK");
  console.log("=".repeat(60));

  // Check if deployer is whitelisted
  const isWhitelisted = await kyc.isWhitelisted(deployer.address);
  console.log("Deployer whitelisted:", isWhitelisted ? "✅ YES" : "❌ NO");

  if (!isWhitelisted) {
    console.log("\n⏳ Whitelisting deployer...");
    
    // Check if deployer has admin role
    try {
      const oneYearFromNow = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
      const tx = await kyc.approveKYC(deployer.address, oneYearFromNow);
      console.log("   Transaction sent:", tx.hash);
      
      await tx.wait();
      console.log("   ✅ Deployer whitelisted successfully!");
      
      // Verify
      const isNowWhitelisted = await kyc.isWhitelisted(deployer.address);
      console.log("   Verification:", isNowWhitelisted ? "✅ Confirmed" : "❌ Failed");
      
    } catch (error: any) {
      console.error("   ❌ Failed to whitelist:", error.message);
      console.log("\n   This might be because:");
      console.log("   - You don't have KYC_ADMIN_ROLE on this registry");
      console.log("   - The registry is from a different deployment");
      console.log("\n   Solution: Deploy a new NFT contract with the current KYC registry");
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ CHECK COMPLETE");
  console.log("=".repeat(60));
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:");
    console.error(error);
    process.exit(1);
  });
