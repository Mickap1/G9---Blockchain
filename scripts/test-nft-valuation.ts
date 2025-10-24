import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script de test pour vérifier la récupération de la valuation depuis les métadonnées
 */

const MIN_MULTIPLIER = 0.8;
const MAX_MULTIPLIER = 1.2;
const DEFAULT_NFT_PRICE = "50000.0";

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

async function getValuationFromMetadata(nft: any, tokenId: number): Promise<bigint | null> {
  try {
    const tokenURI = await nft.tokenURI(tokenId);
    console.log("   📄 Token URI:", tokenURI.substring(0, 100) + "...");
    
    let metadataJSON: string;
    
    if (tokenURI.startsWith('data:application/json;base64,')) {
      const base64Data = tokenURI.replace('data:application/json;base64,', '');
      metadataJSON = Buffer.from(base64Data, 'base64').toString('utf-8');
    } else if (tokenURI.startsWith('ipfs://')) {
      console.log("   ⚠️  IPFS URI détecté");
      return null;
    } else {
      try {
        const response = await fetch(tokenURI);
        metadataJSON = await response.text();
      } catch {
        return null;
      }
    }
    
    const metadata = JSON.parse(metadataJSON);
    console.log("   📋 Métadonnées:", JSON.stringify(metadata, null, 2));
    
    if (metadata.valuation) {
      const valuationStr = typeof metadata.valuation === 'string' 
        ? metadata.valuation 
        : metadata.valuation.toString();
      
      return ethers.parseEther(valuationStr);
    }
    
    return null;
  } catch (error: any) {
    console.log("   ⚠️  Erreur:", error.message);
    return null;
  }
}

async function main() {
  console.log("\n🧪 TEST DE RÉCUPÉRATION DE LA VALUATION");
  console.log("=".repeat(70));
  
  const nftAddress = "0x75499Fc469f8d224C7bF619Ada37ea8f3cD8c36E";
  const oracleAddress = "0x602571F05745181fF237b81dAb8F67148e9475C7";
  
  const nft = await ethers.getContractAt("NFTAssetTokenV2", nftAddress);
  const oracle = await ethers.getContractAt("SimplePriceOracle", oracleAddress);
  
  const totalSupply = await nft.totalSupply();
  console.log("Total NFTs:", totalSupply.toString());
  
  // Tester sur chaque NFT
  for (let tokenId = 0; tokenId < Number(totalSupply); tokenId++) {
    console.log(`\n💎 Token ID ${tokenId}:`);
    
    try {
      const owner = await nft.ownerOf(tokenId);
      console.log("   👤 Owner:", owner);
      
      // Récupérer la valuation
      const valuation = await getValuationFromMetadata(nft, tokenId);
      
      if (valuation) {
        console.log("   ✅ Valuation trouvée:", ethers.formatEther(valuation), "EUR");
        
        // Simuler la mise à jour du prix
        const multiplier = randomBetween(MIN_MULTIPLIER, MAX_MULTIPLIER);
        const newPriceFloat = Number(ethers.formatEther(valuation)) * multiplier;
        const newPrice = ethers.parseEther(newPriceFloat.toFixed(18));
        
        console.log("   📊 Nouveau prix (×" + multiplier.toFixed(4) + "):", ethers.formatEther(newPrice), "EUR");
        
        // Mettre à jour dans l'oracle
        const tx = await oracle.updateNFTPrice(nftAddress, tokenId, newPrice);
        console.log("   ⏳ Transaction:", tx.hash);
        await tx.wait();
        console.log("   ✅ Prix mis à jour dans l'oracle!");
        
      } else {
        console.log("   ⚠️  Valuation non trouvée, utilisation du prix par défaut:", DEFAULT_NFT_PRICE, "EUR");
        const defaultPrice = ethers.parseEther(DEFAULT_NFT_PRICE);
        
        const tx = await oracle.updateNFTPrice(nftAddress, tokenId, defaultPrice);
        await tx.wait();
        console.log("   ✅ Prix par défaut défini!");
      }
      
    } catch (error: any) {
      console.error("   ❌ Erreur:", error.message);
    }
  }
  
  console.log("\n" + "=".repeat(70));
  console.log("✅ Test terminé!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
