# 📖 Guide d'Utilisation Rapide

Ce guide vous montre comment utiliser la plateforme de tokenisation d'actifs en tant qu'utilisateur, administrateur KYC ou gestionnaire de tokens.

## 🎭 Rôles des Utilisateurs

### 👤 Investisseur Standard
- Soumettre son KYC
- Acheter/vendre des tokens
- Consulter son portfolio
- Brûler ses tokens

### 🔐 Administrateur KYC
- Approuver/rejeter des KYC
- Blacklister des adresses
- Gérer les expirations

### 💼 Gestionnaire de Tokens
- Minter de nouveaux tokens
- Mettre à jour les métadonnées
- Suspendre/reprendre les transferts

---

## 🚀 Démarrage Rapide

### 1. Configuration de l'environnement

```bash
# Installer les dépendances
npm install

# Compiler les contrats
npx hardhat compile

# Lancer les tests
npx hardhat test
```

### 2. Se connecter à un contrat déployé

```javascript
import { ethers } from "hardhat";

// Adresses des contrats (remplacer par les vraies)
const KYC_REGISTRY_ADDRESS = "0x...";
const TOKEN_ADDRESS = "0x...";

// Se connecter aux contrats
const kycRegistry = await ethers.getContractAt("KYCRegistry", KYC_REGISTRY_ADDRESS);
const token = await ethers.getContractAt("FungibleAssetToken", TOKEN_ADDRESS);

// Obtenir le signer
const [signer] = await ethers.getSigners();
console.log("Connecté avec:", signer.address);
```

---

## 👤 Pour les Investisseurs

### Étape 1: Soumettre son KYC

```javascript
// 1. Préparer vos documents KYC (hors blockchain)
// - Pièce d'identité
// - Justificatif de domicile
// - Formulaire KYC rempli

// 2. Uploader sur IPFS (utiliser Pinata, Infura IPFS, etc.)
const documentHash = "QmYourIPFSHash...";
const dataURI = `ipfs://${documentHash}`;

// 3. Soumettre le KYC
const tx = await kycRegistry.submitKYC(dataURI);
await tx.wait();

console.log("✅ KYC soumis avec succès!");
console.log("Attendre l'approbation d'un administrateur...");
```

### Étape 2: Vérifier son statut KYC

```javascript
// Vérifier le statut
const status = await kycRegistry.getKYCStatus(signer.address);

const statusNames = ["None", "Pending", "Approved", "Rejected", "Blacklisted"];
console.log("Statut KYC:", statusNames[status]);

// Vérifier si whitelisté
const isWhitelisted = await kycRegistry.isWhitelisted(signer.address);
console.log("Whitelisté:", isWhitelisted);

// Obtenir toutes les infos
const kycData = await kycRegistry.getKYCData(signer.address);
console.log("Données KYC:", {
    status: statusNames[kycData.status],
    approvalDate: new Date(Number(kycData.approvalDate) * 1000),
    expiryDate: kycData.expiryDate > 0 
        ? new Date(Number(kycData.expiryDate) * 1000) 
        : "Pas d'expiration",
    documents: kycData.dataURI
});
```

### Étape 3: Acheter des tokens

```javascript
// Option A: Mint initial (si vous êtes dans la liste)
// L'administrateur mint pour vous

// Option B: Acheter sur le marché secondaire
// Recevoir un transfert d'un autre holder

// Vérifier si vous pouvez recevoir
const canReceive = await token.canReceiveTokens(signer.address);
if (!canReceive) {
    console.log("❌ Vous devez être whitelisté pour recevoir des tokens");
    return;
}

console.log("✅ Vous pouvez recevoir des tokens");
```

### Étape 4: Consulter son portfolio

```javascript
// Solde
const balance = await token.balanceOf(signer.address);
console.log("Solde:", ethers.formatEther(balance), "tokens");

// Pourcentage de propriété
const ownership = await token.ownershipPercentage(signer.address);
console.log("Propriété:", (Number(ownership) / 100).toFixed(2), "%");

// Valeur de votre holding
const pricePerToken = await token.pricePerToken();
const holdingValue = balance * pricePerToken / ethers.parseEther("1");
console.log("Valeur:", ethers.formatEther(holdingValue), "EUR");

