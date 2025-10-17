# 📜 Smart Contracts

Ce dossier contient tous les smart contracts de la plateforme de tokenisation d'actifs réels.

---

## 📋 Contrats Principaux

### 🔐 KYCregistry.sol
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

### 💎 NFTAssetToken.sol
**Rôle :** Token ERC-721 pour la tokenisation d'actifs uniques

**Fonctionnalités :**
- Données individuelles par NFT (nom, valuation, certificat)
- Métadonnées on-chain complètes
- Batch minting pour plusieurs NFTs
- Désactivation/réactivation d'assets
- Mise à jour de la valuation par l'admin
- Transferts bloqués sans KYC approuvé
- Tracking de la valeur totale de collection

**Exemple d'usage :** Diamants certifiés GIA avec valuation et certificat

---

### 💱 DEX.sol (SimpleDEX)
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

## 🔒 Sécurité

Tous les contrats utilisent :
- **OpenZeppelin 5.0.0** - Librairies auditées
- **AccessControl** - Gestion des rôles
- **Pausable** - Fonction d'urgence
- **ReentrancyGuard** (DEX) - Protection contre réentrabilité
- **Custom Errors** - Économie de gas

---

## 📊 Statistiques

| Contrat | Lignes | Fonctions | Tests |
|---------|--------|-----------|-------|
| KYCregistry.sol | ~200 | 15+ | 87 |
| FungibleAssetToken.sol | ~350 | 20+ | 36 |
| NFTAssetToken.sol | ~400 | 25+ | 106 |
| DEX.sol | ~420 | 15+ | 39 |
| Oracle.sol | ~350 | 15+ | 30 |
| **Total** | **~1,720** | **90+** | **298** |

---

## 🚀 Déploiement

Pour déployer les contrats, consulter :
- [Guide de Déploiement](../docs/deployment-guide.md)
- [Scripts de Déploiement](../scripts/README.md)

---

## 📚 Documentation API

Documentation détaillée de chaque contrat :
- [KYCRegistry API](../docs/KYCRegistry.md)
- [FungibleAssetToken API](../docs/FungibleAssetToken.md)
- [SimpleDEX API](../docs/SimpleDEX.md)

---

**Contrats vérifiés sur Sepolia Etherscan** ✅
