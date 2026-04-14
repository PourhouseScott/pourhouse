FROM node:20-bookworm-slim AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
# This generates the engine binaries
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-bookworm-slim AS runtime
WORKDIR /app
# Install OpenSSL (required for Prisma to run)
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=8080

COPY package*.json ./
# 1. Copy the production node_modules
COPY --from=builder /app/node_modules ./node_modules
# 2. IMPORTANT: Explicitly copy the generated prisma engine files
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY public ./public

EXPOSE 8080
CMD ["node", "dist/server.js"]
