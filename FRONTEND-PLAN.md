# 🎨 Frontend RWA - Real World Assets Platform

## 📋 Stack Technique

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Blockchain**: 
  - ethers.js v6
  - wagmi (React Hooks for Ethereum)
  - RainbowKit (Wallet Connection UI)
- **State Management**: Zustand
- **API**: Axios pour l'indexer
- **Forms**: React Hook Form + Zod validation

## 🏗️ Structure du Projet

```
frontend/
├── app/                      # Next.js 14 App Router
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Page d'accueil
│   ├── kyc/
│   │   ├── page.tsx         # Formulaire KYC utilisateur
│   │   └── admin/page.tsx   # Dashboard admin KYC
│   ├── tokens/
│   │   ├── create/page.tsx  # Créer token fongible
│   │   └── [address]/page.tsx  # Détails d'un token
│   ├── nfts/
│   │   ├── create/page.tsx  # Créer NFT
│   │   └── [id]/page.tsx    # Détails d'un NFT
│   ├── marketplace/
│   │   └── page.tsx         # Liste des actifs
│   ├── dashboard/
│   │   └── page.tsx         # Dashboard personnel
│   └── swap/
│       └── page.tsx         # Interface DEX
├── components/
│   ├── ui/                  # Components shadcn/ui
│   ├── wallet/              # Wallet connection
│   ├── kyc/                 # KYC components
│   ├── tokens/              # Token components
│   └── nfts/                # NFT components
├── lib/
│   ├── contracts/           # ABIs & addresses
│   ├── hooks/               # Custom hooks
│   ├── api/                 # API calls to indexer
│   └── utils/               # Utilities
├── public/                  # Assets statiques
└── styles/                  # Global styles
```

## 🚀 Installation

```bash
# Créer le projet
npx create-next-app@latest frontend --typescript --tailwind --app

cd frontend

# Installer les dépendances blockchain
npm install ethers@6 wagmi viem @rainbow-me/rainbowkit

# Installer UI libraries
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react class-variance-authority clsx tailwind-merge

# Installer utilities
npm install axios react-hook-form @hookform/resolvers zod
npm install zustand date-fns

# Dev dependencies
npm install -D @types/node
```

## 📝 Configuration

### 1. Variables d'environnement (`.env.local`)

```env
# Blockchain
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com

# Contracts
NEXT_PUBLIC_DEX_ADDRESS=0x28B2c6b3C1C9F09ca86e6B7cc8d0b9f0Bd7CE7F4
NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS=0x6B2a38Ef30420B0AF041F014a092BEDB39F2Eb81
NEXT_PUBLIC_NFT_TOKEN_ADDRESS=0xcC1fA977E3c47D3758117De61218208c1282362c
NEXT_PUBLIC_ORACLE_ADDRESS=0x602571F05745181fF237b81dAb8F67148e9475C7
NEXT_PUBLIC_KYC_REGISTRY_ADDRESS=0x8E4312166Ed927C331B5950e5B8ac636841f06Eb

# API Indexer
NEXT_PUBLIC_INDEXER_API_URL=http://localhost:3001/api

# Wallet Connect (optionnel)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

## 🎯 Fonctionnalités

### ✅ Phase 1: Core Setup
- [x] Setup Next.js + TypeScript
- [x] Configuration TailwindCSS
- [x] Installation RainbowKit
- [ ] Layout & Navigation

### ✅ Phase 2: Wallet & Authentication
- [ ] Connexion Wallet (RainbowKit)
- [ ] Affichage adresse wallet
- [ ] Vérification statut KYC

### ✅ Phase 3: Système KYC
- [ ] Formulaire soumission KYC
- [ ] Affichage statut (Pending/Approved/Rejected)
- [ ] Dashboard Admin KYC
- [ ] Approbation/Rejet utilisateurs

### ✅ Phase 4: Création d'Actifs
- [ ] Interface création token ERC20
- [ ] Interface création NFT
- [ ] Upload images (IPFS optionnel)

### ✅ Phase 5: Dashboard Personnel
- [ ] Liste tokens fongibles possédés
- [ ] Galerie NFTs
- [ ] Valeur totale portefeuille
- [ ] Historique transactions

### ✅ Phase 6: Marketplace
- [ ] Liste tous les actifs disponibles
- [ ] Filtres (type, prix, etc.)
- [ ] Recherche
- [ ] Détails actif

### ✅ Phase 7: DEX (Échanges)
- [ ] Interface swap ETH ↔ Tokens
- [ ] Affichage prix en temps réel (Oracle)
- [ ] Estimation gas
- [ ] Historique swaps

### ✅ Phase 8: Intégration Indexer
- [ ] API calls pour les swaps
- [ ] API calls pour les transfers
- [ ] API calls pour les NFTs
- [ ] Refresh automatique des données

### ✅ Phase 9: Déploiement
- [ ] Build production
- [ ] Déploiement Vercel
- [ ] Configuration domaine
- [ ] Tests end-to-end

## 📦 Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
```

## 🎨 Design System

### Couleurs
- Primary: Bleu (#3B82F6)
- Secondary: Violet (#8B5CF6)
- Success: Vert (#10B981)
- Warning: Orange (#F59E0B)
- Error: Rouge (#EF4444)

### Composants UI
- Boutons (Primary, Secondary, Outline, Ghost)
- Cards (Token, NFT, Transaction)
- Modals (Connexion, Confirmation)
- Forms (Input, Select, Textarea, File Upload)
- Notifications (Toast)
- Tables (Marketplace, Dashboard)

## 📱 Pages

### 1. Homepage (`/`)
- Hero section
- Statistiques globales
- Call-to-action

### 2. KYC User (`/kyc`)
- Formulaire de soumission
- Upload documents
- Statut de vérification

### 3. KYC Admin (`/kyc/admin`)
- Liste demandes pending
- Détails utilisateur
- Actions (Approve/Reject)

### 4. Create Token (`/tokens/create`)
- Nom, Symbole, Supply
- Valeur initiale
- Transaction

### 5. Create NFT (`/nfts/create`)
- Nom de l'actif
- Description
- Valuation
- Image

### 6. Dashboard (`/dashboard`)
- Balance tokens
- NFTs possédés
- Valeur totale
- Graphiques

### 7. Marketplace (`/marketplace`)
- Grille d'actifs
- Filtres & recherche
- Pagination

### 8. Swap (`/swap`)
- Input ETH/Token
- Prix temps réel
- Bouton swap
- Historique

## 🔗 Intégration Blockchain

### Lecture (View)
- Récupérer balance tokens
- Lire prix Oracle
- Vérifier statut KYC
- Lister NFTs d'un utilisateur

### Écriture (Transaction)
- Soumettre KYC
- Approuver KYC (admin)
- Mint token/NFT
- Swap tokens
- Transfer tokens

## 🚀 Déploiement

### Frontend (Vercel)
```bash
vercel --prod
```

### Indexer (Railway/Render)
```bash
# Via Railway CLI ou Dashboard
railway up
```

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [RainbowKit Docs](https://www.rainbowkit.com/)
- [Wagmi Docs](https://wagmi.sh/)
- [TailwindCSS Docs](https://tailwindcss.com/)

## 🤝 Contributing

1. Créer une branche feature
2. Développer la fonctionnalité
3. Tester localement
4. Pull request

## 📄 License

MIT
