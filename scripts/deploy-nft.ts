import { ethers, network, run } from "hardhat";
import * as fs from "fs";

/**
 * Deploy NFTAssetToken Contract
 * 
 * Requires: KYCRegistry must be deployed first
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-nft.ts --network sepolia
 *   npx hardhat run scripts/deploy-nft.ts --network amoy
 */

async function main() {
  console.log("💎 Deploying NFTAssetToken Contract\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  
  console.log("📍 Network:", network.name);
  console.log("📍 Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("📍 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), network.name === "amoy" ? "MATIC" : "ETH");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Try to load existing KYCRegistry address
  const kycFilename = `deployments/${network.name}-kyc-registry.json`;
  let kycAddress: string;

  if (fs.existsSync(kycFilename)) {
    const kycDeployment = JSON.parse(fs.readFileSync(kycFilename, "utf8"));
    kycAddress = kycDeployment.address;
    console.log("📄 Using existing KYCRegistry:", kycAddress);
  } else {
    console.log("⚠️  KYCRegistry not found in deployments folder");
    console.log("💡 Please deploy KYCRegistry first:");
    console.log(`   npx hardhat run scripts/deploy-kyc.ts --network ${network.name}\n`);
    
    throw new Error("KYCRegistry address required. Deploy KYCRegistry first.");
  }

  // NFT Collection parameters - Customize these for your collection!
  const COLLECTION_NAME = "Tokenized GIA Diamonds";
  const COLLECTION_SYMBOL = "TDMD";
  const ASSET_TYPE = "Precious Stones";
  const COLLECTION_DESCRIPTION = "GIA certified diamonds with blockchain provenance";

  console.log("\n📋 Collection Parameters:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Name:        ", COLLECTION_NAME);
  console.log("Symbol:      ", COLLECTION_SYMBOL);
  console.log("Type:        ", ASSET_TYPE);
  console.log("Description: ", COLLECTION_DESCRIPTION);
  console.log("KYC Registry:", kycAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Deploy NFTAssetToken
  console.log("📄 Deploying NFTAssetToken...");
  const NFTAssetToken = await ethers.getContractFactory("NFTAssetToken");
  const nft = await NFTAssetToken.deploy(
    COLLECTION_NAME,
    COLLECTION_SYMBOL,
    kycAddress,
    ASSET_TYPE,
    COLLECTION_DESCRIPTION
  );
  await nft.waitForDeployment();
  
  const nftAddress = await nft.getAddress();
  console.log("✅ NFTAssetToken deployed to:", nftAddress);
  
  // Get explorer URL
  const explorerUrl = network.name === "amoy" 
    ? "https://amoy.polygonscan.com" 
    : "https://sepolia.etherscan.io";
  console.log(`🔗 View: ${explorerUrl}/address/${nftAddress}\n`);

  // Wait for blockchain to index
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("⏳ Waiting 30 seconds for blockchain indexing...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Verify contract
    console.log("🔍 Verifying contract on block explorer...\n");
    try {
      await run("verify:verify", {
        address: nftAddress,
        constructorArguments: [
          COLLECTION_NAME,
          COLLECTION_SYMBOL,
          kycAddress,
          ASSET_TYPE,
          COLLECTION_DESCRIPTION
        ],
      });
      console.log("✅ Contract verified successfully!\n");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("ℹ️  Contract already verified\n");
      } else {
        console.log("⚠️  Verification failed:", error.message);
        console.log("💡 You can verify manually later:\n");
        console.log(`   npx hardhat verify --network ${network.name} ${nftAddress} \\`);
        console.log(`     "${COLLECTION_NAME}" \\`);
        console.log(`     "${COLLECTION_SYMBOL}" \\`);
        console.log(`     ${kycAddress} \\`);
        console.log(`     "${ASSET_TYPE}" \\`);
        console.log(`     "${COLLECTION_DESCRIPTION}"\n`);
      }
    }
  }

  // Display contract info
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract:        NFTAssetToken");
  console.log("Address:        ", nftAddress);
  console.log("Network:        ", network.name);
  console.log("Deployer:       ", deployer.address);
  console.log("Explorer:       ", `${explorerUrl}/address/${nftAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("💎 COLLECTION DETAILS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Name:        ", await nft.name());
  console.log("Symbol:      ", await nft.symbol());
  console.log("Type:        ", await nft.assetType());
  console.log("Description: ", await nft.collectionDescription());
  console.log("Total Supply:", (await nft.totalSupply()).toString(), "NFTs");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Get roles
  const DEFAULT_ADMIN_ROLE = await nft.DEFAULT_ADMIN_ROLE();
  const ADMIN_ROLE = await nft.ADMIN_ROLE();
  const MINTER_ROLE = await nft.MINTER_ROLE();
  const PAUSER_ROLE = await nft.PAUSER_ROLE();
  
  console.log("🔐 ROLES GRANTED");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("DEFAULT_ADMIN_ROLE:", await nft.hasRole(DEFAULT_ADMIN_ROLE, deployer.address) ? "✅" : "❌");
  console.log("ADMIN_ROLE:        ", await nft.hasRole(ADMIN_ROLE, deployer.address) ? "✅" : "❌");
  console.log("MINTER_ROLE:       ", await nft.hasRole(MINTER_ROLE, deployer.address) ? "✅" : "❌");
  console.log("PAUSER_ROLE:       ", await nft.hasRole(PAUSER_ROLE, deployer.address) ? "✅" : "❌");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Save deployment info
  const deployment = {
    contract: "NFTAssetToken",
    address: nftAddress,
    kycRegistry: kycAddress,
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    explorerUrl: `${explorerUrl}/address/${nftAddress}`,
    parameters: {
      name: COLLECTION_NAME,
      symbol: COLLECTION_SYMBOL,
      assetType: ASSET_TYPE,
      description: COLLECTION_DESCRIPTION,
    },
    roles: {
      DEFAULT_ADMIN_ROLE: deployer.address,
      ADMIN_ROLE: deployer.address,
      MINTER_ROLE: deployer.address,
      PAUSER_ROLE: deployer.address,
    }
  };

  if (!fs.existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }

  const filename = `deployments/${network.name}-nft-token.json`;
  fs.writeFileSync(filename, JSON.stringify(deployment, null, 2));
  console.log("💾 Deployment info saved to:", filename);
  
  console.log("\n📝 NEXT STEPS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. Approve your address for KYC:");
  console.log(`   Use KYCRegistry at ${kycAddress}`);
  console.log("\n2. Mint NFTs:");
  console.log(`   nft.mintAsset(recipient, "Asset Name", valuation, "ipfs://...", "ipfs://cert...")`);
  console.log("\n3. View on OpenSea (after minting):");
  if (network.name === "sepolia") {
    console.log(`   https://testnets.opensea.io/assets/sepolia/${nftAddress}/0`);
  } else if (network.name === "amoy") {
    console.log(`   https://testnets.opensea.io/assets/amoy/${nftAddress}/0`);
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
