# 🪙 FungibleAssetToken - Documentation Complète

## Vue d'ensemble

Le contrat `FungibleAssetToken` est un token ERC-20 qui représente la propriété fractionnée d'un actif réel (immobilier, art, etc.). Il intègre des contrôles de conformité KYC et des fonctionnalités de gestion avancées.

## 🏗️ Héritages

```solidity
contract FungibleAssetToken is 
    ERC20,           // Standard ERC-20
    ERC20Burnable,   // Capacité de burn
    ERC20Pausable,   // Capacité de pause
    AccessControl    // Gestion des rôles
```

## 🎭 Rôles

### DEFAULT_ADMIN_ROLE
- Rôle administrateur principal (OpenZeppelin)
- Peut gérer tous les autres rôles
- Attribué au déployeur

### ADMIN_ROLE
- Peut mettre à jour les métadonnées de l'actif
- Gère la documentation (URI IPFS)

**Hash:** `keccak256("ADMIN_ROLE")`

### MINTER_ROLE
- Peut créer de nouveaux tokens
- Limité par MAX_SUPPLY
- Doit respecter les contraintes KYC

**Hash:** `keccak256("MINTER_ROLE")`

### PAUSER_ROLE
- Peut suspendre/reprendre les transferts
- Utilisé en cas d'urgence ou de maintenance

**Hash:** `keccak256("PAUSER_ROLE")`

---

## 📊 Structure de données

### AssetMetadata

```solidity
struct AssetMetadata {
    string assetName;          // "Résidence Lumière"
    string assetType;          // "Immobilier", "Art", etc.
    string location;           // "42 Rue de Vaugirard, Paris"
    uint256 totalValue;        // Valeur totale (en centimes ou wei)
    string documentURI;        // Hash IPFS des documents
    uint256 tokenizationDate;  // Date de tokenisation
}
```

### Variables d'état

```solidity
KYCRegistry public immutable kycRegistry;  // Référence au registre KYC
AssetMetadata public assetMetadata;        // Métadonnées de l'actif
uint256 public immutable MAX_SUPPLY;       // Supply maximum (fixé)
```

---

## 🔧 Fonctions de Minting

### `mint(address to, uint256 amount)`
Crée de nouveaux tokens.

**Paramètres:**
- `to`: Adresse destinataire (doit être whitelistée)
- `amount`: Quantité de tokens à créer

**Conditions:**
- Appelant doit avoir `MINTER_ROLE`
- `to` ne peut pas être l'adresse zéro
- `amount` doit être > 0
- `totalSupply() + amount` ≤ `MAX_SUPPLY`
- `to` doit être whitelisté dans KYCRegistry

**Événements émis:** 
- `Transfer(address(0), to, amount)` (ERC-20)
- `TokensMinted(address indexed to, uint256 amount, uint256 timestamp)`

**Erreurs possibles:**
```solidity
error ZeroAddress();
error ZeroAmount();
error ExceedsMaxSupply();
error RecipientNotWhitelisted();
```

**Exemple:**
```javascript
const amount = ethers.parseEther("100"); // 100 tokens
await token.connect(minter).mint(investor.address, amount);
```

---

### `batchMint(address[] calldata recipients, uint256[] calldata amounts)`
Mint vers plusieurs adresses en une transaction.

**Paramètres:**
- `recipients`: Tableau d'adresses
- `amounts`: Tableau de quantités (même longueur)

**Conditions:**
- Les deux tableaux doivent avoir la même longueur
- La somme totale ne doit pas dépasser `MAX_SUPPLY`
- Toutes les adresses doivent être whitelistées

**Exemple:**
```javascript
const recipients = [addr1, addr2, addr3];
const amounts = [
    ethers.parseEther("100"),
    ethers.parseEther("200"),
    ethers.parseEther("150")
];

await token.connect(minter).batchMint(recipients, amounts);
```

---

## 🔥 Fonctions de Burning

### `burn(uint256 amount)`
Détruit des tokens de son propre solde.

**Paramètres:**
- `amount`: Quantité à détruire

**Événements émis:**
- `Transfer(msg.sender, address(0), amount)` (ERC-20)
- `TokensBurned(address indexed from, uint256 amount, uint256 timestamp)`

**Exemple:**
```javascript
const amount = ethers.parseEther("50");
await token.connect(holder).burn(amount);
```

---

### `burnFrom(address account, uint256 amount)`
Détruit des tokens d'une autre adresse (avec approbation).

**Paramètres:**
- `account`: Adresse dont on détruit les tokens
- `amount`: Quantité à détruire

**Conditions:**
- L'appelant doit avoir une allowance suffisante

**Exemple:**
```javascript
// D'abord, approuver
await token.connect(holder).approve(burner.address, amount);

// Ensuite, burn
await token.connect(burner).burnFrom(holder.address, amount);
```

---

## 🛡️ Fonctions de Contrôle

### `pause()`
Suspend tous les transferts de tokens.

**Conditions:**
- Appelant doit avoir `PAUSER_ROLE`

**Effet:** 
- Bloque toutes les fonctions `transfer`, `transferFrom`, `mint`
- Les `burn` restent possibles

**Exemple:**
```javascript
// En cas d'urgence
await token.connect(pauser).pause();
```

---

### `unpause()`
Reprend les transferts de tokens.

**Conditions:**
- Appelant doit avoir `PAUSER_ROLE`
- Le contrat doit être en pause

**Exemple:**
```javascript
// Après résolution du problème
await token.connect(pauser).unpause();
```

---

## 📝 Fonctions d'Administration

### `updateDocumentURI(string memory newDocumentURI)`
Met à jour l'URI des documents de l'actif.

**Paramètres:**
- `newDocumentURI`: Nouveau hash IPFS

**Conditions:**
- Appelant doit avoir `ADMIN_ROLE`

**Événement émis:** `AssetMetadataUpdated(string documentURI)`

**Cas d'usage:**
- Ajout de nouveaux documents légaux
- Mise à jour des rapports d'évaluation
- Ajout de photos actualisées

**Exemple:**
```javascript
const newHash = "ipfs://QmNewHash456...";
await token.connect(admin).updateDocumentURI(newHash);
```

---

## 👁️ Fonctions de Vue

### `canReceiveTokens(address account) → bool`
Vérifie si une adresse peut recevoir des tokens.

**Retourne:** `true` si whitelisté ET non blacklisté

**Exemple:**
```javascript
const canReceive = await token.canReceiveTokens(investor.address);
if (!canReceive) {
    console.log("KYC requis avant de recevoir des tokens");
}
```

---

### `pricePerToken() → uint256`
Calcule le prix par token basé sur la valeur totale de l'actif.

**Formule:** `totalValue / MAX_SUPPLY`

**Retourne:** Prix par token (en même unité que totalValue)

**Exemple:**
```javascript
const price = await token.pricePerToken();
console.log(`Prix par token: ${ethers.formatEther(price)} EUR`);
```

---

### `remainingSupply() → uint256`
Retourne la quantité de tokens restant à minter.

**Formule:** `MAX_SUPPLY - totalSupply()`

**Exemple:**
```javascript
const remaining = await token.remainingSupply();
console.log(`Tokens restants: ${ethers.formatEther(remaining)}`);
```

---

### `canMint() → bool`
Vérifie s'il est encore possible de minter.

**Retourne:** `true` si `totalSupply() < MAX_SUPPLY`

**Exemple:**
```javascript
if (await token.canMint()) {
    // Lancer une nouvelle levée de fonds
}
```

---

### `ownershipPercentage(address account) → uint256`
Calcule le pourcentage de propriété d'une adresse.

**Formule:** `(balance * 10000) / MAX_SUPPLY`

**Retourne:** Pourcentage en points de base (10000 = 100%)

**Exemple:**
```javascript
const ownership = await token.ownershipPercentage(investor.address);
const percentage = ownership / 100; // Conversion en pourcentage
console.log(`Possède ${percentage}% de l'actif`);
```

---

### `getAssetMetadata() → AssetMetadata`
Retourne toutes les métadonnées de l'actif.

**Exemple:**
```javascript
const metadata = await token.getAssetMetadata();
console.log("Actif:", metadata.assetName);
console.log("Type:", metadata.assetType);
console.log("Localisation:", metadata.location);
console.log("Valeur:", ethers.formatEther(metadata.totalValue));
console.log("Documents:", metadata.documentURI);
console.log("Tokenisé le:", new Date(metadata.tokenizationDate * 1000));
```

---

## 🚨 Erreurs Personnalisées

```solidity
error ExceedsMaxSupply();           // Supply max dépassé
error RecipientNotWhitelisted();    // Destinataire pas whitelisté
error SenderNotWhitelisted();       // Expéditeur pas whitelisté
error RecipientBlacklisted();       // Destinataire blacklisté
error SenderBlacklisted();          // Expéditeur blacklisté
error ZeroAddress();                // Adresse zéro non autorisée
error ZeroAmount();                 // Montant zéro non autorisé
```

---

## 📡 Événements

### Événements Standard ERC-20

```solidity
event Transfer(address indexed from, address indexed to, uint256 value);
event Approval(address indexed owner, address indexed spender, uint256 value);
```

### Événements Personnalisés

```solidity
event TokensMinted(address indexed to, uint256 amount, uint256 timestamp);
event TokensBurned(address indexed from, uint256 amount, uint256 timestamp);
event AssetMetadataUpdated(string documentURI);
event KYCCheckFailed(address indexed from, address indexed to, string reason);
```

### `KYCCheckFailed`
Émis lorsqu'un transfert échoue à cause du KYC.

**Utilité:** Permet aux frontends de donner un feedback précis

**Exemple d'écoute:**
```javascript
token.on("KYCCheckFailed", (from, to, reason) => {
    console.error(`Transfert bloqué: ${reason}`);
    // Afficher une popup à l'utilisateur
});
```

---

## 🔐 Mécanisme de Vérification KYC

### Logique de vérification

Chaque transfert (sauf mint/burn) vérifie automatiquement :

```
1. Vérifier si sender est blacklisté
   ❌ Si oui → SenderBlacklisted()
   
