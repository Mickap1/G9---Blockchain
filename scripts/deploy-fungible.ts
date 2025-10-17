import { ethers, network, run } from "hardhat";
import * as fs from "fs";

/**
 * Deploy FungibleAssetToken Contract
 * 
 * Requires: KYCRegistry must be deployed first
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-fungible.ts --network sepolia
 *   npx hardhat run scripts/deploy-fungible.ts --network amoy
 */

async function main() {
  console.log("🪙 Deploying FungibleAssetToken Contract\n");
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
    console.log("💡 Please provide KYCRegistry address:");
    console.log(`   Or deploy it first: npx hardhat run scripts/deploy-kyc.ts --network ${network.name}\n`);
    
    // For this example, we'll exit. In production, you could prompt for input
    throw new Error("KYCRegistry address required. Deploy KYCRegistry first.");
  }

  // Token parameters - Customize these for your asset!
  const TOKEN_NAME = "Paris Tower A Shares";
  const TOKEN_SYMBOL = "PATA";
  const MAX_SUPPLY = 1_000_000; // 1 million shares
  const ASSET_NAME = "Paris Commercial Tower A";
  const ASSET_TYPE = "Real Estate";
  const LOCATION = "15 Avenue des Champs-Élysées, Paris, France";
  const TOTAL_VALUE = 5_000_000; // €5M (in base units)
  const DOCUMENT_URI = "ipfs://QmExampleDocumentHash";

  console.log("\n📋 Token Parameters:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Name:           ", TOKEN_NAME);
  console.log("Symbol:         ", TOKEN_SYMBOL);
  console.log("Max Supply:     ", MAX_SUPPLY.toLocaleString(), "tokens");
  console.log("Asset Name:     ", ASSET_NAME);
  console.log("Asset Type:     ", ASSET_TYPE);
  console.log("Location:       ", LOCATION);
  console.log("Total Value:    ", TOTAL_VALUE.toLocaleString(), "€");
  console.log("KYC Registry:   ", kycAddress);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Deploy FungibleAssetToken
  console.log("📄 Deploying FungibleAssetToken...");
  const FungibleAssetToken = await ethers.getContractFactory("FungibleAssetToken");
  const token = await FungibleAssetToken.deploy(
    TOKEN_NAME,
    TOKEN_SYMBOL,
    MAX_SUPPLY,
    kycAddress,
    ASSET_NAME,
    ASSET_TYPE,
    LOCATION,
    TOTAL_VALUE,
    DOCUMENT_URI
  );
  await token.waitForDeployment();
  
  const tokenAddress = await token.getAddress();
  console.log("✅ FungibleAssetToken deployed to:", tokenAddress);
  
  // Get explorer URL
  const explorerUrl = network.name === "amoy" 
    ? "https://amoy.polygonscan.com" 
    : "https://sepolia.etherscan.io";
  console.log(`🔗 View: ${explorerUrl}/address/${tokenAddress}\n`);

  // Wait for blockchain to index
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("⏳ Waiting 30 seconds for blockchain indexing...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    // Verify contract
    console.log("🔍 Verifying contract on block explorer...\n");
    try {
      await run("verify:verify", {
        address: tokenAddress,
        constructorArguments: [
          TOKEN_NAME,
          TOKEN_SYMBOL,
          MAX_SUPPLY,
          kycAddress,
          ASSET_NAME,
          ASSET_TYPE,
          LOCATION,
          TOTAL_VALUE,
          DOCUMENT_URI
        ],
      });
      console.log("✅ Contract verified successfully!\n");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("ℹ️  Contract already verified\n");
      } else {
        console.log("⚠️  Verification failed:", error.message);
        console.log("💡 You can verify manually later:\n");
        console.log(`   npx hardhat verify --network ${network.name} ${tokenAddress} \\`);
        console.log(`     "${TOKEN_NAME}" \\`);
        console.log(`     "${TOKEN_SYMBOL}" \\`);
        console.log(`     ${MAX_SUPPLY} \\`);
        console.log(`     ${kycAddress} \\`);
        console.log(`     "${ASSET_NAME}" \\`);
        console.log(`     "${ASSET_TYPE}" \\`);
        console.log(`     "${LOCATION}" \\`);
        console.log(`     ${TOTAL_VALUE} \\`);
        console.log(`     "${DOCUMENT_URI}"\n`);
      }
    }
  }

  // Display contract info
  const pricePerToken = await token.pricePerToken();
  const maxSupply = await token.MAX_SUPPLY();
  const metadata = await token.assetMetadata();

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract:        FungibleAssetToken");
  console.log("Address:        ", tokenAddress);
  console.log("Network:        ", network.name);
  console.log("Deployer:       ", deployer.address);
  console.log("Explorer:       ", `${explorerUrl}/address/${tokenAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  console.log("💎 TOKEN DETAILS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Name:            ", await token.name());
  console.log("Symbol:          ", await token.symbol());
  console.log("Max Supply:      ", maxSupply.toString());
  console.log("Asset Name:      ", metadata.assetName);
  console.log("Asset Type:      ", metadata.assetType);
  console.log("Location:        ", metadata.location);
  console.log("Total Value:     ", metadata.totalValue.toString(), "€");
  console.log("Price per Token: ", pricePerToken.toString(), "wei");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Get roles
  const DEFAULT_ADMIN_ROLE = await token.DEFAULT_ADMIN_ROLE();
  const ADMIN_ROLE = await token.ADMIN_ROLE();
  const MINTER_ROLE = await token.MINTER_ROLE();
  const PAUSER_ROLE = await token.PAUSER_ROLE();
  
  console.log("🔐 ROLES GRANTED");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("DEFAULT_ADMIN_ROLE:", await token.hasRole(DEFAULT_ADMIN_ROLE, deployer.address) ? "✅" : "❌");
  console.log("ADMIN_ROLE:        ", await token.hasRole(ADMIN_ROLE, deployer.address) ? "✅" : "❌");
  console.log("MINTER_ROLE:       ", await token.hasRole(MINTER_ROLE, deployer.address) ? "✅" : "❌");
  console.log("PAUSER_ROLE:       ", await token.hasRole(PAUSER_ROLE, deployer.address) ? "✅" : "❌");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Save deployment info
  const deployment = {
    contract: "FungibleAssetToken",
    address: tokenAddress,
    kycRegistry: kycAddress,
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    explorerUrl: `${explorerUrl}/address/${tokenAddress}`,
    parameters: {
      name: TOKEN_NAME,
      symbol: TOKEN_SYMBOL,
      maxSupply: MAX_SUPPLY,
      assetName: ASSET_NAME,
      assetType: ASSET_TYPE,
      location: LOCATION,
      totalValue: TOTAL_VALUE.toString(),
      pricePerToken: pricePerToken.toString(),
      documentURI: DOCUMENT_URI,
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

  const filename = `deployments/${network.name}-fungible-token.json`;
  fs.writeFileSync(filename, JSON.stringify(deployment, null, 2));
  console.log("💾 Deployment info saved to:", filename);
  
  console.log("\n📝 NEXT STEPS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. Approve your address for KYC:");
  console.log(`   Use KYCRegistry at ${kycAddress}`);
  console.log("\n2. Mint some tokens:");
  console.log(`   token.mint(yourAddress, amount)`);
  console.log("\n3. Deploy NFTAssetToken:");
  console.log(`   npx hardhat run scripts/deploy-nft.ts --network ${network.name}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
