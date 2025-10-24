import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script d'auto-update des prix de TOUS les NFTs toutes les X minutes
 * 
 * Ce script:
 * - Tourne en continu
 * - Détecte automatiquement tous les NFTs existants
 * - Change le prix de chaque NFT individuellement
 * - Multiplie par un facteur aléatoire entre 0.8 et 1.2 (±20%)
 * 
 * Usage:
 *   npx hardhat run scripts/auto-update-all-nft-prices.ts --network sepolia
 * 
 * Pour laisser tourner en background (PowerShell):
 *   Start-Process npx -ArgumentList "hardhat", "run", "scripts/auto-update-all-nft-prices.ts", "--network", "sepolia" -WindowStyle Hidden
 */

// ========== CONFIGURATION ==========

const UPDATE_INTERVAL = 3 * 60 * 1000; // 3 minutes pour test

const MIN_MULTIPLIER = 0.8;  // Prix minimum: × 0.8 (-20%)
const MAX_MULTIPLIER = 1.2;  // Prix maximum: × 1.2 (+20%)
const DEFAULT_NFT_PRICE = ethers.parseEther("50000.0"); // Prix par défaut: 50,000 EUR

// ========== FONCTIONS ==========

/**
 * Générer un nombre aléatoire entre min et max
 */
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Mettre à jour le prix d'un NFT dans l'oracle
 */
