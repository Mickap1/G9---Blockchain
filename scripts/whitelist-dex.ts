import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("\n🔓 Whitelisting DEX Contract...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Admin account:", deployer.address);

  // Load deployments
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-addresses.json`);
  
  const addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const kycAddress = addresses.kycRegistry;
  const dexAddress = addresses.dex;

  console.log("📋 Contracts:");
  console.log("   KYC Registry:", kycAddress);
  console.log("   DEX:", dexAddress);

  const kyc = await ethers.getContractAt("KYCRegistry", kycAddress);

  // Check if DEX is already whitelisted
  const isWhitelisted = await kyc.isWhitelisted(dexAddress);
  console.log("\n✅ DEX current whitelist status:", isWhitelisted);

  if (isWhitelisted) {
    console.log("\n✅ DEX is already whitelisted!");
    return;
  }

  // Approve KYC for the DEX contract (1 year expiry)
  const oneYearFromNow = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
  
  console.log("\n🔓 Approving KYC for DEX contract...");
  console.log("   Expiry date:", new Date(oneYearFromNow * 1000).toLocaleDateString());
  
  const tx = await kyc.approveKYC(dexAddress, oneYearFromNow);
  console.log("⏳ Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("✅ Transaction confirmed!");

  // Verify
  const newStatus = await kyc.isWhitelisted(dexAddress);
  console.log("\n✅ DEX new whitelist status:", newStatus);

  if (newStatus) {
    console.log("\n🎉 SUCCESS! DEX contract is now whitelisted.");
    console.log("   Users can now add liquidity and trade!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
