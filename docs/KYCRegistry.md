# 📋 KYCRegistry - Documentation Complète

## Vue d'ensemble

Le contrat `KYCRegistry` est le registre central de conformité KYC/AML de la plateforme. Il gère la vérification d'identité des utilisateurs et maintient les listes blanches (whitelist) et noires (blacklist).

## 📊 Statuts KYC

```solidity
enum KYCStatus {
    None,        // 0: Aucun KYC soumis
    Pending,     // 1: KYC en cours de vérification
    Approved,    // 2: KYC approuvé (whitelisté)
    Rejected,    // 3: KYC rejeté
    Blacklisted  // 4: Adresse blacklistée
}
```

### Diagramme des transitions de statut

```
    None ──────────┐
     │             │
     │ submitKYC() │
     ▼             │
  Pending ─────────┤
     │             │
     ├─ approveKYC()
     │             │
     ▼             │
  Approved ────────┤
     │             │
     ├─ revokeKYC()
     │             │
     ▼             │
  Rejected ────────┤
                   │
                   │ blacklistAddress()
                   ▼
              Blacklisted
                   │
                   │ removeFromBlacklist()
                   ▼
                  None
```

## 🎭 Rôles

### DEFAULT_ADMIN_ROLE
- Rôle administrateur principal
- Peut attribuer et révoquer tous les rôles
- Attribué au déployeur du contrat

### KYC_ADMIN_ROLE
- Peut approuver/rejeter les KYC
- Peut blacklister/déblacklister des adresses
- Peut effectuer des approbations en batch

**Hash du rôle**: `keccak256("KYC_ADMIN_ROLE")`

## 📝 Structure de données

```solidity
struct KYCData {
    KYCStatus status;        // Statut actuel du KYC
    uint256 approvalDate;    // Date d'approbation (timestamp)
    uint256 expiryDate;      // Date d'expiration (0 = pas d'expiration)
    string dataURI;          // IPFS hash des documents KYC
}
```

## 🔧 Fonctions Principales

### Pour les Utilisateurs

#### `submitKYC(string memory dataURI)`
Soumet une demande de vérification KYC.

**Paramètres:**
- `dataURI`: Hash IPFS ou lien vers les documents KYC chiffrés

**Conditions:**
- L'adresse ne doit pas avoir de KYC en cours (Pending/Approved)
- Peut resoumettre après un rejet

**Événement émis:** `KYCSubmitted(address indexed user, string dataURI, uint256 timestamp)`

**Exemple d'utilisation:**
```javascript
const dataURI = "ipfs://QmHash123...";
await kycRegistry.connect(user).submitKYC(dataURI);
```

---

### Pour les Administrateurs KYC

#### `approveKYC(address user, uint256 expiryDate)`
Approuve le KYC d'un utilisateur (l'ajoute à la whitelist).

**Paramètres:**
- `user`: Adresse de l'utilisateur à approuver
- `expiryDate`: Date d'expiration du KYC (timestamp Unix, 0 = pas d'expiration)

**Conditions:**
- Appelant doit avoir le rôle `KYC_ADMIN_ROLE`
- L'adresse ne doit pas être blacklistée

**Événement émis:** `KYCApproved(address indexed user, uint256 expiryDate, uint256 timestamp)`

**Exemple:**
```javascript
const oneYear = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
await kycRegistry.connect(admin).approveKYC(userAddress, oneYear);
```

---

#### `rejectKYC(address user, string memory reason)`
Rejette une demande de KYC.

**Paramètres:**
- `user`: Adresse de l'utilisateur
- `reason`: Raison du rejet

**Événement émis:** `KYCRejected(address indexed user, string reason, uint256 timestamp)`

**Exemple:**
```javascript
await kycRegistry.connect(admin).rejectKYC(userAddress, "Documents incomplets");
```

---

#### `blacklistAddress(address user, string memory reason)`
Ajoute une adresse à la blacklist.

**Paramètres:**
- `user`: Adresse à blacklister
- `reason`: Raison du blacklistage

**Événement émis:** `AddressBlacklisted(address indexed user, string reason, uint256 timestamp)`

**Exemple:**
```javascript
await kycRegistry.connect(admin).blacklistAddress(userAddress, "Activité frauduleuse détectée");
```

---

#### `removeFromBlacklist(address user)`
Retire une adresse de la blacklist.

**Conditions:**
- L'adresse doit être actuellement blacklistée

**Événement émis:** `AddressRemovedFromBlacklist(address indexed user, uint256 timestamp)`

---

