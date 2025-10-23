# 🚀 Guide Rapide : Upload IPFS pour NFT

## ⚡ Pourquoi IPFS ?

Stocker les métadonnées on-chain (sur la blockchain) coûte **très cher en gas**. IPFS permet de :
- ✅ **Réduire les frais** de 90%+ 
- ✅ **Stockage décentralisé** et permanent
- ✅ **Métadonnées accessibles** par tous

---

## 📋 Workflow en 3 Étapes

### 1️⃣ Générer le JSON
Dans l'interface "Create NFT", mode **Saisie Manuelle** :
- Remplissez tous les champs
- Cliquez sur "Minter le NFT"
- Le JSON est généré et **copié automatiquement**

### 2️⃣ Uploader sur IPFS
Utilisez un des services ci-dessous

### 3️⃣ Récupérer l'URI
- Copiez le CID (ex: `QmXXXXXXX...`)
- Revenez dans l'interface
- Mode **URI Existante** : `ipfs://QmXXXXXXX...`
- Mintez votre NFT !

---

## 🌟 Méthode 1 : Pinata (Recommandé - Gratuit)

### Avantages
- ✅ Interface simple
- ✅ 1 GB gratuit
- ✅ Pinning automatique (fichiers gardés en ligne)
- ✅ Gateway rapide

### Étapes

