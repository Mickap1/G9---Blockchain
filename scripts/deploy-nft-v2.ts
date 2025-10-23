import hre from "hardhat";
import fs from "fs";

async function main() {
  // @ts-ignore
  const ethers = hre.ethers;
  console.log("🚀 Deploying NFTAssetTokenV2 (Gas Optimized)...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Get KYC Registry address
  const kycRegistryAddress = "0x563E31793214F193EB7993a2bfAd2957a70C7D65";
  console.log("Using KYC Registry:", kycRegistryAddress);

  // Deploy NFT Token V2 (Optimized)
  console.log("\n📦 Deploying NFTAssetTokenV2...");
  const NFTToken = await ethers.getContractFactory("NFTAssetTokenV2");
  const nftToken = await NFTToken.deploy(
    "RWA Asset Collection V2",
    "RWAV2",
    kycRegistryAddress,
    "Mixed Assets",
    "Gas-optimized collection of tokenized real-world assets"
  );

  await nftToken.waitForDeployment();
  const nftAddress = await nftToken.getAddress();
  console.log("✅ NFTAssetTokenV2 deployed to:", nftAddress);

  // Verify roles
  console.log("\n🔐 Verifying roles...");
  const adminRole = await nftToken.ADMIN_ROLE();
  const minterRole = await nftToken.MINTER_ROLE();
  const pauserRole = await nftToken.PAUSER_ROLE();

  const hasAdmin = await nftToken.hasRole(adminRole, deployer.address);
  const hasMinter = await nftToken.hasRole(minterRole, deployer.address);
  const hasPauser = await nftToken.hasRole(pauserRole, deployer.address);

  console.log("Admin role:", hasAdmin ? "✅" : "❌");
  console.log("Minter role:", hasMinter ? "✅" : "❌");
  console.log("Pauser role:", hasPauser ? "✅" : "❌");

  // Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    timestamp: new Date().toISOString(),
    contracts: {
      NFTAssetTokenV2: {
        address: nftAddress,
        name: "RWA Asset Collection V2",
        symbol: "RWAV2",
        assetType: "Mixed Assets",
        kycRegistry: kycRegistryAddress
      }
    },
    deployer: deployer.address,
    gasOptimized: true,
    changes: [
      "Removed name storage (now only in IPFS)",
      "Removed valuation storage (now only in IPFS)",
      "Removed certificateURI storage (now only in IPFS)",
      "Only stores: tokenizationDate, isActive",
      "Estimated gas reduction: 40-50%"
    ]
  };

  fs.writeFileSync(
    "deployments/sepolia-nft-v2.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📝 Deployment info saved to deployments/sepolia-nft-v2.json");

  console.log("\n🎯 Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("NFT Token V2:", nftAddress);
  console.log("KYC Registry:", kycRegistryAddress);
  console.log("Gas Optimization: ~40-50% reduction");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  console.log("\n⏳ Waiting 30 seconds before verification...");
  await new Promise(resolve => setTimeout(resolve, 30000));

  console.log("\n🔍 Verifying contract on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: nftAddress,
      constructorArguments: [
        "RWA Asset Collection V2",
        "RWAV2",
        kycRegistryAddress,
        "Mixed Assets",
        "Gas-optimized collection of tokenized real-world assets"
      ],
    });
    console.log("✅ Contract verified on Etherscan!");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract already verified!");
    } else {
      console.log("⚠️ Verification failed:", error.message);
      console.log("\n📝 Verify manually with:");
      console.log(`npx hardhat verify --network sepolia ${nftAddress} "RWA Asset Collection V2" "RWAV2" "${kycRegistryAddress}" "Mixed Assets" "Gas-optimized collection of tokenized real-world assets"`);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
