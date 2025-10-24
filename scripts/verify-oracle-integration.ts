import hre from "hardhat";
import { formatEther } from "viem";

const ORACLE_ADDRESS = '0x602571F05745181fF237b81dAb8F67148e9475C7';
const RWAT_ADDRESS = '0xfA451d9C32d15a637Ab376732303c36C34C9979f';
const NFT_ADDRESS = '0xf16b0641A9C56C6db30E052E90DB9358b6D2C946';
const USER_ADDRESS = '0x41B67dE2bc9C0742f010eFCC1C9959F5B1aDb2c0'; // L'utilisateur principal

async function main() {
  console.log("\n🔍 VÉRIFICATION DE L'INTÉGRATION ORACLE\n");
  console.log("=" .repeat(60));

  // Connexion aux contrats
  const publicClient = await hre.viem.getPublicClient();
  const oracle = await publicClient.getContract({
    address: ORACLE_ADDRESS as `0x${string}`,
    abi: (await import('../artifacts/contracts/Oracle.sol/SimplePriceOracle.json')).default.abi,
  });
  
  const nft = await publicClient.getContract({
    address: NFT_ADDRESS as `0x${string}`,
    abi: (await import('../artifacts/contracts/NFTAssetTokenV2.sol/NFTAssetTokenV2.json')).default.abi,
  });

  // 1. Vérifier le prix RWAT
  console.log("\n💰 PRIX DU TOKEN RWAT");
  const rwatPriceData = await oracle.read.getPriceData([RWAT_ADDRESS]) as [bigint, bigint, bigint, boolean];
  console.log(`   Prix: ${formatEther(rwatPriceData[0])} EUR`);
  console.log(`   Actif: ${rwatPriceData[3] ? '✅' : '❌'}`);
  console.log(`   Nombre de MAJ: ${rwatPriceData[2]}`);

  // 2. Récupérer les NFTs de l'utilisateur
  console.log("\n💎 NFTs DE L'UTILISATEUR");
  const userNFTs = await nft.read.tokensOfOwner([USER_ADDRESS as `0x${string}`]) as bigint[];
  console.log(`   Nombre de NFTs: ${userNFTs.length}`);

  if (userNFTs.length === 0) {
    console.log("\n⚠️  L'utilisateur ne possède aucun NFT");
    return;
  }

  // 3. Vérifier le prix de chaque NFT
  let totalNFTValue = 0;
  for (const tokenId of userNFTs) {
    const nftPriceData = await oracle.read.nftPrices([NFT_ADDRESS as `0x${string}`, tokenId]) as [bigint, bigint, bigint, boolean];
    const price = parseFloat(formatEther(nftPriceData[0]));
    const isActive = nftPriceData[3];
    const updateCount = Number(nftPriceData[2]);

    console.log(`\n   NFT #${tokenId}`);
    console.log(`      Prix: ${price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`);
    console.log(`      Actif: ${isActive ? '✅' : '❌'}`);
    console.log(`      Mises à jour: ${updateCount}`);

    if (isActive && price > 0) {
      totalNFTValue += price;
    }
  }

  // 4. Résumé
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 RÉSUMÉ DE LA VALEUR");
  console.log(`   Nombre de NFTs: ${userNFTs.length}`);
  console.log(`   Valeur totale des NFTs: ${totalNFTValue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`);
  console.log(`   Prix RWAT actuel: ${formatEther(rwatPriceData[0])} EUR`);

  console.log("\n✅ INTÉGRATION ORACLE VÉRIFIÉE AVEC SUCCÈS !");
  console.log("\n💡 PROCHAINES ÉTAPES:");
  console.log("   1. Ouvrir la page Oracle: http://localhost:3000/oracle");
  console.log("      → Vous devriez voir tous vos NFTs avec leurs prix");
  console.log("\n   2. Ouvrir le Dashboard: http://localhost:3000/dashboard");
  console.log("      → Les prix des NFTs doivent venir de l'Oracle");
  console.log("      → La valeur totale du portefeuille doit inclure les NFTs");
  console.log("\n   3. Lancer les scripts de mise à jour automatique:");
  console.log("      → npx hardhat run scripts/auto-update-rwat-price.ts --network sepolia");
  console.log("      → npx hardhat run scripts/auto-update-all-nft-prices.ts --network sepolia");
  console.log("\n" + "=".repeat(60) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
