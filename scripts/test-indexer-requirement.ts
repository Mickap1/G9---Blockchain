/**
 * TEST DE L'EXIGENCE #4 : Real-Time On-Chain Awareness
 * 
 * Ce script teste si un swap fait DIRECTEMENT sur le smart contract
 * (en dehors de l'UI) apparaît bien dans l'indexeur et donc dans le frontend.
 * 
 * SCENARIO DE TEST:
 * 1. Faire un swap directement via ethers.js (simule un swap via Etherscan/MetaMask)
 * 2. Attendre que l'indexeur détecte la transaction (max 60 secondes)
 * 3. Vérifier que le swap apparaît dans l'API de l'indexeur
 * 4. ✅ Si oui = Exigence #4 respectée
 */

import { ethers } from "hardhat";
import axios from "axios";

// Configuration
const DEX_ADDRESS = "0x2Cf848B370C0Ce0255C4743d70648b096D3fAa98";
const TOKEN_ADDRESS = "0xfA451d9C32d15a637Ab376732303c36C34C9979f";
const INDEXER_API_URL = "https://g9-blockchain-production-836a.up.railway.app";

// ABIs simplifiés
const DEX_ABI = [
  "function swapETHForTokens(uint256 minTokens) external payable",
  "function swapTokensForETH(uint256 tokenAmount, uint256 minETH) external",
  "function reserveToken() external view returns (uint256)",
  "function reserveETH() external view returns (uint256)",
];

const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
];

