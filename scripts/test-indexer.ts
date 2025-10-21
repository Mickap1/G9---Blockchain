import { ethers } from "ethers";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("🧪 Test de l'indexer - Mint d'un NFT Diamond");
  console.log("=".repeat(50));
  
  // Charger l'adresse du contrat NFT
  const deploymentsPath = path.join(__dirname, "../deployments/sepolia-nft-token.json");
  const deployment = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const nftAddress = deployment.address;
  
  console.log(`📍 Contrat NFT: ${nftAddress}`);
  
  // Setup provider et wallet
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
  console.log(`👤 Compte: ${wallet.address}`);
  
  // Charger l'ABI du contrat
  const artifactPath = path.join(__dirname, "../artifacts/contracts/NFTAssetToken.sol/NFTAssetToken.json");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  // Attacher le contrat
  const nft = new ethers.Contract(nftAddress, artifact.abi, wallet);
  
  // Mint un nouveau Diamond NFT
  const diamondName = `Diamond_Test_${Date.now()}`;
  const valuation = ethers.parseEther("2.5"); // 2.5 ETH de valeur
  
  console.log(`\n💎 Minting NFT...`);
  console.log(`   Nom: ${diamondName}`);
  console.log(`   Valuation: ${ethers.formatEther(valuation)} ETH`);
  
  const tx = await nft.mintAsset(wallet.address, diamondName, valuation);
  console.log(`\n⏳ Transaction envoyée: ${tx.hash}`);
  console.log(`🔗 Etherscan: https://sepolia.etherscan.io/tx/${tx.hash}`);
  
  const receipt = await tx.wait();
  console.log(`✅ Transaction confirmée dans le bloc ${receipt?.blockNumber}`);
  
  console.log("\n" + "=".repeat(50));
  console.log("🎯 MAINTENANT, REGARDEZ VOTRE INDEXER !");
  console.log("   Il devrait détecter ce NFT dans moins d'1 minute");
  console.log("=".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
