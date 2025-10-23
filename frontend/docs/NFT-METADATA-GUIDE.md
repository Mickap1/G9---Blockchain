# Guide de Création de Métadonnées NFT

## 🎯 Deux Modes Disponibles

La page `/create/nft` offre maintenant **deux façons** de créer les métadonnées de vos NFTs :

---

## 📝 Mode 1 : Saisie Manuelle (Recommandé pour débuter)

### Avantages
- ✅ Pas besoin d'uploader sur IPFS au préalable
- ✅ Interface intuitive avec formulaire
- ✅ Métadonnées créées automatiquement
- ✅ Parfait pour les tests rapides

### Champs à Remplir

| Champ | Description | Exemple |
|-------|-------------|---------|
| **Adresse** | Destinataire avec KYC approuvé | `0x41B6b59a9365a58B00a68c597c49dB5Fa8C72116` |
| **Nom** | Nom de l'actif | `Diamond 2.5ct D IF` |
| **Valorisation** | Valeur en EUR | `50000` |
| **Description** | Description détaillée | `Certified natural diamond, 2.5 carat, color D, clarity IF` |
| **Image URI** | URL de l'image | `ipfs://QmXXXXX.../diamond.jpg` |
| **Attributs** | Caractéristiques (optionnel) | Carat: 2.5, Color: D, Clarity: IF |

### Exemple Complet

```
Adresse: 0x41B6b59a9365a58B00a68c597c49dB5Fa8C72116
Nom: Diamond 2.5ct D IF
Valorisation: 50000
Description: Certified natural diamond, 2.5 carat, color D, clarity IF, GIA certified
Image URI: ipfs://QmTest123/diamond.jpg

Attributs:
- Carat: 2.5
- Color: D
- Clarity: IF
- Cut: Excellent
- Certification: GIA

Certificat: ipfs://QmCert456/gia-report.pdf
```

### Ce qui se passe automatiquement

Le système génère automatiquement un fichier JSON :

```json
{
  "name": "Diamond 2.5ct D IF",
  "description": "Certified natural diamond, 2.5 carat, color D, clarity IF, GIA certified",
  "image": "ipfs://QmTest123/diamond.jpg",
  "attributes": [
    {"trait_type": "Carat", "value": "2.5"},
    {"trait_type": "Color", "value": "D"},
    {"trait_type": "Clarity", "value": "IF"},
    {"trait_type": "Cut", "value": "Excellent"},
    {"trait_type": "Certification", "value": "GIA"}
  ]
}
```

Ce JSON est converti en **Data URI** (base64) et stocké directement dans le NFT.

---

## 🔗 Mode 2 : URI Existante (Pour utilisateurs avancés)

### Avantages
- ✅ Contrôle total sur les métadonnées
- ✅ Métadonnées déjà hébergées sur IPFS
- ✅ Peut inclure des champs personnalisés

### Quand l'utiliser ?

- Vous avez déjà uploadé vos métadonnées sur IPFS
- Vous voulez des métadonnées complexes avec des champs personnalisés
- Vous utilisez un outil externe pour générer les métadonnées

### Champs à Remplir

| Champ | Description | Exemple |
|-------|-------------|---------|
| **Adresse** | Destinataire avec KYC approuvé | `0x41B6b59a9365a58B00a68c597c49dB5Fa8C72116` |
| **Nom** | Nom de l'actif | `Diamond 2.5ct D IF` |
| **Valorisation** | Valeur en EUR | `50000` |
| **URI Métadonnées** | Lien vers le JSON | `ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG` |
| **Certificat** | Lien vers certificat (optionnel) | `ipfs://QmCert.../report.pdf` |

### Exemple Complet

```
Adresse: 0x41B6b59a9365a58B00a68c597c49dB5Fa8C72116
Nom: Diamond 2.5ct D IF
Valorisation: 50000
URI Métadonnées: ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG
Certificat: ipfs://QmZfCertificate.../gia-report.pdf
```

---

## 📦 Format Standard des Métadonnées NFT

### Structure JSON Minimale

```json
{
  "name": "Nom de l'actif",
  "description": "Description détaillée",
  "image": "ipfs://QmXXXXX.../image.jpg"
}
```

### Structure Complète (Recommandée)

```json
{
  "name": "Nom de l'actif",
  "description": "Description détaillée de l'actif",
  "image": "ipfs://QmXXXXX.../image.jpg",
  "external_url": "https://votresite.com/asset/1",
  "attributes": [
    {
      "trait_type": "Caractéristique 1",
      "value": "Valeur 1"
    },
    {
      "trait_type": "Caractéristique 2",
      "value": "Valeur 2"
    }
  ],
  "properties": {
    "creator": "Nom du créateur",
    "creation_date": "2025-10-23",
    "certification": "Organisme de certification"
  }
}
```

---

## 🖼️ Exemples par Type d'Actif

### 💎 Diamant

