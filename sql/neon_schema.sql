-- Neon (Postgres) schema for the HMC site.
--
-- This file is the authoritative description of the database. It is fully
-- idempotent — every statement is IF NOT EXISTS — so it is safe to re-run
-- against an existing database to pick up newly added tables and columns.
--
-- The same DDL is also applied at runtime by POST /api/admin/migrate (the
-- "Run migration" button on the admin dashboard), which exists so the schema
-- can be brought up to date without database console access. When you add a
-- table or column, update BOTH this file and that route.
--
-- Run with:
--   psql "$DATABASE_URL" -f sql/neon_schema.sql
-- or paste into the Neon SQL editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── Catalogue structure ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  name            TEXT NOT NULL,
  icon            TEXT,
  teaser          TEXT,
  foot_text       TEXT,
  image_url       TEXT,
  image_public_id TEXT,
  sort_order      INT DEFAULT 999,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

CREATE TABLE IF NOT EXISTS subcategories (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   UUID REFERENCES categories(id) ON DELETE CASCADE,
  category_slug TEXT,
  slug          TEXT NOT NULL,
  name          TEXT NOT NULL,
  blurb         TEXT,
  sort_order    INT DEFAULT 999,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE (category_id, slug)
);
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_subcategories_category_slug ON subcategories(category_slug);

CREATE TABLE IF NOT EXISTS brands (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  logo_url       TEXT,
  logo_public_id TEXT,
  sort_order     INTEGER DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT now()
);
-- Added after the table shape above was first written; POST /api/brands
-- inserts both, so a database missing them cannot create a brand.
ALTER TABLE brands ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb;

-- ─── Products ────────────────────────────────────────────────────────────────
--
-- category_slug / subcategory_slug / category_name / subcategory_name are
-- denormalised copies. Every read path filters and renders from them rather
-- than joining, so they must be kept in step with the *_id columns on write.

CREATE TABLE IF NOT EXISTS products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT UNIQUE NOT NULL,
  name             TEXT NOT NULL,
  description      TEXT,
  category_id      UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id   UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  category_slug    TEXT,
  subcategory_slug TEXT,
  category_name    TEXT,
  subcategory_name TEXT,
  price            NUMERIC,
  tag              TEXT,
  featured         BOOLEAN DEFAULT false,
  images           JSONB DEFAULT '[]'::jsonb,
  specs            JSONB DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand  TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS seo    JSONB DEFAULT '{}'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS videos JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_products_category_slug    ON products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_subcategory_slug ON products(subcategory_slug);
-- products.brand holds a display name; every lookup and the brands join both
-- compare LOWER(brand), which a plain column index cannot serve.
CREATE INDEX IF NOT EXISTS idx_products_brand_lower ON products(LOWER(brand));

-- ─── Use-case tagging ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS use_cases (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_use_cases (
  product_id  UUID NOT NULL REFERENCES products(id)  ON DELETE CASCADE,
  use_case_id UUID NOT NULL REFERENCES use_cases(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, use_case_id)
);
-- The primary key covers product_id lookups; the reverse direction needs its own.
CREATE INDEX IF NOT EXISTS idx_product_use_cases_use_case_id ON product_use_cases(use_case_id);

-- ─── Workshop & leads ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS repair_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  tag             TEXT,
  image_url       TEXT,
  image_public_id TEXT,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- source: 'quote' (form) | 'whatsapp' | 'call' (click logs) | 'chat' (assistant)
-- status: 'new' | 'contacted' | 'closed'
CREATE TABLE IF NOT EXISTS enquiries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT,
  product_slug TEXT,
  name         TEXT,
  phone        TEXT,
  email        TEXT,
  message      TEXT,
  source       TEXT NOT NULL DEFAULT 'quote',
  status       TEXT NOT NULL DEFAULT 'new',
  created_at   TIMESTAMPTZ DEFAULT now()
);
-- Unlike the catalogue tables, enquiries grows without bound: every WhatsApp
-- and call tap on a product page writes a row. These back the admin inbox
-- ordering, the unread badge count, and the most-enquired join on the product page.
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at   ON enquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enquiries_product_slug ON enquiries(product_slug);
CREATE INDEX IF NOT EXISTS idx_enquiries_status_source ON enquiries(status, source);
