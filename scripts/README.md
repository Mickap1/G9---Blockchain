# 📜 Scripts de Déploiement et Utilitaires# Scripts de Déploiement et Utilitaires



Ce dossier contient tous les scripts essentiels pour déployer et gérer les contrats blockchain du projet.Ce dossier contient tous les scripts pour déployer et gérer les contrats blockchain du projet.



------



## 🚀 Scripts de Déploiement## 📋 Scripts de Déploiement



### `deploy-all.ts` - Déploiement Complet### Déploiement de Contrats Individuels

Déploie tous les contrats dans le bon ordre avec vérification des dépendances.

#### `deploy-kyc.ts` - Déployer le KYCRegistry

```bashDéploie le contrat de gestion KYC (indépendant, aucune dépendance).

npx hardhat run scripts/deploy-all.ts --network sepolia

``````bash

npx hardhat run scripts/deploy-kyc.ts --network sepolia

**Ordre de déploiement :**```

1. KYCRegistry

2. FungibleAssetToken#### `deploy-fungible.ts` - Déployer le Token Fongible (ERC-20)

3. NFTAssetTokenDéploie le contrat de token fongible pour la fractionnalisation d'actifs.

4. SimplePriceOracle

5. SimpleDEX```bash

npx hardhat run scripts/deploy-fungible.ts --network sepolia

### Scripts de Déploiement Individuels```



#### `deploy-kyc.ts` - KYCRegistry#### `deploy-nft.ts` - Déployer le Token NFT (ERC-721)

```bashDéploie le contrat NFT pour la tokenisation d'actifs uniques (diamants).

npx hardhat run scripts/deploy-kyc.ts --network sepolia

``````bash

npx hardhat run scripts/deploy-nft.ts --network sepolia

#### `deploy-fungible.ts` - Token Fongible ERC-20```

```bash

npx hardhat run scripts/deploy-fungible.ts --network sepolia#### `deploy-dex.ts` - Déployer le DEX

```Déploie le contrat d'échange décentralisé (DEX) avec pool de liquidité.



#### `deploy-nft.ts` - Token NFT ERC-721```bash

```bashnpx hardhat run scripts/deploy-dex.ts --network sepolia

npx hardhat run scripts/deploy-nft.ts --network sepolia```

```

#### `deploy-oracle.ts` - Déployer l'Oracle de Prix

#### `deploy-oracle.ts` - Oracle de PrixDéploie le contrat Oracle pour la gestion automatique des prix des NFTs.

```bash

npx hardhat run scripts/deploy-oracle.ts --network sepolia```bash

```npx hardhat run scripts/deploy-oracle.ts --network sepolia

```

#### `deploy-dex.ts` - DEX AMM

```bash#### `deploy-all.ts` - Déployer Tous les Contrats

npx hardhat run scripts/deploy-dex.ts --network sepoliaDéploie tous les contrats dans le bon ordre (KYC → Fungible → NFT).

```

```bash

---npx hardhat run scripts/deploy-all.ts --network sepolia

```

## ⚙️ Scripts de Configuration

---

### `setup-dex-liquidity.ts` - Initialiser la Liquidité DEX

Ajoute la liquidité initiale au pool DEX (tokens + ETH).## 🛠️ Scripts Utilitaires



```bash### Gestion du KYC

npx hardhat run scripts/setup-dex-liquidity.ts --network sepolia

```#### `check-kyc.ts` - Vérifier et Corriger la Configuration KYC

Diagnostique les problèmes de KYC et whitelist automatiquement le deployer si nécessaire.

### `whitelist-account.ts` - Whitelister un Compte

Whitelist une adresse pour le trading (requis par KYC).```bash

npx hardhat run scripts/check-kyc.ts --network sepolia

```bash```

npx hardhat run scripts/whitelist-account.ts --network sepolia

```#### `whitelist-account.ts` - Whitelist une Adresse

Ajoute une adresse à la whitelist KYC pour autoriser les transactions.

### `grant-admin-role.ts` - Donner le Rôle Admin

Accorde le rôle admin à une adresse pour gérer les contrats.```bash

npx hardhat run scripts/whitelist-account.ts --network sepolia

```bash```

