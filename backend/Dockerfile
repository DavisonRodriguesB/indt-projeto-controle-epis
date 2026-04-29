# --- Estágio 1: Builder (Compilação) ---
FROM node:20-alpine AS builder

WORKDIR /app

# O Root Directory no Render deve ser 'backend', então os arquivos já estão aqui
COPY package*.json ./
RUN npm ci

# Copia as configurações e o código fonte
COPY tsconfig.json ./
COPY src ./src

# Gera a pasta /dist
RUN npm run build

# --- Estágio 2: Runner (Execução) ---
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Instala apenas dependências de produção para economizar espaço
COPY package*.json ./
RUN npm ci --omit=dev

# Copia o código compilado do estágio anterior
COPY --from=builder /app/dist ./dist

# Expõe a porta padrão do seu app
EXPOSE 3333

# COMANDO DE INICIALIZAÇÃO:
# 1. Tenta rodar migrations (se existirem)
# 2. Inicia o servidor
# O operador '|| true' garante que, se não houver migrations, o servidor tente subir assim mesmo
CMD npx typeorm migration:run -d dist/database/data-source.js || true && node dist/server.js