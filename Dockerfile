# # Stage 1: builder (compila TypeScript e instala todas as deps)
# FROM node:22-bullseye AS builder

# # Diretório de trabalho
# WORKDIR /app

# # Copia package.json e package-lock.json (se existir) para aproveitar cache de layer
# COPY package*.json ./

# # Instala todas as dependências (inclui devDependencies necessárias para build)
# RUN npm ci

# # Copia o restante do código
# COPY . .

# # Build do projeto (gerará ./dist)
# RUN npm run build

# # Remove devDependencies para reduzir espaço (node_modules passará apenas com deps de produção)
# RUN npm prune --production

# # Stage 2: imagem de runtime mais leve
# FROM node:22-bullseye-slim AS runner

# ENV NODE_ENV=production
# WORKDIR /app

# # Cria usuário não-root para rodar a app
# RUN useradd --user-group --create-home --shell /bin/false appuser

# # Copia arquivos necessários do builder
# COPY --from=builder /app/package*.json /app/
# COPY --from=builder /app/node_modules /app/node_modules
# COPY --from=builder /app/dist /app/dist

# # (Opcional) copie outros arquivos estáticos necessários, ex.: public, prisma, migrations etc.
# # COPY --from=builder /app/public /app/public

# # Ajusta permissões
# RUN chown -R appuser:appuser /app

# USER appuser

# # Porta padrão usada por Nest; ajuste se necessário (ex.: 3000)
# EXPOSE 3000

# # Healthcheck simples — usando a raiz da aplicação
# HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
#   CMD wget -q -O- http://localhost:3000/ || exit 1

# # Comando para iniciar a aplicação em produção
# CMD ["node", "dist/main"]

# Imagem base com Node
FROM node:22-bullseye

# Diretório de trabalho
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala todas as dependências (inclui devDependencies para poder rodar npm run start)
RUN npm ci

# Copia o restante do código
COPY . .

# Cria usuário não-root (opcional)
RUN useradd --user-group --create-home --shell /bin/false appuser \
    && chown -R appuser:appuser /app

USER appuser

# Porta usada pelo Nest
EXPOSE 3000

# Healthcheck simples
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -q -O- http://localhost:3000/ || exit 1

# Comando para rodar a aplicação
CMD ["npm", "run", "start"]
