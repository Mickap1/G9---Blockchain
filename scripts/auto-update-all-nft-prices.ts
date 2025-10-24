import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script d'auto-update du prix de TOUS les NFTs à chaque heure pile (00 minutes)
 * 
 * Ce script:
 * - Tourne en continu
 * - Attend la prochaine heure pile (ex: 22h00, 23h00, 0h00)
 * - Met à jour le prix de tous les NFTs existants
 * - Multiplie par un facteur aléatoire entre 0.8 et 1.2
 * 
 * Usage:
 *   npx hardhat run scripts/auto-update-all-nft-prices.ts --network sepolia
 * 
 * Pour laisser tourner en background (PowerShell):
 *   Start-Process npx -ArgumentList "hardhat", "run", "scripts/auto-update-all-nft-prices.ts", "--network", "sepolia" -WindowStyle Hidden
 */

// ========== CONFIGURATION ==========

const MIN_MULTIPLIER = 0.8;  // Prix minimum: × 0.8 (-20%)
const MAX_MULTIPLIER = 1.2;  // Prix maximum: × 1.2 (+20%)
const DEFAULT_NFT_PRICE = "50000.0"; // 50,000 EUR par défaut pour un NFT

// ========== FONCTIONS ==========

/**
 * Calculer le temps jusqu'à la prochaine heure pile
 */
function getMillisecondsUntilNextHour(): number {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0); // Prochaine heure, 00 minutes, 00 secondes
  return nextHour.getTime() - now.getTime();
}

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
  
  console.log("\n  💎 Token ID:", tokenId);
  console.log("     Ancien prix:", ethers.formatEther(currentPrice), "EUR");
  console.log("     Multiplicateur:", multiplier.toFixed(4));
  console.log("     Nouveau prix:", ethers.formatEther(newPrice), "EUR");
  console.log("     Changement:", changeSymbol + changePercent + "%");
  
  try {
    const tx = await oracle.updateNFTPrice(nftAddress, tokenId, newPrice);
    console.log("     ⏳ Transaction:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("     ✅ Mis à jour! (Gas:", receipt?.gasUsed.toString() + ")");
    
    return newPrice;
    
  } catch (error: any) {
    console.error("     ❌ Erreur:", error.message);
    return currentPrice; // Garder l'ancien prix en cas d'erreur
  }
}

/**
 * Récupérer ou initialiser le prix d'un NFT
 */
async function getOrInitNFTPrice(
  oracle: any,
  nftAddress: string,
  tokenId: number
): Promise<bigint> {
  try {
    const priceData = await oracle.nftPrices(nftAddress, tokenId);
    if (priceData.isActive && priceData.price > 0n) {
      return priceData.price;
    }
  } catch (error) {
    // Prix non défini
  }
  
  // Initialiser avec le prix par défaut
  const defaultPrice = ethers.parseEther(DEFAULT_NFT_PRICE);
  console.log("     ℹ️  Initialisation du prix:", ethers.formatEther(defaultPrice), "EUR");
  
  try {
    const tx = await oracle.updateNFTPrice(nftAddress, tokenId, defaultPrice);
    await tx.wait();
    console.log("     ✅ Prix initial défini!");
  } catch (error: any) {
    console.error("     ⚠️  Erreur d'initialisation:", error.message);
  }
  
  return defaultPrice;
}

/**
 * Mettre à jour tous les NFTs
 */
async function updateAllNFTs(oracle: any, nft: any, nftAddress: string) {
  console.log("\n" + "=".repeat(70));
  console.log("💎 MISE À JOUR DE TOUS LES NFTs");
  console.log("=".repeat(70));
  console.log("Heure:", new Date().toLocaleString());
  console.log("Contrat NFT:", nftAddress);
  
  // Récupérer le nombre total de NFTs
  let totalSupply: bigint;
  try {
    totalSupply = await nft.totalSupply();
  } catch (error) {
    console.log("\n❌ Impossible de récupérer totalSupply");
    return;
  }
  
  const count = Number(totalSupply);
  console.log("Nombre de NFTs:", count);
  
  if (count === 0) {
    console.log("\n⚠️  Aucun NFT à mettre à jour");
    return;
  }
  
  console.log("\n🔄 Mise à jour en cours...");
  
  // Mettre à jour chaque NFT (Token ID commence à 0)
  for (let tokenId = 0; tokenId < count; tokenId++) {
    try {
      // Vérifier que le NFT existe
      await nft.ownerOf(tokenId);
      
      // Récupérer ou initialiser le prix
      const currentPrice = await getOrInitNFTPrice(oracle, nftAddress, tokenId);
      
      // Mettre à jour le prix
      await updateNFTPrice(oracle, nftAddress, tokenId, currentPrice);
      
    } catch (error: any) {
      if (error.message.includes("ERC721NonexistentToken")) {
        console.log(`\n  ⚠️  Token ID ${tokenId} n'existe pas (sauté)`);
      } else {
        console.error(`\n  ❌ Erreur Token ID ${tokenId}:`, error.message);
      }
    }
  }
  
  console.log("\n✅ Mise à jour terminée!");
}

/**
 * Boucle principale
 */
async function main() {
  console.log("\n💎 NFT PRICES AUTO-UPDATE SCRIPT");
  console.log("=".repeat(70));
  console.log("Planification: Chaque heure pile (XX:00)");
  console.log("Variation: ±20% (×", MIN_MULTIPLIER, "à ×" + MAX_MULTIPLIER + ")");
  console.log("=".repeat(70));
  
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
  const nftAddress = "0x75499Fc469f8d224C7bF619Ada37ea8f3cD8c36E"; // NFTAssetTokenV2
  
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
  
  console.log("\n✅ Contrats connectés!");
  
  // Boucle infinie avec synchronisation horaire
  let updateCount = 0;
  
  while (true) {
    // Calculer le temps jusqu'à la prochaine heure
    const msUntilNextHour = getMillisecondsUntilNextHour();
    const nextUpdate = new Date(Date.now() + msUntilNextHour);
    
    console.log("\n⏰ Prochaine mise à jour: " + nextUpdate.toLocaleTimeString());
    console.log("   (dans " + Math.round(msUntilNextHour / 1000 / 60) + " minutes)");
    console.log("⏹️  Appuyez sur Ctrl+C pour arrêter\n");
    
    // Attendre jusqu'à la prochaine heure
    await new Promise(resolve => setTimeout(resolve, msUntilNextHour));
    
    // Mettre à jour tous les NFTs
    updateCount++;
    console.log("\n🔄 Mise à jour automatique #" + updateCount);
    
    await updateAllNFTs(oracle, nft, nftAddress);
  }
}

// Gestion propre de l'arrêt
let updateCount = 0;

process.on("SIGINT", () => {
  console.log("\n\n👋 Arrêt du script...");
  console.log("Nombre de mises à jour effectuées:", updateCount);
  process.exit(0);
});

// Lancer le script
main().catch((error) => {
  console.error("\n❌ Erreur fatale:");
  console.error(error);
  process.exit(1);
});
