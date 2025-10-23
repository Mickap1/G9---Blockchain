# Système KYC - Guide d'utilisation

## 🎯 Vue d'ensemble

Le système KYC (Know Your Customer) permet de contrôler l'accès aux fonctionnalités de la plateforme blockchain. Les utilisateurs doivent soumettre une demande KYC qui sera ensuite approuvée ou rejetée par un administrateur.

## 📋 Ce qui a été corrigé

### 1. Page utilisateur KYC (`/kyc`)
- ✅ Interface pour soumettre une demande KYC
- ✅ Affichage du statut actuel (Aucun, En attente, Approuvé, Rejeté, Liste noire)
- ✅ Messages informatifs selon le statut
- ✅ Formulaire de soumission avec URI de données
- ✅ Utilisation du hook `useKYC` pour gérer les interactions

### 2. Page administrateur KYC (`/admin/kyc`)
- ✅ Vue complète des demandes KYC par statut (onglets)
- ✅ Affichage des statistiques en temps réel
- ✅ Actions administrateur:
  - Approuver une demande
  - Rejeter une demande avec raison
  - Mettre sur liste noire avec raison
  - Révoquer un KYC approuvé
- ✅ Vérification automatique des droits admin
- ✅ Chargement des événements blockchain en temps réel

### 3. Hook `useKYC`
- ✅ Chargement automatique du statut KYC
- ✅ Fonction `submitKYC` pour soumettre une demande
- ✅ Vérification whitelist/blacklist
- ✅ Données KYC complètes (dates, URI, etc.)

### 4. Configuration
- ✅ Adresse du contrat KYC Registry ajoutée dans `.env.local`
- ✅ Toutes les adresses de contrats mises à jour

## 🚀 Comment utiliser le système

### Pour les utilisateurs

1. **Connecter son wallet**
   - Aller sur la plateforme
   - Cliquer sur "Connect Wallet"
   - Connecter son wallet MetaMask ou autre

2. **Soumettre une demande KYC**
   - Aller sur `/kyc`
   - Entrer l'URI de vos documents KYC
     - Exemple: `ipfs://QmXXXXXXXXXXXXXXXXXXXX`
     - Ou un lien sécurisé: `https://example.com/kyc-docs/...`
   - Cliquer sur "Soumettre la demande KYC"
   - Confirmer la transaction dans votre wallet
   - Attendre la confirmation

3. **Vérifier le statut**
   - Le statut passe à "En attente"
   - Vous recevrez une notification une fois traité
   - Statuts possibles:
     - **Aucun**: Pas de KYC soumis
     - **En attente**: En cours de révision
     - **Approuvé**: ✅ Vous pouvez utiliser la plateforme
     - **Rejeté**: ❌ Resoumettez avec des infos mises à jour
     - **Liste noire**: 🚫 Contactez l'administrateur

### Pour les administrateurs

1. **Vérifier les droits admin**
   - Vous devez avoir le rôle `KYC_ADMIN_ROLE` sur le smart contract
   - L'adresse du déployeur a automatiquement ce rôle

2. **Accéder au panneau admin**
   - Aller sur `/admin/kyc`
   - Si vous n'êtes pas admin, un message d'erreur s'affichera

3. **Gérer les demandes**
   
   **Onglet "En attente":**
   - Voir toutes les demandes non traitées
   - Pour chaque demande:
     - **✓ Approuver**: Donne accès à la plateforme
     - **✗ Rejeter**: Refuse la demande (raison requise)
     - **🚫 Liste noire**: Bloque définitivement (raison requise)

   **Onglet "Approuvés":**
   - Voir tous les utilisateurs KYC approuvés
   - Actions possibles:
     - **⚠ Révoquer**: Retirer l'approbation (raison requise)
     - **🚫 Liste noire**: Bloquer l'utilisateur

   **Onglet "Rejetés":**
   - Voir les demandes rejetées
   - Actions possibles:
     - **✓ Approuver**: Approuver malgré le rejet précédent
     - **🚫 Liste noire**: Bloquer définitivement

   **Onglet "Liste noire":**
   - Voir les adresses bloquées
   - Aucune action disponible (liste noire définitive)