npx hardhat run scripts/grant-admin-role.ts --network sepolia

```### Gestion des NFTs



---#### `mint-diamond.ts` - Minter un NFT Diamond

Crée un NFT de diamant certifié GIA avec une valuation initiale.

## 🧪 Scripts de Test et Vérification

```bash

### `test-indexer-requirement.ts` - Test de l'Exigence #4 ⭐npx hardhat run scripts/mint-diamond.ts --network sepolia

**Script IMPORTANT** qui prouve que l'exigence #4 est respectée.```



```bash### Gestion de l'Oracle et des Prix

npx hardhat run scripts/test-indexer-requirement.ts --network sepolia

```#### `check-prices.ts` - Consulter les Prix des NFTs

Affiche les prix actuels et l'historique des prix stockés dans l'Oracle.

**Ce qu'il fait :**

1. Fait un swap directement sur le smart contract (hors UI)```bash

2. Attend que l'indexeur le détecte (max 2 minutes)npx hardhat run scripts/check-prices.ts --network sepolia

3. Vérifie que le swap apparaît dans l'API indexeur```

4. ✅ Prouve que les transactions externes sont visibles

#### `auto-update-diamond-price.ts` - Mise à Jour Automatique des Prix

**Documentation :** Voir `docs/TEST-INDEXER-GUIDE.md`Script en boucle infinie qui met à jour le prix du Diamond toutes les heures (ou 2 minutes en mode test).



### `verify-system.ts` - Vérification Complète du Système```bash

Vérifie que tous les contrats sont déployés et fonctionnels.# Mode test (2 minutes)

npx hardhat run scripts/auto-update-diamond-price.ts --network sepolia

```bash

npx hardhat run scripts/verify-system.ts --network sepolia# Pour production: éditer le fichier et décommenter UPDATE_INTERVAL = 60 * 60 * 1000

``````



**Vérifie :****Fonctionnement:**

- Déploiement des contrats- Génère un multiplicateur aléatoire entre 0.8 et 1.2 (-20% à +20%)

- Connexions entre contrats- Met à jour le prix dans l'Oracle ET dans le contrat NFT

- Rôles et permissions- Tourne en continu avec un intervalle configurable

- Liquidité DEX

- État KYC### Gestion du DEX



---#### `setup-dex-liquidity.ts` - Ajouter de la Liquidité au DEX

Ajoute de la liquidité (tokens + ETH) au pool du DEX.

## 🔍 Scripts de Vérification Rapide

```bash

### `check-kyc.ts` - Vérifier le Statut KYCnpx hardhat run scripts/setup-dex-liquidity.ts --network sepolia

Vérifie si une adresse est whitelistée/blacklistée.```



```bash#### `buy-with-account2.ts` - Acheter des Tokens (Account 2)

npx hardhat run scripts/check-kyc.ts --network sepoliaAchète des tokens depuis le DEX en utilisant le compte 2 (PRIVATE_KEY_2).

```

```bash

### `check-prices.ts` - Vérifier les Prix Oraclenpx hardhat run scripts/buy-with-account2.ts --network sepolia

Affiche les prix actuels des assets depuis l'Oracle.```



```bash#### `trade-tokens.ts` - Trading Complet (2 Comptes)

npx hardhat run scripts/check-prices.ts --network sepoliaScript complet de trading:

```1. Account 1 vend des tokens au DEX

2. Account 2 achète des tokens du DEX

---

```bash

## 🛠️ Utilitairesnpx hardhat run scripts/trade-tokens.ts --network sepolia

```

### `mint-diamond.ts` - Créer un NFT Diamant

Exemple de création d'un NFT avec métadonnées IPFS.### Monitoring



```bash#### `check-accounts-status.ts` - Vérifier les Soldes et KYC

npx hardhat run scripts/mint-diamond.ts --network sepoliaAffiche les soldes ETH, tokens, et statut KYC de plusieurs comptes.

```

```bash

### `list-admins.ts` - Lister les Adminsnpx hardhat run scripts/check-accounts-status.ts --network sepolia

Liste tous les admins des contrats.```



```bash#### `check-sepolia-balance.ts` - Vérifier le Solde Sepolia

npx hardhat run scripts/list-admins.ts --network sepoliaVérifie le solde ETH du deployer et la connexion au réseau.

```

