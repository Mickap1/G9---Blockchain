# 🧪 TEST MANUEL - Guide Étape par Étape

## 🎯 Ce que nous allons faire :

1. Lancer l'indexer dans un terminal
2. Faire une transaction sur Sepolia (mint NFT)
3. Voir l'indexer détecter l'événement automatiquement

---

## 📋 ÉTAPE 1 : Préparer l'Indexer

### Option A : Build et Run (Recommandé)

```bash
cd indexer
npm run build
node dist/index.js
```

### Option B : Avec nodemon (Alternative)

```bash
cd indexer
npm install -g nodemon
nodemon --exec "npx ts-node ../src/index.ts"
```

---

## 📋 ÉTAPE 2 : Vérifier que l'Indexer tourne

Vous devriez voir :
```
🚀 Starting RWA Indexer...
✅ Connected to MongoDB
📍 Resuming from block XXXXX
✅ Cron job scheduled (every minute)
🌐 API Server running on http://localhost:3001
```

**⚠️ NE FERMEZ PAS CE TERMINAL !**

---

## 📋 ÉTAPE 3 : Ouvrir un 2ème Terminal

Dans un NOUVEAU terminal PowerShell :

```bash
cd C:\Users\mrori\Bureau\Epitech\blockchain\Project\G9---Blockchain
npx ts-node scripts/test-indexer.ts
```

---

## 📋 ÉTAPE 4 : Observer le Résultat

### Dans le Terminal 2 (transaction), vous verrez :
```
🧪 Test de l'indexer - Mint d'un NFT Diamond
💎 Minting NFT...
⏳ Transaction envoyée: 0xabc123...
✅ Transaction confirmée dans le bloc 9459400
🎯 MAINTENANT, REGARDEZ VOTRE INDEXER !
```

### Dans le Terminal 1 (indexer), dans les 60 secondes :
```
⏰ Cron job triggered - Indexing new events...
🔍 Indexing blocks 9459398 to 9459401

🔔 NOUVEAU NFT MINTÉ !
   Token ID: #X
   Owner: 0x...
   Nom: Diamond_Test_XXXXXXXXX
   Valuation: 2.5 ETH
   Bloc: 9459400
   TX: https://sepolia.etherscan.io/tx/0xabc123...

💎 Indexed 1 NFT mints, 0 valuations, 0 transfers
✅ Indexed blocks 9459398 to 9459401
```

---

## ✅ TEST RÉUSSI SI :

- [ ] L'indexer détecte automatiquement le NFT
- [ ] Affiche "🔔 NOUVEAU NFT MINTÉ !"
- [ ] Montre tous les détails (ID, Owner, Nom, Valuation)
- [ ] Donne le lien Etherscan

---

## 🔄 Alternative : Test depuis Etherscan Directement

Si vous préférez faire un test "manuel" depuis Etherscan :

1. Allez sur votre contrat NFT sur Etherscan :
   https://sepolia.etherscan.io/address/0xcC1fA977E3c47D3758117De61218208c1282362c#writeContract

2. Connectez votre wallet

3. Appelez la fonction `mintAsset` :
   - `to`: votre adresse
   - `name`: "Diamond_Manual_Test"
   - `valuation`: 2500000000000000000 (2.5 ETH en wei)

4. Confirmez la transaction

5. **Attendez max 1 minute** et regardez votre indexer !

---

## 🐛 Si ça ne marche pas :

### L'indexer se ferme tout seul ?
Essayez la version compilée :
```bash
cd indexer
npm run build
node dist/index.js
```

### Pas de message "NOUVEAU NFT MINTÉ" ?
- Vérifiez que l'adresse du contrat NFT est correcte dans `src/config/contracts.ts`
- Vérifiez que le cron tourne (message "⏰ Cron job triggered" toutes les minutes)
- Attendez 1 minute complète

### Erreur de connexion MongoDB ?
- Vérifiez le fichier `indexer/.env`
- Testez avec : `npx ts-node indexer/test-connection.ts`

---

## 💡 Astuce

Pour voir l'indexer en action sans faire de transaction :
1. Lancez l'indexer
2. Regardez les messages "⏰ Cron job triggered" toutes les minutes
3. Cela prouve que le système fonctionne !

Si vous mintez un NFT après, il sera automatiquement détecté.

---

## 📊 Vérifier les Données Stockées

Après le test, vérifiez MongoDB :

```bash
curl http://localhost:3001/api/nfts
```

Vous devriez voir votre NFT dans la réponse JSON !
