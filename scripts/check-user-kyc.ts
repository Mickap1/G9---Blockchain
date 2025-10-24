import { ethers } from "hardhat";

/**
 * Script pour vérifier le statut KYC d'une adresse spécifique
 * 
 * Usage:
 *   npx hardhat run scripts/check-user-kyc.ts --network sepolia
 */

async function main() {
  // Adresse à vérifier (remplacer par votre adresse)
  const userAddress = process.env.USER_ADDRESS || "0x41B6b59a9365a58B00a68c597c49dB5Fa8C72116";
  
  console.log("\n🔍 VÉRIFICATION DU STATUT KYC");
  console.log("=".repeat(70));
  console.log("Adresse à vérifier:", userAddress);
  
  // Charger le contrat KYC
  const kycAddress = "0x563E31793214F193EB7993a2bfAd2957a70C7D65";
  const kyc = await ethers.getContractAt("KYCRegistry", kycAddress);
  
  console.log("\n📋 Contrat KYC Registry:", kycAddress);
  console.log("Réseau:", (await ethers.provider.getNetwork()).name);
  
  // Vérifier le statut
  const isWhitelisted = await kyc.isWhitelisted(userAddress);
  
  console.log("\n" + "=".repeat(70));
  if (isWhitelisted) {
    console.log("✅ STATUT: APPROUVÉ (Whitelisted)");
    console.log("   → Peut créer des NFTs via mintAssetPublic()");
  } else {
    console.log("❌ STATUT: NON APPROUVÉ");
    console.log("   → Ne peut PAS créer de NFTs");
    console.log("\n💡 Pour approuver cette adresse:");
    console.log("   npx hardhat run scripts/approve-kyc.ts --network sepolia");
  }
  console.log("=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
