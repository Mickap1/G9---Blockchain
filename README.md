# 🏗️ Plateforme de Tokenisation d'Actifs Réels (RWA)

> Système blockchain complet pour la tokenisation d'actifs réels avec conformité KYC, DEX intégré et Oracle de prix automatisé.

**Projet Blockchain Epitech 2025-2026**

[![Tests](https://img.shields.io/badge/tests-190%20passing-success)](./test)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.0-yellow)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.0.0-purple)](https://www.openzeppelin.com/)

---

## 📖 Description du Projet

Cette plateforme permet de **tokeniser des actifs réels** (immobilier, diamants, œuvres d'art) sur la blockchain Ethereum avec une **conformité KYC/AML intégrée**.

Le système comprend :
- 🪙 **Tokenisation fongible (ERC-20)** pour la propriété fractionnée
- 💎 **Tokenisation NFT (ERC-721)** pour les actifs uniques
- 🔐 **Système KYC on-chain** pour la conformité réglementaire
- 💱 **DEX intégré** avec AMM pour le trading décentralisé
- 📊 **Oracle de prix** pour les valuations automatisées

---

## 🛠️ Technologies Utilisées

### Blockchain & Smart Contracts

**Solidity 0.8.20** - Langage de programmation pour smart contracts Ethereum. Choisi pour sa maturité, sa sécurité intégrée (protection contre les overflows) et son écosystème riche.

**Hardhat 2.22.0** - Environnement de développement Ethereum professionnel. Offre un réseau local, des tests TypeScript, le debugging avec console.log dans Solidity, et une intégration complète avec les outils de l'écosystème.

**OpenZeppelin 5.0.0** - Librairies de smart contracts auditées et battle-tested. Standard de l'industrie pour les contrats sécurisés (ERC20, ERC721, AccessControl, Pausable). Utilisé par Uniswap, Aave, Compound et des milliers de projets.

**Ethers.js 6.4.0** - Librairie JavaScript/TypeScript pour interagir avec Ethereum. Légère (88KB vs 1.1MB pour Web3.js), moderne (async/await), et parfaitement intégrée avec Hardhat.

### Développement & Tests

**TypeScript 5.0.0** - Ajoute le typage statique à JavaScript pour des scripts et tests robustes. Détecte les erreurs à la compilation et améliore la maintenabilité.

**Chai 4.2.0** - Framework de tests avec une syntaxe expressive. Permet d'écrire des tests lisibles et compréhensibles.

**Hardhat Toolbox** - Plugin tout-en-un incluant ethers, chai-matchers, gas reporter, coverage et plus encore.

### Réseau

**Ethereum Sepolia Testnet** - Testnet officiel Ethereum (Chain ID: 11155111). Faucets gratuits disponibles, compatible avec tous les outils de production, parfait pour les tests avant mainnet.

---

## 🎯 Roadmap - Exigences du Projet

### ✅ 1. Tokenisation d'Actifs Réels (Complète)
**Actifs tokenisés :** Immobilier commercial et Diamants certifiés GIA

**Tokens Fongibles (ERC-20) :**
- ✅ FungibleAssetToken - Partage de propriété immobilière
- ✅ Supply cap avec métadonnées on-chain
- ✅ Scripts : `deploy-fungible.ts`, `mint-tokens.ts`

**Tokens Non-Fongibles (ERC-721) :**
- ✅ NFTAssetToken - Diamants uniques certifiés
- ✅ Valuation et certificats on-chain
- ✅ Scripts : `deploy-nft.ts`, `mint-diamond.ts`

### ✅ 2. Conformité KYC & Whitelisting/Blacklisting (Complète)
**Système KYC On-Chain :**
- ✅ KYCRegistry - Gestion complète KYC/AML
- ✅ Whitelist obligatoire pour détenir/trader les tokens
- ✅ Blacklist prioritaire (révocation même avec KYC approuvé)
- ✅ Vérifications enforced dans les hooks `_update()`
- ✅ Scripts : `deploy-kyc.ts`, `whitelist-account.ts`, `check-kyc.ts`

### ✅ 3. Trading On-Chain (Complète)
**DEX avec Pool de Liquidité :**
- ✅ SimpleDEX - AMM avec formule x*y=k (Uniswap V2)
- ✅ Pool Token/ETH avec LP tokens
- ✅ Trading limité aux adresses whitelistées
- ✅ Liquidité initiale fournie par le déployeur
- ✅ Scripts : `deploy-dex.ts`, `setup-dex-liquidity.ts`, `trade-tokens.ts`, `buy-with-account2.ts`

### ✅ 4. Indexer en Temps Réel (Complète)
**Synchronisation Blockchain → Frontend :**
- ✅ Backend indexeur déployé sur Railway (Node.js + Express)
- ✅ Monitoring automatique toutes les 60 secondes
- ✅ Indexation de TOUS les événements : Swaps, Transfers, NFTs, Oracle
- ✅ Stockage MongoDB Atlas (cloud)
- ✅ API REST exposée : `https://g9-blockchain-production-836a.up.railway.app`
- ✅ Frontend intégré avec hooks React (`useIndexer.ts`)
- ✅ Affichage temps réel dans Dashboard et DEX
- ✅ **Détection des transactions externes** (hors UI) ✨
- ✅ Test automatisé : `test-indexer-requirement.ts`
- ✅ Documentation : `PROOF-REQUIREMENT-4.md`, `docs/INDEXER-INTEGRATION.md`

**Preuves de conformité :**
```bash
# Tester l'indexeur en production
curl https://g9-blockchain-production-836a.up.railway.app/api/health

# Lancer le test automatisé (swap externe visible)
npx hardhat run scripts/test-indexer-requirement.ts --network sepolia
```

### ✅ 5. Oracle (Complète)
**Oracle de Prix On-Chain :**
- ✅ SimplePriceOracle - Prix des NFT avec historique
- ✅ Mise à jour automatique toutes les heures (ou 2 min en test)
- ✅ Variation ±20% pour simulation de marché
- ✅ Historique de 100 entrées maximum
- ✅ Scripts : `deploy-oracle.ts`, `auto-update-diamond-price.ts`, `check-prices.ts`

---

## 📚 Documentation

- 📖 **[Documentation Complète](./docs/README.md)** - Hub de documentation
- 🚀 **[Guide de Déploiement](./docs/deployment-guide.md)** - Déploiement détaillé
- 💱 **[Guide DEX](./docs/DEX-DEPLOYMENT-GUIDE.md)** - Configuration du DEX
- 📊 **[Guide Oracle](./docs/ORACLE-GUIDE.md)** - Configuration de l'Oracle
- 🛠️ **[Scripts](./scripts/README.md)** - Documentation des scripts

### Smart Contracts

- 📜 **[Documentation Contrats](./contracts/README.md)** - Vue d'ensemble des contrats
- 🔗 **[Adresses Déployées](./CONTRACTS-ADDRESSES.md)** - Toutes les adresses avec liens Etherscan

**Contrats déployés sur Sepolia :**
| Contrat | Adresse | Etherscan |
|---------|---------|-----------|
| KYCRegistry | `0x563E31...7C7D65` | [🔍 Voir](https://sepolia.etherscan.io/address/0x563E31793214F193EB7993a2bfAd2957a70C7D65) |
| RWAT Token | `0xfA451d...C9979f` | [🔍 Voir](https://sepolia.etherscan.io/address/0xfA451d9C32d15a637Ab376732303c36C34C9979f) |
| NFT V2 | `0xf16b06...2C946` | [🔍 Voir](https://sepolia.etherscan.io/address/0xf16b0641A9C56C6db30E052E90DB9358b6D2C946) |
| SimpleDEX | `0x2Cf848...3fAa98` | [🔍 Voir](https://sepolia.etherscan.io/address/0x2Cf848B370C0Ce0255C4743d70648b096D3fAa98) |
| Oracle | `0x602571...9475C7` | [🔍 Voir](https://sepolia.etherscan.io/address/0x602571F05745181fF237b81dAb8F67148e9475C7) |
| Marketplace | `0x9F057E...8013dd` | [🔍 Voir](https://sepolia.etherscan.io/address/0x9F057E253D69f6d362C63A3DB0bdff66eE8013dd) |

### API des Contrats

- 🔐 **[KYCRegistry](./docs/KYCRegistry.md)** - API du système KYC
- 🪙 **[FungibleAssetToken](./docs/FungibleAssetToken.md)** - API Token ERC-20
- 💱 **[SimpleDEX](./docs/SimpleDEX.md)** - API du DEX

---

## 👥 Équipe

**Epitech Paris - Promo 2026**  
Projet Blockchain

---

## 🔗 Liens Utiles

- 🌐 [Sepolia Etherscan](https://sepolia.etherscan.io)
- 💧 [Sepolia Faucet](https://sepoliafaucet.com)
- 📖 [Hardhat Documentation](https://hardhat.org/docs)
- 🛡️ [OpenZeppelin Documentation](https://docs.openzeppelin.com)
- 📊 [Solidity Documentation](https://docs.soliditylang.org)

---
