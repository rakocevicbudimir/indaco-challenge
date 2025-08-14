## Legal Document Prototype

A full‑stack prototype for managing legal documents, sections, references, notes, and blog articles. Backend is NestJS + Prisma + PostgreSQL; frontend is Nuxt 4 + Pinia; Docker is used for the database.

### Run full docker environment
```bash
cp .env.example .env
docker compose up -d # you can add the `--build` flag to build newly if already built

# run seed
docker exec legal_backend node dist/prisma/seed
```

> The seeded users are
```bash
admin@example.com
alice@example.com
bob@example.com
charlie@example.com
diana@example.com
```
The password for all the users is: `password123`

### Quick start

1) Start PostgreSQL via Docker (from the repo root):

```bash
cp .env.example .env  # if you keep one; otherwise create .env as below
docker compose up -d db
```

Example `.env` at repo root for Docker Compose:

```dotenv
POSTGRES_DB_PORT=5432
POSTGRES_DB_DATABASE=legal
POSTGRES_DB_USER=postgres
POSTGRES_DB_PASS=postgres
```

2) Backend (NestJS):

```bash
cd backend
npm install

# backend/.env
# DATABASE_URL must point to the Docker DB above
cat > .env << 'EOF'
PORT=3000
JWT_SECRET=dev_secret_change_me
JWT_EXPIRATION=1d
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/legal?schema=public
EOF

npm run prisma:migrate
npm run prisma:generate
npm run prisma:seed   # optional

npm run start:dev     # http://localhost:3000 , Swagger: /docs
```

3) Frontend (Nuxt 4):

```bash
cd frontend
npm install

# frontend/.env  (Nuxt proxy target for the backend API)
cat > .env << 'EOF'
NUXT_PUBLIC_EXTERNAL_API_BASE=http://localhost:3000
EOF

# Run Nuxt on 3001 to avoid clashing with the backend on 3000
npm run dev -- -p 3001   # http://localhost:3001
```

Frontend calls the backend through the Nuxt proxy at `/api1/**`, which forwards to `NUXT_PUBLIC_EXTERNAL_API_BASE`.

### Key design and architecture

- **Backend (NestJS 11)**: Modular structure with `auth`, `document`, `section`, `note`, `meta`, `reference`, `blog`. Uses DTO validation, global exception filter, response transform, timeout interceptor, and Swagger (`/docs`).
- **Data layer (Prisma + PostgreSQL)**: Schema models for `User`, `Document`, `Section` (hierarchical), `Reference` (typed cross‑entity links), `Meta`/`EntityMeta` for tags/categories, `Blog`, and `Note`.
- **Frontend (Nuxt 4 + Pinia)**: Pages and admin tooling for blogs and documents; rich‑text editing via Tiptap components; state in `app/stores/*`.
- **API access**: Browser requests hit Nuxt at `/api1`, which proxy to the backend. This avoids CORS in development and keeps a single origin for the app.

### Authentication

- **Method**: JWT Bearer. Endpoints: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.
- **Server**: `JWT_SECRET` and `JWT_EXPIRATION` required. Guards protect routes; roles via `Role` enum.
- **Client**: Token stored in `localStorage` by `app/stores/auth.ts`. Requests include `Authorization: Bearer <token>`.

### Server/client split

- **Backend**: `http://localhost:3000` by default (configurable with `PORT`).
- **Frontend**: `http://localhost:3001` recommended in dev (`npm run dev -- -p 3001`).
- **Proxy**: Nuxt route rule proxies `/api1/**` to `NUXT_PUBLIC_EXTERNAL_API_BASE` (default fallback is `http://localhost:3001`, set it to backend URL).

### Docker usage

- Docker is used for Postgres only via `docker-compose.yaml`. Configure with root `.env` variables: `POSTGRES_DB_PORT`, `POSTGRES_DB_DATABASE`, `POSTGRES_DB_USER`, `POSTGRES_DB_PASS`.
- Prisma reads `DATABASE_URL` from `backend/.env` and must match the Docker DB settings.

### Extra features and notes

- **Swagger docs**: `http://localhost:3000/docs` for live API exploration.
- **Seeding**: `npm run prisma:seed` populates initial data from `backend/prisma/seed.ts`.
- **Rich text**: Tiptap editors in `frontend/app/components/TiptapEditor.vue` and `TiptapNovelEditor.vue`.
- **Roles**: Basic role handling exists; enhance as needed for admin flows.

### Rendering modes & SEO (Nuxt 4)

This app uses Nuxt 4’s universal rendering by default with selective hybrid rendering to balance SEO and performance. See Nuxt’s official guide on rendering for deeper context: [Nuxt 4 Rendering Modes](https://nuxt.com/docs/4.x/guide/concepts/rendering).

- **Universal (SSR)**: Initial HTML is rendered on the server, then hydrated on the client. This provides fast first contentful paint and excellent SEO because crawlers can index full HTML.
- **Client‑Side Rendering (CSR)**: The browser renders everything. Faster to build and cheaper to host, but initial content is not in HTML, which is slower and less SEO‑friendly.
- **Hybrid Rendering**: Mix strategies per route using `routeRules` for the best of both worlds.

Current configuration (in `frontend/nuxt.config.ts`):

```ts
export default defineNuxtConfig({
  app: { head: { titleTemplate: '%s - Legal Intelligence', /* meta defaults */ } },
  nitro: {
    routeRules: {
      '/': { prerender: true },
      '/blog': { isr: 3600 },
      '/blog/**': { isr: true },
      '/documents': { swr: 3600 },
      '/documents/**': { swr: 3600 },
      '/admin/**': { ssr: false, headers: { 'x-robots-tag': 'noindex, nofollow' } },
      '/api1/**': { proxy: `${process.env.NUXT_PUBLIC_EXTERNAL_API_BASE || 'http://localhost:3001'}/**` },
    }
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3001'
    }
  }
})
```

- **Home `/`**: prerendered at build time for instant load and SEO.
- **Blog**: ISR caches HTML at the edge; updates revalidate without full redeploy.
- **Documents**: SWR caches on the server and revalidates in the background.
- **Admin**: client‑only and marked `noindex, nofollow` for search engines.

Per‑page SEO enhancements use `useHead` to set titles, descriptions, and canonical URLs built from `NUXT_PUBLIC_SITE_URL`.

If you prefer a pure SPA (CSR‑only) for certain deployments, you can set `ssr: false` globally in `nuxt.config.ts` as per Nuxt docs, but SEO will be reduced. Hybrid rendering is generally recommended for content pages. Reference: [Nuxt 4 Rendering Modes](https://nuxt.com/docs/4.x/guide/concepts/rendering).

### Known trade‑offs / implementation notes

- **Token storage**: Uses `localStorage`; simple but susceptible to XSS. Consider HTTP‑only cookies for production.
- **CORS vs proxy**: Dev relies on Nuxt proxying `/api1`. If you bypass the proxy, enable and configure CORS carefully.
- **Port collisions**: Backend and Nuxt both default to 3000. Run Nuxt on 3001 (or change backend `PORT`).
- **User management**: Frontend store contains admin user operations under `/users/*`. The backend currently exposes `auth` endpoints; additional user CRUD endpoints may be required to fully enable those flows.

### Scripts reference

- **Backend**: `start`, `start:dev`, `prisma:migrate`, `prisma:generate`, `prisma:seed`, `prisma:studio`.
- **Frontend**: `dev`, `build`, `generate`, `preview`.

