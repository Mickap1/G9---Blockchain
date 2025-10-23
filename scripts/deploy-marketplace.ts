import hre from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Deploying Marketplace Contract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Load existing addresses
  const addressesPath = path.join(__dirname, "../deployments/sepolia-addresses.json");
  let addresses: any = {};
  
  if (fs.existsSync(addressesPath)) {
    addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  }

  const KYC_REGISTRY = addresses.kycRegistry || "";
  const FEE_RECIPIENT = deployer.address; // Admin receives fees by default

  if (!KYC_REGISTRY) {
    throw new Error("KYC Registry address not found. Please deploy KYC first.");
  }

  console.log("Using KYC Registry:", KYC_REGISTRY);
  console.log("Fee Recipient:", FEE_RECIPIENT);
  console.log("");

  // ========== DEPLOY MARKETPLACE ==========
  console.log("📦 Deploying Marketplace...");
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(
    KYC_REGISTRY,
    FEE_RECIPIENT
  );

  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();

  console.log("✅ Marketplace deployed to:", marketplaceAddress);
  console.log("");

  // ========== VERIFY DEPLOYMENT ==========
  console.log("🔍 Verifying deployment...");
  
  const feePercentage = await marketplace.feePercentage();
  const feeRecipient = await marketplace.feeRecipient();
  const kycRegistry = await marketplace.kycRegistry();
  
  console.log("Fee Percentage:", feePercentage.toString(), "(2.5%)");
  console.log("Fee Recipient:", feeRecipient);
  console.log("KYC Registry:", kycRegistry);
  console.log("");

  // ========== SAVE DEPLOYMENT DATA ==========
  addresses.marketplace = marketplaceAddress;
  addresses.lastUpdated = new Date().toISOString();

  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  console.log("✅ Addresses saved to:", addressesPath);

  // Save ABI
  const artifactPath = path.join(__dirname, "../artifacts/contracts/Marketplace.sol/Marketplace.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  const abiDir = path.join(__dirname, "../frontend/lib/abis");
  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(abiDir, "Marketplace.json"),
    JSON.stringify(artifact.abi, null, 2)
  );
  console.log("✅ ABI saved to frontend/lib/abis/Marketplace.json");

  // Save complete deployment info
  const deploymentInfo = {
    marketplace: marketplaceAddress,
    kycRegistry: KYC_REGISTRY,
    feeRecipient: FEE_RECIPIENT,
    feePercentage: feePercentage.toString(),
    deployer: deployer.address,
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployedAt: new Date().toISOString(),
  };

  const deploymentPath = path.join(__dirname, "../deployments/sepolia-marketplace.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Deployment info saved to:", deploymentPath);
  console.log("");

  // ========== SUMMARY ==========
  console.log("═══════════════════════════════════════════════════════════");
  console.log("🎉 MARKETPLACE DEPLOYMENT SUCCESSFUL!");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("");
  console.log("📋 Deployment Summary:");
  console.log("-----------------------------------------------------------");
  console.log("Marketplace:         ", marketplaceAddress);
  console.log("KYC Registry:        ", KYC_REGISTRY);
  console.log("Fee Recipient:       ", FEE_RECIPIENT);
  console.log("Fee Percentage:      ", "2.5%");
  console.log("Network:             ", hre.network.name);
  console.log("Deployer:            ", deployer.address);
  console.log("-----------------------------------------------------------");
  console.log("");

  console.log("📝 Next Steps:");
  console.log("1. Update .env.local with:");
  console.log(`   NEXT_PUBLIC_MARKETPLACE_ADDRESS=${marketplaceAddress}`);
  console.log("");
  console.log("2. Verify contract on Etherscan:");
  console.log(`   npx hardhat verify --network sepolia ${marketplaceAddress} "${KYC_REGISTRY}" "${FEE_RECIPIENT}"`);
  console.log("");
  console.log("3. To list an NFT:");
  console.log("   - Approve Marketplace contract for your NFT");
  console.log("   - Call listNFT(nftContract, tokenId, price)");
  console.log("");
  console.log("4. To list tokens:");
  console.log("   - Approve Marketplace contract for your tokens");
  console.log("   - Call listTokens(tokenContract, amount, pricePerToken)");
  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
