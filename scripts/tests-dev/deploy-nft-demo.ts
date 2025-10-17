import { ethers, network } from "hardhat";
import * as fs from "fs";

async function main() {
  const networkName = network.name;
  const isAmoy = networkName === "amoy";
  const isSepolia = networkName === "sepolia";
  
  if (!isAmoy && !isSepolia) {
    console.error("❌ This script only supports 'amoy' or 'sepolia' networks");
    console.log("� Usage:");
    console.log("   npx hardhat run scripts/deploy-nft-demo.ts --network amoy");
    console.log("   npx hardhat run scripts/deploy-nft-demo.ts --network sepolia");
    return;
  }

  const tokenSymbol = isAmoy ? "MATIC" : "ETH";
  const explorerUrl = isAmoy ? "https://amoy.polygonscan.com" : "https://sepolia.etherscan.io";
  const faucetUrl = isAmoy 
    ? "https://faucet.polygon.technology/" 
    : "https://sepoliafaucet.com/";

  console.log(`�🚀 Deploying NFTAssetToken Demo on ${networkName.toUpperCase()}...\n`);

  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Account balance: ${ethers.formatEther(balance)} ${tokenSymbol}\n`);

  // ========== 1. Deploy KYCRegistry ==========
  console.log("📄 1/3 Deploying KYCRegistry...");
  const KYCRegistry = await ethers.getContractFactory("KYCRegistry");
  const kycRegistry = await KYCRegistry.deploy();
  await kycRegistry.waitForDeployment();
  const kycAddress = await kycRegistry.getAddress();
  console.log("   ✅ KYCRegistry:", kycAddress);
  console.log(`   🔗 View: ${explorerUrl}/address/${kycAddress}`);
  console.log("");

  // ========== 2. Deploy NFTAssetToken (Diamonds) ==========
  console.log("📄 2/3 Deploying NFTAssetToken (Diamond Collection)...");
  const NFT = await ethers.getContractFactory("NFTAssetToken");
  const nft = await NFT.deploy(
    "Tokenized GIA Diamonds",
    "TDMD",
    kycAddress,
    "Precious Stones",
    "GIA certified diamonds with blockchain provenance"
  );
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("   ✅ NFT Collection:", nftAddress);
  console.log(`   🔗 View: ${explorerUrl}/address/${nftAddress}`);
  console.log("");

  // ========== 3. Setup Initial KYC ==========
  console.log("🔐 3/3 Setting up KYC for deployer...");
  const approveTx = await kycRegistry.approveKYC(deployer.address, 0);
  await approveTx.wait();
  console.log("   ✅ Deployer whitelisted:", deployer.address);
  console.log("");

  // ========== 4. Mint Sample NFTs ==========
  console.log("🪙 Minting 3 sample diamond NFTs...\n");

  // Diamond #1
  console.log("   💎 Minting Diamond #1...");
  const tx1 = await nft.mintAsset(
    deployer.address,
    "Round Brilliant 2.5ct D-VS1",
    50000, // €50,000
    "ipfs://QmSampleDiamond1Photo",
    "ipfs://QmGIACertificate-12345678"
  );
  await tx1.wait();
  console.log("      ✅ Token #0 minted");

  // Diamond #2
  console.log("   💎 Minting Diamond #2...");
  const tx2 = await nft.mintAsset(
    deployer.address,
    "Princess Cut 3.0ct E-VVS2",
    75000, // €75,000
    "ipfs://QmSampleDiamond2Photo",
    "ipfs://QmGIACertificate-23456789"
  );
  await tx2.wait();
  console.log("      ✅ Token #1 minted");

  // Diamond #3
  console.log("   💎 Minting Diamond #3...");
  const tx3 = await nft.mintAsset(
    deployer.address,
    "Emerald Cut 2.0ct F-VS1",
    60000, // €60,000
    "ipfs://QmSampleDiamond3Photo",
    "ipfs://QmGIACertificate-34567890"
  );
  await tx3.wait();
  console.log("      ✅ Token #2 minted");
  console.log("");

  // ========== 5. Display Summary ==========
  const totalSupply = await nft.totalSupply();
  const balance3 = await nft.balanceOf(deployer.address);
  const totalValue = await nft.totalValueOf(deployer.address);
  const collectionValue = await nft.totalCollectionValue();

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("📋 CONTRACT ADDRESSES:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("KYCRegistry:      ", kycAddress);
  console.log("NFT Collection:   ", nftAddress);
  console.log("");
  console.log("💎 COLLECTION INFO:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Name:             ", await nft.name());
  console.log("Symbol:           ", await nft.symbol());
  console.log("Type:             ", await nft.assetType());
  console.log("Total Supply:     ", totalSupply.toString(), "NFTs");
  console.log("Collection Value: ", "€" + collectionValue.toString());
  console.log("");
  console.log("👤 YOUR PORTFOLIO:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Your Address:     ", deployer.address);
  console.log("NFTs Owned:       ", balance3.toString());
  console.log("Total Value:      ", "€" + totalValue.toString());
  console.log("");
  console.log(`🔗 ${isAmoy ? 'POLYGONSCAN' : 'ETHERSCAN'} LINKS:`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("KYC Contract:     ", `${explorerUrl}/address/${kycAddress}`);
  console.log("NFT Contract:     ", `${explorerUrl}/address/${nftAddress}`);
  console.log("");
  console.log("📝 NEXT STEPS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("1️⃣  VERIFY CONTRACTS:");
  console.log(`   npx hardhat verify --network ${networkName}`, kycAddress);
  console.log(`   npx hardhat verify --network ${networkName}`, nftAddress, 
              '"Tokenized GIA Diamonds"', 
              '"TDMD"',
              kycAddress,
              '"Precious Stones"',
              '"GIA certified diamonds with blockchain provenance"');
  console.log("");
  console.log("2️⃣  VIEW YOUR NFTs IN METAMASK:");
  console.log("   - Open MetaMask");
  console.log("   - Go to 'NFTs' tab");
  console.log("   - Click 'Import NFT'");
  console.log("   - Contract Address:", nftAddress);
  console.log("   - Token ID: 0 (then 1, then 2)");
  console.log("");
  console.log("3️⃣  INTERACT VIA POLYGONSCAN:");
  console.log("   - Go to NFT contract link above");
  console.log("   - Click 'Contract' tab → 'Write Contract'");
  console.log("   - Connect MetaMask");
  console.log("   - Try functions like transferFrom, mintAsset, etc.");
  console.log("");
  console.log("4️⃣  TEST KYC WORKFLOW:");
  console.log("   - Create a second MetaMask account");
  console.log("   - Try to transfer without KYC → Should FAIL");
  console.log("   - Approve KYC on KYCRegistry contract");
  console.log("   - Try again → Should SUCCEED");
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // ========== 6. Save Addresses ==========
  const chainId = isAmoy ? 80002 : 11155111;
  const deployment = {
    network: networkName,
    chainId: chainId,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      kycRegistry: kycAddress,
      nftCollection: nftAddress
    },
    nftInfo: {
      name: "Tokenized GIA Diamonds",
      symbol: "TDMD",
      totalSupply: totalSupply.toString(),
      collectionValue: collectionValue.toString()
    },
    sampleNFTs: [
      { tokenId: 0, name: "Round Brilliant 2.5ct D-VS1", value: 50000 },
      { tokenId: 1, name: "Princess Cut 3.0ct E-VVS2", value: 75000 },
      { tokenId: 2, name: "Emerald Cut 2.0ct F-VS1", value: 60000 }
    ]
  };

  if (!fs.existsSync("deployments")) {
    fs.mkdirSync("deployments");
  }

  const filename = `deployments/${networkName}-nft-demo.json`;
  fs.writeFileSync(
    filename,
    JSON.stringify(deployment, null, 2)
  );

  console.log(`💾 Deployment info saved to: ${filename}`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);    
  });