2. Vérifier si recipient est blacklisté
   ❌ Si oui → RecipientBlacklisted()
   
3. Vérifier si sender est whitelisté
   ❌ Si non → SenderNotWhitelisted()
   
4. Vérifier si recipient est whitelisté
   ❌ Si non → RecipientNotWhitelisted()
   
✅ Si toutes les vérifications passent → Transfert autorisé
```

### Implémentation

```solidity
function _update(address from, address to, uint256 value)
    internal
    override(ERC20, ERC20Pausable)
{
    // Permettre mint (from = 0) et burn (to = 0)
    if (from != address(0) && to != address(0)) {
        // Vérifications KYC...
    }
    
    super._update(from, to, value);
}
```

---

## 💡 Cas d'Usage

### Cas 1: Tokenisation d'un bien immobilier

```javascript
// Paramètres de l'actif
const assetName = "Appartement Rue de Vaugirard";
const assetType = "Immobilier Résidentiel";
const location = "42 Rue de Vaugirard, 75015 Paris, France";
const totalValue = ethers.parseEther("500000"); // 500,000 EUR
const maxSupply = ethers.parseEther("10000");   // 10,000 tokens
const documentURI = "ipfs://QmDocuments123...";

// Déployer le token
const TokenFactory = await ethers.getContractFactory("FungibleAssetToken");
const token = await TokenFactory.deploy(
    "Paris Vaugirard Token",
    "PVT",
    maxSupply,
    kycRegistryAddress,
    assetName,
    assetType,
    location,
    totalValue,
    documentURI
);

// Prix par token = 500,000 / 10,000 = 50 EUR
const pricePerToken = await token.pricePerToken();
```

### Cas 2: Distribution initiale aux investisseurs

```javascript
// Liste des investisseurs vérifiés (KYC approuvé)
const investors = [
    { address: "0x123...", amount: ethers.parseEther("1000") },  // 10%
    { address: "0x456...", amount: ethers.parseEther("2500") },  // 25%
    { address: "0x789...", amount: ethers.parseEther("1500") },  // 15%
];

// Vérifier que tous sont whitelistés
for (const investor of investors) {
    const canReceive = await token.canReceiveTokens(investor.address);
    if (!canReceive) {
        throw new Error(`${investor.address} n'est pas whitelisté`);
    }
}

// Mint en batch
const addresses = investors.map(i => i.address);
const amounts = investors.map(i => i.amount);
await token.connect(minter).batchMint(addresses, amounts);

// Vérifier la distribution
for (const investor of investors) {
    const balance = await token.balanceOf(investor.address);
    const ownership = await token.ownershipPercentage(investor.address);
    console.log(`${investor.address}: ${ethers.formatEther(balance)} tokens (${ownership/100}%)`);
}
```

### Cas 3: Transaction secondaire

```javascript
// Alice veut vendre 100 tokens à Bob
const amount = ethers.parseEther("100");

// Vérifier que Bob est whitelisté
if (!await token.canReceiveTokens(bob.address)) {
    throw new Error("Bob doit compléter son KYC");
}

// Vérifier le solde d'Alice
const balance = await token.balanceOf(alice.address);
if (balance < amount) {
    throw new Error("Solde insuffisant");
}

// Effectuer le transfert
await token.connect(alice).transfer(bob.address, amount);

// Vérifier les nouveaux pourcentages de propriété
const aliceOwnership = await token.ownershipPercentage(alice.address);
const bobOwnership = await token.ownershipPercentage(bob.address);
console.log(`Alice: ${aliceOwnership/100}%, Bob: ${bobOwnership/100}%`);
```

### Cas 4: Gestion d'urgence

```javascript
// Détection d'une activité suspecte
const suspiciousAddress = "0xabc...";

// 1. Blacklister l'adresse dans KYCRegistry
await kycRegistry.connect(admin).blacklistAddress(
    suspiciousAddress,
    "Activité suspecte détectée"
);

// 2. Suspendre tous les transferts (optionnel)
await token.connect(pauser).pause();

// 3. Enquêter et résoudre le problème
// ...

