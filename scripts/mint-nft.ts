import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script to mint an NFT (Real Estate / Immeuble)
 * This will be used for price updates
 * 
 * Usage:
 * npx hardhat run scripts/mint-nft.ts --network sepolia
 */

async function main() {
  console.log("\n🏢 Minting NFT Asset (Immeuble)...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📝 Minting with account:", deployer.address);

  // Load deployments
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-addresses.json`);
  
  if (!fs.existsSync(deploymentsPath)) {
    console.log("❌ No deployments found!");
    process.exit(1);
  }
  
  const addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const nftAddress = addresses.nft;
  const kycAddress = addresses.kycRegistry;
  
  if (!nftAddress || !kycAddress) {
    console.log("❌ NFT or KYC contract not deployed!");
    process.exit(1);
  }
  
  console.log("📋 Contract Addresses:");
  console.log("   NFT:", nftAddress);
  console.log("   KYC:", kycAddress);

  // Get contracts
  const nft = await ethers.getContractAt("NFTAssetToken", nftAddress);
  const kyc = await ethers.getContractAt("KYCRegistry", kycAddress);

  // Check if deployer is whitelisted
  const isWhitelisted = await kyc.isWhitelisted(deployer.address);
  if (!isWhitelisted) {
    console.log("\n❌ Deployer is not whitelisted!");
    console.log("   Whitelisting deployer...");
    const oneYearFromNow = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
    const tx = await kyc.approveKYC(deployer.address, oneYearFromNow);
    await tx.wait();
    console.log("   ✅ Deployer whitelisted!");
  }

  // NFT Data
  const nftData = {
    name: "Immeuble Paris 8ème",
    valuation: ethers.parseEther("50000000"), // 50 million EUR
    tokenURI: "ipfs://QmExample123/metadata.json",
    certificateURI: "ipfs://QmExample123/certificate.pdf"
  };

  console.log("\n📦 NFT Data:");
  console.log("   Name:", nftData.name);
  console.log("   Valuation:", ethers.formatEther(nftData.valuation), "EUR");
  console.log("   Token URI:", nftData.tokenURI);
  console.log("   Certificate URI:", nftData.certificateURI);

  // Mint NFT
  console.log("\n⏳ Minting NFT...");
  
  const mintTx = await nft.mintAsset(
    deployer.address,
    nftData.name,
    nftData.valuation,
    nftData.tokenURI,
    nftData.certificateURI
  );
  
  console.log("📤 Transaction sent:", mintTx.hash);
  const receipt = await mintTx.wait();
  console.log("✅ NFT minted!");
  console.log("   Block:", receipt?.blockNumber);
  console.log("   Gas used:", receipt?.gasUsed.toString());

  // Get Token ID from event
  const mintEvent = receipt?.logs.find((log: any) => {
    try {
      const parsed = nft.interface.parseLog(log);
      return parsed?.name === "AssetMinted";
    } catch {
      return false;
    }
  });

  let tokenId = 1; // Default
  if (mintEvent) {
    const parsed = nft.interface.parseLog(mintEvent);
    tokenId = Number(parsed?.args?.tokenId || 1);
  }

  console.log("   Token ID:", tokenId);
  console.log("   Owner:", deployer.address);

  // Verify mint
  console.log("\n📊 Verification:");
  const owner = await nft.ownerOf(tokenId);
  const assetData = await nft.assetData(tokenId);
  
  console.log("   Owner:", owner);
  console.log("   Name:", assetData.name);
  console.log("   Valuation:", ethers.formatEther(assetData.valuation), "EUR");
  console.log("   Active:", assetData.isActive);

  console.log("\n" + "=".repeat(60));
  console.log("✅ NFT MINTED SUCCESSFULLY");
  console.log("=".repeat(60));
  console.log("\n🔗 View on Etherscan:");
  const explorerUrl = networkName === "sepolia" 
    ? "https://sepolia.etherscan.io"
    : "http://localhost";
  console.log("   NFT Contract:", `${explorerUrl}/address/${nftAddress}`);
  console.log("   Transaction:", `${explorerUrl}/tx/${receipt?.hash}`);

  console.log("\n📖 Next steps:");
  console.log("   1. ✅ NFT minted with Token ID:", tokenId);
  console.log("   2. Deploy Oracle: npx hardhat run scripts/deploy-oracle.ts --network", networkName);
  console.log("   3. Start price updates: npx hardhat run scripts/auto-update-price.ts --network", networkName);
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:");
    console.error(error);
    process.exit(1);
  });