```bash

### `auto-update-diamond-price.ts` - Mise à Jour Automatique Prixnpx hardhat run scripts/check-sepolia-balance.ts --network sepolia

Script automatique pour mettre à jour les prix Oracle (à lancer via cron).```



```bash#### `verify-system.ts` - Vérifier Tout le Système

npx hardhat run scripts/auto-update-diamond-price.ts --network sepoliaVérifie que tous les contrats sont déployés et fonctionnels.

```

```bash

### `extract-abis.js` - Extraire les ABIsnpx hardhat run scripts/verify-system.ts --network sepolia

Extrait les ABIs des contrats pour le frontend.```



```bash---

node scripts/extract-abis.js

```## 🧪 Tests Unitaires



### `start-indexer.ps1` - Démarrer l'Indexeur Local (Windows)Les tests se trouvent dans le dossier `test/`:

Démarre l'indexeur en local pour le développement.

#### `FungibleAssetToken.test.ts`

```powershellTests complets du token ERC-20 fongible (minting, transferts, KYC, pause).

.\scripts\start-indexer.ps1

```#### `KYCRegistry.test.ts`

Tests du système KYC (whitelist, révocation, rôles).

---

#### `NFTAssetToken.test.ts`

## 📊 Ordre d'Exécution RecommandéTests du token NFT ERC-721 (minting, transferts, valuation, métadonnées).



### 1. Déploiement Initial#### `SimpleDEX.test.ts`

```bashTests du DEX (liquidité, swaps, fees, sécurité).

# Tout déployer d'un coup

npx hardhat run scripts/deploy-all.ts --network sepolia**Lancer tous les tests:**

```bash

# Extraire les ABIs pour le frontendnpx hardhat test

node scripts/extract-abis.js```

```

**Lancer un test spécifique:**

### 2. Configuration```bash

```bashnpx hardhat test test/SimpleDEX.test.ts

# Whitelist votre compte```

npx hardhat run scripts/whitelist-account.ts --network sepolia

---

# Ajouter la liquidité initiale au DEX

npx hardhat run scripts/setup-dex-liquidity.ts --network sepolia## 📁 Fichiers de Déploiement

```

Les scripts sauvegardent les adresses dans `deployments/`:

### 3. Vérification

```bash- `sepolia-addresses.json` - Toutes les adresses déployées

# Vérifier que tout fonctionne- `sepolia-kyc-registry.json` - KYCRegistry

npx hardhat run scripts/verify-system.ts --network sepolia- `sepolia-fungible-token.json` - FungibleAssetToken

- `sepolia-nft-token.json` - NFTAssetToken

# Tester l'indexeur (IMPORTANT pour l'évaluation)- `sepolia-all-contracts.json` - Tous les contrats

npx hardhat run scripts/test-indexer-requirement.ts --network sepolia

```- `sepolia-addresses.json` - Toutes les adresses déployées

- `sepolia-kyc-registry.json` - KYCRegistry

---- `sepolia-fungible-token.json` - FungibleAssetToken

- `sepolia-nft-token.json` - NFTAssetToken

## 🎯 Scripts Essentiels pour le Projet- `sepolia-all-contracts.json` - Tous les contrats



| Script | Objectif | Priorité |---

|--------|----------|----------|

| `deploy-all.ts` | Déploiement complet | ⭐⭐⭐ |## ⚡ Guide de Démarrage Rapide

| `test-indexer-requirement.ts` | Preuve exigence #4 | ⭐⭐⭐ |

| `whitelist-account.ts` | Permettre le trading | ⭐⭐⭐ |### 1. Déploiement Initial

| `setup-dex-liquidity.ts` | Initialiser DEX | ⭐⭐⭐ |```bash

| `verify-system.ts` | Vérification complète | ⭐⭐ |# Déployer tous les contrats de base

| `extract-abis.js` | Frontend | ⭐⭐ |npx hardhat run scripts/deploy-all.ts --network sepolia

| `mint-diamond.ts` | Exemple NFT | ⭐ |

# Déployer le DEX

---npx hardhat run scripts/deploy-dex.ts --network sepolia



