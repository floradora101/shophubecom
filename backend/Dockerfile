# ShopHub Backend - NestJS API
# Build context: repository root (parent of backend/)
#
# Required env vars at runtime:
#   DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET,
#   JWT_ACCESS_EXPIRY, JWT_REFRESH_EXPIRY, FRONTEND_URL
# Optional: SMTP_* for email, PORT (default 3001)

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat

FROM base AS builder
WORKDIR /app

# Copy package files and prisma (includes backend's own mock-data for seed)
COPY backend/package*.json ./
COPY backend/prisma ./prisma/
RUN npm ci

# Copy backend source
COPY backend/src ./src
COPY backend/tsconfig*.json ./
COPY backend/nest-cli.json ./
COPY backend/eslint.config.mjs ./

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