// 4. Reprendre les opérations
await token.connect(pauser).unpause();
```

### Cas 5: Mise à jour de documents

```javascript
// L'actif a été réévalué, nouveaux documents disponibles
const newValuation = {
    report: "evaluation_2024.pdf",
    photos: ["photo1.jpg", "photo2.jpg"],
    legalDocs: ["acte_propriete_update.pdf"]
};

// Upload sur IPFS
const newHash = await uploadToIPFS(newValuation);

// Mettre à jour l'URI
await token.connect(admin).updateDocumentURI(`ipfs://${newHash}`);

// Vérifier
const metadata = await token.getAssetMetadata();
console.log("Nouveaux documents:", metadata.documentURI);
```

### Cas 6: Rachat et burn de tokens

```javascript
// La société rachète des tokens pour réduire la supply
const buybackAmount = ethers.parseEther("500");

// 1. Acheter les tokens du marché secondaire
await token.connect(holder).transfer(company.address, buybackAmount);

// 2. Burn les tokens rachetés
await token.connect(company).burn(buybackAmount);

// 3. Vérifier l'effet
const totalSupply = await token.totalSupply();
const remaining = await token.remainingSupply();
console.log(`Supply totale: ${ethers.formatEther(totalSupply)}`);
console.log(`Peut encore minter: ${ethers.formatEther(remaining)}`);

// Note: Le prix par token augmente automatiquement
// car totalValue reste constant mais supply diminue
```

---

## 📊 Calculs Financiers

### Valeur d'un holding

```javascript
async function calculateHoldingValue(holderAddress) {
    const balance = await token.balanceOf(holderAddress);
    const pricePerToken = await token.pricePerToken();
    const holdingValue = balance * pricePerToken / ethers.parseEther("1");
    
    return {
        tokens: ethers.formatEther(balance),
        valueInEUR: ethers.formatEther(holdingValue),
        ownershipPercent: (await token.ownershipPercentage(holderAddress)) / 100
    };
}

// Exemple
const holding = await calculateHoldingValue(investor.address);
console.log(`Tokens: ${holding.tokens}`);
console.log(`Valeur: ${holding.valueInEUR} EUR`);
console.log(`Propriété: ${holding.ownershipPercent}%`);
```

### Calcul de dividendes proportionnels

```javascript
async function calculateDividends(totalDividends) {
    const maxSupply = await token.MAX_SUPPLY();
    const holders = await getAllHolders(); // Fonction custom
    
    const dividends = [];
    for (const holder of holders) {
        const balance = await token.balanceOf(holder);
        const share = (balance * BigInt(10000)) / maxSupply;
        const dividend = (totalDividends * share) / BigInt(10000);
        
        dividends.push({
            address: holder,
            amount: ethers.formatEther(dividend),
            percentage: Number(share) / 100
        });
    }
    
    return dividends;
}

// Exemple: Distribuer 50,000 EUR de loyers
const totalDividends = ethers.parseEther("50000");
const distribution = await calculateDividends(totalDividends);
distribution.forEach(d => {
    console.log(`${d.address}: ${d.amount} EUR (${d.percentage}%)`);
});
```

---

## 🧪 Tests

Le contrat est couvert par 35 tests unitaires vérifiant :

- ✅ Déploiement et configuration
- ✅ Minting (simple et batch)
- ✅ Transferts avec KYC
- ✅ Burning
- ✅ Pause/Unpause
- ✅ Gestion des rôles
- ✅ Fonctions de vue
- ✅ Scénarios d'intégration complets

Pour exécuter les tests:
```bash
npx hardhat test test/FungibleAssetToken.test.ts
```

---

## 🔐 Sécurité

### Bonnes Pratiques

1. **KYC obligatoire**: Tous les transferts vérifient le KYC
2. **Supply fixe**: MAX_SUPPLY est immutable
3. **Pause d'urgence**: Possibilité de suspendre en cas de problème
4. **Rôles séparés**: Séparation des responsabilités
5. **Événements complets**: Traçabilité de toutes les actions

### Points d'attention

⚠️ **Centralisation**: Les rôles d'admin ont beaucoup de pouvoir
- Solution: Utiliser un multi-sig pour les rôles critiques

⚠️ **Dépendance KYC**: Si le contrat KYCRegistry est compromis
- Solution: Fonction d'urgence pour changer le registre (à implémenter si nécessaire)

⚠️ **Documents IPFS**: Les URIs ne sont pas vérifiés on-chain
- Solution: Processus de gouvernance pour les mises à jour

---

## 📚 Références

- [ERC-20 Standard](https://eips.ethereum.org/EIPS/eip-20)
- [OpenZeppelin ERC20](https://docs.openzeppelin.com/contracts/4.x/erc20)
- [OpenZeppelin AccessControl](https://docs.openzeppelin.com/contracts/4.x/api/access#AccessControl)
- [Real World Asset Tokenization](https://www.investopedia.com/terms/t/tokenization.asp)
