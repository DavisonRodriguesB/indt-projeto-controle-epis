# --- Estágio 1: Builder ---
FROM node:20-alpine AS builder

WORKDIR /app

# Como o Root Directory é 'backend', os arquivos já estão aqui
COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

# --- Estágio 2: Runner ---
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# Render espera que seu app use a porta da variável de ambiente PORT
EXPOSE 3333

CMD ["node", "dist/server.js"]