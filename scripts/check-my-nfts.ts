import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

/**
 * Script pour vérifier les NFTs possédés par une adresse
 * Usage: npx hardhat run scripts/check-my-nfts.ts --network sepolia
 */

async function main() {
  console.log("\n🔍 Checking NFT ownership...\n");

  // Charger les adresses déployées
  const deploymentsPath = path.join(__dirname, "../deployments/sepolia-nft-token.json");
  
  if (!fs.existsSync(deploymentsPath)) {
    console.error("❌ Deployment file not found. Please deploy NFT contract first.");
    return;
  }

  const deploymentData = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));
  const NFT_ADDRESS = deploymentData.address;

  console.log(`📋 NFT Contract: ${NFT_ADDRESS}\n`);

  // Récupérer les signers
  const [owner, account1, account2] = await ethers.getSigners();
  const accounts = [
    { name: "Owner", address: owner.address, signer: owner },
    { name: "Account 1", address: account1.address, signer: account1 },
    { name: "Account 2", address: account2.address, signer: account2 },
  ];

  // Connecter au contrat
  const NFTContract = await ethers.getContractAt("NFTAssetToken", NFT_ADDRESS);

  // Vérifier chaque compte
  for (const account of accounts) {
    console.log(`\n👤 ${account.name}: ${account.address}`);
    console.log("─".repeat(80));

    try {
      const balance = await NFTContract.balanceOf(account.address);
      console.log(`   Balance: ${balance.toString()} NFT(s)`);

      if (balance > 0n) {
        console.log("\n   NFTs owned:");
        
        // Parcourir tous les tokens possibles
        let foundCount = 0;
        for (let tokenId = 0; tokenId < 100 && foundCount < Number(balance); tokenId++) {
          try {
            const tokenOwner = await NFTContract.ownerOf(tokenId);
            
            if (tokenOwner.toLowerCase() === account.address.toLowerCase()) {
              foundCount++;
              
              // Récupérer les données de l'asset
              const assetData = await NFTContract.assetData(tokenId);
              const tokenURI = await NFTContract.tokenURI(tokenId);
              
              console.log(`\n   📦 Token ID: ${tokenId}`);
              console.log(`      Name: ${assetData.name}`);
              console.log(`      Valuation: ${ethers.formatEther(assetData.valuation)} ETH`);
              console.log(`      Active: ${assetData.isActive}`);
              console.log(`      Tokenization Date: ${new Date(Number(assetData.tokenizationDate) * 1000).toLocaleString()}`);
              console.log(`      Certificate URI: ${assetData.certificateURI}`);
              
              // Afficher un extrait du tokenURI
              if (tokenURI.startsWith('data:application/json')) {
                try {
                  const jsonString = decodeURIComponent(tokenURI.split(',')[1]);
                  const metadata = JSON.parse(jsonString);
                  console.log(`      Metadata: ${JSON.stringify(metadata, null, 2).substring(0, 200)}...`);
                } catch (e) {
                  console.log(`      Token URI (base64): ${tokenURI.substring(0, 100)}...`);
                }
              } else {
                console.log(`      Token URI: ${tokenURI.substring(0, 100)}...`);
              }
            }
          } catch (e) {
            // Token n'existe pas ou autre erreur
            if (foundCount >= Number(balance)) {
              break;
            }
          }
        }
      } else {
        console.log("   ❌ No NFTs owned by this account");
      }
    } catch (error: any) {
      console.error(`   ❌ Error checking account: ${error.message}`);
    }
  }

  // Statistiques globales
  console.log("\n\n📊 Global Statistics");
  console.log("─".repeat(80));
  
  try {
    const totalSupply = await NFTContract.totalSupply?.() || 0n;
    console.log(`Total NFTs minted: ${totalSupply.toString()}`);
    
    const collectionName = await NFTContract.name();
    const collectionSymbol = await NFTContract.symbol();
    const assetType = await NFTContract.assetType();
    
    console.log(`Collection: ${collectionName} (${collectionSymbol})`);
    console.log(`Asset Type: ${assetType}`);
  } catch (error: any) {
    console.error(`Error fetching global stats: ${error.message}`);
  }

  console.log("\n✅ Check complete!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
