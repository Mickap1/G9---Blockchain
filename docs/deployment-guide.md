# 🚀 Guide de Déploiement

Ce guide vous accompagne dans le déploiement de la plateforme de tokenisation d'actifs.

## 📋 Prérequis

### Logiciels requis
- Node.js >= 18.x
- npm ou yarn
- Git
- Un wallet Ethereum (MetaMask recommandé)

### Connaissances requises
- Bases de Solidity
- Utilisation de Hardhat
- Concepts blockchain (gas, transactions, etc.)

---

## 🏗️ Installation

### 1. Cloner le repository

```bash
git clone https://github.com/EpitechPGE45-2025/G-ING-910-PAR-9-1-blockchain-14.git
cd G-ING-910-PAR-9-1-blockchain-14
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

Créer un fichier `.env` à la racine :

```env
# Clé privée de déploiement (GARDER SECRÈTE!)
PRIVATE_KEY=votre_clé_privée_ici

# RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/VOTRE_PROJECT_ID
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# API Keys pour vérification des contrats
ETHERSCAN_API_KEY=votre_api_key_etherscan
POLYGONSCAN_API_KEY=votre_api_key_polygonscan

# Options
REPORT_GAS=true
```

⚠️ **IMPORTANT**: Ne jamais commit le fichier `.env` ! Il est déjà dans `.gitignore`.

---

## ✅ Vérification

### Compiler les contrats

```bash
npx hardhat compile
```

Résultat attendu:
```
Compiled 8 Solidity files successfully
```

### Lancer les tests

```bash
npx hardhat test
```

Résultat attendu:
```
  87 passing (2s)
```

---

## 🌐 Déploiement

### Option 1: Déploiement Local (Hardhat Network)

Idéal pour le développement et les tests.

```bash
# Terminal 1 - Lancer le node local
npx hardhat node

