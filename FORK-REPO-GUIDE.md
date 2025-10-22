# 🔀 Forker le Repo pour Railway

## Problème
Railway ne peut déployer que depuis des repos dont vous êtes propriétaire.

## Solution : Fork le Repo

### Étape 1 : Fork sur GitHub

1. Allez sur le repo original : https://github.com/Mickap1/G9---Blockchain
2. Cliquez sur le bouton **"Fork"** en haut à droite
3. Sélectionnez votre compte personnel
4. Attendez que le fork se crée (~10 secondes)
5. Vous aurez maintenant : `https://github.com/VOTRE-USERNAME/G9---Blockchain`

### Étape 2 : Cloner VOTRE Fork Localement

```powershell
# Aller dans un nouveau dossier
cd C:\Users\mrori\Bureau\Epitech\blockchain\Project

# Cloner VOTRE fork
git clone https://github.com/VOTRE-USERNAME/G9---Blockchain.git G9---Blockchain-Fork

# Entrer dans le dossier
cd G9---Blockchain-Fork
```

### Étape 3 : Ajouter le Repo Original comme Remote (Optionnel)

Pour pouvoir récupérer les mises à jour du repo original :

```powershell
git remote add upstream https://github.com/Mickap1/G9---Blockchain.git
```

Quand vous voulez récupérer les changements :
```powershell
git fetch upstream
git merge upstream/main
```

### Étape 4 : Déployer sur Railway

Maintenant sur Railway :
1. **"New Project"** > **"Deploy from GitHub repo"**
2. Vous verrez maintenant **`VOTRE-USERNAME/G9---Blockchain`**
3. Sélectionnez-le et continuez le déploiement

---

## 🔧 Solution 2 : Créer un Nouveau Repo

Si vous ne voulez pas forker, créez un nouveau repo :

### Étape 1 : Créer un Repo sur GitHub

1. Allez sur GitHub : https://github.com/new
2. Nom : `RWA-Blockchain-Project`
3. Visibilité : **Public** ou **Private**
4. **NE PAS** initialiser avec README
5. Cliquez sur **"Create repository"**

### Étape 2 : Changer l'Origin de Votre Repo Local

```powershell
cd C:\Users\mrori\Bureau\Epitech\blockchain\Project\G9---Blockchain

# Supprimer l'ancien remote
git remote remove origin

# Ajouter VOTRE repo
git remote add origin https://github.com/VOTRE-USERNAME/RWA-Blockchain-Project.git

# Push tout
git push -u origin main
```

### Étape 3 : Déployer sur Railway

Railway verra maintenant votre nouveau repo.

---

## 🔧 Solution 3 : Demander les Droits Admin

Si vous travaillez en équipe :

1. Demandez au propriétaire (Mickap1) de vous ajouter comme **Admin** du repo
2. Ou demandez-lui de déployer sur Railway et de vous inviter au projet

---

## 💡 Ma Recommandation

**Solution 1 (Fork)** est la plus simple et rapide :
- ✅ Vous gardez tout votre travail
- ✅ Vous pouvez toujours sync avec le repo original
- ✅ Vous avez le contrôle total
- ✅ Déploiement Railway possible immédiatement

---

## 🚀 Après le Fork

Une fois que vous avez forké, vous pourrez :
1. Déployer sur Railway depuis VOTRE fork
2. Continuer à travailler normalement
3. Faire des Pull Requests vers le repo original si besoin

---

Voulez-vous que je vous aide avec l'une de ces solutions ? 😊
