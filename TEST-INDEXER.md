# 🧪 Test de l'Indexer en Direct

## Objectif
Vérifier que l'indexer détecte automatiquement les événements blockchain en temps réel.

## Étapes du Test

### 1️⃣ Ouvrir 2 Terminaux

**Terminal 1** : Pour l'indexer
**Terminal 2** : Pour la transaction test

---

### 2️⃣ Terminal 1 - Lancer l'Indexer

```bash
cd indexer
npm run dev
```

**Ce que vous devriez voir :**
```
🚀 Starting RWA Indexer...
✅ Connected to MongoDB
📍 Resuming from block XXXXX
🔄 Running initial indexing...
✅ Cron job scheduled (every minute)
🌐 API Server running on http://localhost:3001
```

**Laissez ce terminal ouvert et visible !**

---

### 3️⃣ Terminal 2 - Exécuter une Transaction Test

Attendez 10 secondes, puis dans le 2ème terminal :

```bash
npx ts-node scripts/test-indexer.ts
```

**Ce que vous devriez voir :**
```
🧪 Test de l'indexer - Mint d'un NFT Diamond
📍 Contrat NFT: 0xcC1fA977E3c47D3758117De61218208c1282362c
👤 Compte: 0x...
💎 Minting NFT...
   Nom: Diamond_Test_1729520123456
   Valuation: 2.5 ETH
⏳ Transaction envoyée: 0xabc123...
🔗 Etherscan: https://sepolia.etherscan.io/tx/0xabc123...
✅ Transaction confirmée dans le bloc 9459400
🎯 MAINTENANT, REGARDEZ VOTRE INDEXER !
```

---

### 4️⃣ Observez le Terminal 1 (Indexer)

**Dans les 60 secondes suivantes**, vous devriez voir dans le Terminal 1 :

```
⏰ Cron job triggered - Indexing new events...
🔍 Indexing blocks 9459398 to 9459401
🔔 NOUVEAU NFT MINTÉ !
   Token ID: #1
   Owner: 0x...
   Nom: Diamond_Test_1729520123456
   Valuation: 2.5 ETH
   Bloc: 9459400
   TX: https://sepolia.etherscan.io/tx/0xabc123...
💎 Indexed 1 NFT mints, 0 valuations, 0 transfers
✅ Indexed blocks 9459398 to 9459401
```

---

## ✅ Test Réussi Si :

1. ✅ L'indexer détecte automatiquement le NFT minté
2. ✅ Affiche les détails complets (nom, owner, valuation, TX hash)
3. ✅ Stocke l'événement dans MongoDB

---

## 🎨 Variantes de Test

### Test avec un Transfer de Tokens

```bash
npx ts-node scripts/trade-tokens.ts
```

### Test avec un Swap sur le DEX

```bash
npx ts-node scripts/buy-with-account2.ts
```

---

## 🔍 Vérifier dans MongoDB

Après le test, vérifiez que les données sont bien stockées :

```bash
cd indexer
npx ts-node test-connection.ts
```

Ou consultez l'API :

```bash
curl http://localhost:3001/api/nfts
```

---

## ❌ Troubleshooting

**L'indexer ne détecte rien ?**
- Vérifiez que le cron tourne (devrait afficher "⏰ Cron job triggered" toutes les minutes)
- Vérifiez que les adresses de contrats dans `src/config/contracts.ts` sont correctes
- Attendez jusqu'à 1 minute (le cron s'exécute toutes les minutes)

**Erreur "Cannot find module" ?**
- Vérifiez que vous êtes dans le bon dossier
- Exécutez `npm install` si nécessaire

---

## 📊 Résultat Attendu

L'indexer doit automatiquement :
1. Scanner les nouveaux blocs toutes les minutes
2. Détecter les événements de vos contrats
3. Afficher un message détaillé dans la console
4. Stocker les données dans MongoDB
5. Les rendre disponibles via l'API REST

C'est exactement ce dont votre frontend a besoin pour afficher les données en temps réel ! 🎉
