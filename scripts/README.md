# Scripts de Déploiement et Utilitaires

Ce dossier contient tous les scripts pour déployer et gérer les contrats blockchain du projet.

---

## 📋 Scripts de Déploiement

### Déploiement de Contrats Individuels

#### `deploy-kyc.ts` - Déployer le KYCRegistry
Déploie le contrat de gestion KYC (indépendant, aucune dépendance).

```bash
npx hardhat run scripts/deploy-kyc.ts --network sepolia
```

#### `deploy-fungible.ts` - Déployer le Token Fongible (ERC-20)
Déploie le contrat de token fongible pour la fractionnalisation d'actifs.

```bash
npx hardhat run scripts/deploy-fungible.ts --network sepolia
```

#### `deploy-nft.ts` - Déployer le Token NFT (ERC-721)
Déploie le contrat NFT pour la tokenisation d'actifs uniques (diamants).

```bash
npx hardhat run scripts/deploy-nft.ts --network sepolia
```

#### `deploy-dex.ts` - Déployer le DEX
Déploie le contrat d'échange décentralisé (DEX) avec pool de liquidité.

```bash
npx hardhat run scripts/deploy-dex.ts --network sepolia
```

#### `deploy-oracle.ts` - Déployer l'Oracle de Prix
Déploie le contrat Oracle pour la gestion automatique des prix des NFTs.

```bash
npx hardhat run scripts/deploy-oracle.ts --network sepolia
```

#### `deploy-all.ts` - Déployer Tous les Contrats
Déploie tous les contrats dans le bon ordre (KYC → Fungible → NFT).

```bash
npx hardhat run scripts/deploy-all.ts --network sepolia
```

---

## 🛠️ Scripts Utilitaires

### Gestion du KYC

#### `check-kyc.ts` - Vérifier et Corriger la Configuration KYC
Diagnostique les problèmes de KYC et whitelist automatiquement le deployer si nécessaire.

```bash
npx hardhat run scripts/check-kyc.ts --network sepolia
```

#### `whitelist-account.ts` - Whitelist une Adresse
Ajoute une adresse à la whitelist KYC pour autoriser les transactions.

```bash
npx hardhat run scripts/whitelist-account.ts --network sepolia
```

### Gestion des NFTs

#### `mint-diamond.ts` - Minter un NFT Diamond
Crée un NFT de diamant certifié GIA avec une valuation initiale.

```bash
npx hardhat run scripts/mint-diamond.ts --network sepolia
```

### Gestion de l'Oracle et des Prix

#### `check-prices.ts` - Consulter les Prix des NFTs
Affiche les prix actuels et l'historique des prix stockés dans l'Oracle.

```bash
npx hardhat run scripts/check-prices.ts --network sepolia
```

#### `auto-update-diamond-price.ts` - Mise à Jour Automatique des Prix
Script en boucle infinie qui met à jour le prix du Diamond toutes les heures (ou 2 minutes en mode test).

```bash
# Mode test (2 minutes)
npx hardhat run scripts/auto-update-diamond-price.ts --network sepolia

# Pour production: éditer le fichier et décommenter UPDATE_INTERVAL = 60 * 60 * 1000
```

**Fonctionnement:**
- Génère un multiplicateur aléatoire entre 0.8 et 1.2 (-20% à +20%)
- Met à jour le prix dans l'Oracle ET dans le contrat NFT
- Tourne en continu avec un intervalle configurable

### Gestion du DEX

#### `setup-dex-liquidity.ts` - Ajouter de la Liquidité au DEX
Ajoute de la liquidité (tokens + ETH) au pool du DEX.

```bash
npx hardhat run scripts/setup-dex-liquidity.ts --network sepolia
```

#### `buy-with-account2.ts` - Acheter des Tokens (Account 2)
Achète des tokens depuis le DEX en utilisant le compte 2 (PRIVATE_KEY_2).

```bash
npx hardhat run scripts/buy-with-account2.ts --network sepolia
```

#### `trade-tokens.ts` - Trading Complet (2 Comptes)
Script complet de trading:
1. Account 1 vend des tokens au DEX
2. Account 2 achète des tokens du DEX

```bash
npx hardhat run scripts/trade-tokens.ts --network sepolia
```

### Monitoring

#### `check-accounts-status.ts` - Vérifier les Soldes et KYC
Affiche les soldes ETH, tokens, et statut KYC de plusieurs comptes.

```bash
npx hardhat run scripts/check-accounts-status.ts --network sepolia
```

#### `check-sepolia-balance.ts` - Vérifier le Solde Sepolia
Vérifie le solde ETH du deployer et la connexion au réseau.

```bash
npx hardhat run scripts/check-sepolia-balance.ts --network sepolia
```

#### `verify-system.ts` - Vérifier Tout le Système
Vérifie que tous les contrats sont déployés et fonctionnels.

```bash
npx hardhat run scripts/verify-system.ts --network sepolia
```

