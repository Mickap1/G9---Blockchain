# 🔄 Integration de l'Indexeur Blockchain

## ✅ Statut de l'intégration

L'indexeur blockchain est **complètement intégré et déployé sur Railway** ! 🚀

### Ce qui a été fait :

1. ✅ **Backend indexeur** : Monitore les événements blockchain en temps réel
2. ✅ **Déployé sur Railway** : `https://g9-blockchain-production-836a.up.railway.app`
3. ✅ **API REST** : Expose les données sur `/api/*`
4. ✅ **Hooks React** : `useIndexer.ts` pour consommer l'API facilement
5. ✅ **Header avec indicateur** : Affiche le statut de l'indexeur (Live / Direct Mode)
6. ✅ **Page DEX** : Affiche l'historique des swaps depuis l'indexeur
7. ✅ **Auto-refresh** : Les données se mettent à jour automatiquement toutes les 60 secondes
8. ✅ **MongoDB Atlas** : Base de données cloud pour le stockage

### 📊 Statistiques actuelles (indexeur en production) :
- 3 swaps indexés
- 3 transfers de tokens
- 1 NFT créé
- 133 mises à jour de prix Oracle

---

## 🌐 Déploiement Railway (Production)

### L'indexeur est déjà déployé ! 🎉

**URL de production** : `https://g9-blockchain-production-836a.up.railway.app`

Le frontend est configuré pour utiliser automatiquement l'indexeur Railway en production.

### Tester l'indexeur en production

```bash
# Santé de l'API
curl https://g9-blockchain-production-836a.up.railway.app/api/health

# Statistiques
curl https://g9-blockchain-production-836a.up.railway.app/api/stats

# Derniers swaps
curl https://g9-blockchain-production-836a.up.railway.app/api/swaps

# NFTs
curl https://g9-blockchain-production-836a.up.railway.app/api/nfts
```

### Configuration Railway

Le projet utilise :
- **Dockerfile** : Build automatique depuis le fichier `Dockerfile`
- **MongoDB Atlas** : Base de données cloud (variable `MONGODB_URI`)
- **Auto-deploy** : À chaque push sur `main`
- **Restart policy** : Redémarre automatiquement en cas d'erreur

Voir `railway.json` pour la configuration complète.

---

## 🚀 Développement Local (Optionnel)

Si tu veux tester l'indexeur localement (pas nécessaire, il est déjà en prod) :

### Option 1 : Avec le script PowerShell (recommandé)

```powershell
# Depuis la racine du projet
.\scripts\start-indexer.ps1
```

Le script va :
- Vérifier Node.js
- Créer le fichier `.env` si nécessaire
- Installer les dépendances
- Compiler le code si besoin
- Démarrer l'indexeur

### Option 2 : Manuellement

```bash
# 1. Aller dans le dossier indexer
cd indexer

# 2. Configurer le .env (si pas déjà fait)
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Installer les dépendances
npm install

# 4. Compiler le code TypeScript
npm run build

# 5. Démarrer l'indexeur
npm start
```

---

## ⚙️ Configuration requise

### Fichier `.env` dans `/indexer/`

```env
# RPC Sepolia (Infura, Alchemy, ou autre)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_API_KEY

# MongoDB (local ou cloud)
MONGODB_URI=mongodb://localhost:27017/rwa-indexer

# Port de l'API (optionnel, défaut: 3001)
PORT=3001

# Host (optionnel, défaut: 0.0.0.0)
HOST=0.0.0.0
```

### MongoDB

L'indexeur a besoin de MongoDB pour stocker les données indexées.

**Installation locale (Windows)** :
```powershell
# Avec Chocolatey
choco install mongodb

# Ou télécharger depuis : https://www.mongodb.com/try/download/community
```

**Ou utiliser MongoDB Atlas (cloud gratuit)** :
1. Créer un compte sur https://www.mongodb.com/cloud/atlas
2. Créer un cluster gratuit
3. Obtenir la connection string
4. L'ajouter dans `.env` : `MONGODB_URI=mongodb+srv://...`

---

## 🧪 Tester l'indexeur

### 1. Vérifier que l'indexeur est démarré

```bash
curl http://localhost:3001/api/health
```

Réponse attendue :
```json
{
  "status": "ok",
  "timestamp": "2025-10-24T..."
}
```

### 2. Voir les statistiques

```bash
curl http://localhost:3001/api/stats
```

### 3. Voir les derniers swaps

```bash
curl http://localhost:3001/api/swaps?limit=10
```

### 4. Voir les NFTs

```bash
curl http://localhost:3001/api/nfts
```

---

## 🌐 Frontend : Utilisation de l'indexeur

### Header avec indicateur de statut

Le header affiche maintenant un indicateur :
- 🟢 **"Indexer Live"** : L'indexeur est actif, les données sont en temps réel
- 🔴 **"Direct Mode"** : L'indexeur est hors ligne, lecture directe depuis la blockchain

### Page DEX - Historique des swaps

La page DEX affiche maintenant l'historique complet des swaps depuis l'indexeur.

**Avantages** :
- ✅ Affiche TOUS les swaps, même ceux effectués hors de l'interface
- ✅ Mise à jour automatique toutes les 60 secondes
- ✅ Pas besoin de rafraîchir la page manuellement
- ✅ Performance optimale (pas besoin de scanner la blockchain)

### Hooks React disponibles

```typescript
import { 
  useIndexerHealth,
  useIndexerSwaps,
  useIndexerTransfers,
  useIndexerNFTs,
  useIndexerStats
} from '@/lib/hooks/useIndexer';

// Exemple d'utilisation
function MyComponent() {
  const { isHealthy, loading } = useIndexerHealth();
  const { swaps, loading: swapsLoading } = useIndexerSwaps(20, 0);
  const { stats } = useIndexerStats();
  
  // ...
}
```

