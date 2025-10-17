# ❓ FAQ - Questions Fréquentes

## 🎯 Général

### Qu'est-ce que la tokenisation d'actifs ?
La tokenisation consiste à représenter la propriété d'un actif réel (immobilier, art, etc.) par des tokens numériques sur une blockchain. Chaque token représente une fraction de l'actif.

**Avantages:**
- 💰 Propriété fractionnée (investir avec moins de capital)
- 🌍 Accessibilité mondiale
- 💱 Liquidité accrue
- 🔍 Transparence
- ⚡ Transactions rapides

### Pourquoi utiliser la blockchain ?
- **Immuabilité**: Les transactions ne peuvent pas être modifiées
- **Transparence**: Toutes les opérations sont traçables
- **Décentralisation**: Pas d'intermédiaire unique
- **Smart Contracts**: Automatisation des processus

---

## 🔐 KYC & Conformité

### Pourquoi un système KYC ?
Le KYC (Know Your Customer) est obligatoire pour:
- ✅ Respecter les régulations AML/CFT
- ✅ Prévenir le blanchiment d'argent
- ✅ Empêcher le financement du terrorisme
- ✅ Protéger les investisseurs

### Qui peut approuver un KYC ?
Seuls les comptes ayant le rôle `KYC_ADMIN_ROLE` peuvent approuver, rejeter ou blacklister des adresses.

### Combien de temps prend la vérification KYC ?
Cela dépend de votre processus. En général:
- Soumission: Instantané (transaction blockchain)
- Vérification: 1-5 jours ouvrés (processus off-chain)
- Approbation: Instantané (transaction blockchain)

### Que se passe-t-il si mon KYC est rejeté ?
Vous pouvez resoumettre une nouvelle demande avec les documents corrigés.

```javascript
// Après un rejet
await kycRegistry.connect(user).submitKYC(newDocumentURI);
```

### Mon KYC peut-il expirer ?
Oui, lors de l'approbation, un admin peut définir une date d'expiration:

```javascript
const oneYear = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
await kycRegistry.approveKYC(user, oneYear);
```

Pour un KYC sans expiration, utiliser `0`:
```javascript
await kycRegistry.approveKYC(user, 0); // Pas d'expiration
```

### Que faire si je suis blacklisté ?
Contactez l'administrateur de la plateforme. Si l'erreur est prouvée, un admin peut vous retirer de la blacklist:

```javascript
await kycRegistry.removeFromBlacklist(userAddress);
```

---

## 🪙 Tokens

### Quel est le standard du token ?
`FungibleAssetToken` est un token **ERC-20**, le standard le plus utilisé pour les tokens fongibles sur Ethereum.

### Combien de tokens seront créés ?
Le `MAX_SUPPLY` est fixé au déploiement et ne peut pas être changé. Par exemple:

```javascript
const maxSupply = ethers.parseEther("10000"); // 10,000 tokens
```

### Peut-on créer plus de tokens que le MAX_SUPPLY ?
❌ Non, c'est impossible. Le contrat revert avec l'erreur `ExceedsMaxSupply()`.

### Comment est calculé le prix par token ?
```
Prix par token = Valeur totale de l'actif / MAX_SUPPLY
```

Exemple:
- Actif: 500,000 EUR
- MAX_SUPPLY: 10,000 tokens
- Prix: 500,000 / 10,000 = **50 EUR/token**

### Puis-je transférer mes tokens à n'importe qui ?
❌ Non, uniquement vers des adresses **whitelistées** (KYC approuvé) et **non blacklistées**.

### Que se passe-t-il si j'essaie de transférer à une adresse non vérifiée ?
La transaction revert avec l'erreur appropriée:
- `SenderNotWhitelisted()`: Vous n'êtes pas whitelisté
- `RecipientNotWhitelisted()`: Le destinataire n'est pas whitelisté
- `SenderBlacklisted()`: Vous êtes blacklisté
- `RecipientBlacklisted()`: Le destinataire est blacklisté

### Puis-je brûler (burn) mes tokens ?
✅ Oui, avec la fonction `burn()`:

```javascript
const amount = ethers.parseEther("100");
await token.connect(holder).burn(amount);
```

