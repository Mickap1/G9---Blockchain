import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("\n📊 Vos Positions de Liquidité - Explication Détaillée\n");
  console.log("=".repeat(70));

  const [deployer] = await ethers.getSigners();

  // Load deployments
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === "unknown" ? "localhost" : network.name;
  const deploymentsPath = path.join(__dirname, "..", "deployments", `${networkName}-addresses.json`);
  
  const addresses = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const dexAddress = addresses.dex;
  const tokenAddress = addresses.fungibleToken;

  console.log("\n👤 Votre adresse:", deployer.address);
  console.log("📋 Contrat DEX:", dexAddress);

  const dex = await ethers.getContractAt("SimpleDEX", dexAddress);
  const token = await ethers.getContractAt("FungibleAssetToken", tokenAddress);

  // 1. ÉTAT DU POOL
  console.log("\n" + "=".repeat(70));
  console.log("1️⃣  ÉTAT ACTUEL DU POOL (la réserve commune)");
  console.log("=".repeat(70));

  const poolInfo = await dex.getPoolInfo();
  const reserveToken = Number(ethers.formatEther(poolInfo._reserveToken));
  const reserveETH = Number(ethers.formatEther(poolInfo._reserveETH));
  const totalLiquidity = Number(ethers.formatEther(poolInfo._totalLiquidity));
  const tokenPrice = Number(ethers.formatEther(poolInfo._tokenPrice));

  console.log("\n💰 Réserves du Pool :");
  console.log(`   📦 Tokens : ${reserveToken.toFixed(2)} tokens`);
  console.log(`   💎 ETH    : ${reserveETH.toFixed(6)} ETH`);
  console.log(`   💵 Valeur totale : ~${(reserveETH * 2).toFixed(6)} ETH\n`);
  
  console.log("📈 Informations :");
  console.log(`   Prix 1 token = ${tokenPrice.toFixed(8)} ETH`);
  console.log(`   Total LP tokens en circulation = ${totalLiquidity.toFixed(6)}`);

  // 2. VOTRE POSITION
  console.log("\n" + "=".repeat(70));
  console.log("2️⃣  VOTRE POSITION DE LIQUIDITÉ");
  console.log("=".repeat(70));

  const yourLPTokens = await dex.liquidity(deployer.address);
  const yourLPBalance = Number(ethers.formatEther(yourLPTokens));
  const yourSharePercent = (yourLPBalance / totalLiquidity) * 100;

  console.log("\n🎫 Vos LP Tokens :");
  console.log(`   Vous possédez : ${yourLPBalance.toFixed(6)} LP tokens`);
  console.log(`   Part du pool  : ${yourSharePercent.toFixed(2)}%\n`);

  // 3. CE QUE VOUS POUVEZ RÉCUPÉRER
  console.log("💰 Valeur que vous pouvez retirer :");
  const yourTokens = (reserveToken * yourSharePercent) / 100;
  const yourETH = (reserveETH * yourSharePercent) / 100;
  
  console.log(`   📦 Tokens : ${yourTokens.toFixed(2)} tokens`);
  console.log(`   💎 ETH    : ${yourETH.toFixed(6)} ETH`);
  console.log(`   💵 Valeur totale : ~${(yourETH * 2).toFixed(6)} ETH`);

  // 4. VOS BALANCES ACTUELLES
  console.log("\n" + "=".repeat(70));
  console.log("3️⃣  VOS BALANCES DE WALLET (ce que vous avez en dehors du pool)");
  console.log("=".repeat(70));

  const tokenBalance = await token.balanceOf(deployer.address);
  const ethBalance = await ethers.provider.getBalance(deployer.address);

  console.log("\n💼 Dans votre wallet :");
  console.log(`   📦 Tokens : ${ethers.formatEther(tokenBalance)} tokens`);
  console.log(`   💎 ETH    : ${ethers.formatEther(ethBalance)} ETH`);

  // 5. EXPLICATION
  console.log("\n" + "=".repeat(70));
  console.log("4️⃣  EXPLICATION : QU'EST-CE QUI S'EST PASSÉ ?");
  console.log("=".repeat(70));

  console.log("\n📝 Quand vous avez ajouté de la liquidité :");
  console.log("\n   1. Vous avez DONNÉ au pool :");
  console.log(`      → ${yourTokens.toFixed(2)} tokens (retirés de votre wallet)`);
  console.log(`      → ${yourETH.toFixed(6)} ETH (retirés de votre wallet)`);
  
  console.log("\n   2. En échange, vous avez REÇU :");
  console.log(`      → ${yourLPBalance.toFixed(6)} LP tokens (certificat de propriété)`);
  
  console.log("\n   3. Ces LP tokens représentent :");
  console.log(`      → ${yourSharePercent.toFixed(2)}% de TOUT le pool`);
  console.log(`      → Le droit de retirer votre part + les frais gagnés`);

  console.log("\n💡 Analogie simple :");
  console.log("   C'est comme mettre de l'argent dans une coopérative :");
  console.log("   • Vous donnez : tokens + ETH");
  console.log("   • Vous recevez : des parts (LP tokens)");
  console.log("   • La coopérative gagne : 0.3% sur chaque échange");
  console.log("   • Vous profitez : proportionnellement à vos parts");

  // 6. GAINS POTENTIELS
  console.log("\n" + "=".repeat(70));
  console.log("5️⃣  VOS GAINS POTENTIELS");
  console.log("=".repeat(70));

  console.log("\n📈 Comment vous gagnez de l'argent :");
  console.log("\n   Chaque fois que quelqu'un fait un SWAP :");
  console.log("   • Il paye 0.3% de frais");
  console.log(`   • Vous recevez ${yourSharePercent.toFixed(2)}% de ces frais`);
  console.log("   • Les frais s'accumulent automatiquement dans le pool");
  console.log("   • Votre part grandit en valeur !");

  console.log("\n   Exemple :");
  console.log("   • User A swap 100 tokens → ETH");
  console.log("   • Frais = 0.3 tokens (0.3%)");
  console.log(`   • Vous gagnez = ${(0.3 * yourSharePercent / 100).toFixed(6)} tokens`);

  // 7. ACTIONS POSSIBLES
  console.log("\n" + "=".repeat(70));
  console.log("6️⃣  VOS OPTIONS MAINTENANT");
  console.log("=".repeat(70));

  console.log("\n🎯 Vous pouvez :");
  console.log("\n   A) GARDER votre position :");
  console.log("      ✓ Continuer à accumuler des frais");
  console.log("      ✓ Profit : plus il y a de swaps, plus vous gagnez");
  console.log("      ✗ Risque : impermanent loss si prix change beaucoup");

  console.log("\n   B) AJOUTER plus de liquidité :");
  console.log("      ✓ Augmenter votre part du pool");
  console.log("      ✓ Gagner plus de frais");

  console.log("\n   C) RETIRER votre liquidité :");
  console.log("      ✓ Récupérer vos tokens + ETH + frais accumulés");
  console.log(`      → Vous récupéreriez : ${yourTokens.toFixed(2)} tokens + ${yourETH.toFixed(6)} ETH`);
  console.log("      ✗ Vous arrêtez de gagner des frais");

  console.log("\n" + "=".repeat(70));
  console.log("\n✅ En résumé : Vous êtes maintenant un investisseur du DEX !");
  console.log(`   Vous possédez ${yourSharePercent.toFixed(2)}% du pool et gagnez des frais sur chaque échange.\n`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
