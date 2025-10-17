import { ethers } from "hardhat";

/**
 * Script pour whitelist le DEX et ajouter la liquidité initiale
 * 
 * Ce script fait 3 choses :
 * 1. Whitelist le contrat DEX dans le KYC Registry
 * 2. Mint des tokens si nécessaire
 * 3. Ajoute la liquidité initiale au pool
 */

async function main() {
  console.log("\n🔐 Whitelist du DEX et ajout de liquidité...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Wallet:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Solde:", ethers.formatEther(balance), "ETH");

  // Adresses des contrats sur Sepolia
  const KYC_ADDRESS = "0x8E4312166Ed927C331B5950e5B8ac636841f06Eb";
  const TOKEN_ADDRESS = "0x6B2a38Ef30420B0AF041F014a092BEDB39F2Eb81";
  const DEX_ADDRESS = "0x28B2c6b3C1C9F09ca86e6B7cc8d0b9f0Bd7CE7F4";

  // Connecter aux contrats
  const kycRegistry = await ethers.getContractAt("KYCRegistry", KYC_ADDRESS);
  const token = await ethers.getContractAt("FungibleAssetToken", TOKEN_ADDRESS);
  const dex = await ethers.getContractAt("SimpleDEX", DEX_ADDRESS);

  // ========== ÉTAPE 1 : Whitelist le DEX ==========
  console.log("\n📋 ÉTAPE 1 : Whitelist du DEX");
  console.log("   DEX Address:", DEX_ADDRESS);

  const isDexWhitelisted = await kycRegistry.isWhitelisted(DEX_ADDRESS);
  
  if (isDexWhitelisted) {
    console.log("   ✅ DEX est déjà whitelisté");
  } else {
    console.log("   ⏳ Whitelist du DEX en cours...");
    
    const futureExpiry = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 an
    
    const whitelistTx = await kycRegistry.batchApproveKYC([DEX_ADDRESS], futureExpiry);
    await whitelistTx.wait();
    
    console.log("   ✅ DEX whitelisté avec succès!");
    console.log("   Transaction:", whitelistTx.hash);
  }

  // ========== ÉTAPE 2 : Vérifier/Mint les tokens ==========
  console.log("\n💰 ÉTAPE 2 : Vérification des tokens");

  const deployerTokenBalance = await token.balanceOf(deployer.address);
  console.log("   Tokens actuels:", ethers.formatEther(deployerTokenBalance));

  // Montant de liquidité à ajouter (ajusté selon votre solde ETH)
  const liquidityTokens = ethers.parseEther("100"); // 100 tokens
  const liquidityETH = ethers.parseEther("0.01");    // 0.01 ETH

  console.log("\n   Liquidité prévue:");
  console.log("   - Tokens:", ethers.formatEther(liquidityTokens));
  console.log("   - ETH:", ethers.formatEther(liquidityETH));

  if (deployerTokenBalance < liquidityTokens) {
    const tokensNeeded = liquidityTokens - deployerTokenBalance;
    console.log("\n   ⏳ Mint de", ethers.formatEther(tokensNeeded), "tokens...");
    
    const mintTx = await token.mint(deployer.address, tokensNeeded);
    await mintTx.wait();
    
    console.log("   ✅ Tokens mintés avec succès!");
    console.log("   Transaction:", mintTx.hash);
  } else {
    console.log("   ✅ Suffisamment de tokens disponibles");
  }

  // ========== ÉTAPE 3 : Vérifier si le pool existe déjà ==========
  console.log("\n🏊 ÉTAPE 3 : Vérification du pool");

  const poolInfo = await dex.getPoolInfo();
  const poolExists = poolInfo._reserveToken > 0n;

  if (poolExists) {
    console.log("   ⚠️  Le pool existe déjà!");
    console.log("   Token Reserve:", ethers.formatEther(poolInfo._reserveToken));
    console.log("   ETH Reserve:", ethers.formatEther(poolInfo._reserveETH));
    console.log("   Prix:", ethers.formatEther(poolInfo._tokenPrice), "ETH par token");
    
    console.log("\n   💡 Si vous voulez ajouter plus de liquidité, le ratio actuel sera maintenu.");
    console.log("   Pour ajouter de la liquidité, utilisez le script add-more-liquidity.ts");
    return;
  }

  // ========== ÉTAPE 4 : Approve les tokens ==========
  console.log("\n✅ ÉTAPE 4 : Approval des tokens");

  const currentAllowance = await token.allowance(deployer.address, DEX_ADDRESS);
  
  if (currentAllowance < liquidityTokens) {
    console.log("   ⏳ Approval du DEX pour dépenser", ethers.formatEther(liquidityTokens), "tokens...");
    
    const approveTx = await token.approve(DEX_ADDRESS, liquidityTokens);
    await approveTx.wait();
    
    console.log("   ✅ Approval accordé!");
    console.log("   Transaction:", approveTx.hash);
  } else {
    console.log("   ✅ Approval déjà accordé");
  }

  // ========== ÉTAPE 5 : Ajouter la liquidité ==========
  console.log("\n💧 ÉTAPE 5 : Ajout de la liquidité");

  // Vérifier qu'on a assez d'ETH
  if (balance < liquidityETH) {
    console.log("\n   ❌ ERREUR : Solde ETH insuffisant!");
    console.log("   Besoin:", ethers.formatEther(liquidityETH), "ETH");
    console.log("   Disponible:", ethers.formatEther(balance), "ETH");
    console.log("\n   💡 Obtenez plus de Sepolia ETH:");
    console.log("      - https://sepoliafaucet.com");
    console.log("      - https://faucet.quicknode.com/ethereum/sepolia");
    return;
  }

  console.log("   ⏳ Ajout de la liquidité...");
  console.log("   - Tokens:", ethers.formatEther(liquidityTokens));
  console.log("   - ETH:", ethers.formatEther(liquidityETH));

  const addLiquidityTx = await dex.addLiquidity(liquidityTokens, {
    value: liquidityETH,
    gasLimit: 500000 // Limite de gas pour éviter les erreurs
  });

  console.log("   ⏳ Transaction envoyée, attente de confirmation...");
  const receipt = await addLiquidityTx.wait();

  console.log("   ✅ Liquidité ajoutée avec succès!");
  console.log("   Transaction:", receipt?.hash);

  // ========== ÉTAPE 6 : Vérifier le résultat ==========
  console.log("\n📊 ÉTAPE 6 : Vérification du pool");

  const finalPoolInfo = await dex.getPoolInfo();
  const userLiquidity = await dex.getUserLiquidity(deployer.address);

  console.log("\n   Pool Information:");
  console.log("   - Token Reserve:", ethers.formatEther(finalPoolInfo._reserveToken));
  console.log("   - ETH Reserve:", ethers.formatEther(finalPoolInfo._reserveETH));
  console.log("   - Total Liquidity:", ethers.formatEther(finalPoolInfo._totalLiquidity));
  console.log("   - Token Price:", ethers.formatEther(finalPoolInfo._tokenPrice), "ETH par token");

  console.log("\n   Votre Position:");
  console.log("   - LP Tokens:", ethers.formatEther(userLiquidity.userLiquidity));
  console.log("   - Part du pool:", (Number(userLiquidity.sharePercent) / 100).toFixed(2), "%");

  // ========== RÉSUMÉ FINAL ==========
  console.log("\n" + "=".repeat(60));
  console.log("✅ CONFIGURATION TERMINÉE AVEC SUCCÈS!");
  console.log("=".repeat(60));

  console.log("\n📋 Résumé:");
  console.log("   ✅ DEX whitelisté");
  console.log("   ✅ Tokens mintés/approuvés");
  console.log("   ✅ Liquidité ajoutée au pool");

  console.log("\n🎯 Prochaines étapes:");
  console.log("   1. Tester un swap :");
  console.log("      npx hardhat run scripts/test-swap.ts --network sepolia");
  console.log("\n   2. Vérifier sur Etherscan :");
  console.log("      https://sepolia.etherscan.io/address/" + DEX_ADDRESS);
  console.log("\n   3. Ajouter plus de liquidité si besoin :");
  console.log("      npx hardhat run scripts/add-more-liquidity.ts --network sepolia");

  console.log("\n🎉 Votre DEX est maintenant opérationnel!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Erreur:");
    console.error(error);
    process.exit(1);
  });
