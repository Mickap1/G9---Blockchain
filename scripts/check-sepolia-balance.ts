import { ethers } from "hardhat";

async function main() {
  console.log("\n💰 Vérification du solde Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  
  console.log("📝 Adresse du wallet:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInEth = ethers.formatEther(balance);
  
  console.log("💵 Solde:", balanceInEth, "ETH");
  
  if (parseFloat(balanceInEth) < 0.01) {
    console.log("\n⚠️  ATTENTION: Solde insuffisant pour le déploiement!");
    console.log("   Vous avez besoin d'au moins 0.01 ETH pour déployer.");
    console.log("\n💡 Obtenez du Sepolia ETH gratuit ici:");
    console.log("   - https://sepoliafaucet.com");
    console.log("   - https://faucet.quicknode.com/ethereum/sepolia");
    console.log("   - https://www.infura.io/faucet/sepolia");
  } else {
    console.log("\n✅ Solde suffisant pour le déploiement!");
  }
  
  // Vérifier la connexion réseau
  const network = await ethers.provider.getNetwork();
  console.log("\n🌐 Réseau:", network.name, "(Chain ID:", network.chainId.toString(), ")");
  
  // Vérifier le RPC
  const blockNumber = await ethers.provider.getBlockNumber();
  console.log("📦 Dernier bloc:", blockNumber);
  
  console.log("\n✅ Connexion au réseau réussie!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Erreur:");
    console.error(error);
    process.exit(1);
  });
