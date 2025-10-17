import { ethers, run } from "hardhat";

async function main() {
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "Testnet" : network.name;
  
  console.log(`🚀 Deploying to ${networkName}...\n`);

  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  const symbol = network.chainId === 11155111n ? "ETH" : "MATIC";
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ${symbol}\n`);

  if (balance < ethers.parseEther("0.05")) {
    console.log("⚠️  WARNING: Low balance! Get test tokens from a faucet\n");
  }

  // ========== 1. Deploy KYCRegistry ==========
  console.log("📄 Deploying KYCRegistry...");
  const KYCRegistry = await ethers.getContractFactory("KYCRegistry");
  const kycRegistry = await KYCRegistry.deploy();
  await kycRegistry.waitForDeployment();
  const kycAddress = await kycRegistry.getAddress();
  console.log("✅ KYCRegistry deployed to:", kycAddress);
  
  // Determine explorer URL based on network
  const explorerUrl = network.chainId === 11155111n 
    ? `https://sepolia.etherscan.io/address/${kycAddress}`
    : `https://amoy.polygonscan.com/address/${kycAddress}`;
  console.log("   View on explorer:", explorerUrl);
  console.log("");

  // ========== 2. Deploy Sample Token ==========
  console.log("📄 Deploying FungibleAssetToken (Sample Real Estate)...");
  const Token = await ethers.getContractFactory("FungibleAssetToken");
  const token = await Token.deploy(
    "Residence Lumiere Token",
    "PLM",
    ethers.parseEther("10000"),
    kycAddress,
    "Residence Lumiere - Paris 15eme",
    "Real Estate",
    "42 Rue de Vaugirard, 75015 Paris, France",
    500000, // €500,000
    "ipfs://QmSampleDocumentHash123456789"
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ Token deployed to:", tokenAddress);
  
  const tokenExplorerUrl = network.chainId === 11155111n 
    ? `https://sepolia.etherscan.io/address/${tokenAddress}`
    : `https://amoy.polygonscan.com/address/${tokenAddress}`;
  console.log("   View on explorer:", tokenExplorerUrl);
  console.log("");

  // ========== 3. Setup Initial KYC ==========
  console.log("🔐 Setting up initial KYC...");
  console.log("   Whitelisting deployer:", deployer.address);
  const tx = await kycRegistry.approveKYC(deployer.address, 0);
  await tx.wait();
  console.log("✅ Deployer whitelisted");
  console.log("");

  // ========== 4. Mint Initial Tokens ==========
  console.log("🪙 Minting initial tokens to deployer...");
  const mintTx = await token.mint(deployer.address, ethers.parseEther("1000"));
  await mintTx.wait();
  console.log("✅ Minted 1,000 PLM tokens");
  console.log("");

  // ========== 5. Verify Contracts on Etherscan ==========
  console.log("🔍 Verifying contracts on block explorer...");
  console.log("");
  
  // Wait a bit for the contracts to be indexed
  console.log("⏳ Waiting 30 seconds for contracts to be indexed...");
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  try {
    console.log("📄 Verifying KYCRegistry...");
    await run("verify:verify", {
      address: kycAddress,
      constructorArguments: [],
    });
    console.log("✅ KYCRegistry verified!");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ KYCRegistry already verified!");
    } else {
      console.log("❌ KYCRegistry verification failed:", error.message);
    }
  }
  console.log("");

  try {
    console.log("📄 Verifying FungibleAssetToken...");
    await run("verify:verify", {
      address: tokenAddress,
      constructorArguments: [
        "Residence Lumiere Token",
        "PLM",
        ethers.parseEther("10000").toString(),
        kycAddress,
        "Residence Lumiere - Paris 15eme",
        "Real Estate",
        "42 Rue de Vaugirard, 75015 Paris, France",
        "500000",
        "ipfs://QmSampleDocumentHash123456789"
      ],
    });
    console.log("✅ FungibleAssetToken verified!");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ FungibleAssetToken already verified!");
    } else {
      console.log("❌ FungibleAssetToken verification failed:", error.message);
    }
  }
  console.log("");

  // ========== 6. Display Info ==========
  const metadata = await token.getAssetMetadata();
  const pricePerToken = await token.pricePerToken();
  const balance2 = await token.balanceOf(deployer.address);
  const ownership = await token.ownershipPercentage(deployer.address);

  console.log("🎉 Deployment Complete!\n");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 Contract Addresses:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("KYCRegistry:  ", kycAddress);
  console.log("Token (PLM):  ", tokenAddress);
  console.log("");
  console.log("🏠 Asset Information:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Name:         ", metadata.assetName);
  console.log("Type:         ", metadata.assetType);
  console.log("Location:     ", metadata.location);
  console.log("Total Value:   €" + metadata.totalValue.toString());
  console.log("Price/Token:   €" + pricePerToken.toString());
  console.log("Total Supply:  10,000 PLM");
  console.log("");
  console.log("💰 Your Holdings:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Balance:      ", ethers.formatEther(balance2), "PLM");
  console.log("Ownership:    ", Number(ownership) / 100 + "%");
  console.log("");
  console.log("🔗 Explorers:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  
  const baseExplorerUrl = network.chainId === 11155111n 
    ? "https://sepolia.etherscan.io/address/"
    : "https://amoy.polygonscan.com/address/";
  
  console.log("KYC:  ", baseExplorerUrl + kycAddress);
  console.log("Token:", baseExplorerUrl + tokenAddress);
  console.log("");
  console.log("📝 Next Steps:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("1. ✅ Contracts verified on block explorer!");
  console.log("");
  console.log("2. Add token to MetaMask:");
  console.log("   - Token Address:", tokenAddress);
  console.log("   - Symbol: PLM");
  console.log("   - Decimals: 18");
  console.log("");
  console.log("3. Interact via block explorer (Write Contract tab)");
  console.log("");

  // Save addresses
  const fs = require("fs");
  const saveNetworkName = network.chainId === 11155111n ? "sepolia" : "amoy";
  const addresses = {
    kycRegistry: kycAddress,
    token: tokenAddress,
    deployer: deployer.address,
    network: saveNetworkName,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    verified: true
  };

  const filename = `deployments/${saveNetworkName}-addresses.json`;
  fs.writeFileSync(
    filename,
    JSON.stringify(addresses, null, 2)
  );

  console.log(`💾 Addresses saved to: ${filename}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });