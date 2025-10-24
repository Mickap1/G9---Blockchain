# Pages DEX et Marketplace

## 🔄 DEX (Decentralized Exchange)

**URL:** `/dex`

### Fonctionnalités

1. **Swap (Échange de tokens)**
   - ETH → Token
   - Token → ETH
   - Prix dynamique calculé en temps réel selon la formule AMM (x × y = k)
   - Frais de 0.3% redistribués aux fournisseurs de liquidité
   - Protection contre le slippage (2%)
   - Estimation en temps réel du montant reçu

2. **Liquidité**
   - Ajouter de la liquidité au pool (ETH + Tokens)
   - Gagner des frais de 0.3% sur tous les swaps
   - Ratio suggéré affiché en temps réel

3. **Statistiques du pool**
   - Réserve ETH
   - Réserve Tokens
   - Prix actuel (ETH/TOKEN)

4. **Vos balances**
   - ETH disponible
   - Tokens disponibles

### Contrats utilisés
- SimpleDEX: `0x28B2c6b3C1C9F09ca86e6B7cc8d0b9f0Bd7CE7F4`
- FungibleToken: `0xfA451d9C32d15a637Ab376732303c36C34C9979f`

### Mécanisme AMM

Le DEX utilise la formule **Constant Product Formula** :
```
x × y = k
```

Où :
- `x` = Réserve ETH
- `y` = Réserve Tokens
- `k` = Constante (produit des réserves)

**Prix dynamique :**
- Plus on achète, plus le prix augmente (offre diminue)
- Plus on vend, plus le prix baisse (offre augmente)
- Le prix s'ajuste automatiquement après chaque transaction

**Exemple :**
```
Pool initial: 10 ETH + 100,000 Tokens
k = 10 × 100,000 = 1,000,000

Achat de tokens avec 1 ETH:
Nouveau x = 10 + 1 = 11 ETH
Nouveau y = 1,000,000 / 11 = 90,909 Tokens
Tokens reçus = 100,000 - 90,909 = 9,091 Tokens (après fee)
```

### Exigences
- ⚠️ **KYC obligatoire** : Vous devez être whitelisté pour trader
- Wallet connecté avec du Sepolia ETH
- Pour vendre des tokens : approbation requise

---

## 🛒 Marketplace (P2P)

**URL:** `/marketplace`

### Fonctionnalités actuelles

1. **Visualiser les NFTs en vente**
   - Affichage des NFTs possédés par d'autres utilisateurs
   - Image, nom, description
   - Prix fixe défini par le vendeur
   - Adresse du vendeur

2. **Votre inventaire**
   - NFTs possédés
   - Balance de tokens disponibles

3. **Créer une annonce** (En développement)
   - Lister vos NFTs à un prix fixe
   - Lister vos tokens à un prix fixe

### État du développement

🚧 **Marketplace en construction**

Pour implémenter un marketplace complet, il faudrait :

1. **Contrat Marketplace**
   ```solidity
   contract Marketplace {
     struct Listing {
       address seller;
       uint256 tokenId;
       uint256 price;
       bool active;
     }
     
     function createListing(tokenId, price) external;
     function cancelListing(listingId) external;
     function buyNFT(listingId) external payable;
   }
   ```

2. **Workflow**
   - Vendeur approuve le contrat Marketplace
   - Vendeur crée un listing avec un prix
   - Acheteur paie le contrat Marketplace
   - Le contrat transfère le NFT et l'ETH

3. **Fonctionnalités à ajouter**
   - Listings on-chain
   - Achats directs
   - Annulation de listings
   - Marketplace de tokens fongibles (en plus des NFTs)
   - Historique des ventes
   - Filtres et recherche

### Contrats utilisés
- NFTAssetTokenV2: `0x75499Fc469f8d224C7bF619Ada37ea8f3cD8c36E`
- FungibleToken: `0xfA451d9C32d15a637Ab376732303c36C34C9979f`

### Solution temporaire

En attendant l'implémentation complète :
- Les NFTs sont affichés avec leur valuation
- Contact direct entre vendeur et acheteur
- Transfert manuel avec approbation

