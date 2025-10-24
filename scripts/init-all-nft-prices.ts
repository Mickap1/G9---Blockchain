import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script pour initialiser les prix de TOUS les NFTs existants dans l'Oracle
 * 
 * Usage:
 *   npx hardhat run scripts/init-all-nft-prices.ts --network sepolia
 */

const DEFAULT_NFT_PRICE = ethers.parseEther("50000.0"); // 50,000 EUR

async function main() {
  console.log("\n🚀 INITIALISATION DES PRIX DE TOUS LES NFTs");
  console.log("=".repeat(60));

  // Charger les adresses
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentsPath = path.join(
    __dirname,
    "..",
    "deployments",
    `${networkName}-addresses.json`
  );

  if (!fs.existsSync(deploymentsPath)) {
    console.log("❌ Fichier deployments introuvable!");
    process.exit(1);
  }

  const addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const oracleAddress = addresses.oracle;
  
  // Utiliser NFTAssetTokenV2 (la bonne adresse)
  const nftAddress = "0xf16b0641A9C56C6db30E052E90DB9358b6D2C946"; // NFTAssetTokenV2

  if (!oracleAddress) {
    console.log("❌ Oracle non déployé!");
    process.exit(1);
  }

  console.log("\n📋 Configuration:");
  console.log("Network:", networkName);
  console.log("Oracle:", oracleAddress);
  console.log("NFT Contract:", nftAddress);

  // Se connecter aux contrats
  const oracle = await ethers.getContractAt("SimplePriceOracle", oracleAddress);
  const nft = await ethers.getContractAt("NFTAssetTokenV2", nftAddress);
  const [signer] = await ethers.getSigners();

  console.log("\nSigner:", await signer.getAddress());

  // Obtenir le total supply
  console.log("\n" + "=".repeat(60));
  console.log("📊 DÉTECTION DES NFTs");
  console.log("=".repeat(60));

  const totalSupply = await nft.totalSupply();
  const total = Number(totalSupply);
  
  console.log("Total Supply:", total, "NFTs");

  if (total === 0) {
    console.log("\n❌ Aucun NFT n'a été minté!");
    console.log("   Mintez d'abord des NFTs avec:");
    console.log("   npx hardhat run scripts/mint-diamond.ts --network", networkName);
    process.exit(1);
  }

  // Récupérer tous les token IDs existants
  const tokenIds: number[] = [];
  
  for (let i = 0; i < total; i++) {
    try {
      const owner = await nft.ownerOf(i);
      if (owner && owner !== ethers.ZeroAddress) {
        tokenIds.push(i);
        console.log(`   ✅ NFT #${i} - Owner: ${owner}`);
      }
    } catch (error) {
      console.log(`   ⚠️  NFT #${i} n'existe pas ou a été brûlé`);
    }
  }

  if (tokenIds.length === 0) {
    console.log("\n❌ Aucun NFT actif trouvé!");
    process.exit(1);
  }

  console.log("\n✅", tokenIds.length, "NFT(s) actif(s) trouvé(s):", tokenIds.join(", "));

  // Initialiser les prix
  console.log("\n" + "=".repeat(60));
  console.log("💰 INITIALISATION DES PRIX");
  console.log("=".repeat(60));

  let initialized = 0;
  let alreadySet = 0;

  for (const tokenId of tokenIds) {
    console.log(`\n📝 NFT #${tokenId}:`);
    
    try {
      // Vérifier si un prix existe déjà
      const priceData = await oracle.nftPrices(nftAddress, tokenId);
      
      if (priceData.isActive && priceData.price > 0n) {
        console.log("   ℹ️  Prix déjà défini:", ethers.formatEther(priceData.price), "EUR");
        console.log("   Dernière mise à jour:", new Date(Number(priceData.lastUpdate) * 1000).toLocaleString());
        alreadySet++;
      } else {
        // Initialiser avec le prix par défaut
        console.log("   ⏳ Initialisation à", ethers.formatEther(DEFAULT_NFT_PRICE), "EUR...");
        
        const tx = await oracle.updateNFTPrice(nftAddress, tokenId, DEFAULT_NFT_PRICE);
        console.log("   Transaction hash:", tx.hash);
        
        const receipt = await tx.wait();
        console.log("   ✅ Prix initialisé!");
        console.log("   Gas utilisé:", receipt?.gasUsed.toString());
        
        initialized++;
      }
    } catch (error: any) {
      console.error("   ❌ Erreur:", error.message);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ INITIALISATION TERMINÉE");
  console.log("=".repeat(60));
  console.log("NFTs avec prix déjà défini:", alreadySet);
  console.log("NFTs nouvellement initialisés:", initialized);
  console.log("Total:", tokenIds.length, "NFTs");

  console.log("\n🎯 Prochaines étapes:");
  console.log("1. Vérifier les prix: npx hardhat run scripts/check-oracle.ts --network", networkName);
  console.log("2. Lancer l'auto-update de tous les NFTs:");
  console.log("   npx hardhat run scripts/auto-update-all-nft-prices.ts --network", networkName);
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
