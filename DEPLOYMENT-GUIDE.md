# 🚀 Guide de Déploiement de l'Indexer

Ce guide vous aidera à déployer l'indexer RWA sur différentes plateformes cloud.

---

## Option 1: Railway (Recommandé) 🚂

**Avantages**: 
- Gratuit jusqu'à $5/mois de crédit
- Déploiement en 1 clic depuis GitHub
- Base de données PostgreSQL/MongoDB incluse
- SSL automatique
- Logs en temps réel

### Étapes:

#### 1. Créer un compte Railway
👉 https://railway.app/

#### 2. Créer un nouveau projet
- Cliquez sur "New Project"
- Sélectionnez "Deploy from GitHub repo"
- Connectez votre repo GitHub `G9---Blockchain`

#### 3. Configurer les variables d'environnement

Dans le dashboard Railway, allez dans **Variables** et ajoutez :

```env
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
MONGODB_URI=mongodb+srv://rwa_user:OsM2cIBBEwj20XM0@rwa-cluster.ktlnnue.mongodb.net/?retryWrites=true&w=majority&appName=RWA-Cluster
DB_NAME=rwa_indexer
PORT=3001
LOG_LEVEL=info
NODE_ENV=production
```

#### 4. Déployer
- Railway détectera automatiquement le `Dockerfile`
- Le build et le déploiement se lancent automatiquement
- Attendez 2-3 minutes

#### 5. Obtenir l'URL publique
- Allez dans **Settings** > **Networking**
- Cliquez sur "Generate Domain"
- Vous obtiendrez une URL type: `https://your-app.railway.app`

#### 6. Tester
```bash
curl https://your-app.railway.app/api/health
```

Vous devriez voir:
```json
{"success":true,"status":"healthy","timestamp":"2025-10-22T..."}
```

---

## Option 2: Render 🎨

**Avantages**: 
- Plan gratuit permanent
- Base de données PostgreSQL/MongoDB gratuite
- SSL automatique
- Redéploiement automatique sur push

### Étapes:

#### 1. Créer un compte Render
👉 https://render.com/

#### 2. Créer un nouveau Web Service
- Cliquez sur "New +" > "Web Service"
- Connectez votre repo GitHub
- Sélectionnez `G9---Blockchain`

#### 3. Configuration
```
Name: rwa-indexer
Environment: Docker
Branch: main
Dockerfile Path: ./Dockerfile
```

