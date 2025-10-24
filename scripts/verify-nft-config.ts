import { ethers } from "hardhat";

/**
 * Script pour vérifier la configuration du contrat NFT
 * et notamment l'adresse du KYC Registry qu'il utilise
 * 
 * Usage:
 *   npx hardhat run scripts/verify-nft-config.ts --network sepolia
 */

async function main() {
  console.log("\n🔍 VÉRIFICATION DE LA CONFIGURATION NFT");
  console.log("=".repeat(70));
  
  const nftAddress = "0x75499Fc469f8d224C7bF619Ada37ea8f3cD8c36E";
  const expectedKycAddress = "0x563E31793214F193EB7993a2bfAd2957a70C7D65";
  
  console.log("Contrat NFT:", nftAddress);
  console.log("KYC attendu:", expectedKycAddress);
  
  // Charger le contrat NFT
  const nft = await ethers.getContractAt("NFTAssetTokenV2", nftAddress);
  
  // Récupérer l'adresse KYC utilisée par le contrat
  const kycRegistryAddress = await nft.kycRegistry();
  
  console.log("\n📋 Configuration du contrat NFT:");
  console.log("   Nom:", await nft.name());
  console.log("   Symbol:", await nft.symbol());
  console.log("   Asset Type:", await nft.assetType());
  console.log("   KYC Registry:", kycRegistryAddress);
  
  console.log("\n" + "=".repeat(70));
  if (kycRegistryAddress.toLowerCase() === expectedKycAddress.toLowerCase()) {
    console.log("✅ KYC REGISTRY: CORRECT");
  } else {
    console.log("❌ KYC REGISTRY: INCORRECT!");
    console.log("   Attendu:", expectedKycAddress);
    console.log("   Trouvé:", kycRegistryAddress);
  }
  
  // Vérifier les rôles de l'adresse connectée
  const [deployer] = await ethers.getSigners();
  console.log("\n🔑 Vérification des rôles pour:", deployer.address);
  
  const DEFAULT_ADMIN_ROLE = await nft.DEFAULT_ADMIN_ROLE();
  const ADMIN_ROLE = await nft.ADMIN_ROLE();
  const MINTER_ROLE = await nft.MINTER_ROLE();
  const PAUSER_ROLE = await nft.PAUSER_ROLE();
  
  const hasDefaultAdmin = await nft.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  const hasAdmin = await nft.hasRole(ADMIN_ROLE, deployer.address);
  const hasMinter = await nft.hasRole(MINTER_ROLE, deployer.address);
  const hasPauser = await nft.hasRole(PAUSER_ROLE, deployer.address);
  
  console.log("   DEFAULT_ADMIN_ROLE:", hasDefaultAdmin ? "✅ OUI" : "❌ NON");
  console.log("   ADMIN_ROLE:", hasAdmin ? "✅ OUI" : "❌ NON");
  console.log("   MINTER_ROLE:", hasMinter ? "✅ OUI" : "❌ NON");
  console.log("   PAUSER_ROLE:", hasPauser ? "✅ OUI" : "❌ NON");
  
  // Vérifier si le contrat est pausé
  const isPaused = await nft.paused();
  console.log("\n⏸️  Contrat pausé:", isPaused ? "❌ OUI (pas de mint possible!)" : "✅ NON");
  
  // Vérifier le KYC de l'adresse
  const kyc = await ethers.getContractAt("KYCRegistry", kycRegistryAddress);
  const isWhitelisted = await kyc.isWhitelisted(deployer.address);
  console.log("🎫 KYC Whitelisted:", isWhitelisted ? "✅ OUI" : "❌ NON");
  
  console.log("\n" + "=".repeat(70));
  console.log("📊 RÉSUMÉ:");
  
  if (kycRegistryAddress.toLowerCase() !== expectedKycAddress.toLowerCase()) {
    console.log("❌ Le contrat NFT utilise une MAUVAISE adresse KYC!");
    console.log("   → Il faut redéployer le contrat NFT avec la bonne adresse KYC");
  } else if (isPaused) {
    console.log("❌ Le contrat est PAUSÉ!");
    console.log("   → Utilisez: npx hardhat run scripts/unpause-nft.ts --network sepolia");
  } else if (!isWhitelisted) {
    console.log("❌ Votre adresse n'est PAS whitelistée dans le KYC!");
    console.log("   → Utilisez un script pour vous approuver dans le KYC");
  } else {
    console.log("✅ Tout semble correct!");
    console.log("   → Le mint devrait fonctionner");
  }
  
  console.log("=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