---

## 🧪 Tests Unitaires

Les tests se trouvent dans le dossier `test/`:

#### `FungibleAssetToken.test.ts`
Tests complets du token ERC-20 fongible (minting, transferts, KYC, pause).

#### `KYCRegistry.test.ts`
Tests du système KYC (whitelist, révocation, rôles).

#### `NFTAssetToken.test.ts`
Tests du token NFT ERC-721 (minting, transferts, valuation, métadonnées).

#### `SimpleDEX.test.ts`
Tests du DEX (liquidité, swaps, fees, sécurité).

**Lancer tous les tests:**
```bash
npx hardhat test
```

**Lancer un test spécifique:**
```bash
npx hardhat test test/SimpleDEX.test.ts
```

---

## 📁 Fichiers de Déploiement

Les scripts sauvegardent les adresses dans `deployments/`:

- `sepolia-addresses.json` - Toutes les adresses déployées
- `sepolia-kyc-registry.json` - KYCRegistry
- `sepolia-fungible-token.json` - FungibleAssetToken
- `sepolia-nft-token.json` - NFTAssetToken
- `sepolia-all-contracts.json` - Tous les contrats

- `sepolia-addresses.json` - Toutes les adresses déployées
- `sepolia-kyc-registry.json` - KYCRegistry
- `sepolia-fungible-token.json` - FungibleAssetToken
- `sepolia-nft-token.json` - NFTAssetToken
- `sepolia-all-contracts.json` - Tous les contrats

---

## ⚡ Guide de Démarrage Rapide

### 1. Déploiement Initial
```bash
# Déployer tous les contrats de base
npx hardhat run scripts/deploy-all.ts --network sepolia

# Déployer le DEX
npx hardhat run scripts/deploy-dex.ts --network sepolia

# Déployer l'Oracle
npx hardhat run scripts/deploy-oracle.ts --network sepolia
```

### 2. Configuration
```bash
# Whitelist des utilisateurs
npx hardhat run scripts/whitelist-account.ts --network sepolia

# Ajouter liquidité au DEX
npx hardhat run scripts/setup-dex-liquidity.ts --network sepolia
```

### 3. Minting de NFTs
```bash
# Minter un Diamond NFT
npx hardhat run scripts/mint-diamond.ts --network sepolia
```

### 4. Lancer l'Oracle (Auto-Update)
```bash
# Mode test (updates toutes les 2 minutes)
npx hardhat run scripts/auto-update-diamond-price.ts --network sepolia
```

---

## 🔑 Configuration Requise

Variables d'environnement dans `.env`:

```env
# Clé privée du deployer
PRIVATE_KEY=votre_clé_privée

# Clé privée du second compte (optionnel, pour tests multi-wallet)
PRIVATE_KEY_2=votre_clé_privée_2

# RPC Provider
ALCHEMY_API_KEY=votre_clé_alchemy

# Vérification des contrats
ETHERSCAN_API_KEY=votre_clé_etherscan
```

---

## 💡 Astuces

### Économiser du Gas
- Utilisez toujours les **scripts TypeScript** au lieu d'Etherscan pour les transactions
- Exemple: `buy-with-account2.ts` coûte **0.001 ETH** vs **0.0315 ETH** sur Etherscan

### Vérifier les Prix en Temps Réel
- **Via Script:** `npx hardhat run scripts/check-prices.ts --network sepolia`
- **Via Etherscan:** [Oracle Read Contract](https://sepolia.etherscan.io/address/0x602571F05745181fF237b81dAb8F67148e9475C7#readContract)

### Mode Production vs Test
Pour passer en mode production (updates toutes les heures):
1. Éditer `scripts/auto-update-diamond-price.ts`
2. Ligne 16: Décommenter `UPDATE_INTERVAL = 60 * 60 * 1000`
3. Commenter `UPDATE_INTERVAL = 2 * 60 * 1000`

---

## 🐛 Dépannage

**Problème:** "KYCRegistry not found"
- **Solution:** Déployer KYC d'abord avec `deploy-kyc.ts`

**Problème:** "Execution reverted" lors du minting
- **Solution:** Vérifier que l'adresse est whitelistée avec `check-kyc.ts`

**Problème:** "Insufficient funds"
- **Solution:** Obtenir du Sepolia ETH sur [sepoliafaucet.com](https://sepoliafaucet.com)

**Problème:** Vérification Etherscan échoue
- **Solution:** Attendre 30 secondes et réessayer

---

## 📚 Documentation Complémentaire

- [Guide Oracle](../docs/ORACLE-GUIDE.md) - Guide complet de l'Oracle
- [Guide DEX](../docs/deployment-guide.md) - Déploiement du DEX
- [FAQ](../docs/faq.md) - Questions fréquentes

---

**Besoin d'aide?** Consultez la [documentation principale](../README.md) ou les fichiers dans [docs/](../docs/)
