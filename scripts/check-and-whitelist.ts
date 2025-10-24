import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("\n🔍 Checking KYC Status...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Account:", deployer.address);

  // Load deployments
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-addresses.json`);
  
  const addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const kycAddress = addresses.kycRegistry;

  console.log("📋 KYC Registry:", kycAddress);

  const kyc = await ethers.getContractAt("KYCRegistry", kycAddress);

  const isWhitelisted = await kyc.isWhitelisted(deployer.address);
  const hasRole = await kyc.hasRole(await kyc.WHITELISTED_ROLE(), deployer.address);

  console.log("\n✅ Status:");
  console.log("   isWhitelisted():", isWhitelisted);
  console.log("   hasRole(WHITELISTED_ROLE):", hasRole);

  if (!isWhitelisted) {
    console.log("\n⚠️  Account is NOT whitelisted!");
    console.log("   Whitelisting now...");

    const tx = await kyc.whitelist(deployer.address);
    await tx.wait();

    console.log("✅ Account whitelisted!");

    const newStatus = await kyc.isWhitelisted(deployer.address);
    console.log("   New status:", newStatus);
  } else {
    console.log("\n✅ Account is already whitelisted");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
