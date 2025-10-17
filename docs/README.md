# 📚 Documentation - Plateforme de Tokenisation d'Actifs# 📚 Documentation - Tokenized Asset Platform



Documentation complète de la plateforme blockchain de tokenisation d'actifs réels (RWA).Bienvenue dans la documentation complète de la plateforme de tokenisation d'actifs réels.



---[![Tests](https://img.shields.io/badge/tests-129%20passing-success)](../test)

[![Contracts](https://img.shields.io/badge/contracts-3%2F3-success)](../contracts)

## 📖 Guides Principaux[![Coverage](https://img.shields.io/badge/coverage-100%25%20core-brightgreen)](../test)



### 🚀 Déploiement## 📖 Table des matières

- **[Guide de Déploiement](./deployment-guide.md)** - Déploiement complet sur Sepolia

- **[Guide DEX](./DEX-DEPLOYMENT-GUIDE.md)** - Configuration et utilisation du DEX1. [Introduction](#introduction)

- **[Guide Oracle](./ORACLE-GUIDE.md)** - Configuration de l'Oracle de prix2. [Architecture du Projet](#architecture)

3. [Contrats Principaux](#contrats)

### 📘 Référence API des Contrats4. [Guides d'Utilisation](#guides)

5. [État du Projet](#état-du-projet)

- **[KYCRegistry](./KYCRegistry.md)** - API complète du système KYC

- **[FungibleAssetToken](./FungibleAssetToken.md)** - API du token ERC-20## Introduction

- **[SimpleDEX](./SimpleDEX.md)** - API du DEX

Cette plateforme permet la **tokenisation complète d'actifs réels** (immobilier, diamants, œuvres d'art, etc.) sur la blockchain Ethereum/Polygon avec **conformité KYC/AML intégrée**.

### ✅ Confirmation de Succès

### 🎯 Objectifs du Projet

- **[ORACLE-SUCCESS](./ORACLE-SUCCESS.md)** - Récapitulatif de l'implémentation Oracle

- Tokeniser des actifs réels avec conformité réglementaire

---- Supporter **deux types de tokens** : Fungible (ERC-20) et Non-Fungible (ERC-721)

- Implémenter un système KYC on-chain robuste

## 🎯 Vue d'Ensemble du Projet- Préparer l'intégration DEX et oracle



### Contrats Smart Contracts### ✅ Caractéristiques Implémentées (Phase 1 & 2)



Le projet comprend 5 contrats principaux:#### 🪙 **Tokenisation Complète**

- ✅ **Fungible Assets (ERC-20)** - Propriété fractionnée d'actifs réels

1. **KYCRegistry** - Gestion de la conformité KYC/AML  - Supply management avec plafond

2. **FungibleAssetToken** - Token ERC-20 pour actifs fractionnés  - Prix par token calculé automatiquement

3. **NFTAssetToken** - Token ERC-721 pour actifs uniques (diamants)  - Métadonnées complètes (type, description, documents)

4. **SimpleDEX** - DEX avec AMM pour trading décentralisé  - Batch minting optimisé

5. **SimplePriceOracle** - Oracle pour prix des NFTs  

- ✅ **Non-Fungible Assets (ERC-721)** - Actifs uniques tokenisés

### Déploiements Actifs (Sepolia)  - Données individuelles par asset (nom, valuation, certificat)

  - Tracking de la valeur de collection

| Contrat | Adresse | Status |  - Désactivation/réactivation d'assets

|---------|---------|--------|  - Batch minting pour plusieurs NFTs

| KYCRegistry | `0x45d12B1D...B5b8` | ✅ Vérifié |

| FungibleAssetToken | `0x6B2a38Ef...2Eb81` | ✅ Vérifié |#### 🔐 **Conformité KYC/AML**

| NFTAssetToken | `0xcC1fA977...2362c` | ✅ Vérifié |- ✅ **Système KYC Complet**

| SimpleDEX | `0x28B2c6b3...E7F4` | ✅ Vérifié |  - Soumission de documents KYC

| SimplePriceOracle | `0x602571F0...75C7` | ✅ Vérifié |  - Processus d'approbation avec expiration

  - Révocation et rejet

---  - Batch approval pour plusieurs utilisateurs

  

## 🔧 Configuration Requise- ✅ **Whitelist & Blacklist**

  - Whitelist : Seules les adresses KYC approuvées peuvent trader

### Variables d'Environnement  - Blacklist : Révocation immédiate (prioritaire sur whitelist)

  - Enforcement on-chain dans `_update()` hooks

```env

# Wallet (ne JAMAIS commit!)#### 🛡️ **Sécurité & Contrôle**

PRIVATE_KEY=your_private_key- ✅ **Access Control** - Rôles granulaires (ADMIN, MINTER, PAUSER, KYC_ADMIN)

PRIVATE_KEY_2=your_second_private_key  # Optionnel- ✅ **Pausable** - Arrêt d'urgence des transferts

- ✅ **Burnable** - Destruction de tokens par les détenteurs

# RPC Provider- ✅ **Custom Errors** - Gestion d'erreurs gas-efficient

ALCHEMY_API_KEY=your_alchemy_api_key- ✅ **Event Emissions** - Audit trail complet



# Contract Verification#### 🧪 **Qualité & Tests**

ETHERSCAN_API_KEY=your_etherscan_api_key- ✅ **129 tests passants** (0 échecs)

```- ✅ **100% coverage** des fonctions critiques

- ✅ **Edge cases** couverts

### Prérequis Système- ✅ **Integration scenarios** testés



- Node.js >= 18.0.0## Architecture

- npm >= 9.0.0

- Git```

- MetaMask ou wallet Web3┌───────────────────────────────────────────────────────────────┐

│                    TOKENIZATION LAYER                         │

---├───────────────────────────────────────────────────────────────┤

│                                                               │

## 💡 Commandes Rapides│  ┌────────────────────────────┐  ┌─────────────────────────┐ │

│  │  FungibleAssetToken        │  │  NFTAssetToken          │ │

```bash│  │  (ERC-20)                  │  │  (ERC-721)              │ │

# Tests│  │                            │  │                         │ │

npx hardhat test                                    # Tous les tests (168)│  │ • Propriété fractionnée    │  │ • Actifs uniques        │ │

npx hardhat test test/SimpleDEX.test.ts            # Test spécifique│  │ • Supply cap               │  │ • Asset data tracking   │ │

│  │ • Prix/token calculé       │  │ • Valuation updates     │ │

# Déploiement│  │ • Batch minting            │  │ • Certificate URIs      │ │

npx hardhat run scripts/deploy-all.ts --network sepolia│  │ • Burn & Pause             │  │ • Collection value      │ │

npx hardhat run scripts/deploy-oracle.ts --network sepolia│  └─────────────┬──────────────┘  └───────────┬─────────────┘ │

│                │                              │               │

# Monitoring│                └──────────────┬───────────────┘               │

npx hardhat run scripts/check-prices.ts --network sepolia│                               │                               │

npx hardhat run scripts/check-accounts-status.ts --network sepolia└───────────────────────────────┼───────────────────────────────┘

                                │

# Trading                                │ Vérifie KYC/Whitelist/Blacklist

npx hardhat run scripts/trade-tokens.ts --network sepolia                                ▼

```┌───────────────────────────────────────────────────────────────┐

│                    COMPLIANCE LAYER                           │

---├───────────────────────────────────────────────────────────────┤

│                                                               │

## 📊 Statistiques du Projet│                      KYCRegistry                              │

│                                                               │

- **168 tests** unitaires (100% passing)│  • Soumission KYC (documents IPFS)                           │

- **5 contrats** déployés et vérifiés│  • Approbation avec expiration                               │

- **2,000+ lignes** de Solidity│  • Révocation & Rejet                                        │

- **17 scripts** utilitaires│  • Whitelist (KYC approuvé + non expiré)                    │

- **100% coverage** des fonctions critiques│  • Blacklist (priorité sur whitelist)                       │

│  • Batch operations                                          │

---│  • Role-based access (KYC_ADMIN)                            │

│                                                               │

## 🔗 Liens Utiles└───────────────────────────────────────────────────────────────┘

```

- [README Principal](../README.md)

- [Scripts Documentation](../scripts/README.md)### Flux de Transfer

- [Sepolia Etherscan](https://sepolia.etherscan.io)

- [Alchemy Dashboard](https://dashboard.alchemy.com)```mermaid

graph TD

---    A[User A veut transférer] --> B{Blacklist?}

    B -->|Oui| C[❌ Revert: SenderBlacklisted]

**Documentation mise à jour:** 17 Octobre 2025    B -->|Non| D{Whitelist?}

    D -->|Non| E[❌ Revert: SenderNotWhitelisted]
    D -->|Oui| F{Recipient Blacklist?}
    F -->|Oui| G[❌ Revert: RecipientBlacklisted]
    F -->|Non| H{Recipient Whitelist?}
    H -->|Non| I[❌ Revert: RecipientNotWhitelisted]
    H -->|Oui| J[✅ Transfer Success]
```

## Contrats

### 1. [KYCRegistry](./KYCRegistry.md) ✅
**Gestion centralisée de la conformité KYC/AML**

- 📄 ~300 lignes de code
- ✅ 87 tests passants
- 🔐 Rôles: DEFAULT_ADMIN_ROLE, KYC_ADMIN_ROLE
- 🌐 Déployé sur Sepolia: `0xD1FbE41b66f3215ebE1c2703d9f8450De23F7446`

**Fonctions principales:**
- `submitKYC()`, `approveKYC()`, `rejectKYC()`, `revokeKYC()`
- `blacklistAddress()`, `removeFromBlacklist()`
- `batchApproveKYC()`
- `isWhitelisted()`, `isBlacklisted()`, `canTransfer()`

### 2. [FungibleAssetToken](./FungibleAssetToken.md) ✅
**Token ERC-20 pour actifs fractionnés**

- 📄 ~350 lignes de code
- ✅ 36 tests passants
- 🔐 Rôles: ADMIN_ROLE, MINTER_ROLE, PAUSER_ROLE
- 🌐 Déployé sur Sepolia: `0x8B5927CBBb1AE0eA68577b7bBe60318F8CE09eE4`

**Fonctions principales:**
- `mint()`, `batchMint()`, `burn()`, `burnFrom()`
- `pause()`, `unpause()`
- `updateDocumentURI()`
- `pricePerToken()`, `ownershipPercentage()`, `canMint()`

### 3. NFTAssetToken ✅
**Token ERC-721 pour actifs uniques**

- 📄 ~390 lignes de code
- ✅ 106 tests passants
- 🔐 Rôles: ADMIN_ROLE, MINTER_ROLE, PAUSER_ROLE
- 🌐 Exemple déployé sur Sepolia (voir deployments/)

**Fonctions principales:**
- `mintAsset()`, `batchMintAssets()`
- `updateValuation()`, `updateTokenURI()`
- `deactivateAsset()`, `reactivateAsset()`
- `tokensOfOwner()`, `totalCollectionValue()`, `totalValueOf()`

## Guides

### 🚀 Démarrage Rapide
- [Guide de Déploiement](./deployment-guide.md) - Déployer sur Sepolia/Amoy
- [Guide d'Utilisation](./usage-guide.md) - Utiliser les contrats
- [Vérification Automatique](./auto-verification.md) - Vérifier sur Etherscan

### 📚 Référence
- [Structure du Projet](./STRUCTURE.md) - Organisation du code
- [FAQ](./faq.md) - Questions fréquentes

## État du Projet

### ✅ Phase 1-2: Smart Contracts & Compliance (COMPLET)

| Feature | Status | Progress |
|---------|--------|----------|
| KYCRegistry | ✅ Complet | 100% |
| FungibleAssetToken | ✅ Complet | 100% |
| NFTAssetToken | ✅ Complet | 100% |
| Tests | ✅ 129 passing | 100% |
| Deployment Scripts | ✅ Complet | 100% |
| Documentation | ✅ Complet | 100% |
| Testnet Deployment | ✅ Sepolia | 100% |
| Contract Verification | ✅ Etherscan | 100% |

### ⏳ Phase 3: Trading (TODO)

| Feature | Status | Progress |
|---------|--------|----------|
| Uniswap Integration | ⏳ À faire | 0% |
| Liquidity Pool | ⏳ À faire | 0% |
| KYC-Compliant DEX | ⏳ À faire | 0% |

### ⏳ Phase 4: Indexer & API (TODO)

| Feature | Status | Progress |
|---------|--------|----------|
| Event Listener | ⏳ À faire | 0% |
| Database | ⏳ À faire | 0% |
| REST API | ⏳ À faire | 0% |

### ⏳ Phase 5: Oracle & Frontend (TODO)

| Feature | Status | Progress |
|---------|--------|----------|
| Price Oracle | ⏳ À faire | 0% |
| React Frontend | ⏳ À faire | 0% |
| Wallet Integration | ⏳ À faire | 0% |

## Technologies Utilisées

| Technologie | Version | Utilisation |
|-------------|---------|-------------|
| **Solidity** | ^0.8.20 | Smart contracts |
| **Hardhat** | ^2.22.0 | Dev environment |
| **OpenZeppelin** | ^5.0.0 | Librairies sécurisées |
| **TypeScript** | ~5.0.0 | Tests & scripts |
| **Ethers.js** | ^6.4.0 | Blockchain interaction |
| **Chai** | ^4.2.0 | Testing framework |

## Réseaux Supportés

| Réseau | Chain ID | Status | Explorer |
|--------|----------|--------|----------|
| **Ethereum Sepolia** | 11155111 | ✅ Actif | [Etherscan](https://sepolia.etherscan.io/) |
| **Polygon Amoy** | 80002 | ✅ Actif | [PolygonScan](https://amoy.polygonscan.com/) |
| **Hardhat Network** | 31337 | ✅ Local | - |
| ~~Polygon Mumbai~~ | ~~80001~~ | ❌ Déprécié | - |

## Statistiques du Projet

```
📊 Smart Contracts:     3 contrats déployés
🧪 Tests:               129 tests passants (0 échecs)
📝 Documentation:       7 fichiers de docs
🔐 Security:            OpenZeppelin audited libs
⛓️  Networks:           2 testnets + 1 local
✅ Verification:        100% verified on Etherscan
```

## Licence

MIT License - Epitech Project 2025-2026