#### `revokeKYC(address user, string memory reason)`
Révoque un KYC précédemment approuvé.

**Conditions:**
- Le KYC doit être dans l'état `Approved`

**Événement émis:** `KYCRevoked(address indexed user, string reason, uint256 timestamp)`

**Exemple:**
```javascript
await kycRegistry.connect(admin).revokeKYC(userAddress, "Violation des conditions");
```

---

#### `batchApproveKYC(address[] calldata users, uint256 expiryDate)`
Approuve plusieurs utilisateurs en une seule transaction.

**Paramètres:**
- `users`: Tableau d'adresses à approuver
- `expiryDate`: Date d'expiration (même pour tous)

**Comportement:**
- Ignore automatiquement les adresses blacklistées
- Émet un événement `KYCApproved` pour chaque approbation réussie

**Exemple:**
```javascript
const users = [address1, address2, address3];
const expiryDate = 0; // Pas d'expiration
await kycRegistry.connect(admin).batchApproveKYC(users, expiryDate);
```

---

## 👁️ Fonctions de Vue

### `isWhitelisted(address user) → bool`
Vérifie si une adresse est whitelistée et que son KYC n'a pas expiré.

**Retourne:** `true` si l'adresse est approuvée et non expirée

**Exemple:**
```javascript
const isValid = await kycRegistry.isWhitelisted(userAddress);
if (isValid) {
    console.log("Utilisateur peut transférer des tokens");
}
```

---

### `isBlacklisted(address user) → bool`
Vérifie si une adresse est blacklistée.

**Retourne:** `true` si l'adresse est blacklistée

---

### `getKYCStatus(address user) → KYCStatus`
Obtient le statut KYC actuel d'une adresse.

**Retourne:** Énumération `KYCStatus` (0-4)

**Exemple:**
```javascript
const status = await kycRegistry.getKYCStatus(userAddress);
// 0 = None, 1 = Pending, 2 = Approved, 3 = Rejected, 4 = Blacklisted
```

---

### `getKYCData(address user) → KYCData`
Obtient toutes les données KYC d'une adresse.

**Retourne:** Structure `KYCData` complète

**Exemple:**
```javascript
const kycData = await kycRegistry.getKYCData(userAddress);
console.log("Status:", kycData.status);
console.log("Expiry:", new Date(kycData.expiryDate * 1000));
console.log("Documents:", kycData.dataURI);
```

---

### `canTransfer(address from, address to) → bool`
Vérifie si un transfert est autorisé entre deux adresses.

**Retourne:** `true` si les deux adresses sont whitelistées et non blacklistées

**Exemple:**
```javascript
const canTransfer = await kycRegistry.canTransfer(sender, recipient);
if (!canTransfer) {
    console.log("Transfert non autorisé - KYC requis");
}
```

---

## 📡 Événements

### `KYCSubmitted(address indexed user, string dataURI, uint256 timestamp)`
Émis lorsqu'un utilisateur soumet une demande de KYC.

### `KYCApproved(address indexed user, uint256 expiryDate, uint256 timestamp)`
Émis lorsqu'un KYC est approuvé.

### `KYCRejected(address indexed user, string reason, uint256 timestamp)`
Émis lorsqu'un KYC est rejeté.

### `AddressBlacklisted(address indexed user, string reason, uint256 timestamp)`
Émis lorsqu'une adresse est ajoutée à la blacklist.

### `AddressRemovedFromBlacklist(address indexed user, uint256 timestamp)`
Émis lorsqu'une adresse est retirée de la blacklist.

### `KYCRevoked(address indexed user, string reason, uint256 timestamp)`
Émis lorsqu'un KYC approuvé est révoqué.

---

## 💡 Cas d'Usage

### Cas 1: Onboarding d'un nouvel utilisateur

```javascript
// 1. L'utilisateur prépare ses documents KYC et les uploade sur IPFS
const ipfsHash = await uploadToIPFS(documents);

// 2. L'utilisateur soumet sa demande
await kycRegistry.connect(user).submitKYC(`ipfs://${ipfsHash}`);

// 3. L'administrateur vérifie et approuve
await kycRegistry.connect(admin).approveKYC(
    user.address,
    Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60) // 1 an
);

