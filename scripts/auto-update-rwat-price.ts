import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script d'auto-update du prix du token RWAT à chaque heure pile (00 minutes)
 * 
 * Ce script:
 * - Tourne en continu
 * - Attend la prochaine heure pile (ex: 22h00, 23h00, 0h00)
 * - Met à jour le prix du token RWAT dans l'Oracle
 * - Multiplie par un facteur aléatoire entre 0.9 et 1.1
 * 
 * Usage:
 *   npx hardhat run scripts/auto-update-rwat-price.ts --network sepolia
 * 
 * Pour laisser tourner en background (PowerShell):
 *   Start-Process npx -ArgumentList "hardhat", "run", "scripts/auto-update-rwat-price.ts", "--network", "sepolia" -WindowStyle Hidden
 */

// ========== CONFIGURATION ==========

const MIN_MULTIPLIER = 0.9;  // Prix minimum: × 0.9 (-10%)
const MAX_MULTIPLIER = 1.1;  // Prix maximum: × 1.1 (+10%)
const DEFAULT_TOKEN_PRICE = "50.0"; // 50 EUR par défaut pour RWAT

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
  
  console.log("\n" + "=".repeat(70));
  console.log("🪙 MISE À JOUR DU PRIX RWAT");
  console.log("=".repeat(70));
  console.log("Heure:", new Date().toLocaleString());
  console.log("Token:", tokenAddress);
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
 * Récupérer ou initialiser le prix du token
 */
async function getOrInitTokenPrice(
  oracle: any,
  tokenAddress: string
): Promise<bigint> {
  try {
    const priceData = await oracle.prices(tokenAddress);
    if (priceData.isActive && priceData.price > 0n) {
      console.log("\n✅ Prix actuel dans l'Oracle:", ethers.formatEther(priceData.price), "EUR");
      console.log("   Dernière mise à jour:", new Date(Number(priceData.lastUpdate) * 1000).toLocaleString());
      console.log("   Nombre de mises à jour:", priceData.updateCount.toString());
      return priceData.price;
    }
  } catch (error) {
    // Prix non défini
  }
  
  // Initialiser avec le prix par défaut
  const defaultPrice = ethers.parseEther(DEFAULT_TOKEN_PRICE);
  console.log("\n⚠️  Prix initial non défini dans l'Oracle!");
  console.log("   Initialisation du prix:", ethers.formatEther(defaultPrice), "EUR");
  
  try {
    const tx = await oracle.updatePrice(tokenAddress, defaultPrice);
    await tx.wait();
    console.log("   ✅ Prix initial défini dans l'Oracle!");
  } catch (error: any) {
    console.error("   ⚠️  Erreur d'initialisation:", error.message);
  }
  
  return defaultPrice;
}

/**
 * Boucle principale
 */
async function main() {
  console.log("\n🪙 RWAT TOKEN PRICE AUTO-UPDATE SCRIPT");
  console.log("=".repeat(70));
  console.log("Planification: Chaque heure pile (XX:00)");
  console.log("Variation: ±10% (×", MIN_MULTIPLIER, "à ×" + MAX_MULTIPLIER + ")");
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
  const tokenAddress = addresses.fungibleToken;
  
  if (!oracleAddress) {
    console.log("❌ Oracle non déployé!");
    console.log("   Run: npx hardhat run scripts/deploy-oracle.ts --network", networkName);
    process.exit(1);
  }
  
  if (!tokenAddress) {
    console.log("❌ Token RWAT non déployé!");
    console.log("   Run: npx hardhat run scripts/deploy-tokens.ts --network", networkName);
    process.exit(1);
  }
  
  console.log("\n📋 Configuration:");
  console.log("Oracle:", oracleAddress);
  console.log("RWAT Token:", tokenAddress);
  console.log("Network:", networkName);
  
  // Se connecter aux contrats
  const oracle = await ethers.getContractAt("SimplePriceOracle", oracleAddress);
  const token = await ethers.getContractAt("FungibleAssetToken", tokenAddress);
  
  // Récupérer les infos du token
  const name = await token.name();
  const symbol = await token.symbol();
  const totalSupply = await token.totalSupply();
  
  console.log("\n🪙 Token Info:");
  console.log("   Name:", name);
  console.log("   Symbol:", symbol);
  console.log("   Total Supply:", ethers.formatEther(totalSupply), symbol);
  
  // Récupérer ou initialiser le prix
  let currentPrice = await getOrInitTokenPrice(oracle, tokenAddress);
  
  console.log("\n✅ Script prêt!");
  
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
    
    // Mettre à jour le prix
    updateCount++;
    console.log("\n🔄 Mise à jour automatique #" + updateCount);
    
    currentPrice = await updateRWATPrice(oracle, tokenAddress, currentPrice);
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
