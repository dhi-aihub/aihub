# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.14.0

FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:${NODE_VERSION}-alpine AS runner
ENV NODE_ENV=production
ENV PORT=3003
WORKDIR /usr/src/app

# Copy package files and install production dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /usr/src/app/dist ./dist

USER node
EXPOSE 3003
CMD ["node", "dist/server.js"]