// 4. Vérification
const isWhitelisted = await kycRegistry.isWhitelisted(user.address);
console.log("Utilisateur whitelisté:", isWhitelisted);
```

### Cas 2: Gestion d'une activité suspecte

```javascript
// Détection d'activité suspecte
if (suspiciousActivity) {
    // Blacklister immédiatement
    await kycRegistry.connect(admin).blacklistAddress(
        suspiciousUser.address,
        "Activité suspecte détectée - Enquête en cours"
    );
    
    // L'utilisateur ne peut plus transférer de tokens
    const isBlacklisted = await kycRegistry.isBlacklisted(suspiciousUser.address);
    // isBlacklisted = true
}
```

### Cas 3: Renouvellement de KYC expiré

```javascript
// Vérifier l'expiration
const kycData = await kycRegistry.getKYCData(user.address);
const isExpired = kycData.expiryDate > 0 && 
                  kycData.expiryDate < Math.floor(Date.now() / 1000);

if (isExpired) {
    // L'utilisateur resoumit ses documents mis à jour
    await kycRegistry.connect(user).submitKYC(newIPFSHash);
    
    // L'admin approuve avec une nouvelle date d'expiration
    await kycRegistry.connect(admin).approveKYC(
        user.address,
        newExpiryDate
    );
}
```

### Cas 4: Approbation en masse d'investisseurs

```javascript
// Liste d'investisseurs pré-vérifiés
const investors = [
    "0x1234...",
    "0x5678...",
    "0x9abc..."
];

// Approuver tous en une transaction
await kycRegistry.connect(admin).batchApproveKYC(
    investors,
    0 // Pas d'expiration
);

// Vérifier
for (const investor of investors) {
    const isWhitelisted = await kycRegistry.isWhitelisted(investor);
    console.log(`${investor}: ${isWhitelisted}`);
}
```

---

## 🔐 Sécurité

### Bonnes Pratiques

1. **Documents chiffrés**: Les documents KYC doivent être chiffrés avant d'être uploadés sur IPFS
2. **Accès restreint**: Seuls les KYC admins de confiance doivent avoir le rôle
3. **Audit des logs**: Surveiller tous les événements pour détecter les abus
4. **Multi-sig recommandé**: Utiliser un portefeuille multi-signature pour le DEFAULT_ADMIN_ROLE
5. **Expiration régulière**: Définir des dates d'expiration pour forcer la revérification périodique

### Vecteurs d'attaque potentiels

- ❌ **Admin malveillant**: Un KYC admin pourrait approuver des adresses non vérifiées
  - ✅ Solution: Multi-sig + audit des événements
  
- ❌ **Réutilisation de KYC**: Quelqu'un pourrait réutiliser le hash IPFS d'un autre
  - ✅ Solution: Vérification off-chain que le KYC correspond à l'adresse

---

## 📊 Métriques et Monitoring

### Événements à surveiller

```javascript
// Écouter les soumissions
kycRegistry.on("KYCSubmitted", (user, dataURI, timestamp) => {
    console.log(`Nouveau KYC: ${user}`);
    // Déclencher un processus de vérification
});

// Écouter les blacklistages
kycRegistry.on("AddressBlacklisted", (user, reason, timestamp) => {
    console.log(`ALERTE: ${user} blacklisté - ${reason}`);
    // Notifier l'équipe de sécurité
});
```

### Statistiques utiles

```javascript
// Compter les KYC par statut
async function getKYCStatistics(addresses) {
    const stats = {
        none: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        blacklisted: 0
    };
    
    for (const address of addresses) {
        const status = await kycRegistry.getKYCStatus(address);
        switch(status) {
            case 0: stats.none++; break;
            case 1: stats.pending++; break;
            case 2: stats.approved++; break;
            case 3: stats.rejected++; break;
            case 4: stats.blacklisted++; break;
        }
    }
    
    return stats;
}
```

---

## 🧪 Tests

Le contrat est couvert par 52 tests unitaires vérifiant :
- ✅ Déploiement et rôles
- ✅ Soumission de KYC
- ✅ Approbation et rejet
- ✅ Blacklisting/déblacklisting
- ✅ Révocation de KYC
- ✅ Vérifications de conformité
- ✅ Gestion des rôles
- ✅ Cas limites et edge cases
- ✅ Émission des événements
- ✅ Scénarios d'intégration

Pour exécuter les tests:
```bash
npx hardhat test test/KYCRegistry.test.ts
```

---

## 📚 Références

- [OpenZeppelin AccessControl](https://docs.openzeppelin.com/contracts/4.x/api/access#AccessControl)
- [EIP-5173: NFT Future Rewards](https://eips.ethereum.org/EIPS/eip-5173) (pour inspiration)
- [FATF Guidance on Virtual Assets](https://www.fatf-gafi.org/publications/fatfrecommendations/documents/guidance-rba-virtual-assets.html)
