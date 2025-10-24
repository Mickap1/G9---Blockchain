import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script pour vérifier l'état de l'Oracle et afficher les prix
 * 
 * Usage:
 *   npx hardhat run scripts/check-oracle.ts --network sepolia
 */

async function main() {
  console.log("\n📊 ORACLE PRICE CHECK");
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
    console.log("   Run: npx hardhat run scripts/deploy-oracle.ts --network", networkName);
    process.exit(1);
  }

  console.log("\n📋 Configuration:");
  console.log("Network:", networkName);
  console.log("Oracle:", oracleAddress);
  console.log("Fungible Token:", fungibleTokenAddress);
  console.log("NFT Token:", nftTokenAddress);

  // Se connecter à l'Oracle
  const oracle = await ethers.getContractAt("SimplePriceOracle", oracleAddress);

  console.log("\n" + "=".repeat(60));
  console.log("💰 PRIX DU TOKEN FONGIBLE (RWAT)");
  console.log("=".repeat(60));

  try {
    // Récupérer les données du prix du token fongible
    const fungiblePriceData = await oracle.prices(fungibleTokenAddress);
    
    if (fungiblePriceData.isActive && fungiblePriceData.price > 0n) {
      console.log("✅ Prix actif");
      console.log("Prix:", ethers.formatEther(fungiblePriceData.price), "EUR");
      console.log("Dernière mise à jour:", new Date(Number(fungiblePriceData.lastUpdate) * 1000).toLocaleString());
      console.log("Nombre de mises à jour:", fungiblePriceData.updateCount.toString());
      
      // Récupérer l'historique
      const history = await oracle.getPriceHistory(fungibleTokenAddress);
      console.log("Entrées d'historique:", history.length);
      
      if (history.length > 0) {
        console.log("\n📈 Historique récent (5 dernières entrées):");
        const recentHistory = history.slice(-5);
        recentHistory.forEach((entry: any, index: number) => {
          console.log(`  ${index + 1}. ${ethers.formatEther(entry.price)} EUR - ${new Date(Number(entry.timestamp) * 1000).toLocaleString()}`);
        });

        // Calculer la variation
        if (history.length >= 2) {
          const latest = Number(ethers.formatEther(history[history.length - 1].price));
          const previous = Number(ethers.formatEther(history[history.length - 2].price));
          const change = ((latest - previous) / previous) * 100;
          
          console.log("\n📊 Variation depuis la dernière mise à jour:");
          console.log(`  ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`);
        }
      }
    } else {
      console.log("⚠️  Prix non actif ou non défini");
      console.log("   Pour initialiser le prix:");
      console.log(`   await oracle.updatePrice("${fungibleTokenAddress}", ethers.parseEther("1.0"))`);
    }
  } catch (error: any) {
    console.log("❌ Erreur:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("💎 PRIX DES NFTs");
  console.log("=".repeat(60));

  try {
    // Obtenir le total supply de NFTs
    const nftContract = await ethers.getContractAt("NFTAssetTokenV2", nftTokenAddress);
    const totalSupply = await nftContract.totalSupply();
    const total = Number(totalSupply);
    
    console.log("Total NFTs mintés:", total);
    
    if (total === 0) {
      console.log("⚠️  Aucun NFT n'a été minté");
    } else {
      console.log("");
      
      // Vérifier chaque NFT
      for (let tokenId = 0; tokenId < total; tokenId++) {
        try {
          // Vérifier si le NFT existe
          const owner = await nftContract.ownerOf(tokenId);
          
          // Récupérer le prix
          const nftPriceData = await oracle.nftPrices(nftTokenAddress, tokenId);
          
          if (nftPriceData.isActive && nftPriceData.price > 0n) {
            console.log(`✅ NFT #${tokenId} - Prix actif`);
            console.log("   Owner:", owner);
            console.log("   Prix:", ethers.formatEther(nftPriceData.price), "EUR");
            console.log("   Dernière mise à jour:", new Date(Number(nftPriceData.lastUpdate) * 1000).toLocaleString());
            console.log("   Nombre de mises à jour:", nftPriceData.updateCount.toString());
            
            // Récupérer l'historique
            const history = await oracle.getNFTPriceHistory(nftTokenAddress, tokenId);
            console.log("   Entrées d'historique:", history.length);
            
            if (history.length > 1) {
              // Calculer la variation
              const latest = Number(ethers.formatEther(history[history.length - 1].price));
              const previous = Number(ethers.formatEther(history[history.length - 2].price));
              const change = ((latest - previous) / previous) * 100;
              
              console.log("   📊 Variation:", `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`);
            }
            console.log("");
          } else {
            console.log(`⚠️  NFT #${tokenId} - Prix non actif ou non défini`);
            console.log("   Owner:", owner);
            console.log("");
          }
        } catch (error: any) {
          if (error.message.includes("ERC721: invalid token ID")) {
            console.log(`⚠️  NFT #${tokenId} - N'existe pas ou a été brûlé`);
            console.log("");
          } else {
            console.log(`❌ NFT #${tokenId} - Erreur:`, error.message);
            console.log("");
          }
        }
      }
    }
  } catch (error: any) {
    console.log("❌ Erreur:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("⚙️  INFORMATIONS ADMINISTRATIVES");
  console.log("=".repeat(60));

  try {
    const [signer] = await ethers.getSigners();
    const signerAddress = await signer.getAddress();
    
    // Vérifier les rôles
    const ORACLE_ADMIN_ROLE = await oracle.ORACLE_ADMIN_ROLE();
    const PRICE_UPDATER_ROLE = await oracle.PRICE_UPDATER_ROLE();
    
    const isOracleAdmin = await oracle.hasRole(ORACLE_ADMIN_ROLE, signerAddress);
    const isPriceUpdater = await oracle.hasRole(PRICE_UPDATER_ROLE, signerAddress);
    
    console.log("Votre adresse:", signerAddress);
    console.log("Oracle Admin:", isOracleAdmin ? "✅ Oui" : "❌ Non");
    console.log("Price Updater:", isPriceUpdater ? "✅ Oui" : "❌ Non");
    
    // Vérifier si l'oracle est en pause
    const isPaused = await oracle.paused();
    console.log("État de l'Oracle:", isPaused ? "⏸️  En pause" : "✅ Actif");
  } catch (error: any) {
    console.log("❌ Erreur:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✨ Scripts disponibles:");
  console.log("=".repeat(60));
  console.log("• Auto-update Diamond:", "npx hardhat run scripts/auto-update-diamond-price.ts --network sepolia");
  console.log("• Check Oracle:", "npx hardhat run scripts/check-oracle.ts --network sepolia");
  console.log("\n💡 Tip: Le script auto-update-diamond-price.ts met à jour le prix toutes les 2 minutes");
  console.log("");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