### Que se passe-t-il quand je burn des tokens ?
- Votre solde diminue
- Le `totalSupply` diminue
- Le `remainingSupply` augmente
- Le prix par token reste constant (basé sur MAX_SUPPLY, pas totalSupply)

### Les dividendes sont-ils automatiques ?
❌ Non, la distribution de dividendes doit être implémentée séparément (off-chain ou contrat additionnel).

---

## 👥 Rôles & Permissions

### Quels sont les différents rôles ?

#### KYCRegistry
- `DEFAULT_ADMIN_ROLE`: Gestion des rôles
- `KYC_ADMIN_ROLE`: Approbation/rejet des KYC

#### FungibleAssetToken
- `DEFAULT_ADMIN_ROLE`: Gestion des rôles
- `ADMIN_ROLE`: Mise à jour des métadonnées
- `MINTER_ROLE`: Création de tokens
- `PAUSER_ROLE`: Pause/unpause

### Comment attribuer un rôle ?
```javascript
const role = await contract.ROLE_NAME();
await contract.grantRole(role, addressToGrant);
```

### Comment révoquer un rôle ?
```javascript
const role = await contract.ROLE_NAME();
await contract.revokeRole(role, addressToRevoke);
```

### Qui peut attribuer des rôles ?
Seul le `DEFAULT_ADMIN_ROLE` peut attribuer et révoquer les rôles.

---

## 🚨 Urgences

### Que faire en cas d'activité suspecte ?

1. **Blacklister l'adresse** (KYCRegistry):
```javascript
await kycRegistry.blacklistAddress(suspiciousAddress, "Fraud detected");
```

2. **Suspendre les transferts** (Token):
```javascript
await token.pause();
```

3. **Enquêter**

4. **Reprendre les opérations**:
```javascript
await token.unpause();
```

### Le contrat est pausé, puis-je quand même burn ?
✅ Oui, les fonctions `burn()` et `burnFrom()` fonctionnent même en pause.

### Peut-on modifier le MAX_SUPPLY après déploiement ?
❌ Non, c'est une variable `immutable`. C'est une mesure de sécurité.

### Peut-on changer le KYCRegistry après déploiement ?
❌ Non, l'adresse est `immutable`. Pour changer, il faudrait déployer un nouveau token.

### Un admin peut-il voler mes tokens ?
❌ Non, les admins ne peuvent pas:
- Transférer vos tokens
- Modifier votre solde
- Accéder à votre wallet

Ils peuvent seulement:
- Minter de nouveaux tokens (limité par MAX_SUPPLY)
- Mettre à jour les métadonnées de l'actif
- Pauser les transferts

---

## 💻 Technique

### Pourquoi utiliser IPFS pour les documents ?
IPFS (InterPlanetary File System) permet de stocker des documents de manière décentralisée:
- 📦 Pas de serveur central
- 🔗 Hash unique et immuable
- 💰 Coût réduit (pas de stockage on-chain)
- 🌍 Accessible mondialement

### Comment uploader sur IPFS ?
Plusieurs options:
1. **Pinata**: https://pinata.cloud/
2. **Infura IPFS**: https://infura.io/product/ipfs
3. **Web3.Storage**: https://web3.storage/
4. **IPFS Desktop**: https://docs.ipfs.io/install/ipfs-desktop/

Exemple avec Pinata:
```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

async function uploadToPinata(filePath) {
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const data = new FormData();
    data.append('file', fs.createReadStream(filePath));
    
    const response = await axios.post(url, data, {
        headers: {
            'Authorization': `Bearer ${PINATA_JWT}`
        }
    });
    
    return `ipfs://${response.data.IpfsHash}`;
}
```

### Quelle est la différence entre totalSupply et MAX_SUPPLY ?
- `MAX_SUPPLY`: Limite maximum, fixée au déploiement, ne change jamais
- `totalSupply()`: Quantité actuellement en circulation, augmente avec mint, diminue avec burn

### Comment calculer le gas d'une transaction ?
Avec Hardhat:
```javascript
const tx = await token.mint(address, amount);
const receipt = await tx.wait();
console.log("Gas used:", receipt.gasUsed.toString());
```

### Peut-on upgrader les contrats ?
❌ Non, les contrats actuels ne sont pas upgradeables (pas de proxy pattern).

Pour upgrader, il faudrait:
1. Déployer de nouveaux contrats
2. Migrer les données
3. Communiquer aux utilisateurs

**Note**: Les contrats non-upgradeables sont plus sûrs mais moins flexibles.

---

## 💰 Économie

### Comment sont calculés les dividendes ?
Les dividendes doivent être calculés proportionnellement à la propriété:

```javascript
// Si un holder possède 1000 tokens sur 10000 total
// Il possède 10% de l'actif
// Si 50,000 EUR de dividendes → 5,000 EUR pour lui

