import { ethers } from "hardhat";
import * as fs from 'fs';

/**
 * 📚 GUIDE COMPLET : COMPRENDRE LE SYSTÈME DE TOKENISATION
 * 
 * Ce script explique comment fonctionne l'ensemble du système,
 * notamment la relation entre les tokens et l'actif sous-jacent.
 */

async function main() {
  console.log("\n" + "═".repeat(80));
  console.log("📚 GUIDE COMPLET : SYSTÈME DE TOKENISATION D'ACTIFS RÉELS");
  console.log("═".repeat(80));

  // Charger les adresses
  const addressesPath = "./deployments/sepolia-addresses.json";
  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
  
  const tokenAddress = addresses.fungibleToken;
  const dexAddress = addresses.dex;
  
  const token = await ethers.getContractAt("FungibleAssetToken", tokenAddress);
  const dex = await ethers.getContractAt("SimpleDEX", dexAddress);
  
  const [signer] = await ethers.getSigners();
  
  // Récupérer les informations
  const [name, symbol, decimals, maxSupply, metadata] = await Promise.all([
    token.name(),
    token.symbol(),
    token.decimals(),
    token.MAX_SUPPLY(),
    token.assetMetadata()
  ]);
  
  const yourBalance = await token.balanceOf(signer.address);
  const yourBalanceFormatted = Number(ethers.formatUnits(yourBalance, decimals));
  const maxSupplyFormatted = Number(ethers.formatUnits(maxSupply, decimals));
  
  const totalValueEUR = Number(metadata.totalValue);
  const valuePerToken = totalValueEUR / maxSupplyFormatted;
  const yourPercent = (yourBalanceFormatted / maxSupplyFormatted) * 100;
  const yourValue = (totalValueEUR * yourPercent) / 100;

  console.log("\n📖 PARTIE 1 : QU'EST-CE QU'UN TOKEN D'ACTIF RÉEL ?");
  console.log("━".repeat(80));
  console.log("\n💡 CONCEPT DE BASE :");
  console.log("Un actif physique (comme un immeuble) est divisé en plusieurs tokens.");
  console.log("Chaque token représente une FRACTION de propriété de cet actif.");
  console.log("\n🏢 EXEMPLE AVEC VOTRE ACTIF :");
  console.log(`  • Nom de l'actif : ${metadata.assetName || name}`);
  console.log(`  • Type : ${metadata.assetType}`);
  console.log(`  • Localisation : ${metadata.location}`);
  console.log(`  • Valeur totale : ${totalValueEUR.toLocaleString('fr-FR')} EUR`);
  console.log(`  • Divisé en : ${maxSupplyFormatted.toLocaleString('fr-FR')} tokens (${symbol})`);
  console.log(`  • Valeur par token : ${valuePerToken.toFixed(2)} EUR`);
  
  console.log("\n✅ ANALOGIE SIMPLE :");
  console.log("━".repeat(80));
  console.log("Imaginez une pizza 🍕 qui coûte 1,000,000 EUR.");
  console.log("Cette pizza est coupée en 1,000,000 parts égales.");
  console.log("Chaque part (= 1 token) vaut donc 1 EUR.");
  console.log("\nSi vous avez 100,000 parts → Vous possédez 10% de la pizza");
  console.log("Si vous avez 500,000 parts → Vous possédez 50% de la pizza");
  console.log("Si vous avez TOUTES les parts → Vous possédez la pizza entière !");

  console.log("\n\n📊 PARTIE 2 : VOTRE SITUATION ACTUELLE");
  console.log("━".repeat(80));
  console.log(`\n👤 Votre adresse : ${signer.address}`);
  console.log(`\n💰 Vos tokens dans votre wallet :`);
  console.log(`  • Quantité : ${yourBalanceFormatted.toLocaleString('fr-FR')} ${symbol}`);
  console.log(`  • Part de propriété : ${yourPercent.toFixed(4)}%`);
  console.log(`  • Valeur équivalente : ${yourValue.toLocaleString('fr-FR')} EUR`);
  console.log(`\n📝 Interprétation :`);
  console.log(`  Vous possédez ${yourPercent.toFixed(4)}% de l'actif.`);
  console.log(`  C'est comme si vous étiez propriétaire de ${yourPercent.toFixed(4)}% de l'immeuble !`);

  // Vérifier la liquidité dans le DEX
  try {
    const lpTokens = await dex.liquidity(signer.address);
    const poolInfo = await dex.getPoolInfo();
    
    if (lpTokens > 0n) {
      const lpBalance = Number(ethers.formatUnits(lpTokens, 18));
      const reserveToken = Number(ethers.formatUnits(poolInfo[0], decimals));
      const reserveETH = Number(ethers.formatUnits(poolInfo[1], 18));
      const totalLiquidity = Number(ethers.formatUnits(poolInfo[2], 18));
      
      const sharePercent = (lpBalance / totalLiquidity) * 100;
      const tokensInPool = (reserveToken * sharePercent) / 100;
      const ethInPool = (reserveETH * sharePercent) / 100;
      
      console.log(`\n💧 Vos tokens dans le DEX (liquidité) :`);
      console.log(`  • LP Tokens : ${lpBalance.toFixed(4)}`);
      console.log(`  • Part du pool : ${sharePercent.toFixed(2)}%`);
      console.log(`  • Tokens déposés : ${tokensInPool.toFixed(2)} ${symbol}`);
      console.log(`  • ETH déposés : ${ethInPool.toFixed(6)} ETH`);
      
      const totalTokens = yourBalanceFormatted + tokensInPool;
      const totalPercent = (totalTokens / maxSupplyFormatted) * 100;
      const totalValueTokens = (totalValueEUR * totalPercent) / 100;
      
      console.log(`\n🔢 TOTAL DE VOS TOKENS :`);
      console.log(`  • Dans votre wallet : ${yourBalanceFormatted.toFixed(2)} ${symbol}`);
      console.log(`  • Dans le DEX : ${tokensInPool.toFixed(2)} ${symbol}`);
      console.log(`  • TOTAL : ${totalTokens.toFixed(2)} ${symbol}`);
      console.log(`  • Part totale de l'actif : ${totalPercent.toFixed(4)}%`);
      console.log(`  • Valeur totale : ${totalValueTokens.toLocaleString('fr-FR')} EUR`);
    }
  } catch (e) {
    console.log(`\n💧 Liquidité : Vous n'avez pas de tokens dans le DEX`);
  }

  console.log("\n\n🔄 PARTIE 3 : QUE POUVEZ-VOUS FAIRE AVEC VOS TOKENS ?");
  console.log("━".repeat(80));
  console.log("\n1️⃣  GARDER vos tokens = Être propriétaire de votre part d'actif");
  console.log("    → Vous possédez toujours votre % de l'immeuble");
  console.log("    → Si l'actif prend de la valeur, vos tokens aussi");
  console.log("    → Vous pourriez recevoir des dividendes (si implémenté)");
  
  console.log("\n2️⃣  VENDRE vos tokens sur le DEX");
  console.log("    → Vous échangez vos tokens contre de l'ETH");
  console.log("    → Vous perdez votre part de propriété");
  console.log("    → Quelqu'un d'autre devient propriétaire à votre place");
  
  console.log("\n3️⃣  VENDRE vos tokens sur le Marketplace (NFT)");
  console.log("    → Si vous avez des NFTs représentant des actifs spécifiques");
  console.log("    → Vente P2P avec prix fixe");
  
  console.log("\n4️⃣  FOURNIR DE LA LIQUIDITÉ au DEX");
  console.log("    → Vous déposez tokens + ETH dans le pool");
  console.log("    → Vous gagnez 0.3% de frais sur TOUS les swaps");
  console.log("    → Vos tokens sont toujours à vous, juste \"en dépôt\"");
  console.log("    → Vous pouvez les retirer quand vous voulez !");

  console.log("\n\n💡 PARTIE 4 : RETIRER LA LIQUIDITÉ - COMMENT ÇA MARCHE ?");
  console.log("━".repeat(80));
  console.log("\n❓ QUESTION : \"Si je fournis de la liquidité, puis-je récupérer mes tokens ?\"");
  console.log("✅ RÉPONSE : OUI ! Absolument !");
  
  console.log("\n📝 EXPLICATION :");
  console.log("Quand vous ajoutez de la liquidité au DEX :");
  console.log("  1. Vous déposez X tokens + Y ETH");
  console.log("  2. Le DEX vous donne des LP tokens (jetons de liquidité)");
  console.log("  3. Ces LP tokens prouvent que vous avez déposé de la liquidité");
  
  console.log("\nQuand vous retirez la liquidité :");
  console.log("  1. Vous rendez vos LP tokens au DEX");
  console.log("  2. Le DEX vous rend vos tokens + ETH (avec les frais gagnés !)");
  console.log("  3. Vous récupérez TOUT, proportionnellement à vos LP tokens");
  
  console.log("\n🎯 EXEMPLE CONCRET :");
  console.log("━".repeat(80));
  console.log("Vous déposez : 1000 tokens + 0.01 ETH");
  console.log("Vous recevez : 10 LP tokens (exemple)");
  console.log("\n⏰ Après 1 mois :");
  console.log("  • Des gens ont fait des swaps → Vous avez gagné des frais");
  console.log("  • Le pool a maintenant : 1100 tokens + 0.011 ETH (exemple)");
  console.log("  • Vous avez toujours 10 LP tokens = 100% du pool");
  console.log("\n💰 Vous retirez vos 10 LP tokens :");
  console.log("  → Vous récupérez : 1100 tokens + 0.011 ETH");
  console.log("  → BÉNÉFICE : +100 tokens + 0.001 ETH de frais gagnés !");
  
  console.log("\n⚠️  IMPORTANT :");
  console.log("  • Vous pouvez retirer QUAND VOUS VOULEZ (pas de blocage)");
  console.log("  • Vous pouvez retirer TOUT ou juste une PARTIE");
  console.log("  • Vous récupérez toujours votre part + les frais gagnés");
  console.log("  • Les tokens récupérés restent vos % de propriété de l'actif !");

  console.log("\n\n🎓 PARTIE 5 : RÉSUMÉ POUR BIEN COMPRENDRE");
  console.log("━".repeat(80));
  console.log("\n🏢 ACTIF PHYSIQUE (immeuble, bien immobilier, etc.)");
  console.log("  ↓");
  console.log("📊 TOKENS (représentent des parts de propriété)");
  console.log("  ↓");
  console.log("💰 VOUS (possédez X% de l'actif via vos tokens)");
  console.log("  ↓");
  console.log("🔀 ACTIONS POSSIBLES :");
  console.log("  • GARDER → Rester propriétaire");
  console.log("  • VENDRE → Céder votre part à quelqu'un d'autre");
  console.log("  • DÉPOSER au DEX → Gagner des frais (ET récupérer quand vous voulez !)");
  
  console.log("\n✨ EN RÉSUMÉ :");
  console.log("━".repeat(80));
  console.log("✅ Oui, posséder 10% des tokens = posséder 10% de l'actif");
  console.log("✅ Oui, vous pouvez retirer votre liquidité du DEX à tout moment");
  console.log("✅ Oui, les tokens retirés du DEX restent VOTRE propriété");
  console.log("✅ Oui, vous pouvez gagner de l'argent en fournissant de la liquidité");
  
  console.log("\n" + "═".repeat(80));
  console.log("✅ Guide terminé ! Vous savez maintenant comment tout fonctionne 🎉");
  console.log("═".repeat(80) + "\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
