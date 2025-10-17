import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script to mint a Diamond NFT
 * This will be used for price updates with the Oracle
 * 
 * Usage:
 * npx hardhat run scripts/mint-diamond.ts --network sepolia
 */

async function main() {
  console.log("\n💎 Minting Diamond NFT Asset...\n");

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
  
  if (!nftAddress) {
    console.log("❌ NFT contract not deployed!");
    console.log("   Run: npx hardhat run scripts/deploy-nft.ts --network", networkName);
    process.exit(1);
  }
  
  console.log("📋 Contract Address:");
  console.log("   NFT:", nftAddress);

  // Get NFT contract
  const nft = await ethers.getContractAt("NFTAssetToken", nftAddress);

  // Check collection info
  const name = await nft.name();
  const symbol = await nft.symbol();
  const assetType = await nft.assetType();
  
  console.log("\n📦 NFT Collection Info:");
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Asset Type:", assetType);

  // Diamond Data
  const diamondData = {
    name: "GIA Diamond 2.5ct VS1 D",
    valuation: ethers.parseEther("150000"), // 150,000 EUR
    tokenURI: "ipfs://QmDiamond123/metadata.json",
    certificateURI: "ipfs://QmDiamond123/GIA-certificate.pdf"
  };

  console.log("\n💎 Diamond Data:");
  console.log("   Name:", diamondData.name);
  console.log("   Valuation:", ethers.formatEther(diamondData.valuation), "EUR");
  console.log("   Token URI:", diamondData.tokenURI);
  console.log("   GIA Certificate:", diamondData.certificateURI);

  // Mint Diamond NFT
  console.log("\n⏳ Minting Diamond NFT...");
  
  try {
    const mintTx = await nft.mintAsset(
      deployer.address,
      diamondData.name,
      diamondData.valuation,
      diamondData.tokenURI,
      diamondData.certificateURI
    );
    
    console.log("📤 Transaction sent:", mintTx.hash);
    const receipt = await mintTx.wait();
    console.log("✅ Diamond NFT minted!");
    console.log("   Block:", receipt?.blockNumber);
    console.log("   Gas used:", receipt?.gasUsed.toString());

    // Get Token ID from events
    const events = receipt?.logs || [];
    let tokenId = 1;
    
    for (const event of events) {
      try {
        const parsed = nft.interface.parseLog({
          topics: event.topics as string[],
          data: event.data
        });
        
        if (parsed?.name === "AssetMinted") {
          tokenId = Number(parsed.args.tokenId);
          break;
        }
      } catch (e) {
        // Skip events that don't match
      }
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
    console.log("   Tokenization Date:", new Date(Number(assetData.tokenizationDate) * 1000).toLocaleString());

    // Check if Oracle is deployed
    const oracleAddress = addresses.oracle;
    if (oracleAddress) {
      console.log("\n🔮 Setting initial price in Oracle...");
      const oracle = await ethers.getContractAt("SimplePriceOracle", oracleAddress);
      
      try {
        const setTx = await oracle.updateNFTPrice(nftAddress, tokenId, diamondData.valuation);
        await setTx.wait();
        console.log("✅ Initial price set in Oracle!");
        console.log("   Price:", ethers.formatEther(diamondData.valuation), "EUR");
      } catch (error: any) {
        console.log("⚠️  Could not set price in Oracle:", error.message);
        console.log("   You may need PRICE_UPDATER_ROLE");
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ DIAMOND NFT MINTED SUCCESSFULLY");
    console.log("=".repeat(60));
    console.log("\n🔗 View on Etherscan:");
    const explorerUrl = networkName === "sepolia" 
      ? "https://sepolia.etherscan.io"
      : "http://localhost";
    console.log("   NFT Contract:", `${explorerUrl}/address/${nftAddress}`);
    console.log("   Transaction:", `${explorerUrl}/tx/${receipt?.hash}`);
    console.log("   Token:", `${explorerUrl}/nft/${nftAddress}/${tokenId}`);

    console.log("\n📖 Next steps:");
    console.log("   1. ✅ Diamond NFT minted with Token ID:", tokenId);
    console.log("   2. Start automatic price updates:");
    console.log("      npx hardhat run scripts/auto-update-diamond-price.ts --network", networkName);
    console.log("   3. Check prices:");
    console.log("      npx hardhat run scripts/check-prices.ts --network", networkName);
    console.log("\n");

  } catch (error: any) {
    console.error("\n❌ Minting failed:");
    console.error(error.message);
    
    if (error.message.includes("KYC")) {
      console.log("\n💡 Tip: Make sure the deployer is whitelisted in the KYC registry");
      console.log("   The NFT contract uses KYC:", await nft.kycRegistry());
      console.log("   Current KYC registry:", addresses.kycRegistry);
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:");
    console.error(error);
    process.exit(1);
  });