async function updateNFTPrice(
  oracle: any,
  nftAddress: string,
  tokenId: number,
  currentPrice: bigint
): Promise<bigint> {
  // Générer multiplicateur aléatoire
  const multiplier = randomBetween(MIN_MULTIPLIER, MAX_MULTIPLIER);
  
  // Calculer nouveau prix
  const newPriceFloat = Number(ethers.formatEther(currentPrice)) * multiplier;
  const newPrice = ethers.parseEther(newPriceFloat.toFixed(18));
  
  // Calculer changement en %
  const changePercent = ((multiplier - 1) * 100).toFixed(2);
  const changeSymbol = multiplier >= 1 ? "+" : "";
  
  console.log("\n" + "=".repeat(60));
  console.log(`💎 MISE À JOUR DU PRIX DU NFT #${tokenId}`);
  console.log("=".repeat(60));
  console.log("Ancien prix:", ethers.formatEther(currentPrice), "EUR");
  console.log("Multiplicateur:", multiplier.toFixed(4));
  console.log("Nouveau prix:", ethers.formatEther(newPrice), "EUR");
  console.log("Changement:", changeSymbol + changePercent + "%");
  
  // Mettre à jour l'oracle
  console.log("\n⏳ Mise à jour de l'Oracle...");
  
  try {
    const tx = await oracle.updateNFTPrice(nftAddress, tokenId, newPrice);
    console.log("   Transaction envoyée:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("   ✅ Oracle mis à jour!");
    console.log("   Gas utilisé:", receipt?.gasUsed.toString());
    
    return newPrice;
    
  } catch (error: any) {
    console.error("\n❌ Erreur lors de la mise à jour:", error.message);
    return currentPrice; // Garder l'ancien prix en cas d'erreur
  }
}

/**
 * Obtenir tous les NFTs existants
 */
async function getAllNFTs(nft: any): Promise<number[]> {
  try {
    // Obtenir le total supply
    const totalSupply = await nft.totalSupply();
    const total = Number(totalSupply);
    
    console.log("📊 Total Supply:", total, "NFTs");
    
    if (total === 0) {
      console.log("⚠️  Aucun NFT n'a été minté");
      return [];
    }
    
    // Récupérer tous les token IDs (les NFTs sont numérotés de 0 à totalSupply-1)
    const tokenIds: number[] = [];
    for (let i = 0; i < total; i++) {
      try {
        // Vérifier si le NFT existe (il pourrait avoir été brûlé)
        const owner = await nft.ownerOf(i);
        if (owner && owner !== ethers.ZeroAddress) {
          tokenIds.push(i);
        }
      } catch (error) {
        // NFT brûlé ou n'existe pas
        console.log(`   ⚠️  NFT #${i} n'existe pas ou a été brûlé`);
      }
    }
    
    return tokenIds;
  } catch (error: any) {
    console.error("❌ Erreur lors de la récupération des NFTs:", error.message);
    return [];
  }
}

/**
 * Initialiser les prix de tous les NFTs
 */
async function initializeNFTPrices(
  oracle: any,
  nftAddress: string,
  tokenIds: number[]
): Promise<Map<number, bigint>> {
  const prices = new Map<number, bigint>();
  
  console.log("\n" + "=".repeat(60));
  console.log("🔄 INITIALISATION DES PRIX");
  console.log("=".repeat(60));
  
  for (const tokenId of tokenIds) {
    try {
      // Essayer de récupérer le prix existant
      const priceData = await oracle.nftPrices(nftAddress, tokenId);
      
      if (priceData.isActive && priceData.price > 0n) {
        prices.set(tokenId, priceData.price);
        console.log(`NFT #${tokenId}: ${ethers.formatEther(priceData.price)} EUR (existant)`);
      } else {
        // Initialiser avec le prix par défaut
        console.log(`NFT #${tokenId}: Initialisation à ${ethers.formatEther(DEFAULT_NFT_PRICE)} EUR...`);
        const tx = await oracle.updateNFTPrice(nftAddress, tokenId, DEFAULT_NFT_PRICE);
        await tx.wait();
        prices.set(tokenId, DEFAULT_NFT_PRICE);
        console.log(`   ✅ Initialisé`);
      }
    } catch (error: any) {
      console.error(`   ❌ Erreur NFT #${tokenId}:`, error.message);
      prices.set(tokenId, DEFAULT_NFT_PRICE);
    }
  }
  
  return prices;
}

/**
 * Boucle principale
 */
async function main() {
  console.log("\n💎 ALL NFT PRICES AUTO-UPDATE SCRIPT");
  console.log("=".repeat(60));
  console.log("Intervalle:", UPDATE_INTERVAL / 1000 / 60, "minutes");
  console.log("Variation:", MIN_MULTIPLIER, "à", MAX_MULTIPLIER);
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
    console.log("   Run: npx hardhat run scripts/deploy-oracle.ts --network", networkName);
    process.exit(1);
  }
  
  console.log("\n📋 Configuration:");
  console.log("Oracle:", oracleAddress);
  console.log("NFT Contract:", nftAddress);
  console.log("Network:", networkName);
  
  // Se connecter aux contrats
  const oracle = await ethers.getContractAt("SimplePriceOracle", oracleAddress);
  const nft = await ethers.getContractAt("NFTAssetTokenV2", nftAddress);
  
  // Récupérer tous les NFTs existants
  const tokenIds = await getAllNFTs(nft);
  
  if (tokenIds.length === 0) {
    console.log("\n❌ Aucun NFT trouvé! Mintez d'abord des NFTs:");
    console.log("   npx hardhat run scripts/mint-diamond.ts --network", networkName);
    process.exit(1);
  }
  
  console.log("\n✅ NFTs trouvés:", tokenIds.join(", "));
  
  // Initialiser les prix de tous les NFTs
  const currentPrices = await initializeNFTPrices(oracle, nftAddress, tokenIds);
  
  console.log("\n✅ Script prêt! Mise à jour de", tokenIds.length, "NFTs toutes les", UPDATE_INTERVAL / 1000 / 60, "minutes");
  console.log("⏹️  Appuyez sur Ctrl+C pour arrêter\n");
  
  // Boucle infinie
  let updateCount = 0;
  
  while (true) {
    // Attendre l'intervalle
    await new Promise(resolve => setTimeout(resolve, UPDATE_INTERVAL));
    
    updateCount++;
    console.log("\n" + "=".repeat(60));
    console.log(`🔄 MISE À JOUR #${updateCount} - ${new Date().toLocaleString()}`);
    console.log("=".repeat(60));
    
    // Mettre à jour chaque NFT
    for (const tokenId of tokenIds) {
      const currentPrice = currentPrices.get(tokenId) || DEFAULT_NFT_PRICE;
      const newPrice = await updateNFTPrice(oracle, nftAddress, tokenId, currentPrice);
      currentPrices.set(tokenId, newPrice);
      
      // Pause de 5 secondes entre chaque NFT pour éviter les problèmes de nonce
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    // Afficher le statut
    const nextUpdate = new Date(Date.now() + UPDATE_INTERVAL);
    console.log("\n💤 Prochaine mise à jour prévue à:", nextUpdate.toLocaleTimeString());
    console.log("   (dans", UPDATE_INTERVAL / 1000 / 60, "minutes)");
  }
}

// Gestion propre de l'arrêt
process.on("SIGINT", () => {
  console.log("\n\n👋 Arrêt du script...");
  process.exit(0);
});

// Lancer le script
main().catch((error) => {
  console.error("\n❌ Erreur fatale:");
  console.error(error);
  process.exit(1);
});
