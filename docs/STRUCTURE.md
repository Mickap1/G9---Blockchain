# 📚 Structure de la Documentation

## 📁 Organisation des Fichiers

```
docs/
├── README.md                    # Page d'accueil de la documentation
├── KYCRegistry.md              # Documentation complète du contrat KYCRegistry
├── FungibleAssetToken.md       # Documentation complète du contrat FungibleAssetToken
├── deployment-guide.md         # Guide de déploiement pas à pas
├── usage-guide.md              # Guide d'utilisation pour tous les rôles
├── faq.md                      # Questions fréquemment posées
└── STRUCTURE.md               # Ce fichier
```

---

## 📖 Contenu des Documents

### 1. README.md (Page d'accueil)
**Description**: Vue d'ensemble de la plateforme et point d'entrée de la documentation

**Contenu:**
- Introduction au projet
- Architecture des contrats
- Technologies utilisées
- Liens vers les autres documents

**Public cible**: Tous les utilisateurs

---

### 2. KYCRegistry.md
**Description**: Documentation technique complète du contrat de vérification KYC

**Contenu:**
- 📊 Statuts KYC et transitions
- 🎭 Rôles et permissions
- 📝 Structure de données
- 🔧 Toutes les fonctions (utilisateurs + admins)
- 👁️ Fonctions de vue
- 📡 Événements émis
- 💡 Cas d'usage pratiques
- 🔐 Considérations de sécurité
- 📊 Monitoring et métriques
- 🧪 Informations sur les tests

**Taille**: ~15 pages
**Public cible**: Développeurs, administrateurs KYC

---

### 3. FungibleAssetToken.md
**Description**: Documentation technique complète du token ERC-20 d'actif

**Contenu:**
- 🏗️ Héritages et architecture
- 🎭 Rôles et permissions
- 📊 Structures de données
- 🔧 Fonctions de minting (simple + batch)
- 🔥 Fonctions de burning
- 🛡️ Contrôles (pause/unpause)
- 📝 Administration (mise à jour métadonnées)
- 👁️ Fonctions de vue avancées
- 🚨 Erreurs personnalisées
- 📡 Événements
- 🔐 Mécanisme de vérification KYC
- 💡 Cas d'usage détaillés
- 📊 Calculs financiers
- 🧪 Informations sur les tests

**Taille**: ~18 pages
**Public cible**: Développeurs, gestionnaires de tokens

---

### 4. deployment-guide.md
**Description**: Guide pas à pas pour déployer la plateforme

**Contenu:**
- 📋 Prérequis techniques
- 🏗️ Installation de l'environnement
- ✅ Vérifications (compilation, tests)
- 🌐 Déploiement (local, testnet, mainnet)
- 🔧 Configuration post-déploiement
- 🎛️ Monitoring et maintenance
- 🆘 Dépannage commun
- 📊 Estimation des coûts en gas
- 🔐 Bonnes pratiques de sécurité

**Taille**: ~12 pages
**Public cible**: DevOps, administrateurs système

---

### 5. usage-guide.md
**Description**: Guide d'utilisation pour tous les types d'utilisateurs

**Contenu:**

#### Pour les Investisseurs
- Soumettre son KYC
- Vérifier son statut
- Acheter des tokens
- Consulter son portfolio
- Transférer des tokens
- Vendre/brûler des tokens

#### Pour les Administrateurs KYC
- Approuver/rejeter des KYC
- Blacklister des adresses
- Approbation en batch
- Révoquer des KYC

#### Pour les Gestionnaires de Tokens
- Minter des tokens (simple + batch)
- Mettre à jour les documents
- Suspendre/reprendre les transferts

#### Scripts Utiles
- Script de monitoring en temps réel
- Script de statistiques
- Script d'export des holders

**Taille**: ~15 pages
**Public cible**: Tous les utilisateurs de la plateforme

---

### 6. faq.md
**Description**: Réponses aux questions les plus fréquentes

**Contenu:**
- 🎯 Questions générales (tokenisation, blockchain)
- 🔐 KYC & Conformité
- 🪙 Tokens (fonctionnement, transferts)
- 👥 Rôles & Permissions
- 🚨 Situations d'urgence
- 💻 Questions techniques (IPFS, gas, upgrades)
- 💰 Questions économiques (dividendes, valorisation)
- 🔍 Audit & Sécurité
- 📞 Support et ressources d'apprentissage

**Taille**: ~10 pages
**Public cible**: Tous les utilisateurs, débutants

---

## 🎯 Comment Utiliser Cette Documentation

### Si vous êtes...