#### 4. Plan
- Sélectionnez **Free** (512 MB RAM, mise en veille après 15 min d'inactivité)

#### 5. Variables d'environnement
Ajoutez les mêmes que pour Railway (voir ci-dessus)

#### 6. Créer le service
- Cliquez sur "Create Web Service"
- Le déploiement prend 3-5 minutes

#### 7. URL publique
- URL format: `https://rwa-indexer.onrender.com`

⚠️ **Note**: Sur le plan gratuit, le service s'endort après 15 min d'inactivité. Le premier appel peut prendre 30-60 secondes.

---

## Option 3: Vercel (Alternative simple) ⚡

**Avantages**: 
- Gratuit
- Déploiement ultra rapide
- Intégration GitHub parfaite

### Étapes:

#### 1. Modifier le package.json de l'indexer

Ajoutez un script de démarrage:
```json
{
  "scripts": {
    "vercel-build": "cd .. && npm run build --prefix indexer",
    "start": "node dist/index.js"
  }
}
```

#### 2. Créer vercel.json à la racine

```json
{
  "version": 2,
  "builds": [
    {
      "src": "indexer/dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "indexer/dist/index.js"
    }
  ]
}
```

#### 3. Déployer
```bash
npm install -g vercel
cd C:\Users\mrori\Bureau\Epitech\blockchain\Project\G9---Blockchain
vercel
```

#### 4. Suivez les instructions
- Link to existing project? **No**
- Project name? **rwa-indexer**
- Directory? **./indexer**

#### 5. Configurer les variables d'environnement
```bash
vercel env add MONGODB_URI
vercel env add SEPOLIA_RPC_URL
vercel env add DB_NAME
vercel env add PORT
```

#### 6. Déployer en production
```bash
vercel --prod
```

---

## Option 4: VPS (Pour production sérieuse) 💻

**Avantages**: 
- Contrôle total
- Pas de limitations
- Meilleure performance

### Étapes:

#### 1. Louer un VPS
- **DigitalOcean**: $6/mois (droplet Ubuntu)
- **Linode**: $5/mois
- **Vultr**: $6/mois
- **Hetzner**: €4/mois (moins cher)

#### 2. Se connecter en SSH
```bash
ssh root@your-server-ip
```

#### 3. Installer Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

#### 4. Cloner le repo
```bash
git clone https://github.com/Mickap1/G9---Blockchain.git
cd G9---Blockchain
```

#### 5. Créer le fichier .env
```bash
nano indexer/.env
```

Collez vos variables d'environnement, puis `Ctrl+X` > `Y` > `Enter`

#### 6. Build et lancer
```bash
docker build -t rwa-indexer .
docker run -d -p 3001:3001 --name indexer rwa-indexer
```

#### 7. Vérifier
```bash
docker logs -f indexer
curl http://localhost:3001/api/health
```

#### 8. Installer Nginx (reverse proxy)
```bash
apt install nginx
nano /etc/nginx/sites-available/indexer
```

Contenu:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/indexer /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 9. SSL avec Certbot (HTTPS)
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

---

## 🧪 Test de l'API déployée

Une fois déployé, testez tous les endpoints:

```bash
# Health check
curl https://your-app.railway.app/api/health

# Swaps
curl https://your-app.railway.app/api/swaps

# Transfers
curl https://your-app.railway.app/api/transfers

# NFTs
curl https://your-app.railway.app/api/nfts

# Stats
curl https://your-app.railway.app/api/stats
```

---

## 📊 Monitoring

### Logs en temps réel

**Railway**:
```bash
railway logs
```

**Render**:
- Dashboard > Logs

**Vercel**:
```bash
vercel logs
```

**VPS**:
```bash
docker logs -f indexer
```

---

## 🔒 Sécurité

### 1. Variables d'environnement
- ✅ Stockées sur la plateforme (pas dans le code)
- ✅ Pas de commit des fichiers `.env`

### 2. Rate Limiting (TODO)
Ajouter dans `src/index.ts`:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // max 100 requêtes
});

app.use('/api/', limiter);
```

### 3. CORS
Déjà configuré dans `src/index.ts`:
```typescript
app.use(cors());
```

Pour production, limitez les origines:
```typescript
app.use(cors({
  origin: ['https://your-frontend.vercel.app']
}));
```

---

## 🚨 Troubleshooting

### L'indexer ne démarre pas
- Vérifiez les logs
- Vérifiez que `MONGODB_URI` est correct
- Vérifiez que le port 3001 est disponible

### MongoDB connection refused
- Vérifiez que l'IP du serveur est whitelistée sur MongoDB Atlas
- Dans MongoDB Atlas > Network Access > Add IP Address > Allow access from anywhere (0.0.0.0/0)

### Le cron ne se déclenche pas
- Vérifiez les logs toutes les minutes
- Le serveur peut être en "sleep" (Render free tier)

---

## 💰 Coûts

| Plateforme | Gratuit | Payant |
|------------|---------|--------|
| Railway | $5/mois crédit | $5-20/mois |
| Render | Oui (avec limitations) | $7/mois |
| Vercel | Oui (serverless) | $20/mois |
| DigitalOcean | Non | $6/mois |

**Recommandation**: Commencez avec **Railway** (gratuit + facile), puis migrez vers VPS si besoin.

---

## 🎯 Prochaine Étape

Une fois l'indexer déployé, notez l'URL publique:
```
https://your-indexer.railway.app
```

Vous en aurez besoin pour le frontend dans:
```env
NEXT_PUBLIC_INDEXER_API_URL=https://your-indexer.railway.app/api
```

---

## ✅ Checklist Déploiement

- [ ] Compte Railway/Render créé
- [ ] Repo GitHub connecté
- [ ] Variables d'environnement configurées
- [ ] MongoDB IP whitelistée
- [ ] Build réussi
- [ ] Indexer en ligne
- [ ] API endpoints testés
- [ ] URL publique notée
- [ ] Logs vérifiés
- [ ] Cron job fonctionne

Bravo ! Votre indexer est maintenant en ligne 24/7 ! 🎉
