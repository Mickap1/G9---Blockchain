# 🚀 GUIDE RAPIDE - Déployer le DEX sur Sepolia

## ⚡ Solution au problème "Circuit breaker"

### Étape 1 : Configurer Alchemy (2 minutes)

1. **Créer un compte** : https://www.alchemy.com/ (gratuit)
2. **Créer une app** : 
   - Chain: **Ethereum**
   - Network: **Sepolia**
3. **Copier l'URL HTTPS** : 
   ```
   https://eth-sepolia.g.alchemy.com/v2/VOTRE_CLE
   ```

### Étape 2 : Configurer le .env

Créez/modifiez le fichier `.env` à la racine du projet :

```env
# Clé privée MetaMask (64 caractères, sans 0x)
PRIVATE_KEY=votre_cle_privee_ici

# URL Alchemy Sepolia
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/VOTRE_CLE

# API Key Etherscan (optionnel)
ETHERSCAN_API_KEY=votre_api_key
```

⚠️ **Remplacez les valeurs par les vraies !**

### Étape 3 : Vérifier le solde

```bash
npx hardhat run scripts/check-sepolia-balance.ts --network sepolia
```

**Besoin de Sepolia ETH ?** Faucets gratuits :
- https://sepoliafaucet.com
- https://faucet.quicknode.com/ethereum/sepolia

### Étape 4 : Déployer le DEX

```bash
npx hardhat run scripts/deploy-dex.ts --network sepolia
```

✅ **Si ça marche** : Vous verrez l'adresse du DEX déployé !

❌ **Si ça échoue encore** : Passez à la solution alternative ci-dessous.

---

## 🔄 Solution Alternative : Déployer via Hardhat Console

Si le script échoue, utilisez la console interactive :

```bash
npx hardhat console --network sepolia
```

Puis dans la console :

```javascript
// 1. Charger les adresses existantes
const fs = require('fs');
const addresses = JSON.parse(fs.readFileSync('deployments/sepolia-addresses.json'));

// 2. Déployer le DEX
const SimpleDEX = await ethers.getContractFactory("SimpleDEX");
const dex = await SimpleDEX.deploy(
  addresses.fungibleToken,
  addresses.kycRegistry
);
await dex.waitForDeployment();

// 3. Afficher l'adresse
const dexAddress = await dex.getAddress();
console.log("DEX deployed to:", dexAddress);

// 4. Sauvegarder l'adresse
addresses.dex = dexAddress;
fs.writeFileSync('deployments/sepolia-addresses.json', JSON.stringify(addresses, null, 2));

// 5. Whitelist le DEX
const kycRegistry = await ethers.getContractAt("KYCRegistry", addresses.kycRegistry);
const futureExpiry = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
await kycRegistry.batchApproveKYC([dexAddress], futureExpiry);
console.log("DEX whitelisted!");

// 6. Ajouter la liquidité
const token = await ethers.getContractAt("FungibleAssetToken", addresses.fungibleToken);
const tokenAmount = ethers.parseEther("1000");
await token.approve(dexAddress, tokenAmount);
await dex.addLiquidity(tokenAmount, { value: ethers.parseEther("0.1") });
console.log("Liquidity added!");

// 7. Vérifier le pool
const poolInfo = await dex.getPoolInfo();
console.log("Token Reserve:", ethers.formatEther(poolInfo._reserveToken));
console.log("ETH Reserve:", ethers.formatEther(poolInfo._reserveETH));
```

---

## 📋 Checklist finale

- [ ] Alchemy configuré avec URL dans `.env`
- [ ] Clé privée dans `.env` (64 caractères)
- [ ] Solde Sepolia ETH > 0.01 ETH
- [ ] KYC Registry déployé
- [ ] FungibleAssetToken déployé
- [ ] Votre adresse est whitelistée
- [ ] DEX déployé ✨
- [ ] DEX whitelisté dans le KYC
- [ ] Liquidité initiale ajoutée

---

## 🎉 Succès !

Une fois déployé, vous verrez :

```
✅ SimpleDEX deployed to: 0x...
✅ Liquidity added!
📊 Pool Information:
   Token Reserve: 1000.0
   ETH Reserve: 0.1
```

**Prochaine étape** : Tester le swap !

```javascript
// Dans la console Hardhat
await dex.swapETHForTokens(
  ethers.parseEther("10"), // Min 10 tokens
  { value: ethers.parseEther("0.01") } // Spend 0.01 ETH
);
```

---

## 🆘 Toujours bloqué ?

1. **Vérifiez le .env** : 
   ```bash
   cat .env  # Linux/Mac
   type .env  # Windows
   ```

2. **Testez la connexion** :
   ```bash
   npx hardhat run scripts/check-sepolia-balance.ts --network sepolia
   ```

3. **Vérifiez les logs complets** : 
   - Regardez l'erreur exacte
   - Copiez le message d'erreur complet

4. **Dernière solution** : Déployez via Remix IDE
   - Allez sur https://remix.ethereum.org
   - Copiez le code de SimpleDEX.sol
   - Compilez et déployez manuellement

---

**Besoin d'aide ?** Montrez-moi l'erreur exacte !
