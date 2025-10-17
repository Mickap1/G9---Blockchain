# 🔮 Guide Complet : Oracle de Prix pour NFT Diamant

## ✅ Ce qui a été fait

### 1. **Contrat Oracle Déployé**
- **Address**: `0x602571F05745181fF237b81dAb8F67148e9475C7`
- **Network**: Sepolia
- **Vérifié**: ✅ Oui sur Etherscan
- **Lien**: https://sepolia.etherscan.io/address/0x602571F05745181fF237b81dAb8F67148e9475C7#code

### 2. **Diamant NFT Minté**
- **Token ID**: 0
- **Nom**: GIA Diamond 2.5ct VS1 D
- **Valuation initiale**: 150,000 EUR
- **Contract**: `0xcC1fA977E3c47D3758117De61218208c1282362c`
- **Lien**: https://sepolia.etherscan.io/nft/0xcC1fA977E3c47D3758117De61218208c1282362c/0

### 3. **Prix Initial dans l'Oracle**
- **Prix**: 150,000 EUR
- **Status**: ✅ Actif
- **Mise à jour**: 17/10/2025 16:18:12

---

## 🚀 Comment Utiliser

### **A) Démarrer la Mise à Jour Automatique des Prix**

Le script `auto-update-diamond-price.ts` met à jour le prix du diamant **toutes les heures** avec une variation aléatoire entre **-20% et +20%**.

#### Pour tester rapidement (2 minutes au lieu de 1 heure):

1. Éditez `scripts/auto-update-diamond-price.ts` ligne 16:
   ```typescript
   const UPDATE_INTERVAL = 2 * 60 * 1000; // 2 minutes pour test
   ```

2. Lancez le script:
   ```bash
   npx hardhat run scripts/auto-update-diamond-price.ts --network sepolia
   ```

#### Pour production (1 heure):

```bash
npx hardhat run scripts/auto-update-diamond-price.ts --network sepolia
```

Le script affichera:
```
💎 DIAMOND PRICE AUTO-UPDATE SCRIPT
============================================================
Intervalle: 60 minutes
Variation: 0.8 à 1.2
============================================================

💎 Diamond NFT Token ID: 0
   Owner: 0x41B6b59a9365a58B00a68c597c49dB5Fa8C72116
   Nom: GIA Diamond 2.5ct VS1 D
   Valuation (NFT contract): 150000.0 EUR

✅ Prix dans l'Oracle: 150000.0 EUR

✅ Script prêt! Mise à jour toutes les 60 minutes
💡 Tip: Pour tester rapidement, réduisez UPDATE_INTERVAL à 2 minutes (ligne 16)
⏹️  Appuyez sur Ctrl+C pour arrêter

🔄 Mise à jour #1
============================================================
💎 MISE À JOUR DU PRIX DU DIAMANT
============================================================
Heure: 17/10/2025 17:18:12
Token ID: 0
Ancien prix: 150000.0 EUR
Multiplicateur: 1.0856
Nouveau prix: 162840.0 EUR
Changement: +8.56%

⏳ Mise à jour de l'Oracle...
   Transaction envoyée: 0x...
   ✅ Oracle mis à jour!
   Bloc: 9431700
   Gas utilisé: 82,456

⏳ Mise à jour du contrat NFT...
   ✅ Prix NFT mis à jour!

🔗 View on Etherscan:
   https://sepolia.etherscan.io/tx/0x...

💤 Prochaine mise à jour prévue à: 18:18:12
   (dans 60 minutes)
```

---

### **B) Vérifier les Prix**

```bash
npx hardhat run scripts/check-prices.ts --network sepolia
```

Affiche:
- Prix actuel dans l'Oracle
- Historique des changements
- Variation en % par rapport au prix précédent
- Nombre total de mises à jour

---

### **C) Lancer en Background (Windows PowerShell)**

Pour laisser le script tourner en arrière-plan:

```powershell
Start-Process npx -ArgumentList "hardhat", "run", "scripts/auto-update-diamond-price.ts", "--network", "sepolia" -WindowStyle Hidden
```

Pour arrêter, trouvez le processus:
```powershell
Get-Process node | Where-Object {$_.CommandLine -like "*auto-update-diamond-price*"} | Stop-Process
```

---

## 📊 Fonctionnement du Système

### **1. Oracle Contract (SimplePriceOracle.sol)**

#### Fonctionnalités:
- ✅ Stocke les prix des NFTs individuels
- ✅ Maintient un historique des 100 derniers prix
- ✅ Calcule automatiquement les variations
- ✅ Système de rôles (ORACLE_ADMIN, PRICE_UPDATER)
- ✅ Pause d'urgence
- ✅ Events pour tracking on-chain