---

## 📊 Ce que l'indexeur surveille

L'indexeur monitore automatiquement ces événements :

### 1. **DEX (SimpleDEX)**
- `Swap` : Tous les échanges ETH ↔ Token
- `LiquidityAdded` : Ajouts de liquidité
- `LiquidityRemoved` : Retraits de liquidité

### 2. **Tokens (FungibleAssetToken)**
- `Transfer` : Tous les transferts de tokens
- Suivi des balances en temps réel

### 3. **NFTs (NFTAssetTokenV2)**
- `Transfer` : Transferts de NFTs
- `NFTMinted` : Création de nouveaux NFTs
- Métadonnées et propriétaires

### 4. **Oracle (SimplePriceOracle)**
- `PriceUpdated` : Mises à jour des prix
- Historique des valorisations

---

## 🔄 Synchronisation automatique

L'indexeur fonctionne avec un **cron job** qui s'exécute **toutes les minutes** :

1. Récupère le dernier bloc indexé depuis MongoDB
2. Scanne les nouveaux blocs depuis ce point
3. Récupère tous les events des contrats surveillés
4. Stocke les nouvelles données dans MongoDB
5. Les expose via l'API REST

**Résultat** : Le frontend affiche toujours les données les plus récentes, même si quelqu'un interagit directement avec les smart contracts via Etherscan ou un autre wallet !

---

## 🎯 Pourquoi c'est important

### Sans indexeur :
- ❌ Le frontend doit scanner la blockchain à chaque chargement
- ❌ Lent et consomme beaucoup de RPC calls
- ❌ Ne voit que les transactions de l'utilisateur connecté
- ❌ Pas d'historique global

### Avec indexeur :
- ✅ Données pré-indexées et optimisées
- ✅ API rapide (quelques ms)
- ✅ Vue complète de toutes les transactions
- ✅ Historique complet et statistiques globales
- ✅ **Satisfait l'exigence #4 du projet** 🎓

---

## 🐛 Dépannage

### L'indexeur ne démarre pas

1. **Vérifier MongoDB** :
   ```bash
   # Tester la connexion MongoDB
   mongosh "mongodb://localhost:27017/rwa-indexer"
   ```

2. **Vérifier le .env** :
   - `SEPOLIA_RPC_URL` est valide ?
   - `MONGODB_URI` est correct ?

3. **Vérifier les logs** :
   ```bash
   cd indexer
   cat logs/combined.log
   ```

### Le frontend affiche "Direct Mode"

**Note** : En production, le frontend utilise automatiquement l'indexeur Railway. "Direct Mode" ne devrait apparaître que si :

1. L'indexeur Railway est down (très rare)
   ```bash
   curl https://g9-blockchain-production-836a.up.railway.app/api/health
   ```

2. Problème de CORS (déjà configuré dans l'indexeur)

3. Variable d'environnement incorrecte :
   ```bash
   # Dans frontend/.env.local (déjà configuré)
   NEXT_PUBLIC_INDEXER_API_URL=https://g9-blockchain-production-e218.up.railway.app
   ```

4. Redémarrer le frontend si tu viens de le modifier :
   ```bash
   cd frontend
   npm run dev
   ```

### Les données ne se mettent pas à jour

1. Vérifier que l'indexeur tourne (logs doivent afficher "Cron job triggered" chaque minute)
2. Vérifier que les contrats sont bien configurés dans `src/config/contracts.ts`
3. Attendre ~60 secondes pour la prochaine synchronisation

---

## 📚 Documentation technique

### API Endpoints

```
GET  /api/health              - Statut de l'indexeur
GET  /api/stats               - Statistiques globales
GET  /api/swaps               - Liste des swaps (query: limit, skip)
GET  /api/transfers           - Liste des transfers (query: limit, skip)
GET  /api/nfts                - Liste des NFTs (query: owner)
GET  /api/price-updates       - Historique des prix Oracle
```

### Structure MongoDB

Collections :
- `swaps` : Événements Swap du DEX
- `transfers` : Transferts de tokens
- `nfts` : NFTs avec métadonnées
- `priceUpdates` : Mises à jour Oracle
- `indexerState` : Dernier bloc indexé

---

## ✨ Améliorations futures possibles

- [ ] WebSocket pour updates en temps réel (push au lieu de pull)
- [ ] Dashboard d'analytics avancé
- [ ] Notifications pour les gros swaps
- [ ] Graphiques de prix historiques
- [ ] Export des données en CSV
- [ ] API de recherche par adresse/hash

---

## 🎓 Conformité avec l'exigence #4

> **Exigence projet** : "Votre frontend doit refléter l'état réel de la blockchain. Si un utilisateur swap directement sur le DEX (en dehors de votre UI), le changement doit apparaître dans votre app. Construisez un indexeur simple qui sync les événements on-chain."

### ✅ Comment on répond à cette exigence :

1. **Indexeur backend** qui scanne la blockchain chaque minute
2. **Stockage MongoDB** pour les événements indexés
3. **API REST** pour exposer les données
4. **Frontend React** qui consomme l'API
5. **Auto-refresh** toutes les 60 secondes
6. **Affichage des swaps externes** dans l'historique

**Résultat** : Si quelqu'un fait un swap via Etherscan ou MetaMask directement sur le contrat, il apparaîtra dans notre interface dans les 60 secondes suivantes ! 🎉

---

**Dernière mise à jour** : 24 octobre 2025
