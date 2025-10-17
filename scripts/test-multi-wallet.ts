/**
 * Script de test avec plusieurs adresses MetaMask
 * Permet de tester les transferts de tokens et les swaps entre différents utilisateurs
 */

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
    console.log("=== TEST MULTI-WALLET ===\n");

    // Charger les adresses déployées
    const deploymentsPath = path.join(__dirname, "..", "deployments", "sepolia-addresses.json");
    if (!fs.existsSync(deploymentsPath)) {
        throw new Error("Fichier sepolia-addresses.json introuvable. Déployez d'abord les contrats.");
    }

    const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf-8"));
    const kycAddress = deployments.kyc;
    const tokenAddress = deployments.fungibleToken || deployments.token;
    const dexAddress = deployments.dex;

    console.log("📋 Adresses des contrats:");
    console.log("  KYC Registry:", kycAddress);
    console.log("  Token:", tokenAddress);
    console.log("  DEX:", dexAddress);
    console.log();

    // Récupérer les signers (adresses MetaMask configurées dans Hardhat)
    const signers = await ethers.getSigners();
    
    if (signers.length < 2) {
        console.log("⚠️ ATTENTION: Vous devez configurer au moins 2 adresses dans hardhat.config.ts");
        console.log("Ajoutez plusieurs clés privées dans accounts: [...]");
        console.log("\nUtilisation du compte principal uniquement pour la démo...\n");
    }

    const wallet1 = signers[0];
    const wallet2 = signers.length > 1 ? signers[1] : signers[0];

    console.log("👛 Wallets utilisés:");
    console.log("  Wallet 1 (Owner):", wallet1.address);
    console.log("  Wallet 2:", wallet2.address);
    console.log();

    // Connexion aux contrats
    const KYCRegistry = await ethers.getContractAt("KYCRegistry", kycAddress);
    const Token = await ethers.getContractAt("FungibleAssetToken", tokenAddress);
    const DEX = await ethers.getContractAt("SimpleDEX", dexAddress);

    console.log("=== ÉTAPE 1: Vérification des balances initiales ===\n");
    
    const wallet1TokenBalance = await Token.balanceOf(wallet1.address);
    const wallet2TokenBalance = await Token.balanceOf(wallet2.address);
    const wallet1ETHBalance = await ethers.provider.getBalance(wallet1.address);
    const wallet2ETHBalance = await ethers.provider.getBalance(wallet2.address);

    console.log("Wallet 1:");
    console.log("  ETH:", ethers.formatEther(wallet1ETHBalance));
    console.log("  Tokens:", ethers.formatUnits(wallet1TokenBalance, 18));
    console.log();
    console.log("Wallet 2:");
    console.log("  ETH:", ethers.formatEther(wallet2ETHBalance));
    console.log("  Tokens:", ethers.formatUnits(wallet2TokenBalance, 18));
    console.log();

    console.log("=== ÉTAPE 2: Vérification du statut KYC ===\n");
    
    const wallet1Whitelisted = await KYCRegistry.isWhitelisted(wallet1.address);
    const wallet2Whitelisted = await KYCRegistry.isWhitelisted(wallet2.address);
    const wallet1Blacklisted = await KYCRegistry.isBlacklisted(wallet1.address);
    const wallet2Blacklisted = await KYCRegistry.isBlacklisted(wallet2.address);

    console.log("Wallet 1:", wallet1Whitelisted ? "✅ Whitelisté" : "❌ Non whitelisté", wallet1Blacklisted ? "🚫 Blacklisté" : "");
    console.log("Wallet 2:", wallet2Whitelisted ? "✅ Whitelisté" : "❌ Non whitelisté", wallet2Blacklisted ? "🚫 Blacklisté" : "");
    console.log();

    // Si wallet2 n'est pas whitelisté, on le whitelist
    if (!wallet2Whitelisted && wallet1.address !== wallet2.address) {
        console.log("🔓 Whitelisting Wallet 2...");
        const tx = await KYCRegistry.connect(wallet1).batchApproveKYC([wallet2.address]);
        await tx.wait();
        console.log("  ✅ Wallet 2 whitelisté!");
        console.log();
    }

    console.log("=== ÉTAPE 3: Test de transfert de tokens (Wallet 1 → Wallet 2) ===\n");
    
    if (wallet1.address === wallet2.address) {
        console.log("⚠️ Les deux wallets sont identiques, skip du transfert");
        console.log();
    } else if (wallet1TokenBalance > 0n) {
        const amountToTransfer = ethers.parseUnits("10", 18); // Transfert 10 tokens
        
        console.log(`📤 Transfert de ${ethers.formatUnits(amountToTransfer, 18)} tokens...`);
        
        try {
            const tx = await Token.connect(wallet1).transfer(wallet2.address, amountToTransfer);
            const receipt = await tx.wait();
            console.log("  ✅ Transfert réussi!");
            console.log("  Transaction:", receipt?.hash);
            console.log();

            // Vérifier les nouvelles balances
            const newWallet1Balance = await Token.balanceOf(wallet1.address);
            const newWallet2Balance = await Token.balanceOf(wallet2.address);

            console.log("Nouvelles balances:");
            console.log("  Wallet 1:", ethers.formatUnits(newWallet1Balance, 18), "tokens");
            console.log("  Wallet 2:", ethers.formatUnits(newWallet2Balance, 18), "tokens");
            console.log();
        } catch (error: any) {
            console.log("  ❌ Erreur lors du transfert:", error.message);
            console.log();
        }
    } else {
        console.log("⚠️ Wallet 1 n'a pas de tokens à transférer");
        console.log();
    }

    console.log("=== ÉTAPE 4: Test de swap sur le DEX (Wallet 2 achète des tokens) ===\n");
    
    const poolInfo = await DEX.getPoolInfo();
    console.log("État de la pool:");
    console.log("  Réserve tokens:", ethers.formatUnits(poolInfo[0], 18));
    console.log("  Réserve ETH:", ethers.formatEther(poolInfo[1]));
    console.log();

    if (poolInfo[0] > 0n && poolInfo[1] > 0n) {
        const ethAmount = ethers.parseEther("0.001"); // Swap 0.001 ETH
        
        console.log(`💱 Wallet 2 swap ${ethers.formatEther(ethAmount)} ETH contre des tokens...`);
        
        try {
            // Calculer le montant de tokens attendus
            const expectedTokens = await DEX.getTokenQuote(ethAmount);
            const minTokens = (expectedTokens * 95n) / 100n; // 5% slippage
            
            console.log(`  Tokens attendus: ${ethers.formatUnits(expectedTokens, 18)}`);
            console.log(`  Slippage max: 5%`);
            
            const tx = await DEX.connect(wallet2).swapETHForTokens(minTokens, { value: ethAmount });
            const receipt = await tx.wait();
            console.log("  ✅ Swap réussi!");
            console.log("  Transaction:", receipt?.hash);
            console.log(`  🔗 Etherscan: https://sepolia.etherscan.io/tx/${receipt?.hash}`);
            console.log();

            // Vérifier la nouvelle balance
            const newWallet2TokenBalance = await Token.balanceOf(wallet2.address);
            console.log("Nouvelle balance Wallet 2:", ethers.formatUnits(newWallet2TokenBalance, 18), "tokens");
            console.log();

        } catch (error: any) {
            console.log("  ❌ Erreur lors du swap:", error.message);
            console.log();
        }
    } else {
        console.log("⚠️ La pool DEX n'a pas de liquidité");
        console.log();
    }

    console.log("=== RÉSUMÉ FINAL ===\n");
    
    const finalWallet1TokenBalance = await Token.balanceOf(wallet1.address);
    const finalWallet2TokenBalance = await Token.balanceOf(wallet2.address);
    const finalWallet1ETHBalance = await ethers.provider.getBalance(wallet1.address);
    const finalWallet2ETHBalance = await ethers.provider.getBalance(wallet2.address);

    console.log("Wallet 1 (Owner):");
    console.log("  Adresse:", wallet1.address);
    console.log("  ETH:", ethers.formatEther(finalWallet1ETHBalance));
    console.log("  Tokens:", ethers.formatUnits(finalWallet1TokenBalance, 18));
    console.log();
    console.log("Wallet 2:");
    console.log("  Adresse:", wallet2.address);
    console.log("  ETH:", ethers.formatEther(finalWallet2ETHBalance));
    console.log("  Tokens:", ethers.formatUnits(finalWallet2TokenBalance, 18));
    console.log();

    console.log("✅ Tests multi-wallet terminés!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
