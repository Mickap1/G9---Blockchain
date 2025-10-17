import { ethers, network, run } from "hardhat";
import * as fs from "fs";

/**
 * Deploy KYCRegistry Contract
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-kyc.ts --network sepolia
 *   npx hardhat run scripts/deploy-kyc.ts --network amoy
 */

async function main() {
  console.log("🔐 Deploying KYCRegistry Contract\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  
  console.log("📍 Network:", network.name);
  console.log("📍 Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("📍 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), network.name === "amoy" ? "MATIC" : "ETH");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Deploy KYCRegistry
  console.log("📄 Deploying KYCRegistry...");
  const KYCRegistry = await ethers.getContractFactory("KYCRegistry");
  const kycRegistry = await KYCRegistry.deploy();
  await kycRegistry.waitForDeployment();
  
  const kycAddress = await kycRegistry.getAddress();
  console.log("✅ KYCRegistry deployed to:", kycAddress);
  
  // Get explorer URL
  const explorerUrl = network.name === "amoy" 
    ? "https://amoy.polygonscan.com" 
    : "https://sepolia.etherscan.io";
  console.log(`🔗 View: ${explorerUrl}/address/${kycAddress}\n`);

  // Wait for blockchain to index
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("⏳ Waiting 30 seconds for blockchain indexing...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Verify contract
    console.log("🔍 Verifying contract on block explorer...\n");
    try {
      await run("verify:verify", {
        address: kycAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified successfully!\n");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("ℹ️  Contract already verified\n");
      } else {
        console.log("⚠️  Verification failed:", error.message);
        console.log("💡 You can verify manually later:\n");
        console.log(`   npx hardhat verify --network ${network.name} ${kycAddress}\n`);
      }
    }
  }

  // Display contract info
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract:        KYCRegistry");
  console.log("Address:        ", kycAddress);
  console.log("Network:        ", network.name);
  console.log("Deployer:       ", deployer.address);
  console.log("Explorer:       ", `${explorerUrl}/address/${kycAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Get roles
  const DEFAULT_ADMIN_ROLE = await kycRegistry.DEFAULT_ADMIN_ROLE();
  const KYC_ADMIN_ROLE = await kycRegistry.KYC_ADMIN_ROLE();
  
  console.log("🔐 ROLES GRANTED");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("DEFAULT_ADMIN_ROLE:", await kycRegistry.hasRole(DEFAULT_ADMIN_ROLE, deployer.address) ? "✅" : "❌");
  console.log("KYC_ADMIN_ROLE:    ", await kycRegistry.hasRole(KYC_ADMIN_ROLE, deployer.address) ? "✅" : "❌");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Save deployment info
  const deployment = {
    contract: "KYCRegistry",
    address: kycAddress,
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    explorerUrl: `${explorerUrl}/address/${kycAddress}`,
    roles: {
      DEFAULT_ADMIN_ROLE: deployer.address,
      KYC_ADMIN_ROLE: deployer.address,
    }
  };

  if (!fs.existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }

  const filename = `deployments/${network.name}-kyc-registry.json`;
  fs.writeFileSync(filename, JSON.stringify(deployment, null, 2));
  console.log("💾 Deployment info saved to:", filename);
  
  console.log("\n📝 NEXT STEPS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. Deploy FungibleAssetToken:");
  console.log(`   npx hardhat run scripts/deploy-fungible.ts --network ${network.name}`);
  console.log("\n2. Deploy NFTAssetToken:");
  console.log(`   npx hardhat run scripts/deploy-nft.ts --network ${network.name}`);
  console.log("\n3. Or deploy all at once:");
  console.log(`   npx hardhat run scripts/deploy-all.ts --network ${network.name}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
