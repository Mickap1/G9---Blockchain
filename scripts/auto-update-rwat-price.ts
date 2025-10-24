import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script d'auto-update du prix du token RWAT toutes les heures
 * 
 * Ce script:
 * - Tourne en continu
 * - Change le prix toutes les heures
 * - Multiplie par un facteur aléatoire entre 0.95 et 1.05 (±5%)
 * 
 * Usage:
 *   npx hardhat run scripts/auto-update-rwat-price.ts --network sepolia
 * 
 * Pour laisser tourner en background (PowerShell):
 *   Start-Process npx -ArgumentList "hardhat", "run", "scripts/auto-update-rwat-price.ts", "--network", "sepolia" -WindowStyle Hidden
 */

// ========== CONFIGURATION ==========

// const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 heure en millisecondes (pour production)
const UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes pour test

const MIN_MULTIPLIER = 0.95;  // Prix minimum: × 0.95 (-5%)
const MAX_MULTIPLIER = 1.05;  // Prix maximum: × 1.05 (+5%)

// ========== FONCTIONS ==========

/**
 * Générer un nombre aléatoire entre min et max
 */
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Mettre à jour le prix du token RWAT dans l'oracle
 */
async function updateRWATPrice(
  oracle: any,
  tokenAddress: string,
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
  console.log("💰 MISE À JOUR DU PRIX DU TOKEN RWAT");
  console.log("=".repeat(60));
  console.log("Heure:", new Date().toLocaleString());
  console.log("Ancien prix:", ethers.formatEther(currentPrice), "EUR");
  console.log("Multiplicateur:", multiplier.toFixed(4));
  console.log("Nouveau prix:", ethers.formatEther(newPrice), "EUR");
  console.log("Changement:", changeSymbol + changePercent + "%");
  
  // Mettre à jour l'oracle
  console.log("\n⏳ Mise à jour de l'Oracle...");
  
  try {
    const tx = await oracle.updatePrice(tokenAddress, newPrice);
    console.log("   Transaction envoyée:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("   ✅ Oracle mis à jour!");
    console.log("   Bloc:", receipt?.blockNumber);
    console.log("   Gas utilisé:", receipt?.gasUsed.toString());
    
    console.log("\n🔗 View on Etherscan:");
    console.log("   https://sepolia.etherscan.io/tx/" + receipt?.hash);
    
    return newPrice;
    
  } catch (error: any) {
    console.error("\n❌ Erreur lors de la mise à jour:", error.message);
    return currentPrice; // Garder l'ancien prix en cas d'erreur
  }
}

/**
 * Boucle principale
 */
async function main() {
  console.log("\n💰 RWAT PRICE AUTO-UPDATE SCRIPT");
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
  const fungibleTokenAddress = addresses.fungibleToken;
  
  if (!oracleAddress) {
    console.log("❌ Oracle non déployé!");
    console.log("   Run: npx hardhat run scripts/deploy-oracle.ts --network", networkName);
    process.exit(1);
  }
  
  if (!fungibleTokenAddress) {
    console.log("❌ Fungible Token non déployé!");
    process.exit(1);
  }
  
  console.log("\n📋 Configuration:");
  console.log("Oracle:", oracleAddress);
  console.log("RWAT Token:", fungibleTokenAddress);
  console.log("Network:", networkName);
  
  // Se connecter aux contrats
  const oracle = await ethers.getContractAt("SimplePriceOracle", oracleAddress);
  const token = await ethers.getContractAt("FungibleAssetToken", fungibleTokenAddress);
  
  // Vérifier le nom du token
  const tokenName = await token.name();
  const tokenSymbol = await token.symbol();
  console.log("\n💎 Token:", tokenName, "(" + tokenSymbol + ")");
  
  // Obtenir le prix initial depuis l'oracle
  let currentPrice: bigint;
  
  try {
    const priceData = await oracle.prices(fungibleTokenAddress);
    if (priceData.isActive && priceData.price > 0n) {
      currentPrice = priceData.price;
      console.log("\n✅ Prix dans l'Oracle:", ethers.formatEther(currentPrice), "EUR");
      console.log("   Dernière mise à jour:", new Date(Number(priceData.lastUpdate) * 1000).toLocaleString());
      console.log("   Nombre de mises à jour:", priceData.updateCount.toString());
    } else {
      throw new Error("Price not set");
    }
  } catch (error) {
    console.log("\n⚠️  Prix initial non défini dans l'Oracle!");
    console.log("   Initialisation avec 1.00 EUR");
    
    currentPrice = ethers.parseEther("1.0");
    
    const tx = await oracle.updatePrice(fungibleTokenAddress, currentPrice);
    await tx.wait();
    console.log("   ✅ Prix initial défini dans l'Oracle!");
  }
  
  console.log("\n✅ Script prêt! Mise à jour toutes les", UPDATE_INTERVAL / 1000 / 60, "minutes");
  console.log("💡 Tip: Pour tester rapidement, UPDATE_INTERVAL est défini à 5 minutes");
  console.log("⏹️  Appuyez sur Ctrl+C pour arrêter\n");
  
  // Boucle infinie
  let updateCount = 0;
  
  while (true) {
    // Attendre l'intervalle
    await new Promise(resolve => setTimeout(resolve, UPDATE_INTERVAL));
    
    // Mettre à jour le prix
    updateCount++;
    console.log("\n🔄 Mise à jour #" + updateCount);
    
    currentPrice = await updateRWATPrice(oracle, fungibleTokenAddress, currentPrice);
    
    // Afficher le statut
    const nextUpdate = new Date(Date.now() + UPDATE_INTERVAL);
    console.log("\n💤 Prochaine mise à jour prévue à:", nextUpdate.toLocaleTimeString());
    console.log("   (dans", UPDATE_INTERVAL / 1000 / 60, "minutes)");
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