#### 👨‍💻 **Développeur**
1. Commencez par [README.md](./README.md) pour comprendre l'architecture
2. Lisez [KYCRegistry.md](./KYCRegistry.md) et [FungibleAssetToken.md](./FungibleAssetToken.md) en détail
3. Suivez le [deployment-guide.md](./deployment-guide.md) pour déployer
4. Consultez la [FAQ](./faq.md) pour les questions techniques

#### 🏢 **Administrateur KYC**
1. Lisez la section "Pour les Administrateurs KYC" dans [usage-guide.md](./usage-guide.md)
2. Consultez [KYCRegistry.md](./KYCRegistry.md) pour les détails des fonctions
3. Référez-vous à la [FAQ](./faq.md) section "KYC & Conformité"

#### 💼 **Gestionnaire de Tokens**
1. Lisez la section "Pour les Gestionnaires de Tokens" dans [usage-guide.md](./usage-guide.md)
2. Consultez [FungibleAssetToken.md](./FungibleAssetToken.md) pour les détails
3. Utilisez les scripts de monitoring

#### 👤 **Investisseur**
1. Commencez par la [FAQ](./faq.md) pour comprendre les bases
2. Suivez la section "Pour les Investisseurs" dans [usage-guide.md](./usage-guide.md)
3. Consultez [FungibleAssetToken.md](./FungibleAssetToken.md) section "Cas d'Usage"

#### 🔧 **DevOps / Admin Système**
1. Suivez le [deployment-guide.md](./deployment-guide.md) intégralement
2. Mettez en place le monitoring (voir [usage-guide.md](./usage-guide.md))
3. Consultez la section "Dépannage" du guide de déploiement

---

## 📊 Statistiques de la Documentation

| Document | Pages estimées | Sections | Exemples de code | Public cible |
|----------|---------------|----------|------------------|--------------|
| README.md | 2 | 4 | 1 | Tous |
| KYCRegistry.md | 15 | 12 | 30+ | Dev, Admin KYC |
| FungibleAssetToken.md | 18 | 14 | 35+ | Dev, Gestionnaires |
| deployment-guide.md | 12 | 8 | 25+ | DevOps |
| usage-guide.md | 15 | 10 | 40+ | Tous |
| faq.md | 10 | 9 | 15+ | Tous |
| **TOTAL** | **~72** | **57** | **146+** | - |

---

## 🔍 Index des Fonctions

### KYCRegistry

**Utilisateur:**
- `submitKYC()`

**Admin:**
- `approveKYC()`
- `rejectKYC()`
- `blacklistAddress()`
- `removeFromBlacklist()`
- `revokeKYC()`
- `batchApproveKYC()`

**Vue:**
- `isWhitelisted()`
- `isBlacklisted()`
- `getKYCStatus()`
- `getKYCData()`
- `canTransfer()`

### FungibleAssetToken

**Minting:**
- `mint()`
- `batchMint()`

**Burning:**
- `burn()`
- `burnFrom()`

**Contrôle:**
- `pause()`
- `unpause()`

**Admin:**
- `updateDocumentURI()`

**Vue:**
- `canReceiveTokens()`
- `pricePerToken()`
- `remainingSupply()`
- `canMint()`
- `ownershipPercentage()`
- `getAssetMetadata()`

**Standard ERC-20:**
- `transfer()`
- `transferFrom()`
- `approve()`
- `balanceOf()`
- `totalSupply()`
- `allowance()`

---

## 🔄 Mises à Jour

Cette documentation est maintenue activement. Pour signaler des erreurs ou suggérer des améliorations:

1. Ouvrir une issue sur GitHub
2. Proposer une Pull Request
3. Contacter l'équipe de documentation

**Dernière mise à jour:** 16 Octobre 2025

---

## 📚 Ressources Externes

- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethereum.org - Tokenization](https://ethereum.org/en/developers/docs/standards/tokens/)

---

## 💡 Contribution

Pour contribuer à cette documentation:

1. Les fichiers sont en format Markdown
2. Utiliser des emojis pour rendre la lecture plus agréable
3. Fournir des exemples de code testés
4. Maintenir une structure cohérente
5. Inclure des liens entre les documents

**Style Guide:**
- Titres: `# 🔥 Titre Principal`
- Sous-titres: `## 📊 Sous-titre`
- Code inline: \`variable\`
- Blocs de code: \`\`\`javascript ou \`\`\`solidity
- Alertes: ✅ (succès), ❌ (erreur), ⚠️ (attention)

---

**Cette documentation a été créée avec ❤️ pour faciliter l'utilisation de la plateforme de tokenisation d'actifs.**
