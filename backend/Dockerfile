FROM node:20-alpine AS builder

WORKDIR /app

# Copia arquivos de dependência primeiro para aproveitar o cache do Docker
COPY package*.json ./
RUN npm ci

# Copia todo o conteúdo da pasta backend (incluindo tsconfig.json e src)
COPY . .

# Executa o build (gera a pasta dist)
RUN npm run build

# --- Estágio de Execução ---
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copia apenas o necessário para rodar em produção
COPY package*.json ./
RUN npm ci --omit=dev

# Copia o código compilado do estágio anterior
COPY --from=builder /app/dist ./dist

# Railway injeta a porta dinamicamente, mas expomos a 3333 por padrão
EXPOSE 3333

# Comando para iniciar
CMD ["node", "dist/server.js"]