# Utiliser Node.js 18 LTS
FROM node:18-alpine

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json
COPY package*.json ./
COPY indexer/package*.json ./indexer/

# Installer les dépendances à la racine (pour src/)
RUN npm install

# Installer les dépendances de l'indexer
WORKDIR /app/indexer
RUN npm ci

# Copier le code source
WORKDIR /app
COPY src/ ./src/
COPY indexer/tsconfig.json ./indexer/

# Compiler TypeScript
WORKDIR /app/indexer
RUN npm run build

# Supprimer les devDependencies après le build pour réduire la taille
WORKDIR /app
RUN npm prune --production
WORKDIR /app/indexer
RUN npm prune --production

# Exposer le port de l'API
EXPOSE 3001

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3001

# S'assurer que le répertoire de travail final est correct
WORKDIR /app/indexer

# Démarrer l'application
# Copier le script de démarrage résilient et l'utiliser
COPY indexer/start.sh /app/indexer/start.sh
RUN chmod +x /app/indexer/start.sh

CMD ["sh", "/app/indexer/start.sh"]