---

## 🆚 DEX vs Marketplace

| Caractéristique | DEX | Marketplace |
|----------------|-----|-------------|
| **Mécanisme** | AMM (Automated Market Maker) | P2P (Peer-to-Peer) |
| **Prix** | Dynamique (change à chaque trade) | Fixe (défini par le vendeur) |
| **Liquidité** | Instantanée (pool de liquidité) | Dépend des listings |
| **Slippage** | Oui (variable selon le volume) | Non (prix garanti) |
| **Meilleur pour** | Trading actif, tokens fongibles | NFTs, achats spécifiques |
| **Frais** | 0.3% aux LPs | Variable (selon implémentation) |
| **KYC** | Requis | À définir |

### Quand utiliser le DEX ?
- ✅ Acheter/vendre des tokens rapidement
- ✅ Trading actif avec liquidité garantie
- ✅ Petits volumes (moins de slippage)
- ❌ Gros volumes (slippage élevé)

### Quand utiliser le Marketplace ?
- ✅ Acheter/vendre des NFTs uniques
- ✅ Prix fixe garanti (pas de surprise)
- ✅ Gros volumes sans impact de prix
- ❌ Besoin de liquidité immédiate

---

## 🛠️ Installation et configuration

### Prérequis
- Node.js 18+
- Wallet MetaMask configuré sur Sepolia
- Sepolia ETH pour les transactions

### Variables d'environnement

Créer un fichier `.env.local` dans `frontend/` :

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_KYC_REGISTRY_ADDRESS=0x563E31793214F193EB7993a2bfAd2957a70C7D65
NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS=0xfA451d9C32d15a637Ab376732303c36C34C9979f
NEXT_PUBLIC_NFT_TOKEN_ADDRESS=0x75499Fc469f8d224C7bF619Ada37ea8f3cD8c36E
NEXT_PUBLIC_DEX_ADDRESS=0x28B2c6b3C1C9F09ca86e6B7cc8d0b9f0Bd7CE7F4
NEXT_PUBLIC_ORACLE_ADDRESS=0x602571F05745181fF237b81dAb8F67148e9475C7
```

### Lancer le frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend accessible à : **http://localhost:3000**

---

## 📝 TODO

### DEX
- [ ] Afficher les LP tokens de l'utilisateur
- [ ] Fonction de retrait de liquidité
- [ ] Graphique de l'évolution des prix
- [ ] Historique des transactions
- [ ] Support de plusieurs paires de tokens

### Marketplace
- [ ] Déployer un contrat Marketplace
- [ ] Implémenter les listings on-chain
- [ ] Fonction d'achat direct
- [ ] Annulation de listings
- [ ] Marketplace de tokens fongibles
- [ ] Système d'enchères (optionnel)
- [ ] Filtres et recherche avancée

### Général
- [ ] Ajouter une image placeholder pour les NFTs (`public/placeholder-nft.png`)
- [ ] Notifications toast pour les transactions
- [ ] Loading states améliorés
- [ ] Gestion d'erreurs plus détaillée
- [ ] Mode sombre optimisé
- [ ] Tests unitaires

---

## 🎨 Design

### Couleurs
- **DEX** : Orange/Yellow gradient
- **Marketplace** : Pink/Purple gradient
- **Homepage** :
  - Tokens : Green
  - NFTs : Purple
  - KYC : Blue
  - Marketplace : Pink
  - DEX : Orange

### Navigation
- Header avec liens vers toutes les pages
- ConnectButton (RainbowKit) intégré
- Icons pour chaque section (Lucide React)

---

## 🔗 Liens utiles

- [SimpleDEX Contract](https://sepolia.etherscan.io/address/0x28B2c6b3C1C9F09ca86e6B7cc8d0b9f0Bd7CE7F4)
- [FungibleToken Contract](https://sepolia.etherscan.io/address/0xfA451d9C32d15a637Ab376732303c36C34C9979f)
- [NFT Contract](https://sepolia.etherscan.io/address/0x75499Fc469f8d224C7bF619Ada37ea8f3cD8c36E)
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Wagmi Documentation](https://wagmi.sh/)
