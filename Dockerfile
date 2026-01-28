# Stage 1: Builder
FROM node:22-bullseye AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# 🔑 DATABASE_URL fake só para gerar o Prisma Client
# ENV DATABASE_URL="postgresql://user:pass@localhost:5432/fake"

# ✅ Gera o Prisma Client (tipos, models, métodos)
# RUN npx prisma generate

# ✅ Agora o Nest consegue compilar
RUN npm run build

# Limpa devDependencies
RUN npm prune --production


# Stage 2: Runner
FROM node:22-bullseye-slim AS runner
ENV NODE_ENV=production
WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

RUN useradd --user-group --create-home --shell /bin/false appuser

COPY --from=builder /app/package*.json /app/
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app/dist

RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 3000
CMD ["node", "dist/main"]