async function main() {
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║  TEST EXIGENCE #4 : Real-Time On-Chain Awareness          ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  // Récupérer le compte (utilise le premier compte du wallet)
  const [signer] = await ethers.getSigners();
  const userAddress = await signer.getAddress();

  console.log("👤 Adresse utilisateur:", userAddress);
  console.log("🔗 Réseau: Sepolia");
  console.log("📍 Contrat DEX:", DEX_ADDRESS);
  console.log("📍 Contrat Token:", TOKEN_ADDRESS);
  console.log("🌐 API Indexeur:", INDEXER_API_URL);
  console.log("");

  // Connexion aux contrats
  const dex = await ethers.getContractAt(DEX_ABI, DEX_ADDRESS, signer);
  const token = await ethers.getContractAt(TOKEN_ABI, TOKEN_ADDRESS, signer);

  // Vérifier les réserves du pool
  console.log("📊 État du pool DEX avant le swap:");
  const reserveTokenBefore = await dex.reserveToken();
  const reserveETHBefore = await dex.reserveETH();
  console.log(`   - Réserve ETH: ${ethers.formatEther(reserveETHBefore)} ETH`);
  console.log(`   - Réserve Tokens: ${ethers.formatEther(reserveTokenBefore)} RWAT`);
  console.log("");

  // Vérifier la balance de l'utilisateur
  const ethBalance = await ethers.provider.getBalance(userAddress);
  const tokenBalance = await token.balanceOf(userAddress);
  console.log("💰 Balances utilisateur avant le swap:");
  console.log(`   - ETH: ${ethers.formatEther(ethBalance)} ETH`);
  console.log(`   - Tokens: ${ethers.formatEther(tokenBalance)} RWAT`);
  console.log("");

  // Vérifier que l'indexeur est actif
  console.log("🔍 Vérification de l'indexeur...");
  try {
    const healthResponse = await axios.get(`${INDEXER_API_URL}/api/health`);
    console.log("✅ Indexeur actif:", healthResponse.data);
  } catch (error) {
    console.error("❌ Indexeur hors ligne! Le test ne peut pas continuer.");
    console.error("   Démarrez l'indexeur avec: npm start (dans le dossier indexer)");
    process.exit(1);
  }
  console.log("");

  // Récupérer le nombre de swaps AVANT
  console.log("📈 Récupération du nombre de swaps avant la transaction...");
  const statsBeforeResponse = await axios.get(`${INDEXER_API_URL}/api/stats`);
  const totalSwapsBefore = statsBeforeResponse.data.data.totalSwaps;
  console.log(`   - Total swaps indexés: ${totalSwapsBefore}`);
  console.log("");

  // ═══════════════════════════════════════════════════════════
  // 🚀 ÉTAPE CRITIQUE : SWAP FAIT EN DEHORS DE L'UI
  // ═══════════════════════════════════════════════════════════
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  🎯 SWAP DIRECT SUR LE SMART CONTRACT (hors UI)           ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");

  const ethToSwap = ethers.parseEther("0.001"); // 0.001 ETH
  const minTokens = 0; // Accepter n'importe quel montant pour simplifier le test

  console.log(`💸 Envoi de ${ethers.formatEther(ethToSwap)} ETH pour acheter des tokens...`);
  console.log("⚠️  Cette transaction est faite DIRECTEMENT via ethers.js");
  console.log("⚠️  Pas via l'interface web (simule Etherscan/MetaMask)");
  console.log("");

  try {
    const tx = await dex.swapETHForTokens(minTokens, {
      value: ethToSwap,
    });

    console.log("📝 Transaction envoyée!");
    console.log(`   Hash: ${tx.hash}`);
    console.log(`   Lien: https://sepolia.etherscan.io/tx/${tx.hash}`);
    console.log("");

    console.log("⏳ Attente de la confirmation...");
    const receipt = await tx.wait();
    
    console.log("✅ Transaction confirmée!");
    console.log(`   Bloc: ${receipt.blockNumber}`);
    console.log(`   Gas utilisé: ${receipt.gasUsed.toString()}`);
    console.log("");

    // Récupérer les nouvelles balances
    const ethBalanceAfter = await ethers.provider.getBalance(userAddress);
    const tokenBalanceAfter = await token.balanceOf(userAddress);
    const tokensReceived = tokenBalanceAfter - tokenBalance;

    console.log("💰 Balances utilisateur après le swap:");
    console.log(`   - ETH: ${ethers.formatEther(ethBalanceAfter)} ETH (changement: ${ethers.formatEther(ethBalance - ethBalanceAfter)} ETH)`);
    console.log(`   - Tokens: ${ethers.formatEther(tokenBalanceAfter)} RWAT (reçu: ${ethers.formatEther(tokensReceived)} RWAT)`);
    console.log("");

    // ═══════════════════════════════════════════════════════════
    // 🔍 VÉRIFICATION : Le swap apparaît-il dans l'indexeur ?
    // ═══════════════════════════════════════════════════════════
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║  🔍 VÉRIFICATION : Le swap est-il indexé ?                ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    console.log("⏰ Attente de l'indexation (l'indexeur scanne toutes les 60 secondes)...");
    console.log("   Cette partie peut prendre jusqu'à 60 secondes.");
    console.log("");

    // Attendre et vérifier plusieurs fois
    let swapFound = false;
    let attempts = 0;
    const maxAttempts = 12; // 12 tentatives x 10 secondes = 2 minutes max

    while (!swapFound && attempts < maxAttempts) {
      attempts++;
      console.log(`🔄 Tentative ${attempts}/${maxAttempts}...`);

      await new Promise(resolve => setTimeout(resolve, 10000)); // Attendre 10 secondes

      try {
        // Vérifier les stats
        const statsAfterResponse = await axios.get(`${INDEXER_API_URL}/api/stats`);
        const totalSwapsAfter = statsAfterResponse.data.data.totalSwaps;

        console.log(`   📊 Total swaps indexés: ${totalSwapsAfter} (avant: ${totalSwapsBefore})`);

        if (totalSwapsAfter > totalSwapsBefore) {
          console.log("   ✅ Nouveaux swaps détectés!");

          // Récupérer les derniers swaps
          const swapsResponse = await axios.get(`${INDEXER_API_URL}/api/swaps?limit=5`);
          const recentSwaps = swapsResponse.data.data;

          // Chercher notre transaction
          const ourSwap = recentSwaps.find((s: any) => s.transactionHash === tx.hash);

          if (ourSwap) {
            swapFound = true;
            console.log("");
            console.log("🎉🎉🎉 SUCCÈS! 🎉🎉🎉");
            console.log("");
            console.log("✅ Le swap fait HORS DE L'UI a été détecté par l'indexeur!");
            console.log("");
            console.log("📋 Détails du swap indexé:");
            console.log(`   - Type: ${ourSwap.type.toUpperCase()}`);
            console.log(`   - Acheteur: ${ourSwap.buyer}`);
            console.log(`   - ETH envoyé: ${ethers.formatEther(ourSwap.ethIn)} ETH`);
            console.log(`   - Tokens reçus: ${ethers.formatEther(ourSwap.tokensOut)} RWAT`);
            console.log(`   - Bloc: ${ourSwap.blockNumber}`);
            console.log(`   - Hash: ${ourSwap.transactionHash}`);
            console.log("");
            console.log("╔════════════════════════════════════════════════════════════╗");
            console.log("║  ✅ EXIGENCE #4 RESPECTÉE !                                ║");
            console.log("║                                                            ║");
            console.log("║  Un swap fait directement sur le smart contract           ║");
            console.log("║  (en dehors de l'UI) apparaît bien dans l'indexeur        ║");
            console.log("║  et sera donc visible dans le frontend!                   ║");
            console.log("╚════════════════════════════════════════════════════════════╝");
            console.log("");
            console.log("🌐 Pour vérifier dans le frontend:");
            console.log("   1. Ouvrez http://localhost:3000/dashboard");
            console.log("   2. Regardez la section 'Activité Blockchain en Temps Réel'");
            console.log("   3. Votre swap devrait y apparaître!");
            console.log("");
            console.log("   OU");
            console.log("");
            console.log("   1. Ouvrez http://localhost:3000/dex");
            console.log("   2. Scrollez jusqu'à 'Historique des Swaps'");
            console.log("   3. Votre swap est dans la liste!");
            console.log("");
          } else {
            console.log("   ⏳ Transaction pas encore dans les 5 derniers swaps, on continue...");
          }
        } else {
          console.log("   ⏳ Pas encore de nouveaux swaps, l'indexeur scanne...");
        }
      } catch (error: any) {
        console.error(`   ❌ Erreur lors de la vérification: ${error.message}`);
      }
    }

    if (!swapFound) {
      console.log("");
      console.log("⚠️  Le swap n'a pas été détecté après 2 minutes.");
      console.log("");
      console.log("Vérifications possibles:");
      console.log("1. L'indexeur est-il bien démarré?");
      console.log("   → curl https://g9-blockchain-production-836a.up.railway.app/api/health");
      console.log("");
      console.log("2. Les adresses des contrats sont-elles correctes dans l'indexeur?");
      console.log("   → Vérifier src/config/contracts.ts");
      console.log("");
      console.log("3. L'indexeur a-t-il des erreurs?");
      console.log("   → Vérifier les logs Railway");
      console.log("");
      console.log(`4. La transaction a-t-elle été confirmée?`);
      console.log(`   → https://sepolia.etherscan.io/tx/${tx.hash}`);
      console.log("");
    }

  } catch (error: any) {
    console.error("❌ Erreur lors du swap:", error.message);
    
    if (error.message.includes("KYC")) {
      console.log("");
      console.log("⚠️  Vous n'êtes pas whitelisté pour trader!");
      console.log("   Exécutez d'abord: npx hardhat run scripts/whitelist-account.ts --network sepolia");
    }
    
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
