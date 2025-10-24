import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("\n🔓 Whitelisting Specific Address...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Admin account:", deployer.address);

  // Address to whitelist
  const addressToWhitelist = "0x5cFb5A4268EBdd4d058D0A2AaA20a19929EFC073";

  // Load deployments
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-addresses.json`);
  
  const addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const kycAddress = addresses.kycRegistry;

  console.log("📋 KYC Registry:", kycAddress);
  console.log("🎯 Address to whitelist:", addressToWhitelist);

  const kyc = await ethers.getContractAt("KYCRegistry", kycAddress);

  // Check current status
  const isWhitelisted = await kyc.isWhitelisted(addressToWhitelist);
  console.log("\n✅ Current whitelist status:", isWhitelisted);

  if (isWhitelisted) {
    console.log("\n✅ Address is already whitelisted!");
    return;
  }

  // Approve KYC for the address (1 year expiry)
  const oneYearFromNow = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
  
  console.log("\n🔓 Approving KYC...");
  console.log("   Expiry date:", new Date(oneYearFromNow * 1000).toLocaleDateString());
  
  const tx = await kyc.approveKYC(addressToWhitelist, oneYearFromNow);
  console.log("⏳ Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("✅ Transaction confirmed!");

  // Verify
  const newStatus = await kyc.isWhitelisted(addressToWhitelist);
  console.log("\n✅ New whitelist status:", newStatus);

  if (newStatus) {
    console.log("\n🎉 SUCCESS! Address is now whitelisted.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
