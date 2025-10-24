# 🧪 Test de l'Exigence #4 : Real-Time On-Chain Awareness

## 📋 But du test

Ce test vérifie que **l'exigence #4 du projet est respectée** :

> "If a user swaps directly on the DEX (outside your UI), the change must appear in your app"

## 🎯 Ce que fait le test

1. ✅ Fait un swap **directement sur le smart contract** (via ethers.js)
   - Simule un utilisateur qui utilise Etherscan ou MetaMask
   - **Ne passe PAS par l'interface web**

2. ✅ Vérifie que l'indexeur détecte la transaction
   - Attend jusqu'à 2 minutes (l'indexeur scanne toutes les 60s)
   - Interroge l'API de l'indexeur

3. ✅ Confirme que le swap apparaît dans l'API
   - Vérifie le hash de transaction
   - Affiche les détails du swap indexé

## 🚀 Comment exécuter le test

### Prérequis

1. **Indexeur démarré** (Railway ou local)
   ```bash
   # Vérifier que l'indexeur fonctionne
   curl https://g9-blockchain-production-836a.up.railway.app/api/health
   ```

2. **Compte whitelisté** pour trader
   ```bash
   # Si pas encore fait
   npx hardhat run scripts/whitelist-account.ts --network sepolia
   ```

3. **Un peu d'ETH Sepolia** sur le compte
   - Le test fait un swap de 0.001 ETH

### Lancer le test

```bash
npx hardhat run scripts/test-indexer-requirement.ts --network sepolia
```

## 📊 Résultat attendu

### ✅ Test réussi

```
╔════════════════════════════════════════════════════════════╗
║  ✅ EXIGENCE #4 RESPECTÉE !                                ║
║                                                            ║
║  Un swap fait directement sur le smart contract           ║
║  (en dehors de l'UI) apparaît bien dans l'indexeur        ║
║  et sera donc visible dans le frontend!                   ║
╚════════════════════════════════════════════════════════════╝
```

Le test affiche :
- ✅ Le hash de la transaction
- ✅ Les détails du swap indexé
- ✅ Confirmation que le swap est dans l'API

### ❌ Test échoué

Si le test échoue, il affiche des pistes de diagnostic :
- L'indexeur est-il démarré ?
- Les adresses des contrats sont-elles correctes ?
- Le compte est-il whitelisté ?

## 🔍 Vérification manuelle dans le frontend

Après que le test réussisse, tu peux vérifier visuellement :

### Option 1 : Dashboard
```
1. Ouvrir http://localhost:3000/dashboard
2. Regarder la section "Activité Blockchain en Temps Réel"
3. Le swap doit apparaître dans la liste
```

### Option 2 : Page DEX
```
1. Ouvrir http://localhost:3000/dex
2. Scroller jusqu'à "Historique des Swaps (Temps Réel)"
3. Le swap est visible avec tous ses détails
```

### Option 3 : API directe
```bash
# Récupérer les 5 derniers swaps
curl https://g9-blockchain-production-836a.up.railway.app/api/swaps?limit=5

# Chercher ton hash de transaction dans la réponse
```

## 🎓 Pourquoi ce test est important

Ce test prouve que :

1. ✅ L'indexeur monitore **vraiment** la blockchain
2. ✅ Il détecte **toutes** les transactions (pas juste celles de l'UI)
3. ✅ Le frontend affiche **toutes** les activités on-chain
4. ✅ L'exigence #4 est **complètement respectée**

Sans indexeur, on verrait seulement les transactions de l'utilisateur connecté.  
Avec l'indexeur, on voit **toutes les transactions de tous les utilisateurs**, même externes ! 🎉

## 🐛 Dépannage

### "Indexeur hors ligne"
```bash
# Vérifier l'indexeur Railway
curl https://g9-blockchain-production-836a.up.railway.app/api/health

# Ou démarrer en local
cd indexer
npm start
```

### "You are not whitelisted"
```bash
npx hardhat run scripts/whitelist-account.ts --network sepolia
```

### "Insufficient funds"
```bash
# Obtenir de l'ETH Sepolia sur un faucet
# https://sepoliafaucet.com/
# https://www.alchemy.com/faucets/ethereum-sepolia
```

### Le swap n'apparaît pas après 2 minutes
```bash
# Vérifier les logs de l'indexeur (Railway)
# Vérifier que les adresses des contrats sont correctes
cat src/config/contracts.ts
```

## 📝 Fichiers liés

- **Ce script** : `/scripts/test-indexer-requirement.ts`
- **Indexeur** : `/src/services/eventListener.ts`
- **Config contrats** : `/src/config/contracts.ts`
- **Composant frontend** : `/frontend/components/RecentActivity.tsx`
- **API client** : `/frontend/lib/api.ts`
- **Hooks React** : `/frontend/lib/hooks/useIndexer.ts`

## 🎬 Démo vidéo suggérée

Pour documenter le projet, tu peux enregistrer :

1. Exécution du test dans le terminal
2. Affichage du swap qui apparaît dans le dashboard
3. Vérification sur Etherscan que c'est bien la même transaction

Cela prouve visuellement que l'exigence #4 fonctionne ! 📹

---

**Dernière mise à jour** : 24 octobre 2025
