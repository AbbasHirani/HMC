# Hirani Marketing Combines

Catalogue, enquiry and admin site for Hirani Marketing Combines — a pump and
water-systems dealer and repair workshop in Parrys, George Town, Chennai.

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Neon Postgres ·
Cloudinary · Gemini · deployed on Vercel.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

You need a `.env.local` before the app will do anything useful — see
[Environment](#environment).

```bash
npm run build        # production build
npm start            # serve the production build
npm run lint         # eslint
npm test             # vitest, single run
npm run test:watch   # vitest, watch mode
```

## What is where

```
src/
  app/
    (public pages)   /  /catalogue/[category]/[subcategory]  /product/[slug]
                     /brand/[slug]  /brands  /services  /ta  /ta/services
    admin/           password-gated CMS: products, categories, brands,
                     repair jobs, use cases, enquiry inbox
    api/             REST handlers + /api/chat (streaming assistant)
  components/        shared UI
  lib/
    db.ts            Neon client (lazy proxy)
    queries.ts       server-only cached reads — never import from a client component
    data.ts          constants + shared types — safe on the client
    chatContext.ts   builds the catalogue context that grounds the assistant
  proxy.ts           auth boundary (Next 16's renamed middleware)
sql/                 database schema — see sql/README.md
```

Two conventions worth knowing before you edit:

- **`lib/queries.ts` is server-only** and `lib/data.ts` is the client-safe half.
  Importing the former into a `'use client'` component will pull the database
  driver into the browser bundle.
- **Mutating API routes must revalidate.** Reads are cached with
  `unstable_cache` under the `products` / `categories` / `brands` / `use-cases`
  tags, so a write that does not call `revalidateTag(tag, 'max')` will not show
  up until the 60s window lapses.

## Auth

A single shared admin password, exchanged for an HS256 JWT in an httpOnly
`hmc_admin` cookie (7 days). Enforced in `src/proxy.ts`:

- `/admin/*` — requires a valid session, redirects to `/admin/login` otherwise.
- `/api/*` — reads are public; POST/PUT/PATCH/DELETE require a session, except
  `/api/admin/auth`, `/api/admin/migrate`, `/api/chat` and `/api/enquiries`,
  which are public or authenticate themselves.

## Database

Neon Postgres. The schema lives in `sql/neon_schema.sql` and can also be applied
at runtime from the admin dashboard. See [sql/README.md](sql/README.md) — in
particular the note on why new columns must be `ALTER`s.

## Environment

`.env.local`, none of which are committed:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon connection string |
| `ADMIN_PASSWORD` | the admin login password |
| `ADMIN_SECRET` | JWT signing key; **must be ≥16 characters** or auth fails closed |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | media uploads |
| `NEXT_PUBLIC_SITE_URL` | canonical origin used by metadata, sitemap and JSON-LD |
| `GEMINI_API_KEY` | AI assistant and the admin SEO/description helpers |
| `GEMINI_MODEL` | optional model override |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` / `_HOST` | optional; analytics is skipped entirely when unset |

## Tests

Vitest, covering the pure logic in `src/lib` — SEO copy generation, API input
validation, and Cloudinary URL rewriting. UI components and route handlers are
not currently covered.

```bash
npm test
```