#### Fonctions principales:
```solidity
// Mettre à jour le prix d'un NFT
function updateNFTPrice(address tokenAddress, uint256 tokenId, uint256 newPrice)

// Récupérer le prix actuel
function getNFTPrice(address tokenAddress, uint256 tokenId) returns (uint256)

// Récupérer l'historique
function getNFTPriceHistory(address tokenAddress, uint256 tokenId) returns (PriceHistory[])

// Calculer la variation
function getPriceChange(address tokenAddress) returns (int256)
```

---

### **2. Script Auto-Update**

#### Ce qu'il fait:
1. Se connecte à l'Oracle et au NFT
2. Récupère le prix actuel
3. Attend l'intervalle configuré (1 heure par défaut)
4. Génère un multiplicateur aléatoire entre 0.8 et 1.2
5. Calcule le nouveau prix
6. Met à jour l'Oracle
7. Met à jour le contrat NFT
8. Répète indéfiniment

#### Configuration:
```typescript
const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 heure
const MIN_MULTIPLIER = 0.8;  // -20%
const MAX_MULTIPLIER = 1.2;  // +20%
```

---

## 🔐 Sécurité & Rôles

### Rôles de l'Oracle:
- **DEFAULT_ADMIN_ROLE**: Gère tous les rôles
- **ORACLE_ADMIN_ROLE**: Peut pause/unpause, activer/désactiver prix
- **PRICE_UPDATER_ROLE**: Peut mettre à jour les prix

**Actuellement**: Deployer (`0x41B6...2116`) possède tous les rôles

### Pour donner le rôle PRICE_UPDATER à une autre adresse:

```typescript
const oracle = await ethers.getContractAt("SimplePriceOracle", oracleAddress);
const PRICE_UPDATER_ROLE = await oracle.PRICE_UPDATER_ROLE();
await oracle.grantRole(PRICE_UPDATER_ROLE, "0xNouvelleAdresse");
```

---

## 📈 Exemple de Scénario

### Évolution du prix sur 5 heures:

| Heure | Prix Avant | Multiplicateur | Prix Après | Variation |
|-------|------------|----------------|------------|-----------|
| 16:00 | 150,000 EUR | - | 150,000 EUR | - |
| 17:00 | 150,000 EUR | 1.0856 | 162,840 EUR | +8.56% |
| 18:00 | 162,840 EUR | 0.9234 | 150,367 EUR | -7.66% |
| 19:00 | 150,367 EUR | 1.1523 | 173,268 EUR | +15.23% |
| 20:00 | 173,268 EUR | 0.8912 | 154,427 EUR | -10.88% |
| 21:00 | 154,427 EUR | 1.0645 | 164,387 EUR | +6.45% |

---

## 🛠️ Scripts Disponibles

| Script | Description | Commande |
|--------|-------------|----------|
| `deploy-oracle.ts` | Déploie l'Oracle | `npx hardhat run scripts/deploy-oracle.ts --network sepolia` |
| `mint-diamond.ts` | Mint un diamant NFT | `npx hardhat run scripts/mint-diamond.ts --network sepolia` |
| `auto-update-diamond-price.ts` | Auto-update du prix | `npx hardhat run scripts/auto-update-diamond-price.ts --network sepolia` |
| `check-prices.ts` | Vérifie les prix | `npx hardhat run scripts/check-prices.ts --network sepolia` |
| `check-kyc.ts` | Vérifie KYC | `npx hardhat run scripts/check-kyc.ts --network sepolia` |

---

## 📋 Adresses des Contrats

```json
{
  "oracle": "0x602571F05745181fF237b81dAb8F67148e9475C7",
  "nft": "0xcC1fA977E3c47D3758117De61218208c1282362c",
  "kycRegistry": "0x8E4312166Ed927C331B5950e5B8ac636841f06Eb",
  "token": "0x6B2a38Ef30420B0AF041F014a092BEDB39F2Eb81",
  "dex": "0x28B2c6b3C1C9F09ca86e6B7cc8d0b9f0Bd7CE7F4"
}
```

---

## 🔗 Liens Etherscan

- **Oracle Contract**: https://sepolia.etherscan.io/address/0x602571F05745181fF237b81dAb8F67148e9475C7#code
- **NFT Contract**: https://sepolia.etherscan.io/address/0xcC1fA977E3c47D3758117De61218208c1282362c
- **Diamond NFT (Token ID 0)**: https://sepolia.etherscan.io/nft/0xcC1fA977E3c47D3758117De61218208c1282362c/0

---

## ✅ Résumé

Vous avez maintenant un système complet d'Oracle qui:

1. ✅ **Stocke les prix** des NFTs on-chain
2. ✅ **Met à jour automatiquement** le prix toutes les heures
3. ✅ **Maintient un historique** des 100 derniers prix
4. ✅ **Calcule les variations** en temps réel
5. ✅ **Fonctionne 24/7** en arrière-plan
6. ✅ **Est sécurisé** avec un système de rôles
7. ✅ **Est vérifié** sur Etherscan

**Prochaine étape**: Lancez l'auto-update et observez l'évolution du prix de votre diamant ! 💎📈
