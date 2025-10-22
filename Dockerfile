# Utiliser Node.js 18 LTS
FROM node:18-alpine

# Créer le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json
COPY indexer/package*.json ./indexer/
COPY package*.json ./

# Installer les dépendances
WORKDIR /app/indexer
RUN npm ci --only=production

# Copier le code source
WORKDIR /app
COPY src/ ./src/
COPY indexer/tsconfig.json ./indexer/

# Compiler TypeScript
WORKDIR /app/indexer
RUN npm install -D typescript @types/node
RUN npm run build

# Exposer le port de l'API
EXPOSE 3001

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3001

# Démarrer l'application
CMD ["node", "dist/index.js"]
