# Multi-stage build for Nuxt3 URL-Shortener
FROM node:22-alpine AS base

# Build the application
FROM base AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxt

# Copy built application
COPY --from=builder --chown=nuxt:nodejs /app/.output /app

# Set environment variables
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nuxt

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --eval "fetch('http://localhost:3000/api/health').then(() => process.exit(0)).catch(() => process.exit(1))"

# Start the application from the correct directory
CMD ["node", "server/index.mjs"]
