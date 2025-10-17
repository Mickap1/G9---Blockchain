import { ethers } from "hardhat";

/**
 * Script pour tester un swap sur le DEX
 * 
 * Ce script démontre comment acheter des tokens avec ETH
 */

async function main() {
  console.log("\n💱 Test de Swap sur SimpleDEX\n");

  const [trader] = await ethers.getSigners();
  console.log("📝 Trader:", trader.address);

  const balance = await ethers.provider.getBalance(trader.address);
  console.log("💰 Solde ETH:", ethers.formatEther(balance), "ETH");

  // Adresses des contrats
  const TOKEN_ADDRESS = "0x6B2a38Ef30420B0AF041F014a092BEDB39F2Eb81";
  const DEX_ADDRESS = "0x28B2c6b3C1C9F09ca86e6B7cc8d0b9f0Bd7CE7F4";
  const KYC_ADDRESS = "0x8E4312166Ed927C331B5950e5B8ac636841f06Eb";

  // Connecter aux contrats
  const token = await ethers.getContractAt("FungibleAssetToken", TOKEN_ADDRESS);
  const dex = await ethers.getContractAt("SimpleDEX", DEX_ADDRESS);
  const kycRegistry = await ethers.getContractAt("KYCRegistry", KYC_ADDRESS);

  // ========== VÉRIFICATION KYC ==========
  console.log("\n🔐 Vérification KYC:");
  
  const isWhitelisted = await kycRegistry.isWhitelisted(trader.address);
  const isBlacklisted = await kycRegistry.isBlacklisted(trader.address);

  console.log("   Whitelisted:", isWhitelisted ? "✅ OUI" : "❌ NON");
  console.log("   Blacklisted:", isBlacklisted ? "⚠️  OUI" : "✅ NON");

  if (!isWhitelisted || isBlacklisted) {
    console.log("\n❌ ERREUR: Vous devez être whitelisté pour trader!");
    console.log("   Demandez à l'admin de vous whitelist avec :");
    console.log("   await kycRegistry.batchApproveKYC(['" + trader.address + "'], futureExpiry);");
    return;
  }

  // ========== INFORMATIONS DU POOL ==========
  console.log("\n📊 Informations du pool:");

  const poolInfo = await dex.getPoolInfo();
  console.log("   Token Reserve:", ethers.formatEther(poolInfo._reserveToken));
  console.log("   ETH Reserve:", ethers.formatEther(poolInfo._reserveETH));
  console.log("   Prix actuel:", ethers.formatEther(poolInfo._tokenPrice), "ETH/token");

  // ========== PRÉPARATION DU SWAP ==========
  console.log("\n💱 Préparation du swap:");

  // Montant d'ETH à dépenser
  const ethAmount = ethers.parseEther("0.001"); // 0.001 ETH
  console.log("   ETH à dépenser:", ethers.formatEther(ethAmount));

  // Obtenir une estimation
  const estimatedTokens = await dex.getTokenQuote(ethAmount);
  console.log("   Tokens estimés:", ethers.formatEther(estimatedTokens));

  // Calculer le slippage (5% de tolérance)
  const slippageTolerance = 5n; // 5%
  const minTokens = (estimatedTokens * (100n - slippageTolerance)) / 100n;
  console.log("   Tokens minimum (5% slippage):", ethers.formatEther(minTokens));

  // Vérifier le solde avant
  const tokenBalanceBefore = await token.balanceOf(trader.address);
  console.log("\n   Token balance avant:", ethers.formatEther(tokenBalanceBefore));

  // ========== EXÉCUTION DU SWAP ==========
  console.log("\n⏳ Exécution du swap ETH → Tokens...");

  try {
    const swapTx = await dex.swapETHForTokens(minTokens, {
      value: ethAmount,
      gasLimit: 300000
    });

    console.log("   Transaction envoyée:", swapTx.hash);
    console.log("   ⏳ Attente de confirmation...");

    const receipt = await swapTx.wait();
    console.log("   ✅ Swap confirmé! (Bloc", receipt?.blockNumber, ")");

    // Vérifier le résultat
    const tokenBalanceAfter = await token.balanceOf(trader.address);
    const tokensReceived = tokenBalanceAfter - tokenBalanceBefore;

    console.log("\n📊 Résultat du swap:");
    console.log("   ETH dépensé:", ethers.formatEther(ethAmount));
    console.log("   Tokens reçus:", ethers.formatEther(tokensReceived));
    console.log("   Prix effectif:", ethers.formatEther(ethAmount * 10000n / tokensReceived), "ETH pour 10k tokens");

    // Nouveau prix du pool
    const newPoolInfo = await dex.getPoolInfo();
    console.log("\n   Nouveau prix du pool:", ethers.formatEther(newPoolInfo._tokenPrice), "ETH/token");

    // ========== RÉSUMÉ ==========
    console.log("\n" + "=".repeat(60));
    console.log("✅ SWAP RÉUSSI!");
    console.log("=".repeat(60));

    console.log("\n📋 Transaction:");
    console.log("   Hash:", receipt?.hash);
    console.log("   Etherscan: https://sepolia.etherscan.io/tx/" + receipt?.hash);

    console.log("\n🎯 Essayez maintenant:");
    console.log("   1. Swap inverse (Tokens → ETH):");
    console.log("      - Approuvez d'abord: await token.approve(dexAddress, amount)");
    console.log("      - Puis swapez: await dex.swapTokensForETH(amount, minETH)");
    console.log("\n   2. Ajoutez plus de liquidité:");
    console.log("      npx hardhat run scripts/add-more-liquidity.ts --network sepolia");

  } catch (error: any) {
    console.log("\n❌ Erreur lors du swap:");
    
    if (error.message.includes("SlippageExceeded")) {
      console.log("   Le prix a trop changé. Essayez avec plus de slippage tolerance.");
    } else if (error.message.includes("NotWhitelisted")) {
      console.log("   Vous devez être whitelisté pour trader.");
    } else if (error.message.includes("PoolNotInitialized")) {
      console.log("   Le pool n'a pas de liquidité. Ajoutez de la liquidité d'abord.");
    } else {
      console.log("   ", error.message);
    }
    
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Script terminé avec erreur");
    process.exit(1);
  });
