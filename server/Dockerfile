# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests and install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source code and build TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npx prisma generate
RUN npm run build

# Stage 2: Runtime Production Container
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy manifests & production node_modules
COPY package*.json ./
COPY prisma ./prisma/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Non-root security user
USER node

EXPOSE 5000

CMD ["node", "dist/server.js"]
