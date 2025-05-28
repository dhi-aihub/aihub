# 1. Use official Node.js image as base
FROM node:18-alpine AS base

# 2. Set working directory
WORKDIR /app

# 3. Install dependencies
COPY package*.json ./
RUN npm install --production=false

# 4. Copy source code
COPY . .

# 5. Build the NestJS application
RUN npm run start