const ownershipPercent = await token.ownershipPercentage(holder);
// Retourne 1000 (en basis points, 1000 = 10%)

const dividend = totalDividends * ownershipPercent / 10000;
```

### Que se passe-t-il si l'actif prend de la valeur ?
1. Mettre à jour `totalValue` dans les métadonnées (fonction à implémenter)
2. Le `pricePerToken()` augmente automatiquement
3. Les holders peuvent vendre leurs tokens plus cher sur le marché secondaire

### Comment fonctionne le marché secondaire ?
Les tokens peuvent être échangés sur:
- DEX (Uniswap, etc.) - Nécessite de créer une pool de liquidité
- Plateformes d'échange centralisées
- P2P via `transfer()`

**Important**: Tous les acheteurs doivent être whitelistés (KYC).

---

## 🔍 Audit & Sécurité

### Les contrats ont-ils été audités ?
Ce projet est à but éducatif. Pour une utilisation en production:
1. Faire auditer par une firme reconnue (OpenZeppelin, Trail of Bits, etc.)
2. Bug bounty program
3. Tests de stress
4. Déploiement progressif (testnet → petit mainnet → complet)

### Quelles sont les vulnérabilités connues ?
Avec les bonnes pratiques actuelles, aucune vulnérabilité critique connue. Cependant:
- ⚠️ Centralisation des rôles d'admin (utiliser multi-sig)
- ⚠️ Dépendance au KYCRegistry (choix de design)
- ⚠️ Pas d'upgrade possible (redéploiement nécessaire)

### Comment signaler un bug de sécurité ?
Si vous trouvez une vulnérabilité:
1. **NE PAS** créer d'issue publique
2. Contacter les mainteneurs en privé
3. Fournir un PoC (Proof of Concept)
4. Attendre le fix avant divulgation publique

---

## 📞 Support

### Où obtenir de l'aide ?
- 📚 Documentation: `/docs`
- 💬 Issues GitHub: https://github.com/EpitechPGE45-2025/G-ING-910-PAR-9-1-blockchain-14/issues
- 📧 Email: [à définir]

### Comment contribuer ?
1. Fork le repository
2. Créer une branch pour votre feature
3. Commiter vos changements
4. Ouvrir une Pull Request
5. Attendre la review

### Puis-je utiliser ce code pour mon projet ?
✅ Oui, sous licence MIT. Vous pouvez:
- Utiliser commercialement
- Modifier
- Distribuer
- Utiliser en privé

Conditions:
- Inclure la licence MIT
- Inclure le copyright original

**Recommandation**: Faire auditer avant utilisation en production !

---

## 🎓 Ressources d'apprentissage

### Apprendre Solidity
- [Solidity Documentation](https://docs.soliditylang.org/)
- [CryptoZombies](https://cryptozombies.io/)
- [Solidity by Example](https://solidity-by-example.org/)

### Apprendre Hardhat
- [Hardhat Tutorial](https://hardhat.org/tutorial)
- [Hardhat Documentation](https://hardhat.org/docs)

### Comprendre la tokenisation
- [Real World Asset Tokenization](https://www.investopedia.com/terms/t/tokenization.asp)
- [Security Token Standards](https://consensys.net/blog/blockchain-explained/what-are-security-tokens/)

### Sécurité blockchain
- [Smart Contract Security Best Practices](https://consensys.github.io/smart-contract-best-practices/)
- [OpenZeppelin Security](https://docs.openzeppelin.com/contracts/4.x/api/security)