// Informations sur l'actif
const metadata = await token.getAssetMetadata();
console.log("\nActif:", metadata.assetName);
console.log("Type:", metadata.assetType);
console.log("Localisation:", metadata.location);
console.log("Valeur totale:", ethers.formatEther(metadata.totalValue), "EUR");
console.log("Documents:", metadata.documentURI);
```

### Étape 5: Transférer des tokens

```javascript
// Vérifier que le destinataire peut recevoir
const recipientAddress = "0x...";
const canTransfer = await kycRegistry.canTransfer(signer.address, recipientAddress);

if (!canTransfer) {
    console.log("❌ Transfert impossible - Vérifier les KYC");
    return;
}

// Effectuer le transfert
const amount = ethers.parseEther("100"); // 100 tokens
const tx = await token.transfer(recipientAddress, amount);
await tx.wait();

console.log("✅ Transfert réussi!");
```

### Étape 6: Vendre des tokens (Brûler)

```javascript
// Si le projet propose un rachat, vous pouvez burn vos tokens
const amountToBurn = ethers.parseEther("50");

const tx = await token.burn(amountToBurn);
await tx.wait();

console.log("✅", ethers.formatEther(amountToBurn), "tokens brûlés");

// Vérifier le nouveau supply
const totalSupply = await token.totalSupply();
console.log("Supply total:", ethers.formatEther(totalSupply));
```

---

## 🔐 Pour les Administrateurs KYC

### Approuver un KYC

```javascript
// 1. Récupérer la soumission (écouter les événements)
kycRegistry.on("KYCSubmitted", async (user, dataURI, timestamp) => {
    console.log("Nouvelle soumission KYC:");
    console.log("  Utilisateur:", user);
    console.log("  Documents:", dataURI);
    console.log("  Date:", new Date(Number(timestamp) * 1000));
    
    // 2. Vérifier les documents (processus off-chain)
    // - Télécharger depuis IPFS
    // - Vérifier l'identité
    // - Validation manuelle ou automatique
});

// 3. Approuver le KYC
const userToApprove = "0x...";
const oneYear = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);

const tx = await kycRegistry.approveKYC(userToApprove, oneYear);
await tx.wait();

console.log("✅ KYC approuvé pour:", userToApprove);
console.log("Expiration:", new Date(oneYear * 1000));
```

### Rejeter un KYC

```javascript
const userToReject = "0x...";
const reason = "Documents incomplets ou invalides";

const tx = await kycRegistry.rejectKYC(userToReject, reason);
await tx.wait();

console.log("❌ KYC rejeté:", userToReject);
console.log("Raison:", reason);
```

### Blacklister une adresse

```javascript
const suspiciousAddress = "0x...";
const reason = "Activité frauduleuse détectée";

const tx = await kycRegistry.blacklistAddress(suspiciousAddress, reason);
await tx.wait();

console.log("🚫 Adresse blacklistée:", suspiciousAddress);

// Vérifier
const isBlacklisted = await kycRegistry.isBlacklisted(suspiciousAddress);
console.log("Blacklisté:", isBlacklisted); // true
```

### Retirer du blacklist

```javascript
const addressToUnblock = "0x...";

// Vérifier d'abord
const isBlacklisted = await kycRegistry.isBlacklisted(addressToUnblock);
if (!isBlacklisted) {
    console.log("❌ Cette adresse n'est pas blacklistée");
    return;
}

const tx = await kycRegistry.removeFromBlacklist(addressToUnblock);
await tx.wait();

console.log("✅ Adresse retirée du blacklist:", addressToUnblock);
```

### Approbation en batch

```javascript
// Liste d'investisseurs pré-vérifiés (ex: investisseurs institutionnels)
const investorsToApprove = [
    "0x1111...",
    "0x2222...",
    "0x3333...",
    "0x4444..."
];

// Tous avec la même date d'expiration
const twoYears = Math.floor(Date.now() / 1000) + (2 * 365 * 24 * 60 * 60);

const tx = await kycRegistry.batchApproveKYC(investorsToApprove, twoYears);
await tx.wait();

console.log(`✅ ${investorsToApprove.length} KYC approuvés en batch`);

// Vérifier
for (const investor of investorsToApprove) {
    const isWhitelisted = await kycRegistry.isWhitelisted(investor);
    console.log(`  ${investor}: ${isWhitelisted ? "✅" : "❌"}`);
}
```

### Révoquer un KYC

```javascript
const userToRevoke = "0x...";
const reason = "Non-respect des conditions d'utilisation";

