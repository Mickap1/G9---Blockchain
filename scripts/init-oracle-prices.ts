import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script pour initialiser les prix dans l'Oracle
 * 
 * Usage:
 *   npx hardhat run scripts/init-oracle-prices.ts --network sepolia
 */

async function main() {
  console.log("\n🚀 INITIALISATION DES PRIX ORACLE");
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
  
  // Utiliser NFTAssetTokenV2 (la bonne adresse)
  const nftTokenAddress = "0xf16b0641A9C56C6db30E052E90DB9358b6D2C946"; // NFTAssetTokenV2

  if (!oracleAddress) {
    console.log("❌ Oracle non déployé!");
    process.exit(1);
  }

  console.log("\n📋 Configuration:");
  console.log("Network:", networkName);
  console.log("Oracle:", oracleAddress);
  console.log("Fungible Token:", fungibleTokenAddress);
  console.log("NFT Token:", nftTokenAddress);

  // Se connecter à l'Oracle
  const oracle = await ethers.getContractAt("SimplePriceOracle", oracleAddress);
  const [signer] = await ethers.getSigners();

  console.log("\nSigner:", await signer.getAddress());

  // Initialiser le prix du token fongible
  console.log("\n" + "=".repeat(60));
  console.log("💰 INITIALISATION DU PRIX DU TOKEN RWAT");
  console.log("=".repeat(60));

  const initialRWATPrice = ethers.parseEther("1.0"); // 1.00 EUR
  console.log("Prix initial:", ethers.formatEther(initialRWATPrice), "EUR");

  try {
    console.log("\n⏳ Envoi de la transaction...");
    const tx1 = await oracle.updatePrice(fungibleTokenAddress, initialRWATPrice);
    console.log("Transaction hash:", tx1.hash);
    
    console.log("⏳ Attente de confirmation...");
    const receipt1 = await tx1.wait();
    console.log("✅ Prix RWAT initialisé!");
    console.log("   Bloc:", receipt1?.blockNumber);
    console.log("   Gas utilisé:", receipt1?.gasUsed.toString());
  } catch (error: any) {
    console.error("❌ Erreur:", error.message);
  }

  // Initialiser le prix du NFT Diamond (Token ID 0)
  console.log("\n" + "=".repeat(60));
  console.log("💎 INITIALISATION DU PRIX DU NFT DIAMOND");
  console.log("=".repeat(60));

  const nft = await ethers.getContractAt("NFTAssetTokenV2", nftTokenAddress);
  const tokenId = 0;

  // Vérifier si le NFT existe
  try {
    const owner = await nft.ownerOf(tokenId);
    console.log("NFT #0 existe, propriétaire:", owner);

    // NFTAssetTokenV2 n'a plus de valuation on-chain
    // Utiliser un prix par défaut de 50,000 EUR pour un diamant
    const nftValuation = ethers.parseEther("50000.0");
    
    console.log("Prix initial pour le NFT:", ethers.formatEther(nftValuation), "EUR");
    console.log("(NFTAssetTokenV2 n'a pas de valuation on-chain, prix par défaut utilisé)");

    try {
      console.log("\n⏳ Envoi de la transaction...");
      const tx2 = await oracle.updateNFTPrice(nftTokenAddress, tokenId, nftValuation);
      console.log("Transaction hash:", tx2.hash);
      
      console.log("⏳ Attente de confirmation...");
      const receipt2 = await tx2.wait();
      console.log("✅ Prix NFT initialisé!");
      console.log("   Bloc:", receipt2?.blockNumber);
      console.log("   Gas utilisé:", receipt2?.gasUsed.toString());
    } catch (error: any) {
      console.error("❌ Erreur:", error.message);
    }
  } catch (error) {
    console.log("⚠️  NFT #0 n'existe pas encore");
    console.log("   Vous devez d'abord créer le NFT Diamond:");
    console.log("   npx hardhat run scripts/mint-diamond.ts --network", networkName);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ INITIALISATION TERMINÉE");
  console.log("=".repeat(60));
  console.log("\n🎯 Prochaines étapes:");
  console.log("1. Vérifier les prix: npx hardhat run scripts/check-oracle.ts --network", networkName);
  console.log("2. Lancer le script auto-update:");
  console.log("   npx hardhat run scripts/auto-update-diamond-price.ts --network", networkName);
  console.log("3. Consulter le frontend: http://localhost:3000/oracle");
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
