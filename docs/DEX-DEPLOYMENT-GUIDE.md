# 🔧 Guide de Déploiement du DEX sur Sepolia

## Problème rencontré : "Circuit breaker is open"

Cette erreur MetaMask se produit quand :
- Trop de requêtes en peu de temps
- Problème avec le RPC provider
- Cache MetaMask corrompu

---

## 🚀 Solutions (par ordre de priorité)

### Solution 1 : Attendre et réessayer (Recommandé)

```bash
# Attendez 2-3 minutes
# Puis réessayez
npx hardhat run scripts/deploy-dex.ts --network sepolia
```

---

### Solution 2 : Utiliser un RPC provider gratuit

#### Option A : Alchemy (Gratuit)

1. Créez un compte sur [alchemy.com](https://www.alchemy.com/)
2. Créez une app Sepolia
3. Copiez l'URL
4. Mettez à jour votre `.env` :

```env
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

5. Modifiez `hardhat.config.ts` :

```typescript
sepolia: {
  url: process.env.ALCHEMY_SEPOLIA_URL,
  accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
}
```

#### Option B : Infura (Gratuit)

1. Créez un compte sur [infura.io](https://infura.io/)
2. Créez un projet Sepolia
3. Copiez l'URL
4. Même processus qu'Alchemy

---

### Solution 3 : Réinitialiser MetaMask

Si vous utilisez MetaMask comme provider :

1. Ouvrez MetaMask
2. **Settings** (Paramètres)
3. **Advanced** (Avancé)
4. **Clear activity tab data** (Effacer les données d'activité)
5. Réessayez le déploiement

---

### Solution 4 : Déployer avec un autre wallet

Utilisez directement une clé privée dans le `.env` :

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.public.blastapi.io
```

⚠️ **ATTENTION** : Ne commitez JAMAIS votre `.env` avec votre clé privée !

---

## 📋 Checklist de déploiement

Avant de déployer, vérifiez :

- [ ] Vous avez du Sepolia ETH (faucet: [sepoliafaucet.com](https://sepoliafaucet.com))
- [ ] KYCRegistry est déjà déployé
- [ ] FungibleAssetToken est déjà déployé
- [ ] Votre adresse est whitelistée dans le KYC
- [ ] Vous avez assez d'ETH pour le gas (~0.01 ETH)

---

## 🎯 Commandes de déploiement

### Étape 1 : Vérifier que tout compile

```bash
npx hardhat compile
```

### Étape 2 : Tester localement

```bash
npx hardhat test test/SimpleDEX.test.ts
```

### Étape 3 : Déployer sur Sepolia

```bash
npx hardhat run scripts/deploy-dex.ts --network sepolia
```

### Étape 4 : Vérifier sur Etherscan

```bash
npx hardhat verify --network sepolia DEX_ADDRESS TOKEN_ADDRESS KYC_ADDRESS
```

---

## 🔍 Troubleshooting supplémentaire

### Erreur : "insufficient funds"

```bash
# Vérifier votre balance
npx hardhat run scripts/check-balance.ts --network sepolia
```

Besoin de Sepolia ETH ? Faucets :
- https://sepoliafaucet.com
- https://faucet.quicknode.com/ethereum/sepolia
- https://www.infura.io/faucet/sepolia

### Erreur : "nonce too high"

```bash
# Réinitialiser le nonce dans MetaMask
# Settings > Advanced > Reset Account
```

### Erreur : "KYC not deployed"

Vérifiez que les adresses sont dans `deployments/sepolia-addresses.json` :

```json
{
  "kycRegistry": "0x...",
  "fungibleToken": "0x..."
}
```

---

## 🏗️ Déploiement manuel (si le script échoue)

### Via Hardhat Console

```bash
npx hardhat console --network sepolia
```

```javascript
// Dans la console
const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
const tokenAddress = "0x..."; // Votre FungibleAssetToken
const kycAddress = "0x...";   // Votre KYCRegistry

const dex = await SimpleDEX.deploy(tokenAddress, kycAddress);
await dex.waitForDeployment();

console.log("DEX deployed to:", await dex.getAddress());
```

### Via Remix IDE

1. Allez sur [remix.ethereum.org](https://remix.ethereum.org)
2. Créez un fichier `SimpleDEX.sol`
3. Copiez le code du contrat
4. Compilez avec Solidity 0.8.20
5. Deploy avec Injected Provider (MetaMask)
6. Entrez les paramètres :
   - `token_`: Adresse de votre FungibleAssetToken
   - `kycRegistry_`: Adresse de votre KYCRegistry

---

## ✅ Après le déploiement

### 1. Sauvegarder l'adresse

```json
// deployments/sepolia-addresses.json
{
  "kycRegistry": "0x...",
  "fungibleToken": "0x...",
  "dex": "0x... ← NOUVELLE ADRESSE"
}
```

### 2. Whitelist le DEX

Le DEX doit être whitelisté pour recevoir des tokens !

```javascript
// Via Hardhat Console
const kycRegistry = await ethers.getContractAt("KYCRegistry", kycAddress);
const dexAddress = "0x..."; // Adresse du DEX
const futureExpiry = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

await kycRegistry.batchApproveKYC([dexAddress], futureExpiry);
```

### 3. Ajouter la liquidité initiale

```javascript
const dex = await ethers.getContractAt("SimpleDEX", dexAddress);
const token = await ethers.getContractAt("FungibleAssetToken", tokenAddress);

// Approve
const tokenAmount = ethers.parseEther("1000");
await token.approve(dexAddress, tokenAmount);

// Add liquidity
await dex.addLiquidity(tokenAmount, {
  value: ethers.parseEther("0.1")
});
```

### 4. Vérifier que ça marche

```javascript
const poolInfo = await dex.getPoolInfo();
console.log("Token Reserve:", ethers.formatEther(poolInfo._reserveToken));
console.log("ETH Reserve:", ethers.formatEther(poolInfo._reserveETH));
console.log("Price:", ethers.formatEther(poolInfo._tokenPrice), "ETH per token");
```

---

## 📞 Si rien ne marche

1. **Utilisez Hardhat local pour tester** :
```bash
npx hardhat node
# Dans un autre terminal
npx hardhat run scripts/deploy-dex.ts --network localhost
```

2. **Vérifiez les logs** :
- Regardez les erreurs complètes dans le terminal
- Vérifiez les transactions sur Sepolia Etherscan

3. **Demandez de l'aide** :
- Postez l'erreur complète
- Incluez votre `hardhat.config.ts` (sans la clé privée!)
- Incluez la version de Node/Hardhat

---

## 🎉 Succès !

Une fois déployé, vous verrez :

```
✅ SimpleDEX deployed to: 0x...
✅ Liquidity added!
📊 Pool Information:
   Token Reserve: 1000.0
   ETH Reserve: 0.1
   Token Price: 0.0001 ETH per token
```

Votre DEX est maintenant live sur Sepolia ! 🚀

---

**Prochaine étape** : Tester les swaps sur le testnet !