**Mode Manuel:**
```
Nom: Diamond 2.5ct D IF
Description: Natural diamond certified by GIA, exceptional quality
Valorisation: 50000
Image: ipfs://QmDiamond.../photo.jpg

Attributs:
- Carat: 2.5
- Color: D
- Clarity: IF
- Cut: Excellent
- Polish: Excellent
- Symmetry: Excellent
- Fluorescence: None
- Certificate: GIA #12345678
```

### 🎨 Œuvre d'Art

**Mode Manuel:**
```
Nom: La Nuit Étoilée - Reproduction Certifiée
Description: Reproduction haute qualité sur toile, édition limitée 1/100
Valorisation: 5000
Image: ipfs://QmArt.../painting.jpg

Attributs:
- Artist: Vincent van Gogh (Original)
- Year: 1889 (Original)
- Medium: Oil on Canvas Reproduction
- Dimensions: 73cm x 92cm
- Edition: 1/100
- Certificate: Authentication House Paris
```

### 🏠 Bien Immobilier

**Mode Manuel:**
```
Nom: Appartement Paris 16ème - 75m²
Description: Appartement 3 pièces, 2ème étage, vue Tour Eiffel
Valorisation: 650000
Image: ipfs://QmProperty.../apartment.jpg

Attributs:
- Type: Apartment
- Rooms: 3
- Surface: 75 m²
- Floor: 2
- City: Paris
- District: 16ème
- View: Eiffel Tower
- Year Built: 1920
- Renovation: 2020
```

### ⌚ Objet de Collection

**Mode Manuel:**
```
Nom: Rolex Daytona 1963 Ref. 6239
Description: Vintage Rolex Daytona in exceptional condition, original parts
Valorisation: 150000
Image: ipfs://QmWatch.../rolex.jpg

Attributs:
- Brand: Rolex
- Model: Daytona
- Reference: 6239
- Year: 1963
- Condition: Excellent
- Box: Original
- Papers: Original
- Service: Recent (2024)
```

---

## 🚀 Upload sur IPFS (Pour Mode URI)

### Option 1 : Pinata (Recommandé)

1. Créer un compte sur [pinata.cloud](https://pinata.cloud)
2. Créer votre fichier `metadata.json`
3. Upload via l'interface web
4. Copier le CID : `QmXXXXXXXXXXXXXXXX`
5. Utiliser : `ipfs://QmXXXXXXXXXXXXXXXX`

### Option 2 : IPFS Desktop

1. Installer [IPFS Desktop](https://docs.ipfs.tech/install/ipfs-desktop/)
2. Ajouter votre fichier JSON
3. Copier le CID généré
4. Utiliser : `ipfs://CID`

### Option 3 : NFT.Storage (Gratuit)

1. Compte sur [nft.storage](https://nft.storage)
2. Upload via API ou interface
3. Stockage permanent gratuit
4. Récupérer le CID

---

## 🎯 Recommandations

### Pour les Tests
- ✅ Utilisez le **Mode Manuel**
- ✅ Images temporaires OK (`ipfs://test123`)
- ✅ Attributs minimum (2-3)

### Pour la Production
- ✅ **Mode Manuel** : Pour simplifier le processus
- ✅ **Mode URI** : Si métadonnées complexes ou déjà sur IPFS
- ✅ Images sur IPFS (Pinata recommandé)
- ✅ Certificats sur IPFS
- ✅ Métadonnées complètes avec tous les attributs

### Bonnes Pratiques
- 📸 Image haute qualité (recommandé: 1000x1000px minimum)
- 📄 Format image: JPG, PNG, ou WEBP
- 📝 Description claire et détaillée
- 🏷️ Attributs pertinents (minimum 3-5)
- 🔒 Certificat d'authenticité si disponible
- 🌐 Utiliser IPFS pour la pérennité

---

## ✅ Checklist de Validation

Avant de minter votre NFT, vérifiez :

- [ ] Le destinataire a un **KYC approuvé**
- [ ] Le nom de l'actif est **descriptif et unique**
- [ ] La valorisation est en **EUR** (nombre entier)
- [ ] L'image est **accessible** (IPFS recommandé)
- [ ] La description est **complète et précise**
- [ ] Les attributs sont **pertinents** (si applicable)
- [ ] Le certificat est fourni (si disponible)
- [ ] Vous avez le **rôle MINTER**

---

## 🆘 Dépannage

### "Recipient not whitelisted"
➡️ Le destinataire doit avoir un KYC approuvé dans le système

### "Sender does not have MINTER_ROLE"
➡️ Votre adresse doit avoir le rôle MINTER sur le contrat NFT

### "Invalid metadata URI"
➡️ Vérifiez le format de l'URI (doit commencer par `ipfs://` ou `https://`)

### Métadonnées ne s'affichent pas
➡️ En mode manuel, vérifiez que description ET image sont remplis
➡️ En mode URI, vérifiez que l'URI pointe vers un JSON valide

---

## 📞 Support

Pour toute question ou problème :
1. Vérifiez que vous êtes connecté avec la bonne adresse
2. Vérifiez que votre KYC est approuvé
3. Consultez la console du navigateur pour les erreurs
4. Vérifiez la transaction sur [Sepolia Etherscan](https://sepolia.etherscan.io)
