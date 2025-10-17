import { ethers, network, run } from "hardhat";
import * as fs from "fs";

/**
 * Deploy All Contracts
 * 
 * Deploys all 5 contracts in the correct order:
 * 1. KYCRegistry (independent)
 * 2. FungibleAssetToken (requires KYCRegistry)
 * 3. NFTAssetToken (requires KYCRegistry)
 * 4. SimplePriceOracle (independent)
 * 5. SimpleDEX (requires KYCRegistry and SimplePriceOracle)
 * 
 * Usage:
 *   npx hardhat run scripts/deploy-all.ts --network sepolia
 *   npx hardhat run scripts/deploy-all.ts --network amoy
 */

async function main() {
  console.log("🚀 DEPLOYING ALL CONTRACTS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  
  console.log("📍 Network:", network.name);
  console.log("📍 Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("📍 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), network.name === "amoy" ? "MATIC" : "ETH");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Get explorer URL
  const explorerUrl = network.name === "amoy" 
    ? "https://amoy.polygonscan.com" 
    : "https://sepolia.etherscan.io";

  const deployedContracts: any = {
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {}
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 1️⃣  DEPLOY KYCRegistry
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log("1️⃣  DEPLOYING KYCRegistry");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  const KYCRegistry = await ethers.getContractFactory("KYCRegistry");
  const kyc = await KYCRegistry.deploy();
  await kyc.waitForDeployment();
  const kycAddress = await kyc.getAddress();
  
  console.log("✅ KYCRegistry deployed:", kycAddress);
  console.log(`🔗 View: ${explorerUrl}/address/${kycAddress}\n`);
  
  deployedContracts.contracts.KYCRegistry = {
    address: kycAddress,
    explorerUrl: `${explorerUrl}/address/${kycAddress}`,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 2️⃣  DEPLOY FungibleAssetToken
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log("2️⃣  DEPLOYING FungibleAssetToken");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // Fungible token parameters
  const TOKEN_NAME = "Tokenized Real Estate Shares";
  const TOKEN_SYMBOL = "TRES";
  const MAX_SUPPLY = ethers.parseUnits("1000000", 18); // 1M tokens
  const ASSET_NAME = "Premium Commercial Building - Paris La Défense";
  const ASSET_TYPE = "Commercial Real Estate";
  const LOCATION = "1 Parvis de La Défense, 92800 Puteaux, France";
  const TOTAL_VALUE = ethers.parseUnits("50000000", 18); // 50M EUR worth
  const DOCUMENT_URI = "ipfs://QmExampleDocumentHash123456789";
  
  console.log("Token:      ", TOKEN_NAME, `(${TOKEN_SYMBOL})`);
  console.log("Max Supply: ", ethers.formatUnits(MAX_SUPPLY, 18), "tokens");
  console.log("Asset:      ", ASSET_NAME);
  console.log("Location:   ", LOCATION);
  console.log("Value:      ", ethers.formatUnits(TOTAL_VALUE, 18), "EUR");
  console.log("KYC:        ", kycAddress, "\n");
  
  const FungibleAssetToken = await ethers.getContractFactory("FungibleAssetToken");
  const fungible = await FungibleAssetToken.deploy(
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
  await fungible.waitForDeployment();
  const fungibleAddress = await fungible.getAddress();
  
  console.log("✅ FungibleAssetToken deployed:", fungibleAddress);
  console.log(`🔗 View: ${explorerUrl}/address/${fungibleAddress}\n`);
  
  deployedContracts.contracts.FungibleAssetToken = {
    address: fungibleAddress,
    explorerUrl: `${explorerUrl}/address/${fungibleAddress}`,
    parameters: {
      name: TOKEN_NAME,
      symbol: TOKEN_SYMBOL,
      maxSupply: ethers.formatUnits(MAX_SUPPLY, 18),
      assetName: ASSET_NAME,
      assetType: ASSET_TYPE,
      location: LOCATION,
      totalValue: ethers.formatUnits(TOTAL_VALUE, 18),
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 3️⃣  DEPLOY NFTAssetToken
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log("3️⃣  DEPLOYING NFTAssetToken");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  // NFT collection parameters
  const COLLECTION_NAME = "Tokenized GIA Diamonds";
  const COLLECTION_SYMBOL = "TDMD";
  const ASSET_TYPE_NFT = "Precious Stones";
  const COLLECTION_DESCRIPTION = "GIA certified diamonds with blockchain provenance";
  
  console.log("Collection: ", COLLECTION_NAME, `(${COLLECTION_SYMBOL})`);
  console.log("Type:       ", ASSET_TYPE_NFT);
  console.log("Description:", COLLECTION_DESCRIPTION);
  console.log("KYC:        ", kycAddress, "\n");
  
  const NFTAssetToken = await ethers.getContractFactory("NFTAssetToken");
  const nft = await NFTAssetToken.deploy(
    COLLECTION_NAME,
    COLLECTION_SYMBOL,
    kycAddress,
    ASSET_TYPE_NFT,
    COLLECTION_DESCRIPTION
  );
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  
  console.log("✅ NFTAssetToken deployed:", nftAddress);
  console.log(`🔗 View: ${explorerUrl}/address/${nftAddress}\n`);
  
  deployedContracts.contracts.NFTAssetToken = {
    address: nftAddress,
    explorerUrl: `${explorerUrl}/address/${nftAddress}`,
    parameters: {
      name: COLLECTION_NAME,
      symbol: COLLECTION_SYMBOL,
      assetType: ASSET_TYPE_NFT,
      description: COLLECTION_DESCRIPTION,
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 4️⃣  DEPLOY SimplePriceOracle
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log("4️⃣  DEPLOYING SimplePriceOracle");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  const SimplePriceOracle = await ethers.getContractFactory("SimplePriceOracle");
  const oracle = await SimplePriceOracle.deploy();
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  
  console.log("✅ SimplePriceOracle deployed:", oracleAddress);
  console.log(`🔗 View: ${explorerUrl}/address/${oracleAddress}\n`);
  
  deployedContracts.contracts.SimplePriceOracle = {
    address: oracleAddress,
    explorerUrl: `${explorerUrl}/address/${oracleAddress}`,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 5️⃣  DEPLOY SimpleDEX
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log("5️⃣  DEPLOYING SimpleDEX");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  console.log("KYC Registry:", kycAddress);
  console.log("Oracle:      ", oracleAddress, "\n");
  
  const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
  const dex = await SimpleDEX.deploy(kycAddress, oracleAddress);
  await dex.waitForDeployment();
  const dexAddress = await dex.getAddress();
  
  console.log("✅ SimpleDEX deployed:", dexAddress);
  console.log(`🔗 View: ${explorerUrl}/address/${dexAddress}\n`);
  
  deployedContracts.contracts.SimpleDEX = {
    address: dexAddress,
    explorerUrl: `${explorerUrl}/address/${dexAddress}`,
    parameters: {
      kycRegistry: kycAddress,
      priceOracle: oracleAddress,
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔍 VERIFY ALL CONTRACTS
  // ═══════════════════════════════════════════════════════════════════════════
  
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⏳ Waiting 30 seconds for blockchain indexing...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    console.log("🔍 Verifying contracts on block explorer...\n");
    
    // Verify KYCRegistry
    try {
      console.log("Verifying KYCRegistry...");
      await run("verify:verify", {
        address: kycAddress,
        constructorArguments: [],
      });
      console.log("✅ KYCRegistry verified\n");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("ℹ️  KYCRegistry already verified\n");
      } else {
        console.log("⚠️  KYCRegistry verification failed:", error.message, "\n");
      }
    }
    
    // Verify FungibleAssetToken
    try {
      console.log("Verifying FungibleAssetToken...");
      await run("verify:verify", {
        address: fungibleAddress,
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
      console.log("✅ FungibleAssetToken verified\n");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("ℹ️  FungibleAssetToken already verified\n");
      } else {
        console.log("⚠️  FungibleAssetToken verification failed:", error.message, "\n");
      }
    }
    
    // Verify NFTAssetToken
    try {
      console.log("Verifying NFTAssetToken...");
      await run("verify:verify", {
        address: nftAddress,
        constructorArguments: [
          COLLECTION_NAME,
          COLLECTION_SYMBOL,
          kycAddress,
          ASSET_TYPE_NFT,
          COLLECTION_DESCRIPTION
        ],
      });
      console.log("✅ NFTAssetToken verified\n");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("ℹ️  NFTAssetToken already verified\n");
      } else {
        console.log("⚠️  NFTAssetToken verification failed:", error.message, "\n");
      }
    }
    
    // Verify SimplePriceOracle
    try {
      console.log("Verifying SimplePriceOracle...");
      await run("verify:verify", {
        address: oracleAddress,
        constructorArguments: [],
      });
      console.log("✅ SimplePriceOracle verified\n");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("ℹ️  SimplePriceOracle already verified\n");
      } else {
        console.log("⚠️  SimplePriceOracle verification failed:", error.message, "\n");
      }
    }
    
    // Verify SimpleDEX
    try {
      console.log("Verifying SimpleDEX...");
      await run("verify:verify", {
        address: dexAddress,
        constructorArguments: [kycAddress, oracleAddress],
      });
      console.log("✅ SimpleDEX verified\n");
    } catch (error: any) {
      if (error.message.includes("Already Verified")) {
        console.log("ℹ️  SimpleDEX already verified\n");
      } else {
        console.log("⚠️  SimpleDEX verification failed:", error.message, "\n");
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 📋 DEPLOYMENT SUMMARY
  // ═══════════════════════════════════════════════════════════════════════════
  
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅ ALL CONTRACTS DEPLOYED SUCCESSFULLY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Network:        ", network.name);
  console.log("Chain ID:       ", (await ethers.provider.getNetwork()).chainId);
  console.log("Deployer:       ", deployer.address);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  
  console.log("1️⃣  KYCRegistry");
  console.log("   Address: ", kycAddress);
  console.log("   Explorer:", `${explorerUrl}/address/${kycAddress}\n`);
  
  console.log("2️⃣  FungibleAssetToken");
  console.log("   Address: ", fungibleAddress);
  console.log("   Name:    ", TOKEN_NAME, `(${TOKEN_SYMBOL})`);
  console.log("   Supply:  ", ethers.formatUnits(MAX_SUPPLY, 18), "tokens");
  console.log("   Price:   ", ethers.formatUnits(TOTAL_VALUE / MAX_SUPPLY, 0), "EUR/token");
  console.log("   Explorer:", `${explorerUrl}/address/${fungibleAddress}\n`);
  
  console.log("3️⃣  NFTAssetToken");
  console.log("   Address: ", nftAddress);
  console.log("   Name:    ", COLLECTION_NAME, `(${COLLECTION_SYMBOL})`);
  console.log("   Explorer:", `${explorerUrl}/address/${nftAddress}`);
  
  if (network.name === "sepolia") {
    console.log("   OpenSea: ", `https://testnets.opensea.io/assets/sepolia/${nftAddress}/0`);
  } else if (network.name === "amoy") {
    console.log("   OpenSea: ", `https://testnets.opensea.io/assets/amoy/${nftAddress}/0`);
  }
  console.log();
  
  console.log("4️⃣  SimplePriceOracle");
  console.log("   Address: ", oracleAddress);
  console.log("   Explorer:", `${explorerUrl}/address/${oracleAddress}\n`);
  
  console.log("5️⃣  SimpleDEX");
  console.log("   Address: ", dexAddress);
  console.log("   Explorer:", `${explorerUrl}/address/${dexAddress}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Save deployment info
  if (!fs.existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }

  const filename = `deployments/${network.name}-all-contracts.json`;
  fs.writeFileSync(filename, JSON.stringify(deployedContracts, null, 2));
  console.log("💾 Deployment info saved to:", filename);
  
  // Also update individual deployment files for consistency
  const kycDeployment = {
    contract: "KYCRegistry",
    address: kycAddress,
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    deployedAt: deployedContracts.deployedAt,
    explorerUrl: `${explorerUrl}/address/${kycAddress}`,
  };
  fs.writeFileSync(
    `deployments/${network.name}-kyc-registry.json`,
    JSON.stringify(kycDeployment, null, 2)
  );
  
  const fungibleDeployment = {
    contract: "FungibleAssetToken",
    address: fungibleAddress,
    kycRegistry: kycAddress,
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    deployedAt: deployedContracts.deployedAt,
    explorerUrl: `${explorerUrl}/address/${fungibleAddress}`,
    parameters: deployedContracts.contracts.FungibleAssetToken.parameters,
  };
  fs.writeFileSync(
    `deployments/${network.name}-fungible-token.json`,
    JSON.stringify(fungibleDeployment, null, 2)
  );
  
  const nftDeployment = {
    contract: "NFTAssetToken",
    address: nftAddress,
    kycRegistry: kycAddress,
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    deployedAt: deployedContracts.deployedAt,
    explorerUrl: `${explorerUrl}/address/${nftAddress}`,
    parameters: deployedContracts.contracts.NFTAssetToken.parameters,
  };
  fs.writeFileSync(
    `deployments/${network.name}-nft-token.json`,
    JSON.stringify(nftDeployment, null, 2)
  );
  
  const oracleDeployment = {
    contract: "SimplePriceOracle",
    address: oracleAddress,
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    deployedAt: deployedContracts.deployedAt,
    explorerUrl: `${explorerUrl}/address/${oracleAddress}`,
  };
  fs.writeFileSync(
    `deployments/${network.name}-oracle.json`,
    JSON.stringify(oracleDeployment, null, 2)
  );
  
  const dexDeployment = {
    contract: "SimpleDEX",
    address: dexAddress,
    kycRegistry: kycAddress,
    priceOracle: oracleAddress,
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    deployedAt: deployedContracts.deployedAt,
    explorerUrl: `${explorerUrl}/address/${dexAddress}`,
  };
  fs.writeFileSync(
    `deployments/${network.name}-dex.json`,
    JSON.stringify(dexDeployment, null, 2)
  );
  
  console.log("💾 Individual deployment files also saved\n");
  
  console.log("📝 NEXT STEPS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. Approve addresses in KYCRegistry:");
  console.log(`   kyc.approveKYC(address)`);
  console.log("\n2. Set up Oracle prices:");
  console.log(`   oracle.updatePrice(tokenAddress, priceInUSD)`);
  console.log("\n3. Mint fungible tokens:");
  console.log(`   fungible.mint(recipient, amount)`);
  console.log("\n4. Mint NFTs:");
  console.log(`   nft.mintAsset(recipient, name, valuation, tokenURI, certURI)`);
  console.log("\n5. Add liquidity to DEX:");
  console.log(`   dex.addLiquidity(tokenAddress, amount)`);
  console.log("\n6. Test trading on DEX:");
  console.log(`   dex.buyTokens(tokenAddress, amount)`);
  console.log("\n7. Complete ecosystem ready! 🚀");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });
