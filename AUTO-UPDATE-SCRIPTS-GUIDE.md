# 🤖 Scripts Auto-Update - Guide d'Hébergement

## 📋 Vue d'ensemble

Deux scripts pour mettre à jour automatiquement les prix dans l'Oracle à **chaque heure pile** (XX:00) :

1. **`auto-update-all-nft-prices.ts`** - Met à jour tous les NFTs
2. **`auto-update-rwat-price.ts`** - Met à jour le token RWAT

## ⏰ Planification Horaire

Les deux scripts utilisent une logique de **synchronisation horaire** :
- Attendent la prochaine heure pile (ex: 22h00, 23h00, 00h00)
- Exécutent la mise à jour
- Attendent la prochaine heure pile
- Et ainsi de suite...

**Exemple :**
- Script lancé à 16h28 → première MAJ à 17h00
- Script lancé à 22h59 → première MAJ à 23h00
- Script lancé à 23h00 → première MAJ à 00h00 (minuit)

## 🎯 Configuration

### Script NFT (`auto-update-all-nft-prices.ts`)
```typescript
const MIN_MULTIPLIER = 0.8;  // Prix minimum: × 0.8 (-20%)
const MAX_MULTIPLIER = 1.2;  // Prix maximum: × 1.2 (+20%)
const DEFAULT_NFT_PRICE = "50000.0"; // 50,000 EUR par défaut
```

**Fonctionnement :**
- Récupère `totalSupply()` du contrat NFT
- Parcourt tous les Token IDs (de 0 à totalSupply-1)
- Met à jour le prix de chaque NFT existant
- Initialise le prix si non défini (50,000 EUR)

### Script RWAT (`auto-update-rwat-price.ts`)
```typescript
const MIN_MULTIPLIER = 0.9;  // Prix minimum: × 0.9 (-10%)
const MAX_MULTIPLIER = 1.1;  // Prix maximum: × 1.1 (+10%)
const DEFAULT_TOKEN_PRICE = "50.0"; // 50 EUR par défaut
```

**Fonctionnement :**
- Récupère le prix actuel dans l'Oracle
- Applique une variation de ±10%
- Met à jour via `oracle.updatePrice()`
- Initialise le prix si non défini (50 EUR)

## 🧪 Test Local

### Test NFT
```bash
npx hardhat run scripts/auto-update-all-nft-prices.ts --network sepolia
```

**Sortie attendue :**
```
💎 NFT PRICES AUTO-UPDATE SCRIPT
======================================================================
Planification: Chaque heure pile (XX:00)
Variation: ±20% (× 0.8 à ×1.2)
======================================================================

📋 Configuration:
Oracle: 0x602571F05745181fF237b81dAb8F67148e9475C7
NFT Contract: 0x75499Fc469f8d224C7bF619Ada37ea8f3cD8c36E
Network: sepolia

✅ Contrats connectés!

⏰ Prochaine mise à jour: 17:00:00
   (dans 32 minutes)
⏹️  Appuyez sur Ctrl+C pour arrêter
```

### Test RWAT
```bash
npx hardhat run scripts/auto-update-rwat-price.ts --network sepolia
```

**Sortie attendue :**
```
🪙 RWAT TOKEN PRICE AUTO-UPDATE SCRIPT
======================================================================
Planification: Chaque heure pile (XX:00)
Variation: ±10% (× 0.9 à ×1.1)
======================================================================

📋 Configuration:
Oracle: 0x602571F05745181fF237b81dAb8F67148e9475C7
RWAT Token: 0xfA451d9C32d15a637Ab376732303c36C34C9979f
Network: sepolia

🪙 Token Info:
   Name: RWA Platform Token
   Symbol: RWAT
   Total Supply: 60000.0 RWAT

✅ Prix actuel dans l'Oracle: 50.0 EUR
   Dernière mise à jour: 24/10/2025 16:30:00
   Nombre de mises à jour: 5

✅ Script prêt!

⏰ Prochaine mise à jour: 17:00:00
   (dans 32 minutes)
⏹️  Appuyez sur Ctrl+C pour arrêter
```

## 🚀 Options d'Hébergement

### Option 1 : Railway (Recommandé)

**Avantages :**
- Hébergement cloud gratuit (500h/mois)
- Logs accessibles en ligne
- Redémarrage automatique en cas d'erreur
- Déjà utilisé pour l'indexer

**Setup :**

1. **Créer un nouveau service Railway**
```bash
railway login
railway init
railway up
```

2. **Configurer les variables d'environnement**
```env
ALCHEMY_API_KEY=votre_clé
SEPOLIA_PRIVATE_KEY=votre_clé_privée
NODE_ENV=production
```

3. **Créer un `Procfile`**
```
nft: npx hardhat run scripts/auto-update-all-nft-prices.ts --network sepolia
rwat: npx hardhat run scripts/auto-update-rwat-price.ts --network sepolia
```

4. **Déployer**
```bash
railway up
```

### Option 2 : Serveur VPS (Digital Ocean, AWS EC2, etc.)

**Setup avec PM2 :**

1. **Installer PM2**
```bash
npm install -g pm2
```

2. **Créer `ecosystem.config.js`**
```javascript
module.exports = {
  apps: [
    {
      name: 'nft-price-updater',
      script: 'npx',
      args: 'hardhat run scripts/auto-update-all-nft-prices.ts --network sepolia',
      cwd: '/path/to/project',
      env: {
        ALCHEMY_API_KEY: 'your_key',
        SEPOLIA_PRIVATE_KEY: 'your_key'
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/nft-err.log',
      out_file: './logs/nft-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    {
      name: 'rwat-price-updater',
      script: 'npx',
      args: 'hardhat run scripts/auto-update-rwat-price.ts --network sepolia',
      cwd: '/path/to/project',
      env: {
        ALCHEMY_API_KEY: 'your_key',
        SEPOLIA_PRIVATE_KEY: 'your_key'
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/rwat-err.log',
      out_file: './logs/rwat-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
```

3. **Lancer les scripts**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

4. **Commandes utiles**
```bash
# Voir les logs en temps réel
pm2 logs

# Voir le statut
pm2 status

# Redémarrer un script
pm2 restart nft-price-updater

# Arrêter tous les scripts
pm2 stop all
```

### Option 3 : GitHub Actions (Cron Job)

**Limitations :**
- Maximum 1 fois toutes les 5 minutes (pas horaire précis)
- Dépend de la disponibilité de GitHub

**Créer `.github/workflows/update-prices.yml`** :
```yaml
name: Update Prices

on:
  schedule:
    # Toutes les heures à 00 minutes (UTC)
    - cron: '0 * * * *'
  workflow_dispatch: # Permet le déclenchement manuel

jobs:
  update-nft-prices:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Update NFT Prices
        env:
          ALCHEMY_API_KEY: ${{ secrets.ALCHEMY_API_KEY }}
          SEPOLIA_PRIVATE_KEY: ${{ secrets.SEPOLIA_PRIVATE_KEY }}
        run: npx hardhat run scripts/auto-update-all-nft-prices.ts --network sepolia
  
  update-rwat-price:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Update RWAT Price
        env:
          ALCHEMY_API_KEY: ${{ secrets.ALCHEMY_API_KEY }}
          SEPOLIA_PRIVATE_KEY: ${{ secrets.SEPOLIA_PRIVATE_KEY }}
        run: npx hardhat run scripts/auto-update-rwat-price.ts --network sepolia
```

### Option 4 : Windows Task Scheduler (Local)

**Créer `start-nft-updater.bat`** :
```batch
@echo off
cd C:\path\to\project
npx hardhat run scripts/auto-update-all-nft-prices.ts --network sepolia
```

**Créer `start-rwat-updater.bat`** :
```batch
@echo off
cd C:\path\to\project
npx hardhat run scripts/auto-update-rwat-price.ts --network sepolia
```

**Configuration Task Scheduler :**
1. Ouvrir Task Scheduler
2. Créer une nouvelle tâche
3. Déclencheur : Au démarrage du système
4. Action : Lancer `start-nft-updater.bat`
5. Répéter pour `start-rwat-updater.bat`

## 📊 Monitoring

### Vérifier les mises à jour

**Via Etherscan :**
- Oracle : https://sepolia.etherscan.io/address/0x602571F05745181fF237b81dAb8F67148e9475C7
- Filtrer les événements `PriceUpdated`

**Via Script :**
```bash
npx hardhat run scripts/check-prices.ts --network sepolia
```

**Via Indexer API :**
```bash
curl https://g9-blockchain-production-836a.up.railway.app/api/stats
```

### Logs

Les scripts affichent des logs détaillés :
```
🔄 Mise à jour automatique #5

======================================================================
💎 MISE À JOUR DE TOUS LES NFTs
======================================================================
Heure: 24/10/2025 17:00:00
Contrat NFT: 0x75499Fc469f8d224C7bF619Ada37ea8f3cD8c36E
Nombre de NFTs: 3

🔄 Mise à jour en cours...

  💎 Token ID: 0
     Ancien prix: 48500.0 EUR
     Multiplicateur: 1.0856
     Nouveau prix: 52652.16 EUR
     Changement: +8.56%
     ⏳ Transaction: 0xabc123...
     ✅ Mis à jour! (Gas: 65432)

  💎 Token ID: 1
     Ancien prix: 32100.0 EUR
     Multiplicateur: 0.9234
     Nouveau prix: 29642.94 EUR
     Changement: -7.66%
     ⏳ Transaction: 0xdef456...
     ✅ Mis à jour! (Gas: 65432)

✅ Mise à jour terminée!

⏰ Prochaine mise à jour: 18:00:00
   (dans 60 minutes)
```

## 🔐 Sécurité

### Variables d'environnement

**Ne JAMAIS commit :**
- `SEPOLIA_PRIVATE_KEY`
- `ALCHEMY_API_KEY`

**Utiliser `.env` (déjà dans `.gitignore`) :**
```env
ALCHEMY_API_KEY=your_key_here
SEPOLIA_PRIVATE_KEY=0x...
```

### Compte Dédié

**Recommandation :** Utiliser un wallet dédié pour les mises à jour
- Créer un nouveau wallet
- Lui attribuer uniquement le rôle `PRICE_UPDATER_ROLE`
- Charger avec ~0.1 ETH Sepolia pour les gas fees

**Grant le rôle :**
```bash
npx hardhat run scripts/grant-price-updater-role.ts --network sepolia
```

## 💰 Coûts

### Gas Fees

**Par mise à jour :**
- NFT : ~65,000 gas × nombre de NFTs
- RWAT : ~65,000 gas

**Exemple avec 3 NFTs + 1 RWAT par heure :**
- 4 × 65,000 = 260,000 gas/heure
- 24 heures = 6,240,000 gas/jour
- Gas price moyen Sepolia : 1 gwei
- Coût : ~0.006 ETH/jour (testnet, gratuit)

**Mainnet (estimation) :**
- Gas price : 20 gwei
- Coût : ~0.12 ETH/jour ≈ $300/jour 💸
- **Solution :** Réduire la fréquence (1×/jour au lieu de 24×/jour)

### Hébergement

| Solution | Coût | Avantages |
|----------|------|-----------|
| Railway | Gratuit (500h/mois) | Cloud, logs, auto-restart |
| GitHub Actions | Gratuit | Intégré, simple |
| VPS (DO) | $5-10/mois | Contrôle total |
| Local (PC) | Gratuit | Pas de frais d'hébergement |

## 🎯 Recommandation Finale

**Pour ce projet (Testnet Sepolia) :**

✅ **Railway** (Service 1 : NFT Updater)
```bash
railway init
railway up
# Configurer les env vars dans le dashboard
```

✅ **Railway** (Service 2 : RWAT Updater)
```bash
railway init
railway up
# Configurer les env vars dans le dashboard
```

**Avantages :**
- Gratuit et suffisant pour le testnet
- Même plateforme que l'indexer (cohérence)
- Logs centralisés
- Auto-restart en cas d'erreur
- Facile à montrer aux évaluateurs

**Pour production (Mainnet) :**

✅ **VPS + PM2** avec fréquence réduite (1×/jour)
- Coûts maîtrisés
- Contrôle total
- Logs détaillés

## 📝 Checklist Déploiement

- [ ] Tester les scripts localement
- [ ] Vérifier que le compte a le rôle `PRICE_UPDATER_ROLE`
- [ ] Configurer les variables d'environnement
- [ ] Choisir la solution d'hébergement
- [ ] Déployer les scripts
- [ ] Vérifier les logs après la première exécution
- [ ] Vérifier sur Etherscan que les prix sont mis à jour
- [ ] Configurer le monitoring
- [ ] Documenter l'URL des logs
- [ ] Ajouter le lien dans le README

---

**Date :** Octobre 2025  
**Statut :** ✅ Scripts prêts à déployer  
**Planification :** Chaque heure pile (XX:00)  
**Réseau :** Sepolia Testnet