## 🧹 Nettoyage# Déployer l'Oracle

npx hardhat run scripts/deploy-oracle.ts --network sepolia

Un script de nettoyage (`cleanup-scripts.ps1`) a été exécuté pour supprimer 37 fichiers inutiles (doublons, debug, scripts temporaires).```



**Scripts supprimés :**### 2. Configuration

- Anciennes versions (deploy-kyc-v2, deploy-nft-v2, etc.)```bash

- Scripts de debug (debug-dex-liquidity, fix-dex-in-admin, etc.)# Whitelist des utilisateurs

- Doublons de vérification (check-accounts-status, check-all-whitelisted, etc.)npx hardhat run scripts/whitelist-account.ts --network sepolia

- Doublons d'actions (add-initial-liquidity, trade-tokens, etc.)

- Scripts temporaires (calculate-roles, init-all-nft-prices, etc.)# Ajouter liquidité au DEX

npx hardhat run scripts/setup-dex-liquidity.ts --network sepolia

---```



## 📚 Documentation Complémentaire### 3. Minting de NFTs

```bash

- **Test Indexeur** : `docs/TEST-INDEXER-GUIDE.md`# Minter un Diamond NFT

- **Intégration Indexeur** : `docs/INDEXER-INTEGRATION.md`npx hardhat run scripts/mint-diamond.ts --network sepolia

- **Preuve Exigence #4** : `PROOF-REQUIREMENT-4.md````

- **Conformité Complète** : `docs/REQUIREMENT-4-COMPLIANCE.md`

### 4. Lancer l'Oracle (Auto-Update)

---```bash

# Mode test (updates toutes les 2 minutes)

**Dernière mise à jour** : 24 octobre 2025  npx hardhat run scripts/auto-update-diamond-price.ts --network sepolia

**Scripts essentiels** : 20 (sur 51 originaux)  ```

**Nettoyage effectué** : ✅ 37 fichiers supprimés

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

## 🤖 Scripts Auto-Update (Hébergement)

### `auto-update-all-nft-prices.ts` - Auto-Update Prix NFTs (Toutes les heures)

Met à jour automatiquement le prix de **TOUS les NFTs** à chaque heure pile (XX:00).

```bash
npx hardhat run scripts/auto-update-all-nft-prices.ts --network sepolia
```

**Fonctionnement:**
- Attend la prochaine heure pile (ex: 22h00, 23h00, 00h00)
- Récupère `totalSupply()` du contrat NFT
- Met à jour chaque NFT avec une variation de ±20%
- Boucle infinie avec synchronisation horaire

**Configuration:**
- Variation: ×0.8 à ×1.2 (-20% à +20%)
- Prix par défaut: 50,000 EUR (si non initialisé)
- Planification: Chaque heure à XX:00

### `auto-update-rwat-price.ts` - Auto-Update Prix RWAT (Toutes les heures)

Met à jour automatiquement le prix du **token RWAT** à chaque heure pile (XX:00).

```bash
npx hardhat run scripts/auto-update-rwat-price.ts --network sepolia
```

**Fonctionnement:**
- Attend la prochaine heure pile
- Récupère le prix actuel dans l'Oracle
- Applique une variation de ±10%
- Met à jour via `oracle.updatePrice()`

**Configuration:**
- Variation: ×0.9 à ×1.1 (-10% à +10%)
- Prix par défaut: 50 EUR (si non initialisé)
- Planification: Chaque heure à XX:00

**🚀 Hébergement:**
Consultez le [Guide d'Hébergement](../AUTO-UPDATE-SCRIPTS-GUIDE.md) pour déployer ces scripts sur Railway, VPS, ou GitHub Actions.

**Options disponibles:**
- **Railway** (recommandé) - Gratuit, cloud, logs en ligne
- **VPS + PM2** - Contrôle total, production
- **GitHub Actions** - Intégré, simple
- **Local Windows** - Task Scheduler

**Fichiers de configuration:**
- `ecosystem.config.js` - Configuration PM2
- `railway-updaters.yml` - Configuration Railway
- `start-nft-updater.bat` - Script Windows NFT
- `start-rwat-updater.bat` - Script Windows RWAT

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
