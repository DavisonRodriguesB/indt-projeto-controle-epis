# --- Estágio 1: Builder ---
FROM node:20-alpine AS builder

WORKDIR /app

# O Root Directory no Render está como 'backend', então os arquivos já estão aqui
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

# Copia a pasta dist gerada no builder
COPY --from=builder /app/dist ./dist

# Expõe a porta (Render usa a variável PORT internamente)
EXPOSE 3333

# O segredo está aqui: Rodar as migrations ANTES de iniciar o servidor
CMD npx typeorm migration:run -d dist/database/data-source.js && node dist/server.js