## 🔐 Rôles et permissions

### KYC_ADMIN_ROLE
- Peut approuver des demandes KYC
- Peut rejeter des demandes KYC
- Peut mettre des adresses sur liste noire
- Peut révoquer des KYC approuvés

### DEFAULT_ADMIN_ROLE
- Peut accorder/révoquer le rôle KYC_ADMIN_ROLE
- A tous les droits admin

## ⚙️ Configuration technique

### Variables d'environnement (`.env.local`)
```bash
NEXT_PUBLIC_KYC_REGISTRY_ADDRESS=0x8E4312166Ed927C331B5950e5B8ac636841f06Eb
NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS=0x6B2a38Ef30420B0AF041F014a092BEDB39F2Eb81
NEXT_PUBLIC_NFT_TOKEN_ADDRESS=0xcC1fA977E3c47D3758117De61218208c1282362c
NEXT_PUBLIC_DEX_ADDRESS=0x28B2c6b3C1C9F09ca86e6B7cc8d0b9f0Bd7CE7F4
NEXT_PUBLIC_ORACLE_ADDRESS=0x602571F05745181fF237b81dAb8F67148e9475C7
```

### Contrat Smart Contract
- **Adresse**: `0x8E4312166Ed927C331B5950e5B8ac636841f06Eb`
- **Réseau**: Sepolia
- **Explorer**: https://sepolia.etherscan.io/address/0x8E4312166Ed927C331B5950e5B8ac636841f06Eb

## 🔧 Accorder le rôle admin à d'autres adresses

Si vous voulez donner les droits admin KYC à une autre adresse:

1. Créer un script ou utiliser la console Hardhat:

```javascript
const kycRegistry = await ethers.getContractAt(
  "KYCRegistry", 
  "0x8E4312166Ed927C331B5950e5B8ac636841f06Eb"
);

const KYC_ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("KYC_ADMIN_ROLE"));
const adminAddress = "0x..."; // Adresse à qui donner le rôle

await kycRegistry.grantRole(KYC_ADMIN_ROLE, adminAddress);
```

2. Ou utiliser le script existant `grant-admin-role.ts`

## 📊 Événements blockchain

Le système écoute les événements suivants:

- `KYCSubmitted`: Quand un utilisateur soumet une demande
- `KYCApproved`: Quand un admin approuve
- `KYCRejected`: Quand un admin rejette
- `AddressBlacklisted`: Quand une adresse est bloquée
- `KYCRevoked`: Quand un KYC est révoqué

## 🐛 Dépannage

### "Vous n'avez pas les droits d'administrateur KYC"
- Vérifiez que vous êtes connecté avec le bon wallet
- Vérifiez que votre adresse a le rôle `KYC_ADMIN_ROLE`
- Si vous êtes le déployeur, vous devriez avoir ce rôle automatiquement

### "Aucune demande en attente"
- Les utilisateurs doivent d'abord soumettre des demandes via `/kyc`
- Vérifiez que le contrat est bien déployé et l'adresse correcte

### "Erreur lors de la soumission"
- Vérifiez que vous avez du ETH Sepolia pour payer le gas
- Vérifiez que l'URI de données est valide
- Vérifiez que vous n'avez pas déjà une demande en attente

## 📝 Prochaines étapes recommandées

1. **Tester le système**:
   - Créer une demande KYC avec un compte test
   - Se connecter avec le compte admin
   - Approuver/rejeter la demande

2. **Ajouter des notifications**:
   - Notifier les utilisateurs par email quand leur KYC est traité
   - Ajouter des notifications dans l'interface

3. **Améliorer la sécurité**:
   - Ajouter une expiration automatique des KYC
   - Implémenter un système de renouvellement

4. **Dashboard analytics**:
   - Graphiques d'évolution des KYC
   - Statistiques détaillées
