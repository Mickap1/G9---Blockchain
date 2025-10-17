# 🔧 Guide de Déploiement du DEX sur Sepolia - RÉSOLUTION DU PROBLÈME

## 🚨 Problème : "Circuit breaker is open"

Cette erreur MetaMask signifie que votre provider RPC a trop de requêtes ou est bloqué.

---

## ✅ SOLUTION COMPLÈTE (Étape par étape)

### Étape 1 : Configurer un RPC fiable (OBLIGATOIRE)

Le RPC public est souvent surchargé. Utilisez **Alchemy** (gratuit et fiable).

#### 1.1 Créer un compte Alchemy

1. Allez sur **https://www.alchemy.com/**
2. Cliquez sur **"Sign Up"** (gratuit)
3. Créez votre compte
4. Cliquez sur **"Create App"**
5. Sélectionnez :
   - **Chain**: Ethereum
   - **Network**: Sepolia
   - **Name**: "Blockchain Project DEX"
6. Cliquez sur **"Create App"**

#### 1.2 Récupérer votre API Key

1. Cliquez sur votre app
2. Cliquez sur **"View Key"**
3. Copiez **"HTTPS"** URL qui ressemble à :
   ```
   https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY_HERE
   ```

#### 1.3 Mettre à jour votre .env

Ouvrez (ou créez) le fichier `.env` et ajoutez :

```env
# Votre clé privée MetaMask (sans 0x)
PRIVATE_KEY=votre_cle_privee_64_caracteres

# URL Alchemy Sepolia
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY_HERE

# API Key Etherscan (optionnel pour la vérification)
ETHERSCAN_API_KEY=votre_api_key_etherscan
```

⚠️ **IMPORTANT** : Remplacez `YOUR_KEY_HERE` par votre vraie clé Alchemy !

---

### Étape 2 : Vérifier votre solde Sepolia ETH

```bash
# Créer un script de vérification
```

Créons un script pour vérifier :

<function_calls>
<invoke name="create_file">
<parameter name="content">import { ethers } from "hardhat";

async function main() {
  console.log("\n💰 Vérification du solde Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  
  console.log("📝 Adresse du wallet:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInEth = ethers.formatEther(balance);
  
  console.log("💵 Solde:", balanceInEth, "ETH");
  
  if (parseFloat(balanceInEth) < 0.01) {
    console.log("\n⚠️  ATTENTION: Solde insuffisant pour le déploiement!");
    console.log("   Vous avez besoin d'au moins 0.01 ETH pour déployer.");
    console.log("\n💡 Obtenez du Sepolia ETH gratuit ici:");
    console.log("   - https://sepoliafaucet.com");
    console.log("   - https://faucet.quicknode.com/ethereum/sepolia");
    console.log("   - https://www.infura.io/faucet/sepolia");
  } else {
    console.log("\n✅ Solde suffisant pour le déploiement!");
  }
  
  // Vérifier la connexion réseau
  const network = await ethers.provider.getNetwork();
  console.log("\n🌐 Réseau:", network.name, "(Chain ID:", network.chainId.toString(), ")");
  
  // Vérifier le RPC
  const blockNumber = await ethers.provider.getBlockNumber();
  console.log("📦 Dernier bloc:", blockNumber);
  
  console.log("\n✅ Connexion au réseau réussie!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Erreur:");
    console.error(error);
    process.exit(1);
  });