// Vérifier que le KYC est bien approuvé
const status = await kycRegistry.getKYCStatus(userToRevoke);
if (status !== 2) { // 2 = Approved
    console.log("❌ Le KYC n'est pas approuvé");
    return;
}

const tx = await kycRegistry.revokeKYC(userToRevoke, reason);
await tx.wait();

console.log("🔴 KYC révoqué:", userToRevoke);
```

---

## 💼 Pour les Gestionnaires de Tokens

### Minter des tokens

```javascript
// Vérifier la supply disponible
const remaining = await token.remainingSupply();
console.log("Supply restante:", ethers.formatEther(remaining));

if (remaining === 0n) {
    console.log("❌ Plus de supply disponible");
    return;
}

// Mint vers un investisseur
const investor = "0x...";
const amount = ethers.parseEther("1000");

// Vérifier que l'investisseur est whitelisté
const canReceive = await token.canReceiveTokens(investor);
if (!canReceive) {
    console.log("❌ L'investisseur doit être whitelisté");
    return;
}

// Mint
const tx = await token.mint(investor, amount);
await tx.wait();

console.log("✅", ethers.formatEther(amount), "tokens mintés pour", investor);
```

### Mint en batch

```javascript
// Allocations pour une levée de fonds
const allocations = [
    { address: "0x1111...", amount: ethers.parseEther("1000") },
    { address: "0x2222...", amount: ethers.parseEther("2500") },
    { address: "0x3333...", amount: ethers.parseEther("1500") },
    { address: "0x4444...", amount: ethers.parseEther("750") }
];

// Vérifier le total
const totalToMint = allocations.reduce((sum, a) => sum + a.amount, 0n);
const remaining = await token.remainingSupply();

if (totalToMint > remaining) {
    console.log("❌ Montant total dépasse la supply restante");
    return;
}

// Préparer les arrays
const recipients = allocations.map(a => a.address);
const amounts = allocations.map(a => a.amount);

// Mint en batch
const tx = await token.batchMint(recipients, amounts);
await tx.wait();

console.log("✅ Batch mint réussi!");
console.log("Total minté:", ethers.formatEther(totalToMint));

// Vérifier les soldes
for (const allocation of allocations) {
    const balance = await token.balanceOf(allocation.address);
    console.log(`  ${allocation.address}: ${ethers.formatEther(balance)} tokens`);
}
```

### Mettre à jour les documents

```javascript
// Nouveaux documents d'évaluation, photos, etc.
const newDocumentHash = "QmNewHash...";
const newURI = `ipfs://${newDocumentHash}`;

const tx = await token.updateDocumentURI(newURI);
await tx.wait();

console.log("✅ Documents mis à jour");

// Vérifier
const metadata = await token.getAssetMetadata();
console.log("Nouvel URI:", metadata.documentURI);
```

### Suspendre les transferts (Urgence)

```javascript
// En cas de problème détecté
const tx = await token.pause();
await tx.wait();

console.log("⏸️  Transferts suspendus");

// Vérifier
const isPaused = await token.paused();
console.log("Contrat en pause:", isPaused); // true

// Les utilisateurs ne peuvent plus transférer, mais peuvent encore burn
```

### Reprendre les transferts

```javascript
// Après résolution du problème
const tx = await token.unpause();
await tx.wait();

console.log("▶️  Transferts repris");

const isPaused = await token.paused();
console.log("Contrat en pause:", isPaused); // false
```

---

## 📊 Scripts Utiles

### Script de monitoring

```javascript
// scripts/monitor.ts
import { ethers } from "hardhat";

async function monitor() {
    const kycRegistry = await ethers.getContractAt("KYCRegistry", KYC_ADDRESS);
    const token = await ethers.getContractAt("FungibleAssetToken", TOKEN_ADDRESS);
    
    // Écouter les événements en temps réel
    console.log("🔍 Monitoring actif...\n");
    
    kycRegistry.on("KYCSubmitted", (user, dataURI, timestamp) => {
        console.log("📋 Nouveau KYC soumis:");
        console.log("  User:", user);
        console.log("  Time:", new Date(Number(timestamp) * 1000));
    });
    
    kycRegistry.on("AddressBlacklisted", (user, reason, timestamp) => {
        console.log("🚫 ALERTE - Adresse blacklistée:");
        console.log("  User:", user);
        console.log("  Reason:", reason);
    });
    
    token.on("TokensMinted", (to, amount, timestamp) => {
        console.log("🪙 Tokens mintés:");
        console.log("  To:", to);
        console.log("  Amount:", ethers.formatEther(amount));
    });
    
    token.on("Transfer", (from, to, value) => {
        if (from !== ethers.ZeroAddress && to !== ethers.ZeroAddress) {
            console.log("💸 Transfert:");
            console.log("  From:", from);
            console.log("  To:", to);
            console.log("  Amount:", ethers.formatEther(value));
        }
    });
}

