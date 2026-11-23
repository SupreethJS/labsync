# Multi-stage Dockerfile for LabLink (Single Container on Google Cloud Run)

# ==========================================
# Stage 1: Build Client & Server
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root and workspace package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install all dependencies (including build tools)
RUN npm ci

# Copy server configuration & source
COPY server/tsconfig.json ./server/
COPY server/src ./server/src

# Copy client configuration & source
COPY client/tsconfig*.json client/vite.config.ts client/tailwind.config.js client/postcss.config.js client/index.html ./client/
COPY client/src ./client/src

# Build React client and Express server
RUN npm run build

# ==========================================
# Stage 2: Lean Production Runtime
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy manifests
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install only production runtime dependencies
RUN npm ci --omit=dev

# Copy compiled outputs from builder stage
COPY --from=builder /app/server/dist ./server/dist
COPY --from=builder /app/client/dist ./client/dist

# Security hardening: use non-root node user
USER node

EXPOSE 8080

# Cloud Run invokes container listening on 0.0.0.0:8080
CMD ["node", "server/dist/index.js"]
