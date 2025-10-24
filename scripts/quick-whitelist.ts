import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("\n🔓 Quick Whitelist Script...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Admin account:", deployer.address);

  // Load deployments
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-addresses.json`);
  
  const addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const kycAddress = addresses.kycRegistry;

  console.log("📋 KYC Registry:", kycAddress);

  const kyc = await ethers.getContractAt("KYCRegistry", kycAddress);

  // Approve KYC for the deployer (1 year expiry)
  const oneYearFromNow = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
  
  console.log("\n🔓 Approving KYC for account:", deployer.address);
  console.log("   Expiry date:", new Date(oneYearFromNow * 1000).toLocaleDateString());
  
  const tx = await kyc.approveKYC(deployer.address, oneYearFromNow);
  console.log("⏳ Transaction sent:", tx.hash);
  
  await tx.wait();
  console.log("✅ Transaction confirmed!");

  // Verify
  const isWhitelisted = await kyc.isWhitelisted(deployer.address);
  console.log("\n✅ Whitelist status:", isWhitelisted);

  if (isWhitelisted) {
    console.log("\n🎉 SUCCESS! You can now add liquidity to the DEX.");
    console.log("\nNext step:");
    console.log("  npx hardhat run scripts/add-initial-liquidity.ts --network sepolia");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
