# 🧪 Test Local Avant Déploiement

## ✅ Erreur TypeScript Corrigée

Le problème dans `src/utils/logger.ts` a été corrigé.

## 📋 Étapes pour Tester en Local avec Docker

### 1. Démarrer Docker Desktop

1. Ouvrez **Docker Desktop** sur Windows
2. Attendez qu'il soit complètement démarré (icône dans la barre des tâches devient verte)
3. Vous devriez voir "Docker Desktop is running"

### 2. Build l'Image Docker

```powershell
cd C:\Users\mrori\Bureau\Epitech\blockchain\Project\G9---Blockchain
docker build -t rwa-indexer .
```

⏱️ Durée: 3-5 minutes la première fois

Vous verrez:
```
[+] Building 120.5s (14/14) FINISHED
 => [internal] load build definition from Dockerfile
 => [internal] load .dockerignore
 => [internal] load metadata for docker.io/library/node:18-alpine
 => [ 1/12] FROM docker.io/library/node:18-alpine
 => [ 2/12] WORKDIR /app
 => [ 3/12] COPY indexer/package*.json ./indexer/
 ...
 => [12/12] RUN npm run build
 => exporting to image
 => => naming to docker.io/library/rwa-indexer
```

### 3. Lancer le Container

```powershell
docker run -d -p 3001:3001 `
  -e MONGODB_URI="mongodb+srv://rwa_user:OsM2cIBBEwj20XM0@rwa-cluster.ktlnnue.mongodb.net/?retryWrites=true&w=majority&appName=RWA-Cluster" `
  -e DB_NAME="rwa_indexer" `
  -e PORT="3001" `
  -e SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" `
  -e LOG_LEVEL="info" `
  --name rwa-indexer `
  rwa-indexer
```

### 4. Voir les Logs

```powershell
docker logs -f rwa-indexer
```

Vous devriez voir:
```
Loading .env from: ...
🚀 Starting RWA Indexer...
✅ Connected to MongoDB
✅ Database indexes created
📍 Resuming from block XXXXX
🔄 Running initial indexing...
✅ Cron job scheduled (every minute)
🌐 API Server running on http://localhost:3001
```

Appuyez sur `Ctrl+C` pour quitter les logs.

### 5. Tester l'API

Ouvrez un **nouveau terminal** PowerShell et testez:

```powershell
# Health check
curl http://localhost:3001/api/health

# Swaps
curl http://localhost:3001/api/swaps

# Stats
curl http://localhost:3001/api/stats
```

### 6. Arrêter le Container

```powershell
docker stop rwa-indexer
docker rm rwa-indexer
```

---

## ✅ Si Tout Fonctionne en Local

1. **Commit les changements** (correction du logger)
```powershell
git add src/utils/logger.ts
git commit -m "Fix TypeScript error in logger"
git push origin main
```

2. **Redéployez sur Railway**
   - Railway va automatiquement détecter le push
   - Le build devrait réussir cette fois
   - Attendez 3-5 minutes

---

## 🐛 Troubleshooting

### Docker Desktop ne démarre pas
- Redémarrez Windows
- Réinstallez Docker Desktop: https://www.docker.com/products/docker-desktop/

### Port 3001 déjà utilisé
```powershell
# Utilisez un autre port
docker run -d -p 3002:3001 ... rwa-indexer
curl http://localhost:3002/api/health
```

### MongoDB connection error
- Vérifiez que 0.0.0.0/0 est whitelisté sur MongoDB Atlas
- Vérifiez le MONGODB_URI (pas d'espaces, pas de `< >`)

---

## 🚀 Prochaine Étape

Une fois que le test local fonctionne:
1. Push les changements sur GitHub
2. Railway redéploiera automatiquement
3. Vérifiez les logs sur Railway
4. Testez l'API publique

Puis on passe au **Frontend Next.js** ! 🎉
