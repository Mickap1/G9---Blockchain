# 🏗️ Plateforme de Tokenisation d'Actifs Réels (RWA)# 🏗️ Plateforme de Tokenisation d'Actifs Réels (RWA)



> Système blockchain complet pour la tokenisation d'actifs réels avec conformité KYC, DEX intégré et Oracle de prix automatisé.> Système blockchain complet pour la tokenisation d'actifs réels avec conformité KYC, DEX intégré et Oracle de prix automatisé.



**Projet Blockchain Epitech 2025-2026****Projet Blockchain Epitech 2025-2026**



[![Tests](https://img.shields.io/badge/tests-168%20passing-success)](./test)[![Tests](https://img.shields.io/badge/tests-168%20passing-success)](./test)

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org/)[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue)](https://soliditylang.org/)

[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.0-yellow)](https://hardhat.org/)[![Hardhat](https://img.shields.io/badge/Hardhat-2.22.0-yellow)](https://hardhat.org/)

[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.0.0-purple)](https://www.openzeppelin.com/)[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.0.0-purple)](https://www.openzeppelin.com/)



------



## 🎯 Vue d'Ensemble## 🎯 Vue d'Ensemble



Cette plateforme permet de **tokeniser des actifs réels** (immobilier, diamants, œuvres d'art) sur la blockchain avec:Cette plateforme permet de **tokeniser des actifs réels** (immobilier, diamants, œuvres d'art) sur la blockchain avec:



- 🪙 **Tokens Fongibles (ERC-20)** - Propriété fractionnée d'actifs- 🪙 **Tokens Fongibles (ERC-20)** - Propriété fractionnée d'actifs

- 💎 **Tokens NFT (ERC-721)** - Actifs uniques (diamants GIA)- 💎 **Tokens NFT (ERC-721)** - Actifs uniques (diamants GIA)

- 🔐 **Système KYC On-Chain** - Conformité réglementaire- � **Système KYC On-Chain** - Conformité réglementaire

- 💱 **DEX Intégré** - Trading décentralisé avec pool de liquidité- 💱 **DEX Intégré** - Trading décentralisé avec pool de liquidité

- 📊 **Oracle de Prix** - Mise à jour automatique des valuations NFT- 📊 **Oracle de Prix** - Mise à jour automatique des valuations NFT



---### ✅ Completed Features (Phase 1, 2 & 3) - 60% Complete 🎯



## ✅ Fonctionnalités Implémentées#### 🪙 **Tokenization** (100% Complete)

- ✅ **Fungible Assets (ERC-20)**: FungibleAssetToken with supply management, pricing, and metadata

### 🪙 Tokenisation (100%)- ✅ **Non-Fungible Assets (ERC-721)**: NFTAssetToken with individual asset tracking and valuation

- ✅ **FungibleAssetToken** - ERC-20 avec supply cap et métadonnées- ✅ **Batch Operations**: Efficient batch minting for both token types

- ✅ **NFTAssetToken** - ERC-721 pour diamants certifiés GIA- ✅ **Asset Metadata**: Complete on-chain data (name, valuation, certificates, dates)

- ✅ Batch minting pour les deux types

- ✅ Burn, pause, et gestion des rôles#### 🔐 **On-Chain KYC & Compliance** (100% Complete)

- ✅ **KYC System**: Submission, approval, rejection, and expiration management

### 🔐 Conformité KYC (100%)- ✅ **Whitelist**: Only approved addresses can hold/trade tokens

- ✅ **KYCRegistry** - Système d'approbation/révocation- ✅ **Blacklist**: Revoke access even with approved KYC (security priority)

- ✅ Whitelist avec expiration- ✅ **Transfer Enforcement**: KYC checks enforced in `_update()` hook

- ✅ Blacklist prioritaire (sécurité)- ✅ **Role-Based Access**: Separate roles for KYC admin, minter, pauser

- ✅ Transferts bloqués sans KYC

#### 🛡️ **Security & Safety**

### 💱 Trading DEX (100%)- ✅ **Pausable Transfers**: Emergency pause for both token types

- ✅ **SimpleDEX** - AMM avec formule x*y=k- ✅ **Access Control**: OpenZeppelin's battle-tested AccessControl

- ✅ Pool de liquidité Token/ETH- ✅ **Blacklist Priority**: Blacklist checked before whitelist (security first)

- ✅ Swap avec protection slippage- ✅ **Custom Errors**: Gas-efficient error handling

- ✅ Fees 0.3% redistribués aux LP- ✅ **Event Emissions**: Complete audit trail for all operations

- ✅ KYC obligatoire pour trader

#### 🧪 **Testing & Quality** (168 Tests Passing)

### 📊 Oracle de Prix (100%)- ✅ **KYCRegistry**: 87 comprehensive tests

- ✅ **SimplePriceOracle** - Prix on-chain pour NFTs- ✅ **FungibleAssetToken**: 36 tests covering all scenarios

- ✅ Historique des prix (max 100 entrées)- ✅ **NFTAssetToken**: 106 tests including edge cases and integration

- ✅ Mise à jour automatique (script en boucle)- ✅ **SimpleDEX**: 39 tests for trading and liquidity

- ✅ Variation aléatoire ±20% pour simulation- ✅ **100% Core Functionality Coverage**

- ✅ Rôles d'administration sécurisés

#### � **On-Chain DEX Trading** (100% Complete) ✨ NEW

### 🧪 Tests (168 tests)- ✅ **SimpleDEX Contract**: Custom AMM with KYC enforcement

- ✅ KYCRegistry - 87 tests- ✅ **Constant Product Formula**: x * y = k (Uniswap v2 style)

- ✅ FungibleAssetToken - 36 tests- ✅ **Liquidity Pools**: Token/ETH pools with LP tokens

- ✅ NFTAssetToken - 106 tests- ✅ **Trading Fees**: 0.3% fee distributed to liquidity providers

- ✅ SimpleDEX - 39 tests- ✅ **KYC-Compliant**: Only whitelisted users can trade/provide liquidity

- ✅ 100% coverage des fonctions critiques- ✅ **Slippage Protection**: Min output parameters on all swaps

- ✅ **Security**: ReentrancyGuard, Pausable, role-based access

---

### 🚧 Remaining Work (Phase 4-5)

## 🚀 Démarrage Rapide

#### 🔄 **Real-Time Indexer** (Not Started)

### 1. Installation- ⏳ Event Listener Backend

- ⏳ Database Synchronization

```bash- ⏳ API for Frontend

# Cloner le repo

git clone <votre-repo>#### 🌐 **Price Oracle** (Not Started)

cd G9---Blockchain- ⏳ Asset Price Feeds

- ⏳ On-Chain Price Updates

# Installer les dépendances---

npm install

## 📋 Project Overview

# Configurer l'environnement

cp .env.example .envThis platform enables the tokenization of real-world assets such as real estate, artwork, and precious commodities. It implements:

# Éditer .env avec vos clés

```- ✅ **Tokenization** of fungible (ERC-20) assets with KYC compliance

- ✅ **On-chain KYC & Compliance** with whitelisting/blacklisting mechanisms

### 2. Compilation et Tests- ✅ **Role-based Access Control** for secure operations

- ✅ **Pausable Transfers** for emergency situations

```bash- ✅ **Comprehensive Testing** with 87 unit tests

# Compiler les contrats

npx hardhat compile---



# Lancer tous les tests## 🛠️ Technology Stack

npx hardhat test

### Blockchain & Smart Contracts

# Tests avec coverage

npm run test:coverage| Technology | Version | Purpose |

```|------------|---------|---------|

| **Solidity** | ^0.8.20 | Smart contract programming language |

### 3. Déploiement sur Sepolia| **Hardhat** | ^2.22.0 | Ethereum development environment |

| **OpenZeppelin** | ^5.0.0 | Secure, audited smart contract libraries |

```bash| **Ethers.js** | ^6.4.0 | Ethereum library for JavaScript/TypeScript |

# Déployer tous les contrats de base

npx hardhat run scripts/deploy-all.ts --network sepolia### Development Tools



# Déployer le DEX| Technology | Version | Purpose |

npx hardhat run scripts/deploy-dex.ts --network sepolia|------------|---------|---------|

| **TypeScript** | ~5.0.0 | Type-safe development |

# Déployer l'Oracle| **Chai** | ^4.2.0 | Testing framework |

npx hardhat run scripts/deploy-oracle.ts --network sepolia| **Hardhat Toolbox** | ^5.0.0 | All-in-one plugin for Hardhat |

| **Solidity Coverage** | ^0.8.0 | Code coverage for smart contracts |

# Minter un Diamond NFT| **Hardhat Gas Reporter** | ^1.0.8 | Gas usage analysis |

npx hardhat run scripts/mint-diamond.ts --network sepolia

```### Blockchain Networks



### 4. Lancer l'Oracle (Auto-Update)| Network | Chain ID | Purpose | Status |

|---------|----------|---------|--------|

```bash| **Ethereum Sepolia** | 11155111 | Primary testnet deployment | ✅ Active |

# Mode test (updates toutes les 2 minutes)| **Polygon Amoy** | 80002 | Alternative testnet | ✅ Active |

npx hardhat run scripts/auto-update-diamond-price.ts --network sepolia| **Hardhat Network** | 31337 | Local development & testing | ✅ Active |

| ~~**Polygon Mumbai**~~ | ~~80001~~ | ~~Deprecated~~ | ❌ Sunset |

# Pour production: éditer le fichier et changer UPDATE_INTERVAL à 1 heure

```> **Note**: Mumbai testnet was deprecated in April 2024. All deployments migrated to Amoy.



------



## 📦 Structure du Projet## 📦 Project Structure



``````

G9---Blockchain/G-ING-910-PAR-9-1-blockchain-14/

├── contracts/                          # Smart contracts Solidity│

│   ├── KYCregistry.sol                # Système KYC├── contracts/                      # ✅ Solidity smart contracts

│   ├── FungibleAssetToken.sol         # Token ERC-20│   ├── KYCregistry.sol            # ✅ KYC & compliance management

│   ├── NFTAssetToken.sol              # Token ERC-721 (Diamonds)│   ├── FungibleAssetToken.sol     # ✅ ERC-20 for fractional assets

│   ├── SimpleDEX.sol                  # DEX avec AMM│   └── NFTAssetToken.sol          # ✅ ERC-721 for unique assets

│   └── SimplePriceOracle.sol          # Oracle de prix│

│├── test/                           # ✅ Test files (TypeScript)

├── scripts/                            # Scripts de déploiement et utilitaires│   ├── KYCRegistry.test.ts        # ✅ 87 tests passing

│   ├── deploy-*.ts                    # Scripts de déploiement│   ├── FungibleAssetToken.test.ts # ✅ 36 tests passing

│   ├── mint-diamond.ts                # Minter un NFT Diamond│   └── NFTAssetToken.test.ts      # ✅ 106 tests passing

│   ├── auto-update-diamond-price.ts   # Auto-update prix (loop)│

│   ├── check-prices.ts                # Consulter les prix├── scripts/                        # ✅ Deployment & utility scripts

│   ├── trade-tokens.ts                # Trading multi-wallet│   ├── deploy-kyc.ts              # ✅ Deploy KYCRegistry individually

│   └── README.md                      # Documentation des scripts│   ├── deploy-fungible.ts         # ✅ Deploy FungibleAssetToken individually

││   ├── deploy-nft.ts              # ✅ Deploy NFTAssetToken individually

├── test/                               # Tests unitaires (168 tests)│   ├── deploy-all.ts              # ✅ Deploy all contracts at once

│   ├── KYCRegistry.test.ts│   ├── deploy-testnet.ts          # ✅ Legacy deployment script

│   ├── FungibleAssetToken.test.ts│   ├── deploy-nft-demo.ts         # ✅ Deploy NFT demo with sample assets

│   ├── NFTAssetToken.test.ts│   └── README.md                  # ✅ Deployment scripts documentation

│   └── SimpleDEX.test.ts│

│├── deployments/                    # ✅ Deployed contract addresses

├── docs/                               # Documentation│   ├── sepolia-addresses.json     # ✅ Sepolia testnet deployments

│   ├── deployment-guide.md            # Guide de déploiement complet│   └── sepolia-nft-demo.json      # ✅ NFT demo deployment info

│   ├── DEX-DEPLOYMENT-GUIDE.md        # Guide DEX│

│   ├── SimpleDEX.md                   # API du DEX├── docs/                           # ✅ Complete documentation

│   ├── ORACLE-GUIDE.md                # Guide Oracle│   ├── README.md                  # ✅ Documentation hub

│   ├── KYCRegistry.md                 # API KYC│   ├── quick-deployment.md        # ✅ Quick start deployment guide

│   └── FungibleAssetToken.md          # API Token Fongible│   ├── deployment-guide.md        # ✅ Detailed deployment guide

││   ├── usage-guide.md             # ✅ How to use contracts

├── deployments/                        # Adresses des contrats déployés│   ├── auto-verification.md       # ✅ Contract verification guide

│   └── sepolia-addresses.json│   ├── faq.md                     # ✅ FAQ

││   ├── KYCRegistry.md             # ✅ KYC API docs

└── hardhat.config.ts                   # Configuration Hardhat│   ├── FungibleAssetToken.md      # ✅ Fungible token API docs

```│   └── STRUCTURE.md               # ✅ Project structure

│

---├── artifacts/                      # 🔧 Compiled contracts (generated)

├── cache/                          # 🔧 Hardhat cache (generated)

## 📝 Contrats Déployés sur Sepolia├── typechain-types/                # 🔧 TypeScript types (generated)

│

| Contrat | Adresse | Etherscan |├── hardhat.config.ts               # ✅ Hardhat configuration

|---------|---------|-----------|├── tsconfig.json                   # ✅ TypeScript configuration

| **KYCRegistry** | `0x45d12B1D574608a98C7b6E7023330AF260b0B5b8` | [View](https://sepolia.etherscan.io/address/0x45d12B1D574608a98C7b6E7023330AF260b0B5b8) |├── package.json                    # ✅ Dependencies & scripts

| **FungibleAssetToken** | `0x6B2a38Ef30420B0AF041F014a092BEDB39F2Eb81` | [View](https://sepolia.etherscan.io/address/0x6B2a38Ef30420B0AF041F014a092BEDB39F2Eb81) |├── .env.example                    # ✅ Environment variables template

| **NFTAssetToken** | `0xcC1fA977E3c47D3758117De61218208c1282362c` | [View](https://sepolia.etherscan.io/address/0xcC1fA977E3c47D3758117De61218208c1282362c) |└── README.md                       # ✅ This file

| **SimpleDEX** | `0x28B2c6b3C1C9F09ca86e6B7cc8d0b9f0Bd7CE7F4` | [View](https://sepolia.etherscan.io/address/0x28B2c6b3C1C9F09ca86e6B7cc8d0b9f0Bd7CE7F4) |```

| **SimplePriceOracle** | `0x602571F05745181fF237b81dAb8F67148e9475C7` | [View](https://sepolia.etherscan.io/address/0x602571F05745181fF237b81dAb8F67148e9475C7) |

---

**Tous les contrats sont vérifiés et accessibles sur Etherscan** ✅

## ⚡ Quick Start

---

Deploy all contracts to Sepolia testnet in 3 steps:

## 🛠️ Stack Technique

```bash

| Technologie | Version | Usage |# 1. Install dependencies

|------------|---------|-------|npm install

| **Solidity** | 0.8.20 | Smart contracts |

| **Hardhat** | 2.22.0 | Environnement de développement |# 2. Configure environment (add your keys to .env)

| **OpenZeppelin** | 5.0.0 | Librairies sécurisées auditées |cp .env.example .env

| **Ethers.js** | 6.4.0 | Interaction blockchain |

| **TypeScript** | 5.0.0 | Scripts et tests |# 3. Deploy everything

| **Chai** | 4.2.0 | Framework de tests |npm run deploy:all:sepolia

```

**Réseau:** Ethereum Sepolia Testnet (Chain ID: 11155111)

**That's it!** Your contracts are now deployed and verified. See [`docs/quick-deployment.md`](docs/quick-deployment.md) for details.

---

---

## 💡 Commandes Utiles

## 🚀 Getting Started

### Déploiement

```bash### Prerequisites

# Tout déployer en une commande

npx hardhat run scripts/deploy-all.ts --network sepoliaBefore you begin, ensure you have the following installed:



# Déploiement individuel- **Node.js** >= 18.0.0 ([Download](https://nodejs.org/))

npx hardhat run scripts/deploy-kyc.ts --network sepolia- **npm** >= 9.0.0 (comes with Node.js)

npx hardhat run scripts/deploy-fungible.ts --network sepolia- **Git** ([Download](https://git-scm.com/))

npx hardhat run scripts/deploy-nft.ts --network sepolia- **MetaMask** or another Web3 wallet ([Install](https://metamask.io/))

npx hardhat run scripts/deploy-dex.ts --network sepolia

npx hardhat run scripts/deploy-oracle.ts --network sepolia### Installation

```

1. **Clone the repository**

### Configuration & Monitoring

```bash```bash

# Whitelist une adressegit clone https://github.com/EpitechPGE45-2025/G-ING-910-PAR-9-1-blockchain-14.git

npx hardhat run scripts/whitelist-account.ts --network sepoliacd G-ING-910-PAR-9-1-blockchain-14

```

# Vérifier le statut des comptes

npx hardhat run scripts/check-accounts-status.ts --network sepolia2. **Install dependencies**



# Consulter les prix dans l'Oracle```bash

npx hardhat run scripts/check-prices.ts --network sepolianpm install

```

# Vérifier le solde Sepolia

npx hardhat run scripts/check-sepolia-balance.ts --network sepolia3. **Configure environment variables**

```

```bash

### DEX Trading# Copy the example file

```bashcp .env.example .env

# Ajouter de la liquidité

npx hardhat run scripts/setup-dex-liquidity.ts --network sepolia# Edit .env with your values

```

# Acheter des tokens (Account 2)

npx hardhat run scripts/buy-with-account2.ts --network sepoliaRequired environment variables:

```env

# Trading complet (2 comptes)PRIVATE_KEY=your_wallet_private_key_here

npx hardhat run scripts/trade-tokens.ts --network sepoliaINFURA_API_KEY=your_infura_api_key_here

```ETHERSCAN_API_KEY=your_etherscan_api_key_here

POLYGONSCAN_API_KEY=your_polygonscan_api_key_here

### Tests```

```bash

# Tous les tests> ⚠️ **Security:** Never commit your `.env` file. Use testnet wallets only.

npx hardhat test

4. **Compile smart contracts**

# Test spécifique

npx hardhat test test/SimpleDEX.test.ts```bash

npm run compile

# Avec gas reporter```

npm run test:gas

Expected output:

# Avec coverage```

npm run test:coverage✨ Compiled X Solidity files successfully

``````



------



## 📊 Exemple d'Utilisation## 🧪 Testing



### 1. Minter un Diamond NFT### ✅ Current Test Status: **129 Tests Passing** (4s)



```bash| Contract | Tests | Status |

npx hardhat run scripts/mint-diamond.ts --network sepolia|----------|-------|--------|

```| **KYCRegistry** | 87 | ✅ All passing |

| **FungibleAssetToken** | 36 | ✅ All passing |

**Résultat:**| **NFTAssetToken** | 106 | ✅ All passing |

- 💎 Token ID: 0| **Total** | **229** | **✅ 100%** |

- 📝 Nom: "GIA Diamond 2.5ct VS1 D"

- 💰 Valuation: 150,000 EUR### Run all tests

- 🔗 Transaction confirmée sur Etherscan

```bash

### 2. Consulter le Prixnpm test

# or

```bashnpx hardhat test

npx hardhat run scripts/check-prices.ts --network sepolia```

```

Expected output:

**Affiche:**```

- Prix actuel dans l'Oracle  129 passing (4s)

- Historique des variations```

- Dernier update timestamp

- Nombre total d'updates### Run tests with coverage



### 3. Auto-Update du Prix (Simulation Marché)```bash

npm run test:coverage

```bash```

# Lance le script en boucle infinie

npx hardhat run scripts/auto-update-diamond-price.ts --network sepolia### Run tests with gas reporting

```

```bash

**Ce script:**npm run test:gas

- ⏱️ Update toutes les 2 minutes (mode test) ou 1 heure (production)```

- 🎲 Génère variation aléatoire entre -20% et +20%

- 💾 Sauvegarde dans l'Oracle ET le contrat NFT### Test a specific contract

- ♾️ Tourne indéfiniment jusqu'à Ctrl+C

```bash

---npx hardhat test test/KYCRegistry.test.ts           # 87 tests

npx hardhat test test/FungibleAssetToken.test.ts    # 36 tests

## 🔐 Sécuriténpx hardhat test test/NFTAssetToken.test.ts         # 106 tests

```

### Fonctionnalités de Sécurité

### Test Features Coverage

- ✅ **OpenZeppelin Audited** - Tous les contrats utilisent des librairies auditées

- ✅ **Access Control** - Rôles séparés (ADMIN, MINTER, PAUSER, ORACLE_ADMIN)✅ **KYCRegistry.test.ts**

- ✅ **ReentrancyGuard** - Protection contre les attaques de réentrabilité- Deployment & initialization

- ✅ **Pausable** - Fonction d'urgence pour stopper les transferts- KYC submission, approval, rejection

- ✅ **Blacklist Priority** - Blacklist vérifié AVANT whitelist- Whitelist & blacklist management

- ✅ **Custom Errors** - Économie de gas et messages clairs- Batch operations

- Role management

### Configuration .env- Edge cases & events

- Integration scenarios

```env

# Clé privée du deployer (JAMAIS commit sur Git!)✅ **FungibleAssetToken.test.ts**

PRIVATE_KEY=your_private_key_here- ERC-20 standard compliance

- KYC-enforced transfers

# Clé privée du second compte (optionnel)- Minting with supply limits

PRIVATE_KEY_2=your_second_private_key- Batch minting

- Burning & pausable

# RPC Provider (Alchemy recommandé)- Price per token calculations

ALCHEMY_API_KEY=your_alchemy_key- Ownership percentages



# Verification des contrats✅ **NFTAssetToken.test.ts**

ETHERSCAN_API_KEY=your_etherscan_key- ERC-721 standard compliance

```- Unique asset minting

- Asset data tracking (valuation, certificates)

⚠️ **IMPORTANT:** Ne JAMAIS commit le fichier `.env` (déjà dans `.gitignore`)- Batch minting

- KYC-enforced transfers

---- Blacklist priority tests

- Admin functions (valuation updates, deactivation)

## 📚 Documentation Détaillée- View functions (tokensOfOwner, collection value)

- Integration scenarios

- 📖 **[Guide de Déploiement](./docs/deployment-guide.md)** - Déploiement pas à pas

- 💱 **[Guide DEX](./docs/DEX-DEPLOYMENT-GUIDE.md)** - Utilisation du DEX---

- 📊 **[Guide Oracle](./docs/ORACLE-GUIDE.md)** - Configuration de l'Oracle

- 🔐 **[API KYCRegistry](./docs/KYCRegistry.md)** - Référence API KYC## 🌐 Deployment

- 🪙 **[API FungibleToken](./docs/FungibleAssetToken.md)** - Référence API Token

- 💱 **[API SimpleDEX](./docs/SimpleDEX.md)** - Référence API DEX### Deployment Scripts

- 🛠️ **[Scripts README](./scripts/README.md)** - Documentation des scripts

We provide **4 deployment scripts** for maximum flexibility:

---

#### 🔹 Individual Contract Deployment

## 🎯 Roadmap

Deploy contracts one by one:

### ✅ Phase 1 - Tokenisation (Complète)

- ✅ KYCRegistry```bash

- ✅ FungibleAssetToken (ERC-20)# Deploy KYCRegistry

- ✅ NFTAssetToken (ERC-721)npm run deploy:kyc:sepolia        # Ethereum Sepolia

npm run deploy:kyc:amoy           # Polygon Amoy

### ✅ Phase 2 - Tests & Déploiement (Complète)

- ✅ 168 tests unitaires# Deploy FungibleAssetToken (requires KYC)

- ✅ Déploiement Sepolianpm run deploy:fungible:sepolia

- ✅ Vérification Etherscannpm run deploy:fungible:amoy



### ✅ Phase 3 - Trading & Oracle (Complète)# Deploy NFTAssetToken (requires KYC)

- ✅ SimpleDEX avec AMMnpm run deploy:nft:sepolia

- ✅ Pool de liquiditénpm run deploy:nft:amoy

- ✅ SimplePriceOracle```

- ✅ Auto-update des prix

#### 🚀 All-in-One Deployment

### ⏳ Phase 4 - Indexer & API (À venir)

- ⏳ Backend d'écoute d'eventsDeploy all 3 contracts with a single command:

- ⏳ Base de données (PostgreSQL)

- ⏳ API REST pour frontend```bash

# Deploys: KYCRegistry → FungibleAssetToken → NFTAssetToken

### ⏳ Phase 5 - Frontend (À venir)npm run deploy:all:sepolia

- ⏳ Interface React/Next.jsnpm run deploy:all:amoy

- ⏳ Connexion MetaMask```

- ⏳ Dashboard de gestion d'actifs

#### 🎨 Demo Deployment

---

Deploy with sample NFTs for testing:

## 🤝 Contribution

```bash

Projet académique Epitech. Contributions bienvenues pour:npm run deploy:demo:sepolia

- 🐛 Corrections de bugsnpm run deploy:demo:amoy

- 📝 Améliorations de documentation```

- ✨ Nouvelles fonctionnalités

- 🧪 Tests supplémentaires### Deployment Features



---All deployment scripts include:

- ✅ Automatic contract verification on Etherscan/PolygonScan

## 📜 Licence- ✅ Role assignment (ADMIN, MINTER, PAUSER)

- ✅ Comprehensive deployment summary

Projet développé dans le cadre du cursus Epitech.- ✅ Save deployment info to `deployments/*.json`

- ✅ Network detection and explorer URLs

---- ✅ Post-deployment instructions



## 👥 Équipe📚 **Detailed guides:**

- Quick start: [`docs/quick-deployment.md`](docs/quick-deployment.md)

**Epitech Paris - Promo 2026**  - Full guide: [`docs/deployment-guide.md`](docs/deployment-guide.md)

Projet Blockchain de Fin d'Études- Scripts docs: [`scripts/README.md`](scripts/README.md)



---### ✅ Successfully Deployed Contracts



## 🔗 Liens Utiles#### **Ethereum Sepolia Testnet**



- 🌐 [Sepolia Etherscan](https://sepolia.etherscan.io)| Contract | Address | Verification |

- 💧 [Sepolia Faucet](https://sepoliafaucet.com)|----------|---------|--------------|

- 📖 [Hardhat Docs](https://hardhat.org/docs)| **KYCRegistry** | `0xD1FbE41b66f3215ebE1c2703d9f8450De23F7446` | ✅ [View on Etherscan](https://sepolia.etherscan.io/address/0xD1FbE41b66f3215ebE1c2703d9f8450De23F7446) |

- 🛡️ [OpenZeppelin Docs](https://docs.openzeppelin.com)| **FungibleAssetToken** | `0x8B5927CBBb1AE0eA68577b7bBe60318F8CE09eE4` | ✅ [View on Etherscan](https://sepolia.etherscan.io/address/0x8B5927CBBb1AE0eA68577b7bBe60318F8CE09eE4) |

- 📊 [Solidity Docs](https://docs.soliditylang.org)| **NFTAssetToken** | See `deployments/` folder | ✅ Verified |



---All contracts are **verified and readable** on Etherscan!



**Construit avec ❤️ pour Epitech Blockchain Project**### Local Development


```bash
# Start a local Hardhat node
npm run node

# In another terminal, deploy to local network
npm run deploy:local
```

### Testnet Deployment

#### 🔷 Ethereum Sepolia (Recommended)

1. **Get testnet ETH** from faucets:
   - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
   - [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
   - [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia)

2. **Configure .env**:
```bash
PRIVATE_KEY="your_private_key_here"
SEPOLIA_RPC_URL="https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
ETHERSCAN_API_KEY="your_etherscan_api_key"
```

3. **Deploy with auto-verification**:
```bash
npx hardhat run scripts/deploy-testnet.ts --network sepolia
```

The script will:
- ✅ Deploy KYCRegistry
- ✅ Deploy FungibleAssetToken (example: "Paris Tower A Shares")
- ✅ Wait 30 seconds for blockchain indexing
- ✅ Automatically verify both contracts on Etherscan
- ✅ Save addresses to `deployments/sepolia-addresses.json`

4. **Deploy NFT Demo** (optional):
```bash
npx hardhat run scripts/deploy-nft-demo.ts --network sepolia
```

This will:
- ✅ Deploy KYCRegistry + NFTAssetToken
- ✅ Mint 3 sample diamond NFTs
- ✅ Display collection info and portfolio
- ✅ Save to `deployments/sepolia-nft-demo.json`

#### 🟣 Polygon Amoy (Alternative)

1. **Get testnet MATIC**:
   - [Polygon Faucet](https://faucet.polygon.technology/)

2. **Configure .env**:
```bash
AMOY_RPC_URL="https://rpc-amoy.polygon.technology/"
POLYGONSCAN_API_KEY="your_polygonscan_api_key"
```

3. **Deploy**:
```bash
npx hardhat run scripts/deploy-testnet.ts --network amoy
# or
npx hardhat run scripts/deploy-nft-demo.ts --network amoy
```

### Manual Verification

If auto-verification fails:

```bash
# Verify KYCRegistry
npx hardhat verify --network sepolia <KYC_ADDRESS>

# Verify FungibleAssetToken
npx hardhat verify --network sepolia <TOKEN_ADDRESS> \
  "Paris Tower A Shares" \
  "PATA" \
  <KYC_ADDRESS> \
  1000000 \
  "5000000000000000000000000" \
  "Real Estate" \
  "Fractional ownership of Paris commercial building" \
  "ipfs://..."
```

📖 **[Complete Deployment Guide →](./docs/deployment-guide.md)**  
🔍 **[Auto-Verification Guide →](./docs/auto-verification.md)**

---

## 📖 Technology Explanations

### Why Solidity?

**Solidity** is the most widely-used language for writing Ethereum smart contracts. We chose Solidity because:

- ✅ **Industry Standard**: Used by 95%+ of Ethereum projects
- ✅ **Mature Ecosystem**: Extensive libraries, tools, and documentation
- ✅ **Security**: OpenZeppelin provides battle-tested, audited contracts
- ✅ **EVM Compatibility**: Works on Ethereum, Polygon, Arbitrum, etc.

**Version 0.8.20**: Latest stable version with built-in overflow protection.

### Why Hardhat?

**Hardhat** is a professional-grade development environment for Ethereum. Key advantages:

- ✅ **TypeScript Support**: Type-safe development out of the box
- ✅ **Built-in Network**: Local blockchain for fast testing
- ✅ **Console.log in Solidity**: Debug contracts easily
- ✅ **Plugin Ecosystem**: Toolbox includes ethers, chai-matchers, coverage, gas reporter
- ✅ **Stack Traces**: Detailed error messages for failed transactions

**Alternative considered**: Foundry (faster but Solidity-based tests, steeper learning curve)

### Why OpenZeppelin?

**OpenZeppelin Contracts** is the gold standard for secure smart contracts:

- ✅ **Audited Code**: All contracts professionally audited
- ✅ **Battle-Tested**: Used by Uniswap, Aave, Compound, etc.
- ✅ **Modular**: Inherit only what you need (AccessControl, ERC20, ERC721)
- ✅ **Upgradeable Patterns**: Support for proxy contracts
- ✅ **Community Standard**: Expected by auditors and investors

**Key contracts we use**:
- `AccessControl.sol`: Role-based permissions (KYC_ADMIN, MINTER_ROLE)
- `ERC20.sol`: Fungible token standard
- `ERC721.sol`: Non-fungible token standard
- `Pausable.sol`: Emergency pause functionality

### Why Polygon (Mumbai Testnet)?

**Polygon** is an Ethereum Layer 2 scaling solution. We chose it because:

- ✅ **Low Fees**: ~$0.01 per transaction (vs $5-50 on Ethereum)
- ✅ **Fast Finality**: 2-second block times (vs 12s on Ethereum)
- ✅ **EVM Compatible**: Same Solidity code works on both chains
- ✅ **RWA Focus**: Used by JPMorgan, Franklin Templeton for real-world assets
- ✅ **Mature DeFi**: Uniswap, Aave, QuickSwap available

**Mumbai Testnet**: Free test MATIC, perfect for development and demos.

### Why Ethers.js?

**Ethers.js** is a lightweight, complete Ethereum library:

- ✅ **TypeScript First**: Excellent type definitions
- ✅ **Small Bundle Size**: 88KB (vs 1.1MB for Web3.js)
- ✅ **Modern API**: Promise-based, async/await support
- ✅ **ENS Support**: Built-in support for Ethereum Name Service
- ✅ **Hardhat Integration**: Seamless integration via `hardhat-ethers`

**Version 6.x**: Latest major version with improved performance and API.

### Why TypeScript?

**TypeScript** adds static typing to JavaScript:

- ✅ **Catch Errors Early**: Type checking at compile time
- ✅ **Better IDE Support**: Autocomplete, refactoring, navigation
- ✅ **Self-Documenting**: Types serve as inline documentation
- ✅ **Safer Refactoring**: Rename variables with confidence
- ✅ **Contract Type Generation**: Typechain generates types from ABIs

**Typechain**: Automatically generates TypeScript types from smart contracts.

---

## 🔐 Security Considerations

### Private Key Management

⚠️ **NEVER** commit your private key to Git!

- Use `.env` for local development (already in `.gitignore`)
- For production, use **hardware wallets** (Ledger, Trezor)
- For CI/CD, use **GitHub Secrets** or **AWS Secrets Manager**

## 🎯 Recent Accomplishments

### October 17, 2025 - Major Updates ✨

#### **Bug Fixes & Improvements**
- ✅ Fixed NFTAssetToken shadowing warning (renamed `tokenURI` param to `uri`)
- ✅ Corrected blacklist priority in both token contracts (security fix)
- ✅ Fixed KYCCheckFailed event test compatibility
- ✅ Migrated from deprecated Mumbai to Sepolia/Amoy testnets
- ✅ Fixed Etherscan API V2 configuration

#### **Test Suite Completion**
- ✅ Completed NFTAssetToken.test.ts (106 tests)
- ✅ Added Role Management tests
- ✅ Added Edge Cases tests (empty strings, zero values, large numbers)
- ✅ Added Events verification tests
- ✅ Added Integration Scenarios (full lifecycle, multi-user, KYC changes)
- ✅ Added ERC-721 Interface Compliance tests
- ✅ **Result**: 129 tests passing, 0 failures

#### **Deployment Enhancements**
- ✅ Created `deploy-nft-demo.ts` with sample diamond NFTs
- ✅ Added automatic contract verification (30s delay + verify)
- ✅ Multi-network support (Sepolia/Amoy) with dynamic URLs
- ✅ Removed minimum balance requirement for easier testing
- ✅ Enhanced deployment logging with explorer links

#### **Documentation**
- ✅ Created [auto-verification.md](./docs/auto-verification.md)
- ✅ Updated all guides for Sepolia/Amoy
- ✅ Added comprehensive README with test status
- ✅ Documented deployed contract addresses

---

## 📊 Smart Contract Details

### **KYCRegistry.sol**
- **Purpose**: On-chain KYC and compliance management
- **Size**: ~300 lines
- **Tests**: 87 passing
- **Key Features**:
  - Submit, approve, reject, revoke KYC
  - Whitelist with expiration dates
  - Blacklist with priority over whitelist
  - Batch approval operations
  - Role-based access control

### **FungibleAssetToken.sol**
- **Purpose**: ERC-20 for fractional real-world assets
- **Size**: ~350 lines
- **Tests**: 36 passing
- **Key Features**:
  - Supply cap with minting limits
  - Price per token calculation
  - KYC-enforced transfers
  - Asset metadata (type, description, documents)
  - Batch minting
  - Burn & pause functionality

### **NFTAssetToken.sol**
- **Purpose**: ERC-721 for unique real-world assets
- **Size**: ~390 lines
- **Tests**: 106 passing
- **Key Features**:
  - Individual asset data (name, valuation, certificate)
  - KYC-enforced transfers
  - Batch minting
  - Asset deactivation/reactivation
  - Valuation updates
  - Collection & ownership value tracking
  - Sequential token IDs

---

## 🔐 Security Considerations

### Private Key Management

⚠️ **NEVER** commit your private key to Git!

- Use `.env` for local development (already in `.gitignore`)
- For production, use **hardware wallets** (Ledger, Trezor)
- For CI/CD, use **GitHub Secrets** or **AWS Secrets Manager**

### Smart Contract Security

- ✅ All contracts use OpenZeppelin audited libraries
- ✅ **Blacklist Priority**: Blacklisted addresses blocked even if whitelisted
- ✅ **Reentrancy Protection**: Following Checks-Effects-Interactions pattern
- ✅ **Access Control**: Role-based permissions for all sensitive functions
- ✅ **Pausable**: Emergency stop mechanism for both token types
- ✅ **Custom Errors**: Gas-efficient error handling (Solidity 0.8.20)
- ✅ **Event Emissions**: Complete audit trail for all state changes

### Testing & Auditing

- ✅ **129 tests** covering normal flows, edge cases, and attack vectors
- ✅ **100% critical path coverage**: All transfer logic tested
- ✅ **Integration tests**: Multi-contract interaction scenarios
- ⏳ **External audit**: Recommended before mainnet deployment

---

## 🤝 Contributing

This is an Epitech academic project. Contributions are welcome for:

- 🐛 Bug fixes
- 📝 Documentation improvements
- ✨ New features (after Phase 1-2 completion)
- 🧪 Additional test cases

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

---

## 📜 License

This project is developed as part of the Epitech curriculum.

---

## 👥 Team

**Epitech Paris - Promo 2026**  
Final Year Blockchain Project

---

## 📞 Support

- 📖 [Documentation](./docs/README.md)
- ❓ [FAQ](./docs/faq.md)
- 🐛 [Report Issues](https://github.com/EpitechPGE45-2025/G-ING-910-PAR-9-1-blockchain-14/issues)

---

## 🗺️ Roadmap

### ✅ Phase 1: Core Tokenization (Complete)
- ✅ KYCRegistry smart contract
- ✅ FungibleAssetToken (ERC-20)
- ✅ NFTAssetToken (ERC-721)
- ✅ Comprehensive test suite

### ✅ Phase 2: Deployment & Testing (Complete)
- ✅ Sepolia testnet deployment
- ✅ Contract verification on Etherscan
- ✅ Deployment scripts with auto-verification
- ✅ 129 tests passing

### ⏳ Phase 3: Trading (In Progress)
- ⏳ Uniswap V2/V3 integration
- ⏳ Liquidity pool creation
- ⏳ KYC-compliant DEX wrapper

### ⏳ Phase 4: Indexer & API (Planned)
- ⏳ Event listener backend
- ⏳ PostgreSQL/MongoDB database
- ⏳ REST API for frontend
- ⏳ Real-time synchronization

### ⏳ Phase 5: Oracle & Frontend (Planned)
- ⏳ Price oracle integration
- ⏳ React/Next.js frontend
- ⏳ Wallet connection (MetaMask, WalletConnect)
- ⏳ Asset management dashboard

---

**Built with ❤️ for Epitech Blockchain Project**