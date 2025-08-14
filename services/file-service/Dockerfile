# syntax=docker/dockerfile:1

ARG NODE_VERSION=22.14.0

# --- Build stage: install deps (incl. dev) and compile TS ---
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /usr/src/app

# Install all deps (incl. dev) for building
# Use Docker cache with a mount if you like
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
# If your build script runs `tsc`, ensure "build": "tsc -p ."
RUN npm run build

# --- Runtime stage: smaller image with only production deps + dist ---
FROM node:${NODE_VERSION}-alpine AS runner
ENV NODE_ENV=production
ENV PORT=3002
WORKDIR /usr/src/app

# Install only production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled JS and any runtime assets
COPY --from=builder /usr/src/app/dist ./dist
# If you read Prisma/Sequelize models at runtime from src, copy them too. Here we only need dist.
# COPY --from=builder /usr/src/app/prisma ./prisma   # (only if used)
# COPY --from=builder /usr/src/app/src ./src         # (usually not needed once compiled)

# Run as a non-root user
USER node

# Expose the port that the application listens on.
EXPOSE 3002

# Healthcheck-friendly: server should expose GET /healthz
CMD ["node", "dist/server.js"]