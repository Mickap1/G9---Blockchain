import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("\n🔍 Checking All Whitelisted Addresses...\n");

  const [deployer] = await ethers.getSigners();

  // Load deployments
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-addresses.json`);
  
  const addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const kycAddress = addresses.kycRegistry;

  console.log("📋 KYC Registry:", kycAddress);

  const kyc = await ethers.getContractAt("KYCRegistry", kycAddress);

  // Get all addresses that have been whitelisted
  const stats = await kyc.getStatistics();
  console.log("\n📊 Statistics:");
  console.log("   Total addresses:", stats.total.toString());
  console.log("   Pending:", stats.pending.toString());
  console.log("   Approved:", stats.approved.toString());
  console.log("   Rejected:", stats.rejected.toString());
  console.log("   Blacklisted:", stats.blacklisted.toString());

  // Get approved addresses
  console.log("\n✅ Approved Addresses (via getAllAddressesByStatus):");
  const approvedAddresses = await kyc.getAllAddressesByStatus(2); // Status = 2 (Approved)
  
  if (approvedAddresses.length === 0) {
    console.log("   No addresses found via getAllAddressesByStatus");
  } else {
    for (const addr of approvedAddresses) {
      const data = await kyc.getKYCData(addr);
      console.log(`   ${addr}`);
      console.log(`      Status: ${data.status}`);
      console.log(`      Expiry: ${new Date(Number(data.expiryDate) * 1000).toLocaleDateString()}`);
    }
  }

  // Check specific addresses directly
  console.log("\n🔍 Direct Whitelist Check:");
  const addressesToCheck = [
    { name: "Deployer", addr: deployer.address },
    { name: "DEX", addr: addresses.dex },
    { name: "0x5cFb5A...", addr: "0x5cFb5A4268EBdd4d058D0A2AaA20a19929EFC073" }
  ];

  for (const item of addressesToCheck) {
    const isWhitelisted = await kyc.isWhitelisted(item.addr);
    const data = await kyc.getKYCData(item.addr);
    console.log(`\n   ${item.name} (${item.addr}):`);
    console.log(`      isWhitelisted: ${isWhitelisted}`);
    console.log(`      Status: ${data.status.toString()}`);
    if (data.expiryDate > 0) {
      console.log(`      Expiry: ${new Date(Number(data.expiryDate) * 1000).toLocaleDateString()}`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
