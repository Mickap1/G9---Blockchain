import { ethers } from "hardhat";

/**
 * Script de vérification complète du système
 * Vérifie que tout fonctionne correctement
 */

async function main() {
  console.log("\n🔍 VÉRIFICATION COMPLÈTE DU SYSTÈME\n");
  console.log("=".repeat(60));

  const [deployer] = await ethers.getSigners();
  
  // Adresses
  const KYC_ADDRESS = "0x8E4312166Ed927C331B5950e5B8ac636841f06Eb";
  const TOKEN_ADDRESS = "0x6B2a38Ef30420B0AF041F014a092BEDB39F2Eb81";
  const DEX_ADDRESS = "0x28B2c6b3C1C9F09ca86e6B7cc8d0b9f0Bd7CE7F4";

  // Connecter aux contrats
  const kycRegistry = await ethers.getContractAt("KYCRegistry", KYC_ADDRESS);
  const token = await ethers.getContractAt("FungibleAssetToken", TOKEN_ADDRESS);
  const dex = await ethers.getContractAt("SimpleDEX", DEX_ADDRESS);

  console.log("\n📝 INFORMATIONS GÉNÉRALES");
  console.log("   Wallet:", deployer.address);
  console.log("   Réseau:", (await ethers.provider.getNetwork()).name);
  console.log("   Balance ETH:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // ========== KYC REGISTRY ==========
  console.log("\n🔐 KYC REGISTRY:", KYC_ADDRESS);
  
  const isDeployerWhitelisted = await kycRegistry.isWhitelisted(deployer.address);
  const isDexWhitelisted = await kycRegistry.isWhitelisted(DEX_ADDRESS);
  
  console.log("   ✅ Deployer whitelisté:", isDeployerWhitelisted ? "OUI" : "NON");
  console.log("   ✅ DEX whitelisté:", isDexWhitelisted ? "OUI" : "NON");
  
  // ========== FUNGIBLE TOKEN ==========
  console.log("\n🪙 FUNGIBLE ASSET TOKEN:", TOKEN_ADDRESS);
  
  const tokenName = await token.name();
  const tokenSymbol = await token.symbol();
  const tokenSupply = await token.totalSupply();
  const maxSupply = await token.MAX_SUPPLY();
  const deployerBalance = await token.balanceOf(deployer.address);
  
  console.log("   Nom:", tokenName);
  console.log("   Symbole:", tokenSymbol);
  console.log("   Supply:", ethers.formatEther(tokenSupply), "/", ethers.formatEther(maxSupply));
  console.log("   Votre balance:", ethers.formatEther(deployerBalance));

  // ========== SIMPLE DEX ==========
  console.log("\n💱 SIMPLE DEX:", DEX_ADDRESS);
  
  const poolInfo = await dex.getPoolInfo();
  const userLiquidity = await dex.getUserLiquidity(deployer.address);
  
  console.log("   Token Reserve:", ethers.formatEther(poolInfo._reserveToken));
  console.log("   ETH Reserve:", ethers.formatEther(poolInfo._reserveETH));
  console.log("   Prix du token:", ethers.formatEther(poolInfo._tokenPrice), "ETH");
  console.log("   Total Liquidité:", ethers.formatEther(poolInfo._totalLiquidity), "LP tokens");
  
  console.log("\n   Votre position:");
  console.log("   - LP Tokens:", ethers.formatEther(userLiquidity.userLiquidity));
  console.log("   - Part du pool:", (Number(userLiquidity.sharePercent) / 100).toFixed(2), "%");
  console.log("   - Tokens récupérables:", ethers.formatEther(userLiquidity.tokenShare));
  console.log("   - ETH récupérable:", ethers.formatEther(userLiquidity.ethShare));

  // ========== TESTS FONCTIONNELS ==========
  console.log("\n🧪 TESTS FONCTIONNELS");

  // Test 1: Quote
  const quoteETH = ethers.parseEther("0.001");
  const quoteResult = await dex.getTokenQuote(quoteETH);
  console.log("   ✅ getTokenQuote(0.001 ETH):", ethers.formatEther(quoteResult), "tokens");

  // Test 2: Prix
  const price = await dex.getTokenPrice();
  console.log("   ✅ getTokenPrice():", ethers.formatEther(price), "ETH/token");

  // Test 3: KYC check
  const canTransfer = await kycRegistry.canTransfer(deployer.address, DEX_ADDRESS);
  console.log("   ✅ canTransfer(deployer → DEX):", canTransfer);

  // ========== ÉTAT DU SYSTÈME ==========
  console.log("\n📊 ÉTAT DU SYSTÈME");

  let score = 0;
  let total = 0;

  // Check 1: Deployer whitelisté
  total++;
  if (isDeployerWhitelisted) {
    console.log("   ✅ Deployer est whitelisté");
    score++;
  } else {
    console.log("   ❌ Deployer n'est PAS whitelisté");
  }

  // Check 2: DEX whitelisté
  total++;
  if (isDexWhitelisted) {
    console.log("   ✅ DEX est whitelisté");
    score++;
  } else {
    console.log("   ❌ DEX n'est PAS whitelisté");
  }

  // Check 3: Pool a de la liquidité
  total++;
  if (poolInfo._reserveToken > 0n && poolInfo._reserveETH > 0n) {
    console.log("   ✅ Pool a de la liquidité");
    score++;
  } else {
    console.log("   ❌ Pool est vide");
  }

  // Check 4: Token supply
  total++;
  if (tokenSupply > 0n) {
    console.log("   ✅ Tokens en circulation");
    score++;
  } else {
    console.log("   ⚠️  Aucun token en circulation");
  }

  // Check 5: Prix cohérent
  total++;
  if (price > 0n) {
    console.log("   ✅ Prix du token cohérent");
    score++;
  } else {
    console.log("   ❌ Prix du token invalide");
  }

  // ========== RÉSUMÉ FINAL ==========
  console.log("\n" + "=".repeat(60));
  console.log("📈 SCORE FINAL:", score, "/", total);
  console.log("=".repeat(60));

  const percentage = (score / total) * 100;
  
  if (percentage === 100) {
    console.log("\n🎉 PARFAIT ! Le système est 100% opérationnel !");
    console.log("\n✅ Vous pouvez:");
    console.log("   - Trader sur le DEX");
    console.log("   - Ajouter/retirer de la liquidité");
    console.log("   - Déployer le frontend");
    console.log("   - Commencer la Partie 4 (Indexer)");
  } else if (percentage >= 80) {
    console.log("\n✅ TRÈS BIEN ! Le système est presque parfait.");
    console.log("   Vérifiez les points manquants ci-dessus.");
  } else if (percentage >= 60) {
    console.log("\n⚠️  ATTENTION ! Quelques problèmes détectés.");
    console.log("   Corrigez les points marqués ❌ ci-dessus.");
  } else {
    console.log("\n❌ ERREUR ! Le système nécessite des corrections.");
    console.log("   Beaucoup d'éléments ne fonctionnent pas correctement.");
  }

  // ========== LIENS UTILES ==========
  console.log("\n🔗 LIENS ETHERSCAN");
  console.log("   KYC:", "https://sepolia.etherscan.io/address/" + KYC_ADDRESS);
  console.log("   Token:", "https://sepolia.etherscan.io/address/" + TOKEN_ADDRESS);
  console.log("   DEX:", "https://sepolia.etherscan.io/address/" + DEX_ADDRESS);

  console.log("\n📚 PROCHAINES ÉTAPES");
  console.log("   1. Test de swap:");
  console.log("      npx hardhat run scripts/test-swap.ts --network sepolia");
  console.log("\n   2. Ajouter plus de liquidité:");
  console.log("      npx hardhat run scripts/add-more-liquidity.ts --network sepolia");
  console.log("\n   3. Commencer la Partie 4:");
  console.log("      Indexer pour événements on-chain");

  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Erreur:");
    console.error(error);
    process.exit(1);
  });