# Terminal 2 - Déployer
npx hardhat run scripts/deploy.ts --network localhost
```

### Option 2: Déploiement sur Testnet (Sepolia)

#### Étape 1: Obtenir des ETH de test

Visitez un faucet Sepolia:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

#### Étape 2: Créer le script de déploiement

Créer `scripts/deploy.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Démarrage du déploiement...\n");
    
    const [deployer] = await ethers.getSigners();
    console.log("Déploiement avec le compte:", deployer.address);
    console.log("Solde du compte:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");
    
    // 1. Déployer KYCRegistry
    console.log("📋 Déploiement de KYCRegistry...");
    const KYCRegistryFactory = await ethers.getContractFactory("KYCRegistry");
    const kycRegistry = await KYCRegistryFactory.deploy();
    await kycRegistry.waitForDeployment();
    const kycRegistryAddress = await kycRegistry.getAddress();
    console.log("✅ KYCRegistry déployé à:", kycRegistryAddress, "\n");
    
    // 2. Déployer FungibleAssetToken
    console.log("🪙 Déploiement de FungibleAssetToken...");
    
    const tokenParams = {
        name: "Residence Lumiere Token",
        symbol: "RLT",
        maxSupply: ethers.parseEther("10000"),
        assetName: "Residence Lumiere",
        assetType: "Real Estate",
        location: "42 Rue de Vaugirard, 75015 Paris, France",
        totalValue: ethers.parseEther("500000"),
        documentURI: "ipfs://QmYourIPFSHashHere"
    };
    
    const TokenFactory = await ethers.getContractFactory("FungibleAssetToken");
    const token = await TokenFactory.deploy(
        tokenParams.name,
        tokenParams.symbol,
        tokenParams.maxSupply,
        kycRegistryAddress,
        tokenParams.assetName,
        tokenParams.assetType,
        tokenParams.location,
        tokenParams.totalValue,
        tokenParams.documentURI
    );
    await token.waitForDeployment();
    const tokenAddress = await token.getAddress();
    console.log("✅ FungibleAssetToken déployé à:", tokenAddress, "\n");
    
    // 3. Configuration initiale
    console.log("⚙️ Configuration initiale...");
    
    // Attribuer un KYC admin (exemple)
    const KYC_ADMIN_ROLE = await kycRegistry.KYC_ADMIN_ROLE();
    const kycAdminAddress = "0xYourKYCAdminAddress"; // À remplacer
    await kycRegistry.grantRole(KYC_ADMIN_ROLE, kycAdminAddress);
    console.log("✅ Rôle KYC_ADMIN attribué à:", kycAdminAddress);
    
    // Résumé
    console.log("\n📊 RÉSUMÉ DU DÉPLOIEMENT");
    console.log("========================");
    console.log("KYCRegistry:", kycRegistryAddress);
    console.log("FungibleAssetToken:", tokenAddress);
    console.log("Asset:", tokenParams.assetName);
    console.log("Max Supply:", ethers.formatEther(tokenParams.maxSupply));
    console.log("Total Value:", ethers.formatEther(tokenParams.totalValue), "EUR");
    console.log("\n✅ Déploiement terminé avec succès!");
    
    // Sauvegarder les adresses
    const fs = require("fs");
    const addresses = {
        network: "sepolia",
        kycRegistry: kycRegistryAddress,
        fungibleAssetToken: tokenAddress,
        deployer: deployer.address,
        timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(
        "deployments/sepolia.json",
        JSON.stringify(addresses, null, 2)
    );
    console.log("💾 Adresses sauvegardées dans deployments/sepolia.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
```

#### Étape 3: Créer le dossier deployments

```bash
mkdir -p deployments
```

#### Étape 4: Déployer sur Sepolia

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

#### Étape 5: Vérifier les contrats sur Etherscan

```bash
# KYCRegistry
npx hardhat verify --network sepolia ADRESSE_KYC_REGISTRY

# FungibleAssetToken
npx hardhat verify --network sepolia ADRESSE_TOKEN \
  "Residence Lumiere Token" \
  "RLT" \
  "10000000000000000000000" \
  "ADRESSE_KYC_REGISTRY" \
  "Residence Lumiere" \
  "Real Estate" \
  "42 Rue de Vaugirard, 75015 Paris, France" \
  "500000000000000000000000" \
  "ipfs://QmYourIPFSHashHere"
```

---

## 🔧 Configuration Post-Déploiement

### 1. Configurer les KYC Admins

```javascript
const kycRegistry = await ethers.getContractAt("KYCRegistry", KYC_REGISTRY_ADDRESS);
const KYC_ADMIN_ROLE = await kycRegistry.KYC_ADMIN_ROLE();

// Attribuer le rôle
await kycRegistry.grantRole(KYC_ADMIN_ROLE, ADMIN_ADDRESS);
```

### 2. Whitelister les premiers investisseurs

```javascript
// Liste des investisseurs pré-validés
const investors = [
    "0x123...",
    "0x456...",
    "0x789..."
];

// Approuver en batch (pas d'expiration)
await kycRegistry.batchApproveKYC(investors, 0);
```

### 3. Minter les tokens initiaux

```javascript
const token = await ethers.getContractAt("FungibleAssetToken", TOKEN_ADDRESS);

// Définir les allocations
const allocations = [
    { address: "0x123...", amount: ethers.parseEther("1000") },
    { address: "0x456...", amount: ethers.parseEther("2000") },
    { address: "0x789...", amount: ethers.parseEther("1500") }
];

// Mint en batch
await token.batchMint(
    allocations.map(a => a.address),
    allocations.map(a => a.amount)
);
```

---

## 🎛️ Monitoring et Maintenance

### Surveiller les événements

```javascript
// Écouter les nouvelles soumissions KYC
kycRegistry.on("KYCSubmitted", (user, dataURI, timestamp) => {
    console.log(`Nouveau KYC: ${user}`);
    // Déclencher un workflow de vérification
});

// Écouter les mints
token.on("TokensMinted", (to, amount, timestamp) => {
    console.log(`${ethers.formatEther(amount)} tokens mintés pour ${to}`);
});
```

### Dashboard de monitoring

```javascript
async function getDashboard() {
    // Stats KYCRegistry
    const totalWhitelisted = await countWhitelisted(); // Fonction custom
    const totalBlacklisted = await countBlacklisted(); // Fonction custom
    
    // Stats Token
    const totalSupply = await token.totalSupply();
    const maxSupply = await token.MAX_SUPPLY();
    const remaining = await token.remainingSupply();
    const pricePerToken = await token.pricePerToken();
    
    return {
        kyc: {
            whitelisted: totalWhitelisted,
            blacklisted: totalBlacklisted
        },
        token: {
            totalSupply: ethers.formatEther(totalSupply),
            maxSupply: ethers.formatEther(maxSupply),
            remaining: ethers.formatEther(remaining),
            percentageMinted: (Number(totalSupply) * 100 / Number(maxSupply)).toFixed(2),
            pricePerToken: ethers.formatEther(pricePerToken)
        }
    };
}
```

---

## 🆘 Dépannage

### Erreur: "insufficient funds"
**Solution**: Assurez-vous d'avoir assez d'ETH pour le gas
```bash
# Vérifier le solde
npx hardhat run scripts/check-balance.ts --network sepolia
```

### Erreur: "nonce too low"
**Solution**: Réinitialiser le compte dans MetaMask (Settings > Advanced > Reset Account)

### Erreur: "contract verification failed"
**Solution**: 
1. Vérifier que tous les paramètres du constructeur sont corrects
2. Vérifier que la version du compilateur correspond
3. Attendre 1-2 minutes après le déploiement

### Les transactions sont lentes
**Solution**: Augmenter le gas price dans `hardhat.config.ts`:
```typescript
networks: {
    sepolia: {
        url: process.env.SEPOLIA_RPC_URL,
        accounts: [process.env.PRIVATE_KEY],
        gasPrice: 20000000000, // 20 gwei
    }
}
```

---

## 📊 Estimation des coûts

### Gas estimé (Sepolia/Mainnet)

| Action | Gas estimé | Coût @ 50 gwei |
|--------|-----------|----------------|
| Déploiement KYCRegistry | ~1,500,000 | ~0.075 ETH |
| Déploiement FungibleAssetToken | ~2,500,000 | ~0.125 ETH |
| approveKYC | ~80,000 | ~0.004 ETH |
| batchApproveKYC (10 adresses) | ~600,000 | ~0.03 ETH |
| mint | ~100,000 | ~0.005 ETH |
| transfer | ~120,000 | ~0.006 ETH |

**Total déploiement**: ~0.2 ETH (~$400 @ $2000/ETH)

---

## 🔐 Bonnes Pratiques de Sécurité

1. ✅ **Clé privée**: Ne jamais la commit, utiliser un hardware wallet pour la production
2. ✅ **Multi-sig**: Utiliser Gnosis Safe pour les opérations critiques
3. ✅ **Audit**: Faire auditer les contrats avant le mainnet
4. ✅ **Tests**: 100% de couverture de tests avant déploiement
5. ✅ **Monitoring**: Mettre en place des alertes sur les événements critiques
6. ✅ **Backup**: Sauvegarder toutes les adresses et configurations
7. ✅ **Documentation**: Tenir à jour la doc de toutes les opérations

---

## 📚 Ressources

- [Documentation Hardhat](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)
- [Faucets Sepolia](https://sepoliafaucet.com/)
