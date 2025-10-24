import { ethers } from "hardhat";

/**
 * Script pour tester un mint NFT et voir l'erreur exacte
 * 
 * Usage:
 *   npx hardhat run scripts/test-mint-nft.ts --network sepolia
 */

async function main() {
  console.log("\n🧪 TEST DE MINT NFT");
  console.log("=".repeat(70));
  
  const nftAddress = "0x75499Fc469f8d224C7bF619Ada37ea8f3cD8c36E";
  const [deployer] = await ethers.getSigners();
  
  console.log("Contrat NFT:", nftAddress);
  console.log("Adresse test:", deployer.address);
  
  const nft = await ethers.getContractAt("NFTAssetTokenV2", nftAddress);
  
  // Créer une URI de test simple
  const testMetadata = {
    name: "Test Diamond",
    description: "Test pour vérifier le mint",
    image: "https://example.com/diamond.png",
    valuation: "100000",
    valuationCurrency: "EUR"
  };
  
  const metadataJSON = JSON.stringify(testMetadata);
  const base64Metadata = Buffer.from(metadataJSON).toString('base64');
  const metadataURI = `data:application/json;base64,${base64Metadata}`;
  
  console.log("\n📄 Métadonnées de test créées");
  console.log("URI:", metadataURI.substring(0, 100) + "...");
  
  try {
    console.log("\n🔄 Test 1: Mint pour soi-même avec mintAssetPublic()...");
    
    // Estimer le gas d'abord
    const gasEstimate = await nft.mintAssetPublic.estimateGas(metadataURI);
    console.log("   Gas estimé:", gasEstimate.toString());
    
    const tx = await nft.mintAssetPublic(metadataURI);
    console.log("   Transaction envoyée:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("   ✅ Mint réussi! Gas utilisé:", receipt?.gasUsed.toString());
    
    // Récupérer le token ID minté
    const totalSupply = await nft.totalSupply();
    const newTokenId = totalSupply - 1n;
    console.log("   Token ID minté:", newTokenId.toString());
    
  } catch (error: any) {
    console.log("\n❌ ERREUR DÉTECTÉE:");
    console.log("   Type:", error.name || "Unknown");
    console.log("   Message:", error.message);
    
    if (error.data) {
      console.log("   Data:", error.data);
    }
    
    if (error.reason) {
      console.log("   Raison:", error.reason);
    }
    
    // Essayer de décoder l'erreur du contrat
    if (error.data && typeof error.data === 'string') {
      try {
        const iface = nft.interface;
        const decodedError = iface.parseError(error.data);
        console.log("   Erreur décodée:", decodedError?.name, decodedError?.args);
      } catch (e) {
        console.log("   (Impossible de décoder l'erreur du contrat)");
      }
    }
    
    console.log("\n💡 Suggestions:");
    
    if (error.message.includes("insufficient funds") || error.message.includes("gas")) {
      console.log("   - Vérifiez votre balance ETH");
      const balance = await ethers.provider.getBalance(deployer.address);
      console.log("   - Balance actuelle:", ethers.formatEther(balance), "ETH");
    }
    
    if (error.message.includes("AccessControlUnauthorizedAccount")) {
      console.log("   - Problème de permission/rôle");
      console.log("   - Vérifiez que vous avez le MINTER_ROLE ou que vous êtes whitelisté");
    }
    
    if (error.message.includes("NotWhitelisted") || error.message.includes("whitelist")) {
      console.log("   - Vous n'êtes pas whitelisté dans le KYC Registry");
      console.log("   - Utilisez: npx hardhat run scripts/approve-kyc.ts --network sepolia");
    }
    
    if (error.message.includes("Pausable: paused")) {
      console.log("   - Le contrat est pausé");
      console.log("   - Utilisez: npx hardhat run scripts/unpause-nft.ts --network sepolia");
    }
  }
  
  console.log("\n" + "=".repeat(70) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Erreur fatale:");
    console.error(error);
    process.exit(1);
  });