1. **Créer un compte**
   - Allez sur [pinata.cloud](https://pinata.cloud)
   - Inscription gratuite

2. **Upload le fichier**
   - Cliquez sur "Upload" → "File"
   - Créez un fichier `metadata.json`
   - Collez le JSON copié
   - Uploadez

3. **Récupérer le CID**
   - Copiez le "CID" affiché (ex: `QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG`)
   - Utilisez : `ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG`

### 📸 Étapes Visuelles

```
1. Pinata Dashboard → [Upload] → [File]
2. Choisir metadata.json → [Upload]
3. Copier le CID → ipfs://[CID]
```

---

## 🎯 Méthode 2 : NFT.Storage (Gratuit & Permanent)

### Avantages
- ✅ **Totalement gratuit**
- ✅ **Stockage permanent** garanti
- ✅ Spécialisé pour les NFTs
- ✅ API simple

### Étapes

1. **Créer un compte**
   - [nft.storage](https://nft.storage)
   - Connexion avec GitHub ou email

2. **Upload via l'interface**
   - "Upload" → "File"
   - Choisir `metadata.json`
   - Upload automatique

3. **Récupérer le CID**
   - CID visible instantanément
   - Format : `ipfs://bafybeXXXXXXXXXXXXX...`

### 🔑 Upload via API (Optionnel)

```bash
# Générer une clé API sur nft.storage
# Puis :
curl -X POST https://api.nft.storage/upload \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F file=@metadata.json
```

---

## 💻 Méthode 3 : IPFS Desktop (Local)

### Avantages
- ✅ Contrôle total
- ✅ Pas de compte nécessaire
- ✅ Node IPFS local

### Étapes

1. **Installer IPFS Desktop**
   - Télécharger : [docs.ipfs.tech/install/ipfs-desktop](https://docs.ipfs.tech/install/ipfs-desktop/)
   - Installer et lancer

2. **Ajouter le fichier**
   - "Files" → "Import"
   - Choisir `metadata.json`
   - Le fichier est ajouté automatiquement

3. **Récupérer le CID**
   - Clic droit sur le fichier → "Copy CID"
   - Utiliser : `ipfs://CID`

⚠️ **Important** : Votre node doit rester en ligne, ou utiliser un pinning service.

---

## 🖼️ Upload d'Images IPFS

Les métadonnées référencent souvent des images. Voici comment les uploader :

### Sur Pinata
1. Upload l'image (`diamond.jpg`)
2. Copier le CID : `QmImageXXXX...`
3. Dans les métadonnées, utiliser : `ipfs://QmImageXXXX.../diamond.jpg`

### Sur NFT.Storage
1. Upload l'image
2. Récupérer le CID
3. Utiliser dans le JSON

### Structure Complète

```json
{
  "name": "Diamond 2.5ct D IF",
  "description": "Certified diamond...",
  "image": "ipfs://QmImage123.../diamond.jpg",
  "attributes": [...]
}
```

---

## 📝 Exemple Complet

### 1. JSON Généré (copié automatiquement)

```json
{
  "name": "Diamond 2.5ct D IF",
  "description": "Certified natural diamond, 2.5 carat, color D, clarity IF",
  "image": "ipfs://QmTest123/diamond.jpg",
  "attributes": [
    {"trait_type": "Carat", "value": "2.5"},
    {"trait_type": "Color", "value": "D"},
    {"trait_type": "Clarity", "value": "IF"}
  ]
}
```

### 2. Créer le fichier
- Créer `metadata.json` sur votre ordinateur
- Coller le JSON

### 3. Upload sur Pinata
- Upload `metadata.json`
- CID reçu : `QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG`

### 4. Utiliser dans l'interface
```
Mode: URI Existante
URI: ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
```

### 5. Minter
- Frais de gas réduits à ~150k gas (au lieu de 1M+)
- Transaction confirmée
- NFT créé avec métadonnées décentralisées ✅

---

## 💰 Comparaison des Coûts Gas

| Méthode | Gas Estimé | Coût (~30 gwei) |
|---------|------------|-----------------|
| **On-chain (Data URI)** | ~1,000,000 | ~0.03 ETH | ❌ Très cher
| **IPFS URI** | ~150,000 | ~0.0045 ETH | ✅ Recommandé

**Économie : ~85% de gas !**

---

## 🔄 Workflow Optimisé

### Option A : Upload Images D'abord

1. Upload toutes vos images sur IPFS
2. Noter les CIDs
3. Créer les métadonnées avec les URIs d'images
4. Upload les métadonnées
5. Minter les NFTs

### Option B : Batch Upload

1. Créer un dossier avec :
   - `images/` (toutes les images)
   - `metadata/` (tous les JSON)
2. Upload le dossier entier sur Pinata
3. Structure préservée automatiquement
4. Un seul CID de base

```
ipfs://QmFolder123/
  ├── images/
  │   ├── diamond1.jpg
  │   └── diamond2.jpg
  └── metadata/
      ├── diamond1.json
      └── diamond2.json
```

---

## 🛠️ Tools & Services

### Services IPFS Gratuits
- [Pinata](https://pinata.cloud) - 1 GB gratuit
- [NFT.Storage](https://nft.storage) - Illimité gratuit
- [Web3.Storage](https://web3.storage) - 5 GB gratuit
- [Fleek](https://fleek.co) - IPFS + CDN

### Gateways IPFS Publics
- `https://ipfs.io/ipfs/[CID]`
- `https://gateway.pinata.cloud/ipfs/[CID]`
- `https://cloudflare-ipfs.com/ipfs/[CID]`

### Outils Desktop
- [IPFS Desktop](https://docs.ipfs.tech/install/ipfs-desktop/)
- [IPFS Companion](https://docs.ipfs.tech/install/ipfs-companion/) (Extension navigateur)

---

## ✅ Checklist

Avant de minter votre NFT :

- [ ] JSON des métadonnées généré
- [ ] Image uploadée sur IPFS
- [ ] Métadonnées uploadées sur IPFS
- [ ] CID copié correctement
- [ ] Format URI : `ipfs://CID`
- [ ] Test du lien (gateway) : `https://ipfs.io/ipfs/CID`
- [ ] Vérification du JSON accessible
- [ ] Prêt à minter !

---

## 🆘 Problèmes Courants

### "Gateway timeout"
➡️ Utiliser un autre gateway :
- `https://cloudflare-ipfs.com/ipfs/[CID]`
- `https://gateway.pinata.cloud/ipfs/[CID]`

### "CID not found"
➡️ Attendre quelques minutes (propagation IPFS)
➡️ Vérifier que le fichier est "pinned"

### "Invalid JSON"
➡️ Valider votre JSON sur [jsonlint.com](https://jsonlint.com)
➡️ Vérifier les guillemets et virgules

### "Gas still too high"
➡️ Vérifier que vous utilisez bien `ipfs://` et pas `data:`
➡️ L'URI doit être courte (<200 caractères)

---

## 🎓 Pour Aller Plus Loin

### Documentation IPFS
- [docs.ipfs.tech](https://docs.ipfs.tech)
- [Guide NFT IPFS](https://docs.ipfs.tech/how-to/mint-nfts-with-ipfs/)

### Standards NFT
- [ERC-721 Metadata Standard](https://eips.ethereum.org/EIPS/eip-721)
- [OpenSea Metadata Standards](https://docs.opensea.io/docs/metadata-standards)

### Automatisation
- Scripts de batch upload
- API Pinata / NFT.Storage
- CI/CD pour déploiement automatique

---

## 📞 Support

Si vous avez des questions :
1. Vérifiez que le CID est correct
2. Testez l'accès via gateway : `https://ipfs.io/ipfs/VotreCID`
3. Validez le JSON
4. Consultez la console du navigateur pour les erreurs

**Temps estimé** : 2-5 minutes par NFT une fois le workflow maîtrisé ! 🚀
