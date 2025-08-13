FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies only
FROM base AS deps
COPY backend/package*.json ./
RUN npm ci

# Build the NestJS app and generate Prisma client
FROM deps AS build
COPY backend/ ./
RUN npx prisma generate \
  && npm run build \
  && npx tsc --module commonjs --target ES2023 --outDir dist prisma/seed.ts

# Production runner
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 3000

# Apply DB migrations at container start, then run the server
CMD sh -c "npx prisma migrate deploy && npx prisma generate && node dist/src/main"


