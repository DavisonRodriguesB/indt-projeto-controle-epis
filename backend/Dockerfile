# --- Estágio 1: Builder ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de configuração da pasta backend
COPY backend/package*.json ./
RUN npm ci

# Copia o restante dos arquivos do backend
COPY backend/tsconfig.json ./
COPY backend/src ./src

RUN npm run build

# --- Estágio 2: Runner ---
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copia os arquivos de dependência para instalação limpa de produção
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copia a pasta dist gerada no estágio builder
COPY --from=builder /app/dist ./dist

# Railway usa a variável de ambiente PORT automaticamente
EXPOSE 3333

CMD ["node", "dist/server.js"]