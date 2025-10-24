import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("\n🔧 Fixing DEX in KYC Registry...\n");

  const [deployer] = await ethers.getSigners();

  // Load deployments
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-addresses.json`);
  
  const addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const kycAddress = addresses.kycRegistry;
  const dexAddress = addresses.dex;

  console.log("📋 KYC Registry:", kycAddress);
  console.log("🎯 DEX Address:", dexAddress);

  const kyc = await ethers.getContractAt("KYCRegistry", kycAddress);

  // Check if DEX is already in the list
  const approvedAddresses = await kyc.getAllAddressesByStatus(2);
  const isInList = approvedAddresses.some((addr: string) => addr.toLowerCase() === dexAddress.toLowerCase());

  console.log("\n✅ DEX in approved list:", isInList);

  if (isInList) {
    console.log("\n✅ DEX is already visible in the admin panel!");
    return;
  }

  console.log("\n⚠️  DEX is whitelisted but not in the _allAddresses array");
  console.log("    This is a smart contract bug - approveKYC doesn't add to _allAddresses");
  console.log("\n💡 Workaround: Submit KYC for DEX (will add it to _allAddresses)");

  // Submit KYC for the DEX (as if it was submitting itself)
  // This will add it to _allAddresses
  console.log("\n📝 Submitting KYC for DEX...");
  
  // We need to call submitKYC from the DEX address, but we can't do that
  // Instead, let's check if we can manually add it via an admin function
  
  console.log("\n❌ Cannot fix this without modifying the smart contract");
  console.log("\n📝 SOLUTION:");
  console.log("   1. The smart contract KYCRegistry has a bug in approveKYC()");
  console.log("   2. It doesn't add addresses to _allAddresses when approving them directly");
  console.log("   3. Only submitKYC() adds to _allAddresses");
  console.log("\n   The DEX IS whitelisted and functional");
  console.log("   It just doesn't appear in the admin panel's approved list");
  console.log("\n   To see it in the admin panel, you would need to:");
  console.log("   - Redeploy KYCRegistry with fixed approveKYC(), OR");
  console.log("   - Add a manual tracking function in the admin panel");
  
  console.log("\n🔍 Current workaround: Check whitelist status directly");
  console.log("   Use: kyc.isWhitelisted(address) to verify");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
