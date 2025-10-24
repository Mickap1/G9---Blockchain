# 📜 Smart Contracts

Ce dossier contient tous les smart contracts de la plateforme de tokenisation d'actifs réels.

---

## � Contrats Déployés (Sepolia Testnet)

### 🔐 KYCregistry.sol
**Adresse :** [`0x563E31793214F193EB7993a2bfAd2957a70C7D65`](https://sepolia.etherscan.io/address/0x563E31793214F193EB7993a2bfAd2957a70C7D65)  
**Rôle :** Gestion de la conformité KYC/AML on-chain

**Fonctionnalités :**
- Approbation/révocation des utilisateurs KYC
- Whitelist avec date d'expiration
- Blacklist prioritaire (sécurité renforcée)
- Batch approval pour plusieurs utilisateurs
- Gestion des rôles (ADMIN, KYC_ADMIN)

**Utilisation :** Vérifie que seules les adresses approuvées peuvent détenir et trader des tokens.

---

### 🪙 FungibleAssetToken.sol
**Adresse :** [`0xfA451d9C32d15a637Ab376732303c36C34C9979f`](https://sepolia.etherscan.io/address/0xfA451d9C32d15a637Ab376732303c36C34C9979f)  
**Symbole :** RWAT (Real World Asset Token)  
**Rôle :** Token ERC-20 pour la tokenisation d'actifs fongibles

**Fonctionnalités :**
- Supply cap avec limite maximale
- Métadonnées d'actif (type, location, valeur totale)
- Mint, burn, pause
- Transferts bloqués sans KYC approuvé
- Batch minting optimisé
- Calcul automatique du prix par token

**Exemple d'usage :** Partage de propriété immobilière (1,000,000 tokens = 1 immeuble de 50M EUR)

---

### 💎 NFTAssetTokenV2.sol (Version Optimisée)
**Adresse :** [`0x75499Fc469f8d224C7bF619Ada37ea8f3cD8c36E641A9C56C6db30E052E90DB9358b6D2C946`](https://sepolia.etherscan.io/address/0x75499Fc469f8d224C7bF619Ada37ea8f3cD8c36E641A9C56C6db30E052E90DB9358b6D2C946)  
**Symbole :** RWAV2 (RWA Asset Collection V2)  
**Rôle :** Token ERC-721 pour la tokenisation d'actifs uniques (version gas-optimisée)

**Fonctionnalités :**
- Métadonnées IPFS (réduction gas de 40-50%)
- Stockage on-chain minimal (tokenizationDate, isActive)
- Batch minting pour plusieurs NFTs
- Désactivation/réactivation d'assets
- Transferts bloqués sans KYC approuvé
- Tracking de la valeur totale de collection

**Améliorations V2 :**
- ❌ Nom, valuation, certificateURI retirés du storage on-chain
- ✅ Toutes les métadonnées dans IPFS via tokenURI
- ⚡ Économie de gas significative (~40-50%)

**Exemple d'usage :** Diamants certifiés GIA avec valuation et certificat

> **Note :** `NFTAssetToken.sol` (V1) existe dans le repo mais n'est plus déployé. NFTAssetTokenV2 est la version production.

---

### 💱 DEX.sol (SimpleDEX)
**Adresse :** [`0x2Cf848B370C0Ce0255C4743d70648b096D3fAa98`](https://sepolia.etherscan.io/address/0x2Cf848B370C0Ce0255C4743d70648b096D3fAa98)  
**Rôle :** DEX (Decentralized Exchange) avec AMM pour le trading on-chain

**Fonctionnalités :**
- Pool de liquidité Token/ETH
- Algorithme AMM x*y=k (Uniswap V2 style)
- Swap ETH ↔ Tokens avec slippage protection
- Fees de trading 0.3% redistribués aux LP
- LP tokens pour les fournisseurs de liquidité
- Trading limité aux adresses whitelistées KYC
- Pause d'urgence

**Exemple d'usage :** Échanger des tokens immobiliers contre de l'ETH de manière décentralisée

---

### 📊 Oracle.sol (SimplePriceOracle)
**Adresse :** [`0x602571F05745181fF237b81dAb8F67148e9475C7`](https://sepolia.etherscan.io/address/0x602571F05745181fF237b81dAb8F67148e9475C7)  
**Rôle :** Oracle de prix on-chain pour les actifs tokenisés

**Fonctionnalités :**
- Stockage des prix NFT on-chain
- Historique des prix (max 100 entrées)
- Mise à jour par rôle PRICE_UPDATER
- Batch update pour plusieurs tokens
- Prix pour tokens fongibles et NFTs
- Pause d'urgence

**Exemple d'usage :** Mise à jour automatique toutes les heures du prix d'un diamant NFT

---

### 🏪 Marketplace.sol
**Adresse :** [`0x9F057E253D69f6d362C63A3DB0bdff66eE8013dd`](https://sepolia.etherscan.io/address/0x9F057E253D69f6d362C63A3DB0bdff66eE8013dd)  
**Rôle :** Marketplace décentralisé pour le trading de NFTs

**Fonctionnalités :**
- Listing/Delisting de NFTs
- Achat/Vente peer-to-peer
- Fees configurables (actuellement 2.5%)
- Protection KYC (acheteur et vendeur doivent être whitelistés)
- Support multi-collections
- Pause d'urgence

**Paramètres de déploiement :**
- Fee Recipient : `0x41B6b59a9365a58B00a68c597c49dB5Fa8C72116`
- Fee Percentage : 2.5% (250 basis points)

**Exemple d'usage :** Vendre un diamant NFT tokenisé à un autre investisseur vérifié KYC

---

## � Statistiques des Contrats

| Contrat | Lignes | Fonctions | Tests | Statut |
|---------|--------|-----------|-------|--------|
| KYCregistry.sol | ~200 | 15+ | 52 | ✅ Déployé |
| FungibleAssetToken.sol | ~350 | 20+ | 36 | ✅ Déployé |
| NFTAssetTokenV2.sol | ~300 | 20+ | 35 | ✅ Déployé (Version production) |
| NFTAssetToken.sol | ~400 | 25+ | 41 | 🔒 Archive (V1) |
| DEX.sol | ~420 | 15+ | 39 | ✅ Déployé |
| Oracle.sol | ~350 | 15+ | 22 | ✅ Déployé |
| Marketplace.sol | ~450 | 18+ | 28 | ✅ Déployé |
| **Total Actif** | **~2,070** | **103+** | **212** | **6 déployés** |

---

## � Liens Rapides Etherscan

Tous les contrats sont déployés et vérifiés sur **Sepolia Testnet** :

| Contrat | Adresse | Etherscan |
|---------|---------|-----------|
| **KYCRegistry** | `0x563E31...7C7D65` | [🔍 Voir](https://sepolia.etherscan.io/address/0x563E31793214F193EB7993a2bfAd2957a70C7D65) |
| **RWAT Token** | `0xfA451d...C9979f` | [🔍 Voir](https://sepolia.etherscan.io/address/0xfA451d9C32d15a637Ab376732303c36C34C9979f) |
| **NFT V2** | `0x75499Fc469f8d224C7bF619Ada37ea8f3cD8c36E6...2C946` | [🔍 Voir](https://sepolia.etherscan.io/address/0x75499Fc469f8d224C7bF619Ada37ea8f3cD8c36E641A9C56C6db30E052E90DB9358b6D2C946) |
| **SimpleDEX** | `0x2Cf848...3fAa98` | [🔍 Voir](https://sepolia.etherscan.io/address/0x2Cf848B370C0Ce0255C4743d70648b096D3fAa98) |
| **Oracle** | `0x602571...9475C7` | [🔍 Voir](https://sepolia.etherscan.io/address/0x602571F05745181fF237b81dAb8F67148e9475C7) |
| **Marketplace** | `0x9F057E...8013dd` | [🔍 Voir](https://sepolia.etherscan.io/address/0x9F057E253D69f6d362C63A3DB0bdff66eE8013dd) |

> **Note :** Tous les contrats sont vérifiés sur Etherscan. Vous pouvez voir le code source, lire les fonctions, et explorer les transactions directement sur Etherscan.

---

## 🏗️ Architecture du Système

```
┌─────────────────┐
│   Frontend      │
│   (Next.js)     │
└────────┬────────┘
         │
    ┌────▼────┐
    │  Wagmi  │
    │  Viem   │
    └────┬────┘
         │
┌────────▼──────────────────────────────────────┐
│         Ethereum Sepolia Testnet              │
│                                                │
│  ┌──────────────┐    ┌────────────────┐      │
│  │ KYCRegistry  │◄───┤  All Contracts │      │
│  │   (Gate)     │    │  Verify KYC    │      │
│  └──────────────┘    └────────────────┘      │
│                                                │
│  ┌──────────────┐    ┌──────────────┐        │
│  │  Fungible    │◄───┤   SimpleDEX  │        │
│  │  Token RWAT  │    │   (Trading)  │        │
│  └──────────────┘    └──────▲───────┘        │
│                              │                 │
│  ┌──────────────┐    ┌──────┴───────┐        │
│  │   NFT V2     │◄───┤ Marketplace  │        │
│  │   (Assets)   │    │  (P2P Trade) │        │
│  └──────────────┘    └──────────────┘        │
│                                                │
│  ┌──────────────┐                             │
│  │    Oracle    │ (Price Feeds)               │
│  │  (On-chain)  │                             │
│  └──────────────┘                             │
└────────────────────────────────────────────────┘
         │
    ┌────▼────┐
    │ Indexer │ (MongoDB + Railway)
    │ Backend │ Scans events every 60s
    └─────────┘
```

---

## 🔒 Sécurité

Tous les contrats utilisent :
- **OpenZeppelin 5.0.0** - Librairies auditées
- **AccessControl** - Gestion des rôles (ADMIN, KYC_ADMIN, PRICE_UPDATER)
- **Pausable** - Fonction d'urgence
- **ReentrancyGuard** (DEX, Marketplace) - Protection contre réentrabilité
- **Custom Errors** - Économie de gas

**Tests :** 212 tests unitaires couvrant tous les cas critiques



---

## 🚀 Déploiement

**Réseau actuel :** Sepolia Testnet (Chain ID: 11155111)  
**Deployer :** `0x41B6b59a9365a58B00a68c597c49dB5Fa8C72116`

Pour déployer les contrats, consulter :
- [Guide de Déploiement](../docs/deployment-guide.md)
- [Scripts de Déploiement](../scripts/README.md)
- [Fichiers de Déploiement](../deployments/)

**Scripts de déploiement disponibles :**
```bash
# Déployer le système KYC
npx hardhat run scripts/deploy-kyc.ts --network sepolia

# Déployer les tokens (Fungible + NFT)
npx hardhat run scripts/deploy-tokens.ts --network sepolia

# Déployer le DEX
npx hardhat run scripts/deploy-dex.ts --network sepolia

# Déployer l'Oracle
npx hardhat run scripts/deploy-oracle.ts --network sepolia

# Déployer le Marketplace
npx hardhat run scripts/deploy-marketplace.ts --network sepolia

# Déployer tout le système complet
npx hardhat run scripts/deploy-all.ts --network sepolia
```

---

## 📚 Documentation API

Documentation détaillée de chaque contrat :
- [KYCRegistry API](../docs/KYCRegistry.md)
- [FungibleAssetToken API](../docs/FungibleAssetToken.md)
- [SimpleDEX API](../docs/SimpleDEX.md)
- [Oracle Guide](../docs/ORACLE-GUIDE.md)
- [KYC System Guide](../docs/KYC-SYSTEM-GUIDE.md)

---

## 🧪 Tests

Pour exécuter les tests :

```bash
# Tous les tests
npx hardhat test

# Tests d'un contrat spécifique
npx hardhat test test/KYCregistry.test.ts
npx hardhat test test/FungibleAssetToken.test.ts
npx hardhat test test/DEX.test.ts

# Coverage
npx hardhat coverage
```

**Résultat actuel :** 212 tests passant avec succès ✅

---

## 📝 ABIs et Typechain

Les ABIs compilés sont disponibles dans :
- `artifacts/contracts/` - ABIs Hardhat
- `typechain-types/` - Types TypeScript générés

Pour régénérer les types :
```bash
npx hardhat compile
```

---

## 🔄 Versions et Mises à Jour

| Version | Date | Changements |
|---------|------|-------------|
| **V2** | Oct 2025 | NFT optimisé avec IPFS, Marketplace ajouté |
| **V1** | Oct 2025 | Système complet initial (KYC, Tokens, DEX, Oracle) |

---

**Contrats vérifiés sur Sepolia Etherscan** ✅  
**Dernière mise à jour :** Octobre 2025
