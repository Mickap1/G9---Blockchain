import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

/**
 * Script pour redéployer NFTAssetTokenV2 avec la fonction mintAssetPublic
 * Cette nouvelle fonction permet aux utilisateurs avec KYC approuvé de créer leurs propres NFT
 */

async function main() {
  console.log("\n🚀 UPGRADING NFTAssetTokenV2 with Public Mint");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Load network info
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "sepolia" : network.name;

  // Load existing deployment
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-nft-v2.json`);
  
  if (!fs.existsSync(deploymentsPath)) {
    console.log("❌ NFTAssetTokenV2 deployment not found!");
    console.log("   Please deploy NFTAssetTokenV2 first");
    process.exit(1);
  }

  const oldDeployment = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const kycAddress = oldDeployment.contracts.NFTAssetTokenV2.kycRegistry;
  const oldNftAddress = oldDeployment.contracts.NFTAssetTokenV2.address;
  
  console.log("📋 Old NFT Contract:", oldNftAddress);
  console.log("📋 KYC Registry:", kycAddress);

  // NFT Collection parameters (same as before)
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

  // Deploy new NFTAssetTokenV2
  console.log("📄 Deploying new NFTAssetTokenV2...");
  const NFTAssetTokenV2 = await ethers.getContractFactory("NFTAssetTokenV2");
  const nft = await NFTAssetTokenV2.deploy(
    COLLECTION_NAME,
    COLLECTION_SYMBOL,
    kycAddress,
    ASSET_TYPE,
    COLLECTION_DESCRIPTION
  );
  await nft.waitForDeployment();
  
  const nftAddress = await nft.getAddress();
  console.log("✅ New NFTAssetTokenV2 deployed to:", nftAddress);
  
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
        console.log("   You can verify manually later\n");
      }
    }
  }

  // Save deployment info
  const deployment = {
    network: networkName,
    chainId: Number(network.chainId),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      nftTokenV2: {
        address: nftAddress,
        name: COLLECTION_NAME,
        symbol: COLLECTION_SYMBOL,
        assetType: ASSET_TYPE,
        description: COLLECTION_DESCRIPTION,
        kycRegistry: kycAddress,
        features: [
          "Public minting for KYC-approved users",
          "Admin minting for any KYC-approved address",
          "Gas optimized",
          "Metadata on-chain or IPFS"
        ]
      }
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

  const filename = `deployments/${networkName}-nft-v2.json`;
  const oldFilename = `deployments/${networkName}-nft-v2-old.json`;
  
  // Backup old deployment
  fs.renameSync(filename, oldFilename);
  
  // Save new deployment
  fs.writeFileSync(filename, JSON.stringify(deployment, null, 2));
  console.log("💾 New deployment info saved to:", filename);
  console.log("💾 Old deployment backed up to:", oldFilename);
  
  console.log("\n📝 NEXT STEPS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. Update frontend environment variables:");
  console.log(`   NEXT_PUBLIC_NFT_TOKEN_ADDRESS=${nftAddress}`);
  console.log("\n2. Update frontend files:");
  console.log("   - app/dashboard/page.tsx");
  console.log("   - app/create/nft/page.tsx");
  console.log("\n3. Regenerate ABI:");
  console.log("   npm run extract-abis");
  console.log("\n4. KYC-approved users can now:");
  console.log("   - Call mintAssetPublic(uri) to mint for themselves");
  console.log("   - Admins can still use mintAsset(to, uri) for others");
  console.log("\n5. Test the new public mint function:");
  console.log("   - Ensure you have KYC approved");
  console.log("   - Go to /create/nft");
  console.log("   - Create a NFT for yourself");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
