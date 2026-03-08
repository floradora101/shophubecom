# ShopHub Frontend - Next.js
# Build context: frontend/
# Requires output: "standalone" in next.config.ts
#
# Required env at build: NEXT_PUBLIC_API_URL (or BACKEND_API_URL)
# Required env at runtime: PORT (default 3000), HOSTNAME (default 0.0.0.0)

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat

FROM base AS builder
WORKDIR /app

ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
