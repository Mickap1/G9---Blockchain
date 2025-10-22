# 🐳 Test Docker Local - Indexer

Avant de déployer en production, testez l'indexer avec Docker localement.

## Prérequis

- Docker Desktop installé: https://www.docker.com/products/docker-desktop/

## Test Rapide

### 1. Vérifier que Docker est installé

```powershell
docker --version
```

Devrait afficher: `Docker version XX.XX.XX`

### 2. Build l'image Docker

```powershell
cd C:\Users\mrori\Bureau\Epitech\blockchain\Project\G9---Blockchain
docker build -t rwa-indexer .
```

⏱️ Première fois: ~3-5 minutes

### 3. Lancer le container

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

### 4. Vérifier les logs

```powershell
docker logs -f rwa-indexer
```

Vous devriez voir:
```
🚀 Starting RWA Indexer...
✅ Connected to MongoDB
📍 Resuming from block XXXXX
✅ Cron job scheduled
🌐 API Server running on http://localhost:3001
```

Appuyez sur `Ctrl+C` pour quitter les logs (le container continue de tourner).

### 5. Tester l'API

```powershell
curl http://localhost:3001/api/health
```

Devrait retourner:
```json
{"success":true,"status":"healthy","timestamp":"..."}
```

### 6. Tester les autres endpoints

```powershell
# Swaps
curl http://localhost:3001/api/swaps

# Stats
curl http://localhost:3001/api/stats

# NFTs
curl http://localhost:3001/api/nfts
```

## Commandes Utiles

### Arrêter le container
```powershell
docker stop rwa-indexer
```

### Redémarrer le container
```powershell
docker start rwa-indexer
```

### Supprimer le container
```powershell
docker rm -f rwa-indexer
```

### Supprimer l'image
```powershell
docker rmi rwa-indexer
```

### Voir tous les containers
```powershell
docker ps -a
```

### Entrer dans le container (debug)
```powershell
docker exec -it rwa-indexer sh
```

## Troubleshooting

### Erreur "port already in use"
Un service utilise déjà le port 3001.

**Solution 1**: Arrêter l'autre service
```powershell
# Trouver le processus
netstat -ano | findstr :3001
# Tuer le processus (remplacer PID)
taskkill /PID <PID> /F
```

**Solution 2**: Utiliser un autre port
```powershell
docker run -d -p 3002:3001 ... rwa-indexer
curl http://localhost:3002/api/health
```

### Erreur MongoDB connection
Vérifiez que:
1. L'IP de votre machine est whitelistée sur MongoDB Atlas
2. Le `MONGODB_URI` est correct (pas d'espaces, pas de `< >`)

### Container s'arrête immédiatement
```powershell
docker logs rwa-indexer
```

Regardez l'erreur dans les logs.

## ✅ Si tout fonctionne

Votre indexer est prêt pour le déploiement en production ! 🎉

Passez au `DEPLOYMENT-GUIDE.md` pour déployer sur Railway/Render.
