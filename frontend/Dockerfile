FROM node:22-alpine AS base
WORKDIR /app

# Install only production deps initially to cache better
FROM base AS deps
COPY frontend/package*.json ./
RUN npm ci

FROM deps AS build
COPY frontend/ ./

ENV NITRO_PORT=3001
ENV NODE_ENV=production
ENV NITRO_PORT=3001
ENV NUXT_PUBLIC_EXTERNAL_API_BASE=http://backend:3000

RUN npm run build

FROM base AS runner
ENV NUXT_PUBLIC_EXTERNAL_API_BASE=http://backend:3000

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.output ./.output
EXPOSE 3001
CMD ["node", ".output/server/index.mjs"]


