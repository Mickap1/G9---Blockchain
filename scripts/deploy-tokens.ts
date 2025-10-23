import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Deploying FungibleAssetToken and NFTAssetToken...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // KYC Registry address (v2)
  const KYC_REGISTRY = "0x563E31793214F193EB7993a2bfAd2957a70C7D65";
  console.log("Using KYC Registry:", KYC_REGISTRY, "\n");

  // ========== DEPLOY FUNGIBLE TOKEN ==========
  console.log("📝 Deploying FungibleAssetToken...");
  
  const FungibleToken = await hre.ethers.getContractFactory("FungibleAssetToken");
  const fungibleToken = await FungibleToken.deploy(
    "RWA Platform Token",                    // name
    "RWAT",                                  // symbol
    hre.ethers.parseEther("1000000"),        // maxSupply (1 million tokens)
    KYC_REGISTRY,                            // kycRegistry
    "Platform Utility Token",                // assetName
    "Utility",                               // assetType
    "Global",                                // location
    1000000,                                 // totalValue (in cents)
    "ipfs://QmPlatformTokenDocs"             // documentURI
  );
  
  await fungibleToken.waitForDeployment();
  const fungibleAddress = await fungibleToken.getAddress();
  console.log("✅ FungibleAssetToken deployed to:", fungibleAddress);

  // ========== DEPLOY NFT TOKEN ==========
  console.log("\n📝 Deploying NFTAssetToken...");
  
  const NFTToken = await hre.ethers.getContractFactory("NFTAssetToken");
  const nftToken = await NFTToken.deploy(
    "RWA Asset Collection",                  // name
    "RWANFT",                                // symbol
    KYC_REGISTRY,                            // kycRegistry
    "Mixed Assets",                          // assetType
    "Collection of tokenized real-world assets including artwork, diamonds, and real estate"  // description
  );
  
  await nftToken.waitForDeployment();
  const nftAddress = await nftToken.getAddress();
  console.log("✅ NFTAssetToken deployed to:", nftAddress);

  // ========== VERIFY ROLES ==========
  console.log("\n🔐 Verifying roles...");
  
  const ADMIN_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("ADMIN_ROLE"));
  const MINTER_ROLE = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("MINTER_ROLE"));
  
  const fungibleHasAdmin = await fungibleToken.hasRole(ADMIN_ROLE, deployer.address);
  const fungibleHasMinter = await fungibleToken.hasRole(MINTER_ROLE, deployer.address);
  const nftHasAdmin = await nftToken.hasRole(ADMIN_ROLE, deployer.address);
  const nftHasMinter = await nftToken.hasRole(MINTER_ROLE, deployer.address);
  
  console.log("FungibleToken - Deployer has ADMIN_ROLE:", fungibleHasAdmin ? "✅" : "❌");
  console.log("FungibleToken - Deployer has MINTER_ROLE:", fungibleHasMinter ? "✅" : "❌");
  console.log("NFTToken - Deployer has ADMIN_ROLE:", nftHasAdmin ? "✅" : "❌");
  console.log("NFTToken - Deployer has MINTER_ROLE:", nftHasMinter ? "✅" : "❌");

  // ========== SAVE DEPLOYMENT INFO ==========
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    kycRegistry: KYC_REGISTRY,
    fungibleToken: {
      address: fungibleAddress,
      name: "RWA Platform Token",
      symbol: "RWAT",
      maxSupply: "1000000",
      explorerUrl: `https://sepolia.etherscan.io/address/${fungibleAddress}`
    },
    nftToken: {
      address: nftAddress,
      name: "RWA Asset Collection",
      symbol: "RWANFT",
      explorerUrl: `https://sepolia.etherscan.io/address/${nftAddress}`
    }
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  
  // Save combined file
  const combinedFile = path.join(deploymentsDir, `${hre.network.name}-tokens.json`);
  fs.writeFileSync(combinedFile, JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to:", combinedFile);

  // Update addresses file
  const addressesFile = path.join(deploymentsDir, `${hre.network.name}-addresses.json`);
  let addresses: any = {};
  
  if (fs.existsSync(addressesFile)) {
    addresses = JSON.parse(fs.readFileSync(addressesFile, "utf-8"));
  }

  addresses.fungibleToken = fungibleAddress;
  addresses.nftToken = nftAddress;
  addresses.kycRegistry = KYC_REGISTRY;
  addresses.lastUpdated = new Date().toISOString();

  fs.writeFileSync(addressesFile, JSON.stringify(addresses, null, 2));
  console.log("✅ Addresses file updated:", addressesFile);

  // ========== INSTRUCTIONS ==========
  console.log("\n📋 Next steps:");
  console.log("1. Update frontend .env.local:");
  console.log(`   NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS=${fungibleAddress}`);
  console.log(`   NEXT_PUBLIC_NFT_TOKEN_ADDRESS=${nftAddress}`);
  console.log("\n2. Verify contracts on Etherscan:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${fungibleAddress} "RWA Platform Token" "RWAT" "1000000000000000000000000" "${KYC_REGISTRY}" "Platform Utility Token" "Utility" "Global" 1000000 "ipfs://QmPlatformTokenDocs"`);
  console.log(`   npx hardhat verify --network ${hre.network.name} ${nftAddress} "RWA Asset Collection" "RWANFT" "${KYC_REGISTRY}" "Mixed Assets" "Collection of tokenized real-world assets including artwork, diamonds, and real estate"`);
  
  console.log("\n✨ Deployment complete!");
  console.log("\n📊 Summary:");
  console.log("   FungibleToken:", fungibleAddress);
  console.log("   NFTToken:", nftAddress);
  console.log("   KYC Registry:", KYC_REGISTRY);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