monitor().catch(console.error);
```

### Script de statistiques

```javascript
// scripts/stats.ts
import { ethers } from "hardhat";

async function getStatistics() {
    const token = await ethers.getContractAt("FungibleAssetToken", TOKEN_ADDRESS);
    
    // Token stats
    const totalSupply = await token.totalSupply();
    const maxSupply = await token.MAX_SUPPLY();
    const remaining = await token.remainingSupply();
    const pricePerToken = await token.pricePerToken();
    const metadata = await token.getAssetMetadata();
    
    console.log("📊 STATISTIQUES DU TOKEN");
    console.log("========================");
    console.log("Nom:", await token.name());
    console.log("Symbol:", await token.symbol());
    console.log("Total Supply:", ethers.formatEther(totalSupply));
    console.log("Max Supply:", ethers.formatEther(maxSupply));
    console.log("Remaining:", ethers.formatEther(remaining));
    console.log("% Minté:", ((Number(totalSupply) * 100) / Number(maxSupply)).toFixed(2) + "%");
    console.log("Prix/token:", ethers.formatEther(pricePerToken), "EUR");
    console.log("\n📍 ACTIF");
    console.log("========================");
    console.log("Nom:", metadata.assetName);
    console.log("Type:", metadata.assetType);
    console.log("Localisation:", metadata.location);
    console.log("Valeur totale:", ethers.formatEther(metadata.totalValue), "EUR");
    console.log("Tokenisé le:", new Date(Number(metadata.tokenizationDate) * 1000));
}

getStatistics().catch(console.error);
```

### Script d'export des holders

```javascript
// scripts/export-holders.ts
import { ethers } from "hardhat";
import fs from "fs";

async function exportHolders() {
    const token = await ethers.getContractAt("FungibleAssetToken", TOKEN_ADDRESS);
    
    // Récupérer tous les événements Transfer
    const filter = token.filters.Transfer();
    const events = await token.queryFilter(filter);
    
    // Extraire les adresses uniques
    const addresses = new Set<string>();
    for (const event of events) {
        if (event.args.to !== ethers.ZeroAddress) {
            addresses.add(event.args.to);
        }
    }
    
    // Obtenir les soldes
    const holders = [];
    for (const address of addresses) {
        const balance = await token.balanceOf(address);
        if (balance > 0n) {
            const ownership = await token.ownershipPercentage(address);
            holders.push({
                address,
                balance: ethers.formatEther(balance),
                ownershipPercent: Number(ownership) / 100
            });
        }
    }
    
    // Trier par solde décroissant
    holders.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
    
    // Sauvegarder
    fs.writeFileSync(
        "holders.json",
        JSON.stringify(holders, null, 2)
    );
    
    console.log(`✅ ${holders.length} holders exportés dans holders.json`);
}

exportHolders().catch(console.error);
```

---

## 🔗 Liens Rapides

- [Documentation Complète](./README.md)
- [KYCRegistry API](./KYCRegistry.md)
- [FungibleAssetToken API](./FungibleAssetToken.md)
- [Guide de Déploiement](./deployment-guide.md)
- [FAQ](./faq.md)

---

## 💡 Conseils

1. **Toujours vérifier le KYC** avant de transférer
2. **Sauvegarder les clés privées** de manière sécurisée
3. **Tester sur testnet** avant le mainnet
4. **Monitorer les événements** pour détecter les anomalies
5. **Utiliser multi-sig** pour les rôles critiques
6. **Documenter toutes les opérations** importantes
7. **Faire des backups** réguliers des données

---

## 🆘 Support

En cas de problème, consultez:
1. La [FAQ](./faq.md)
2. Les logs des transactions sur Etherscan
3. Les issues GitHub
4. L'équipe de support
