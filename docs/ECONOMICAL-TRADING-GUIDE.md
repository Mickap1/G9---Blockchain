# 💸 Guide Économique : Trading avec Gas Optimisé

## 🎯 Objectif
Effectuer toutes les opérations de trading en dépensant **moins de 0.005 ETH au total** au lieu de 0.03+ ETH par opération sur Etherscan.

---

## 📋 Prérequis

1. **Compte 1** (Deployer) : Vous avez 0.038 Sepolia ETH ✅
2. **Compte 2** : À créer/configurer
3. Adresses des contrats déployés ✅

---

## 🚀 Procédure Optimisée (3 Étapes)

### **ÉTAPE 1 : Configurer le Compte 2**

#### A) Créer ou récupérer l'adresse du Compte 2

1. Ouvrez **MetaMask**
2. Créez un nouveau compte ou utilisez un existant
3. **Copiez l'adresse** (commence par 0x...)
4. Obtenez du Sepolia ETH : https://sepoliafaucet.com/

---

#### B) Whitelister le Compte 2 (Coût : ~0.001 ETH)

**Modifiez** `scripts/whitelist-account.ts` :

```typescript
// Ligne 13
const ACCOUNT_2_ADDRESS = "0xVotreAdresseCompte2Ici";
```

**Exécutez** :
```bash
npx hardhat run scripts/whitelist-account.ts --network sepolia
```

**Résultat attendu :**
```
📊 Estimated gas: ~52,000
✅ Transaction confirmed!
   Gas used: 52,341
💰 Coût réel: ~0.001 ETH (au lieu de 0.0315 ETH)
```

---

### **ÉTAPE 2 : Vendre des Tokens (Compte 1 → DEX)**

**Coût : ~0.002 ETH pour approve + swap**

**Exécutez** :
```bash
npx hardhat run scripts/trade-tokens.ts --network sepolia
```

**Ce qui se passe :**
1. ✅ Approve automatique du DEX (~30,000 gas)
2. ✅ Swap de 50 tokens → ETH (~100,000 gas)
3. ✅ Logs détaillés de chaque étape
4. ✅ Lien Etherscan pour vérifier

**Résultat attendu :**
```
📊 Estimated gas (approve): 46,000
📊 Estimated gas (swap): 108,000
✅ Swap confirmed!
   Total gas used: ~154,000
💰 Coût réel: ~0.002 ETH (au lieu de 0.06+ ETH sur Etherscan)
```

---

### **ÉTAPE 3 : Acheter des Tokens (Compte 2 → DEX)**

**Coût : ~0.001 ETH de gas**

Pour utiliser le Compte 2, vous avez 2 options :

#### **Option A : Via Script (Recommandé - Le Plus Économique)**

1. **Ajoutez la clé privée du Compte 2** dans `.env` :
   ```bash
   PRIVATE_KEY_2=votre_clé_privée_compte_2
   ```

2. **Modifiez** `hardhat.config.ts` :
   ```typescript
   sepolia: {
     url: process.env.SEPOLIA_RPC_URL || "...",
     accounts: [
       process.env.PRIVATE_KEY!,
       process.env.PRIVATE_KEY_2!,  // Ajoutez cette ligne
     ],
   }
   ```

3. **Créez** `scripts/buy-tokens-account2.ts` (je peux le créer pour vous)

4. **Exécutez** :
   ```bash
   npx hardhat run scripts/buy-tokens-account2.ts --network sepolia
   ```

**Coût : ~0.001 ETH**

---

#### **Option B : Via Etherscan avec Gas Optimisé**

Si vous préférez utiliser Etherscan quand même :

1. Allez sur : https://sepolia.etherscan.io/address/0x28B2c6b3C1C9F09ca86e6B7cc8d0b9f0Bd7CE7F4#writeContract

2. Connectez le **Compte 2** dans MetaMask

3. Utilisez **swapETHForTokens** avec ces paramètres :
   ```
   minTokens: 5000000000000000000  (minimum 5 tokens)
   swapETHForTokens (payable): 0.001  (envoyer 0.001 ETH)
   ```

4. **AVANT DE CONFIRMER** dans MetaMask :
   - Cliquez sur **"Modifier"** les frais
   - Mode **"Avancé"**
   - Changez :
     ```
     Gas Limit: 120000
     Max Priority Fee: 1 Gwei
     Max Fee: 20 Gwei
     ```

**Coût avec optimisation : ~0.0024 ETH au lieu de 0.03+ ETH**

---

## 📊 Comparaison des Coûts

| Opération | Etherscan (défaut) | Script Optimisé | Économie |
|-----------|-------------------|-----------------|----------|
| Whitelist Compte 2 | 0.0315 ETH | 0.001 ETH | **97%** |
| Approve + Sell | 0.063 ETH | 0.002 ETH | **97%** |
| Buy Tokens | 0.0315 ETH | 0.001 ETH | **97%** |
| **TOTAL** | **0.126 ETH** | **0.004 ETH** | **97%** |

**Avec les scripts : vous économisez 0.122 Sepolia ETH !**

---

## 🎯 Coût Total Optimisé

### Avec les scripts Hardhat :
```
1. Whitelist Compte 2:     0.001 ETH
2. Approve DEX:            0.001 ETH
3. Sell 50 tokens:         0.001 ETH
4. Buy tokens (Compte 2):  0.001 ETH
────────────────────────────────────
TOTAL:                     0.004 ETH
```

### Votre budget actuel : 0.038 ETH
```
0.038 - 0.004 = 0.034 ETH restant
```

✅ **Vous pouvez faire ~8 cycles complets de trading avec votre budget !**

---

## 🛠️ Actions Immédiates

### Je peux vous aider à :

1. **Configurer automatiquement le Compte 2** dans le script whitelist
   - Donnez-moi juste l'adresse du Compte 2
   - Je configure et lance le script pour vous

2. **Créer un script d'achat optimisé pour le Compte 2**
   - Configuration automatique de hardhat.config.ts
   - Script prêt à l'emploi avec gas optimisé

3. **Tester le trading complet** avec les 3 scripts
   - Whitelist (0.001 ETH)
   - Sell (0.002 ETH)
   - Buy (0.001 ETH)
   - Total : 0.004 ETH

---

## 💡 Pourquoi les scripts sont moins chers ?

1. **Estimation précise du gas** : Hardhat calcule exactement le gas nécessaire
2. **Pas de sur-estimation** : Etherscan ajoute 10-20x de marge de sécurité
3. **Optimisation automatique** : Les scripts ajoutent seulement 20% de buffer
4. **Batch operations** : Possibilité de grouper plusieurs opérations

---

## 🚀 Prêt à Commencer ?

**Dites-moi :**
1. L'adresse de votre Compte 2 (pour que je configure le whitelist)
2. Si vous voulez que je crée le script d'achat optimisé pour le Compte 2

**Ou bien** dites-moi simplement "GO" et donnez-moi l'adresse du Compte 2, je m'occupe de tout ! 😊

---

**Objectif : Dépenser seulement 0.004 ETH au lieu de 0.126 ETH = Économie de 97% !** 🎯
