import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script to check current prices in the Oracle
 * 
 * Usage:
 * npx hardhat run scripts/check-prices.ts --network sepolia
 */

async function main() {
  console.log("\n💰 Checking Oracle Prices...\n");

  // Load deployments
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-addresses.json`);
  
  if (!fs.existsSync(deploymentsPath)) {
    console.log("❌ No deployments found!");
    process.exit(1);
  }
  
  const addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const oracleAddress = addresses.oracle;
  const nftAddress = addresses.nft;
  
  if (!oracleAddress) {
    console.log("❌ Oracle not deployed!");
    process.exit(1);
  }
  
  console.log("📋 Contract Addresses:");
  console.log("   Oracle:", oracleAddress);
  if (nftAddress) console.log("   NFT:", nftAddress);

  // Get contracts
  const oracle = await ethers.getContractAt("SimplePriceOracle", oracleAddress);

  console.log("\n" + "=".repeat(60));
  console.log("📊 ORACLE STATUS");
  console.log("=".repeat(60));

  // Check if oracle is paused
  const isPaused = await oracle.paused();
  console.log("Paused:", isPaused ? "❌ YES" : "✅ NO");

  // Check NFT prices
  if (nftAddress) {
    const nft = await ethers.getContractAt("NFTAssetToken", nftAddress);
    
    console.log("\n" + "=".repeat(60));
    console.log("💎 NFT ASSET PRICES");
    console.log("=".repeat(60));

    // Check Token IDs 0-5
    for (let tokenId = 0; tokenId <= 5; tokenId++) {
      try {
        // Check if token exists
        const owner = await nft.ownerOf(tokenId);
        const assetData = await nft.assetData(tokenId);
        
        console.log("\n📦 Token ID:", tokenId);
        console.log("   Name:", assetData.name);
        console.log("   Owner:", owner);
        console.log("   Valuation (NFT Contract):", ethers.formatEther(assetData.valuation), "EUR");
        
        // Check Oracle price
        try {
          const priceData = await oracle.nftPrices(nftAddress, tokenId);
          
          if (priceData.isActive) {
            console.log("   Price (Oracle):", ethers.formatEther(priceData.price), "EUR");
            console.log("   Last Update:", new Date(Number(priceData.lastUpdate) * 1000).toLocaleString());
            console.log("   Update Count:", priceData.updateCount.toString());
            
            // Get history
            const history = await oracle.getNFTPriceHistory(nftAddress, tokenId);
            if (history.length > 0) {
              console.log("   History Length:", history.length);
              
              if (history.length >= 2) {
                const latest = history[history.length - 1];
                const previous = history[history.length - 2];
                const change = ((Number(latest.price) - Number(previous.price)) / Number(previous.price)) * 100;
                const changeSymbol = change >= 0 ? "+" : "";
                console.log("   Last Change:", changeSymbol + change.toFixed(2) + "%");
              }
            }
          } else {
            console.log("   Price (Oracle): ❌ Not set");
          }
        } catch (error) {
          console.log("   Price (Oracle): ❌ Not set");
        }
        
      } catch (error) {
        // Token doesn't exist, skip
        break;
      }
    }
  }

  // Check fungible token price (if exists)
  const fungibleAddress = addresses.token || addresses.fungibleToken;
  if (fungibleAddress) {
    console.log("\n" + "=".repeat(60));
    console.log("🪙 FUNGIBLE TOKEN PRICE");
    console.log("=".repeat(60));
    
    try {
      const priceData = await oracle.prices(fungibleAddress);
      
      if (priceData.isActive) {
        console.log("   Token:", fungibleAddress);
        console.log("   Price:", ethers.formatEther(priceData.price), "EUR");
        console.log("   Last Update:", new Date(Number(priceData.lastUpdate) * 1000).toLocaleString());
        console.log("   Update Count:", priceData.updateCount.toString());
        
        // Get history
        const history = await oracle.getPriceHistory(fungibleAddress);
        if (history.length > 0) {
          console.log("   History Length:", history.length);
          
          if (history.length >= 2) {
            const latest = history[history.length - 1];
            const previous = history[history.length - 2];
            const change = ((Number(latest.price) - Number(previous.price)) / Number(previous.price)) * 100;
            const changeSymbol = change >= 0 ? "+" : "";
            console.log("   Last Change:", changeSymbol + change.toFixed(2) + "%");
          }
        }
      } else {
        console.log("   Price: ❌ Not set");
      }
    } catch (error) {
      console.log("   Price: ❌ Not set");
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ CHECK COMPLETE");
  console.log("=".repeat(60));
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:");
    console.error(error);
    process.exit(1);
  });
