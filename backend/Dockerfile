FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files from backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy package files and install deps in backend
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci

# Copy backend source
COPY backend/src ./src
COPY backend/tsconfig*.json ./
COPY backend/nest-cli.json ./
COPY backend/eslint.config.mjs ./

# Copy frontend mock data for seed script (copy to a location seed can import from)
COPY frontend/lib/mock-data/mock-data.ts ./prisma/mock-data.ts

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run the app
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy necessary files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main"]
