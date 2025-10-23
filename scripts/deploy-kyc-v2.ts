import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Deploying updated KYCRegistry contract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy KYCRegistry
  console.log("📝 Deploying KYCRegistry...");
  const KYCRegistry = await hre.ethers.getContractFactory("KYCRegistry");
  const kycRegistry = await KYCRegistry.deploy();
  await kycRegistry.waitForDeployment();

  const kycAddress = await kycRegistry.getAddress();
  console.log("✅ KYCRegistry deployed to:", kycAddress);

  // Verify roles
  const KYC_ADMIN_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("KYC_ADMIN_ROLE"));
  const DEFAULT_ADMIN_ROLE = hre.ethers.ZeroHash;

  const hasKYCRole = await kycRegistry.hasRole(KYC_ADMIN_ROLE, deployer.address);
  const hasDefaultRole = await kycRegistry.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);

  console.log("\n🔐 Roles verification:");
  console.log("   Deployer has KYC_ADMIN_ROLE:", hasKYCRole ? "✅" : "❌");
  console.log("   Deployer has DEFAULT_ADMIN_ROLE:", hasDefaultRole ? "✅" : "❌");

  // Test new functions
  console.log("\n🧪 Testing new functions...");
  
  const allAddresses = await kycRegistry.getAllAddresses();
  console.log("   Total addresses tracked:", allAddresses.length);
  
  const stats = await kycRegistry.getStatistics();
  console.log("   Statistics:");
  console.log("     - Pending:", stats.pending.toString());
  console.log("     - Approved:", stats.approved.toString());
  console.log("     - Rejected:", stats.rejected.toString());
  console.log("     - Blacklisted:", stats.blacklisted.toString());
  console.log("     - Total:", stats.total.toString());

  // Save deployment info
  const deploymentInfo = {
    contract: "KYCRegistry",
    address: kycAddress,
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    explorerUrl: `https://sepolia.etherscan.io/address/${kycAddress}`,
    version: "2.0",
    newFeatures: [
      "getAllAddresses()",
      "getAddressCount()",
      "getAddressesByStatus(status, offset, limit)",
      "getAllAddressesByStatus(status)",
      "getBatchKYCData(users[])",
      "getStatistics()"
    ]
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save individual file
  const kycFile = path.join(deploymentsDir, `${hre.network.name}-kyc-registry-v2.json`);
  fs.writeFileSync(kycFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", kycFile);

  // Update addresses file
  const addressesFile = path.join(deploymentsDir, `${hre.network.name}-addresses.json`);
  let addresses: any = {};
  
  if (fs.existsSync(addressesFile)) {
    addresses = JSON.parse(fs.readFileSync(addressesFile, "utf-8"));
    console.log("📝 Updating existing addresses file...");
  }

  addresses.kycRegistry = kycAddress;
  addresses.kycRegistryOld = addresses.kycRegistry !== kycAddress ? addresses.kycRegistry : undefined;
  addresses.deployer = deployer.address;
  addresses.network = hre.network.name;
  addresses.chainId = (await hre.ethers.provider.getNetwork()).chainId.toString();
  addresses.deployedAt = new Date().toISOString();

  fs.writeFileSync(addressesFile, JSON.stringify(addresses, null, 2));
  console.log("✅ Addresses file updated:", addressesFile);

  // Instructions
  console.log("\n📋 Next steps:");
  console.log("1. Update frontend .env.local with new address:");
  console.log(`   NEXT_PUBLIC_KYC_REGISTRY_ADDRESS=${kycAddress}`);
  console.log("\n2. Verify contract on Etherscan (optional):");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${kycAddress}`);
  console.log("\n3. Test the new functions:");
  console.log(`   npx hardhat run scripts/test-kyc-listing.ts --network ${hre.network.name}`);
  
  console.log("\n✨ Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
