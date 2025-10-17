import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script d'auto-update du prix toutes les heures
 * 
 * Ce script:
 * - Tourne en continu
 * - Change le prix toutes les heures
 * - Multiplie par un facteur aléatoire entre 0.8 et 1.2
 * 
 * Usage:
 *   npx hardhat run scripts/auto-update-price.ts --network sepolia
 * 
 * Pour laisser tourner en background:
 *   nohup npx hardhat run scripts/auto-update-price.ts --network sepolia &
 */

// ========== CONFIGURATION ==========

const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 heure en millisecondes
const MIN_MULTIPLIER = 0.8;  // Prix minimum: × 0.8
const MAX_MULTIPLIER = 1.2;  // Prix maximum: × 1.2

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
  console.log("📊 MISE À JOUR DU PRIX NFT");
  console.log("=".repeat(60));
  console.log("Heure:", new Date().toLocaleString());
  console.log("Token ID:", tokenId);
  console.log("Ancien prix:", ethers.formatEther(currentPrice), "EUR");
  console.log("Multiplicateur:", multiplier.toFixed(4));
  console.log("Nouveau prix:", ethers.formatEther(newPrice), "EUR");
  console.log("Changement:", changeSymbol + changePercent + "%");
  
  // Mettre à jour l'oracle
  console.log("\n⏳ Envoi de la transaction...");
  
  try {
    const tx = await oracle.updateNFTPrice(nftAddress, tokenId, newPrice);
    console.log("Transaction envoyée:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmée!");
    console.log("Bloc:", receipt?.blockNumber);
    console.log("Gas utilisé:", receipt?.gasUsed.toString());
    console.log("🔗 View on Etherscan:");
    console.log("   https://sepolia.etherscan.io/tx/" + receipt?.hash);
    
    return newPrice;
    
  } catch (error: any) {
    console.error("❌ Erreur lors de la mise à jour:", error.message);
    return currentPrice; // Garder l'ancien prix en cas d'erreur
  }
}

/**
 * Boucle principale
 */
async function main() {
  console.log("\n🤖 AUTO-UPDATE SCRIPT DÉMARRÉ");
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
  const nftAddress = addresses.nft;
  
  if (!oracleAddress) {
    console.log("❌ Oracle non déployé!");
    console.log("   Run: npx hardhat run scripts/deploy-oracle.ts --network", networkName);
    process.exit(1);
  }
  
  if (!nftAddress) {
    console.log("❌ NFT Contract non déployé!");
    console.log("   Run: npx hardhat run scripts/deploy-all.ts --network", networkName);
    process.exit(1);
  }
  
  console.log("\n📋 Configuration:");
  console.log("Oracle:", oracleAddress);
  console.log("NFT Contract:", nftAddress);
  console.log("Network:", networkName);
  
  // Se connecter aux contrats
  const oracle = await ethers.getContractAt("SimplePriceOracle", oracleAddress);
  const nft = await ethers.getContractAt("NFTAssetToken", nftAddress);
  
  // Vérifier quel Token ID nous allons mettre à jour
  const TOKEN_ID = 1; // ID du premier NFT (immeuble)
  
  console.log("\n📦 NFT Token ID à mettre à jour:", TOKEN_ID);
  
  // Vérifier si le NFT existe
  try {
    const owner = await nft.ownerOf(TOKEN_ID);
    console.log("   Owner:", owner);
    
    const assetData = await nft.assetData(TOKEN_ID);
    console.log("   Nom:", assetData.name);
    console.log("   Valuation actuelle (NFT contract):", ethers.formatEther(assetData.valuation), "EUR");
  } catch (error) {
    console.log("\n⚠️  NFT Token ID", TOKEN_ID, "n'existe pas encore!");
    console.log("   Vous devez d'abord minter un NFT.");
    console.log("   Run: npx hardhat run scripts/mint-nft.ts --network", networkName);
    process.exit(1);
  }
  
  // Obtenir le prix initial depuis l'oracle
  let currentPrice: bigint;
  
  try {
    currentPrice = await oracle.getNFTPrice(nftAddress, TOKEN_ID);
    console.log("\n✅ Prix dans l'Oracle:", ethers.formatEther(currentPrice), "EUR");
  } catch (error) {
    console.log("\n⚠️  Prix initial non défini dans l'Oracle!");
    
    // Récupérer la valuation depuis le NFT contract
    const assetData = await nft.assetData(TOKEN_ID);
    currentPrice = assetData.valuation;
    
    console.log("   Initialisation du prix dans l'Oracle:", ethers.formatEther(currentPrice), "EUR");
    
    const tx = await oracle.updateNFTPrice(nftAddress, TOKEN_ID, currentPrice);
    await tx.wait();
    console.log("   ✅ Prix initial défini dans l'Oracle!");
  }
  
  console.log("\n✅ Script prêt! Mise à jour toutes les", UPDATE_INTERVAL / 1000 / 60, "minutes");
  console.log("Appuyez sur Ctrl+C pour arrêter\n");
  
  // Boucle infinie
  let updateCount = 0;
  
  while (true) {
    // Attendre l'intervalle
    await new Promise(resolve => setTimeout(resolve, UPDATE_INTERVAL));
    
    // Mettre à jour le prix
    updateCount++;
    console.log("\n🔄 Mise à jour #" + updateCount);
    
    currentPrice = await updateNFTPrice(oracle, nftAddress, TOKEN_ID, currentPrice);
    
    // Mettre à jour aussi le prix dans le contrat NFT
    console.log("\n⏳ Mise à jour du prix dans le contrat NFT...");
    try {
      const updateTx = await nft.updateValuation(TOKEN_ID, currentPrice);
      await updateTx.wait();
      console.log("✅ Prix mis à jour dans le contrat NFT aussi!");
    } catch (error: any) {
      console.log("⚠️  Impossible de mettre à jour le NFT contract:", error.message);
    }
    
    // Afficher le statut
    console.log("\n💤 Prochaine mise à jour dans", UPDATE_INTERVAL / 1000 / 60, "minutes...");
  }
}

// Gestion propre de l'arrêt
process.on("SIGINT", () => {
  console.log("\n\n👋 Arrêt du script...");
  console.log("Nombre de mises à jour effectuées:", updateCount || 0);
  process.exit(0);
});

// Lancer le script
main().catch((error) => {
  console.error("\n❌ Erreur fatale:");
  console.error(error);
  process.exit(1);
});

// Variable globale pour compter les updates
let updateCount = 0;    