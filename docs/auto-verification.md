# 🚀 Script de Déploiement avec Vérification Automatique

## Modifications apportées

Le script `deploy-testnet.ts` a été amélioré pour **vérifier automatiquement les contrats** après le déploiement.

## ✨ Nouvelles fonctionnalités

### 1. **Vérification automatique des contrats**
Après le déploiement, le script attend 30 secondes puis vérifie automatiquement :
- ✅ KYCRegistry
- ✅ FungibleAssetToken

### 2. **Support multi-réseau**
Le script détecte automatiquement le réseau et ajuste :
- Les URLs des explorateurs (Sepolia Etherscan ou Amoy Polygonscan)
- Le symbole de la monnaie (ETH ou MATIC)
- Le nom du fichier de sauvegarde

### 3. **Gestion des erreurs**
Le script gère les cas où :
- Le contrat est déjà vérifié
- La vérification échoue (affiche l'erreur mais continue)

## 📝 Utilisation

### Déploiement sur Sepolia

```bash
npm run deploy:sepolia
```

ou

```bash
npx hardhat run scripts/deploy-testnet.ts --network sepolia
```

### Déploiement sur Amoy

```bash
npm run deploy:amoy
```

ou

```bash
npx hardhat run scripts/deploy-testnet.ts --network amoy
```

## 🔍 Processus de déploiement

1. ✅ Déploie KYCRegistry
2. ✅ Déploie FungibleAssetToken
3. ✅ Configure le KYC initial (whitelist deployer)
4. ✅ Mint 1000 tokens initiaux
5. ⏳ Attend 30 secondes pour l'indexation
6. 🔍 Vérifie KYCRegistry sur l'explorer
7. 🔍 Vérifie FungibleAssetToken sur l'explorer
8. 💾 Sauvegarde les adresses dans `deployments/`

## 📊 Sortie du script

Le script affiche maintenant :
- L'adresse du déployeur et son solde
- Les adresses des contrats déployés
- Les liens vers les explorateurs
- Le statut de vérification (✅ vérifié ou ❌ erreur)
- Les informations de l'actif
- Vos holdings de tokens
- Les prochaines étapes (plus besoin de vérifier manuellement !)

## ⚙️ Configuration requise

Assurez-vous que votre fichier `.env` contient :

```env
PRIVATE_KEY=votre_cle_privee_64_caracteres
ETHERSCAN_API_KEY=votre_cle_api_etherscan_ou_polygonscan
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
```

## 🎯 Exemple de sortie

```
🚀 Deploying to sepolia...

📍 Deploying with account: 0x1234...5678
💰 Account balance: 0.5 ETH

📄 Deploying KYCRegistry...
✅ KYCRegistry deployed to: 0xABCD...1234
   View on explorer: https://sepolia.etherscan.io/address/0xABCD...1234

📄 Deploying FungibleAssetToken (Sample Real Estate)...
✅ Token deployed to: 0xEF12...5678
   View on explorer: https://sepolia.etherscan.io/address/0xEF12...5678

🔐 Setting up initial KYC...
✅ Deployer whitelisted

🪙 Minting initial tokens to deployer...
✅ Minted 1,000 PLM tokens

🔍 Verifying contracts on block explorer...
⏳ Waiting 30 seconds for contracts to be indexed...

📄 Verifying KYCRegistry...
✅ KYCRegistry verified!

📄 Verifying FungibleAssetToken...
✅ FungibleAssetToken verified!

🎉 Deployment Complete!

📋 Contract Addresses:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KYCRegistry:   0xABCD...1234
Token (PLM):   0xEF12...5678

📝 Next Steps:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. ✅ Contracts verified on block explorer!

2. Add token to MetaMask:
   - Token Address: 0xEF12...5678
   - Symbol: PLM
   - Decimals: 18

3. Interact via block explorer (Write Contract tab)

💾 Addresses saved to: deployments/sepolia-addresses.json
```

## 🔄 Fichier de sauvegarde

Le fichier JSON sauvegardé contient maintenant :
```json
{
  "kycRegistry": "0xABCD...1234",
  "token": "0xEF12...5678",
  "deployer": "0x1234...5678",
  "network": "sepolia",
  "chainId": 11155111,
  "deployedAt": "2025-10-17T10:30:00.000Z",
  "verified": true
}
```

## 💡 Avantages

- ⚡ **Gain de temps** : Plus besoin de vérifier manuellement
- 🎯 **Moins d'erreurs** : Les arguments de constructeur sont automatiquement corrects
- 📦 **Tout-en-un** : Déploiement + vérification en une seule commande
- 🌐 **Multi-réseau** : Fonctionne sur Sepolia et Amoy

## 🐛 Dépannage

### La vérification échoue
- Vérifiez que `ETHERSCAN_API_KEY` est défini dans `.env`
- Attendez quelques minutes et vérifiez manuellement si nécessaire
- Le contrat peut déjà être vérifié (message "Already Verified")

### Erreur "Too Many Requests"
- L'API Etherscan a des limites de taux
- Attendez quelques minutes et redéployez

### Contrats non indexés
- Si la vérification échoue, attendez 1-2 minutes
- Visitez l'explorer pour vérifier manuellement si nécessaire
