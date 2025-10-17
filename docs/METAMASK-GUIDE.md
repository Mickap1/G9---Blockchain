# 🦊 Guide MetaMask - Afficher vos Tokens

Ce guide explique comment :
1. Configurer plusieurs comptes MetaMask pour tester les transactions
2. Ajouter votre token personnalisé dans MetaMask
3. Voir vos tokens et effectuer des transactions

---

## 📱 1. Ajouter votre Token dans MetaMask

### Option A : Ajout Automatique (Recommandé)

1. **Ouvrez MetaMask** et sélectionnez le réseau **Sepolia**
2. Cliquez sur **"Import tokens"** (en bas de l'écran)
3. Sélectionnez l'onglet **"Custom token"**
4. Entrez les informations suivantes :

```
Token Contract Address: 0x6B2a38Ef30420B0AF041F014a092BEDB39F2Eb81
Token Symbol: FAT
Token Decimal: 18
```

5. Cliquez sur **"Add Custom Token"** puis **"Import Tokens"**

✅ **Votre token apparaît maintenant dans MetaMask !**

### Option B : Ajout via Etherscan

1. Ouvrez **Etherscan Sepolia**: https://sepolia.etherscan.io/address/0x6B2a38Ef30420B0AF041F014a092BEDB39F2Eb81
2. Descendez et cliquez sur le bouton **"Add to MetaMask"**
3. Confirmez dans la popup MetaMask

---

## 👥 2. Configurer Plusieurs Comptes MetaMask

### Créer un deuxième compte dans MetaMask

1. Ouvrez MetaMask
2. Cliquez sur l'**icône du compte** (en haut à droite)
3. Sélectionnez **"Add account"** ou **"Import account"**
4. Si vous créez un nouveau compte, notez la **clé privée** pour la configuration Hardhat

### Récupérer la clé privée d'un compte

⚠️ **ATTENTION : Ne partagez JAMAIS votre clé privée !**

1. Ouvrez MetaMask
2. Cliquez sur les **3 points** à côté du nom du compte
3. Sélectionnez **"Account details"**
4. Cliquez sur **"Export Private Key"**
5. Entrez votre mot de passe MetaMask
6. **Copiez la clé privée** (commençant par `0x...`)

---

## 🔧 3. Configurer Hardhat avec Plusieurs Comptes

Modifiez votre `hardhat.config.ts` :

```typescript
const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://eth-sepolia.public.blastapi.io",
      accounts: [
        process.env.PRIVATE_KEY!,        // Wallet 1 (Owner)
        process.env.PRIVATE_KEY_2!,      // Wallet 2 (Test user)
      ],
      chainId: 11155111,
    },
  },
};
```

Ajoutez dans votre `.env` :

```bash
PRIVATE_KEY=votre_clé_privée_compte_1
PRIVATE_KEY_2=votre_clé_privée_compte_2
```

---

## 🧪 4. Tester les Transactions entre Comptes

### Étape 1 : Vérifier votre configuration

```bash
npx hardhat run scripts/test-multi-wallet.ts --network sepolia
```

Ce script va :
- ✅ Afficher les balances des 2 wallets
- ✅ Vérifier le statut KYC
- ✅ Whitelister le wallet 2 si nécessaire
- ✅ Transférer 10 tokens du wallet 1 → wallet 2
- ✅ Faire un swap de 0.001 ETH sur le DEX avec le wallet 2

### Étape 2 : Transférer des tokens manuellement dans MetaMask

1. **Ouvrez MetaMask** et sélectionnez votre **Wallet 1**
2. Cliquez sur votre token **FAT**
3. Cliquez sur **"Send"**
4. Entrez l'adresse de destination (votre Wallet 2)
5. Entrez la quantité de tokens
6. Confirmez la transaction

✅ **Les tokens apparaissent dans le Wallet 2 après confirmation !**

### Étape 3 : Swap sur le DEX via script

Avec le wallet 2, achetez des tokens :

```bash
# Créer un script dédié pour le wallet 2
npx hardhat run scripts/test-swap.ts --network sepolia
```

---

## 📊 5. Voir vos Tokens dans MetaMask

### Après avoir ajouté le token personnalisé :

1. **Ouvrez MetaMask**
2. Sélectionnez le réseau **Sepolia**
3. Votre token **FAT (FungibleAssetToken)** apparaît dans la liste
4. Cliquez dessus pour voir :
   - 💰 Votre balance
   - 📜 Historique des transactions
   - 📈 Valeur estimée (si disponible)

### Vérifier sur Etherscan

Pour confirmer vos balances :

```
Token Contract: https://sepolia.etherscan.io/token/0x6B2a38Ef30420B0AF041F014a092BEDB39F2Eb81

Voir la balance d'une adresse:
https://sepolia.etherscan.io/token/0x6B2a38Ef30420B0AF041F014a092BEDB39F2Eb81?a=VOTRE_ADRESSE
```

---

## 🔍 6. Transactions Typiques à Tester

### Test 1 : Transfert direct de tokens
```typescript
// Wallet 1 → Wallet 2
Token.connect(wallet1).transfer(wallet2.address, ethers.parseUnits("10", 18))
```

### Test 2 : Achat de tokens sur le DEX
```typescript
// Wallet 2 achète des tokens avec de l'ETH
DEX.connect(wallet2).swapETHForTokens(minTokens, { value: ethers.parseEther("0.001") })
```

### Test 3 : Vente de tokens sur le DEX
```typescript
// Wallet 2 vend des tokens contre de l'ETH
Token.connect(wallet2).approve(dexAddress, amount)
DEX.connect(wallet2).swapTokensForETH(amount, minETH)
```

---

## ✅ Checklist Complète

Avant de tester :

- [ ] Réseau Sepolia configuré dans MetaMask
- [ ] Token FAT ajouté dans MetaMask (0x6B2a38Ef30420B0AF041F014a092BEDB39F2Eb81)
- [ ] Au moins 2 comptes MetaMask créés
- [ ] Clés privées configurées dans `.env`
- [ ] Les 2 comptes ont du Sepolia ETH (obtenir sur https://sepoliafaucet.com/)
- [ ] Les 2 comptes sont whitelistés dans le KYC

Pour whitelist un compte :
```bash
npx hardhat console --network sepolia
> const KYC = await ethers.getContractAt("KYCRegistry", "0x8E4312166Ed927C331B5950e5B8ac636841f06Eb")
> await KYC.batchApproveKYC(["0xADRESSE_A_WHITELISTER"])
```

---

## 🎯 Résumé

### Voir vos tokens :
✅ Ajoutez le token dans MetaMask avec l'adresse du contrat

### Tester des transactions :
✅ Configurez plusieurs comptes dans `hardhat.config.ts`
✅ Utilisez le script `test-multi-wallet.ts`
✅ Ou transférez manuellement depuis MetaMask

### Vérifier les transactions :
✅ Consultez MetaMask pour l'historique
✅ Utilisez Etherscan pour les détails : https://sepolia.etherscan.io/

---

## 📞 Adresses de vos Contrats Déployés

```
KYC Registry:   0x8E4312166Ed927C331B5950e5B8ac636841f06Eb
Token (FAT):    0x6B2a38Ef30420B0AF041F014a092BEDB39F2Eb81
DEX:            0x28B2c6b3C1C9F09ca86e6B7cc8d0b9f0Bd7CE7F4
```

Liens Etherscan :
- Token: https://sepolia.etherscan.io/address/0x6B2a38Ef30420B0AF041F014a092BEDB39F2Eb81
- DEX: https://sepolia.etherscan.io/address/0x28B2c6b3C1C9F09ca86e6B7cc8d0b9f0Bd7CE7F4
- KYC: https://sepolia.etherscan.io/address/0x8E4312166Ed927C331B5950e5B8ac636841f06Eb

---

**Bon tests ! 🚀**
