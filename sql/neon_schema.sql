-- Neon DB schema for HMC project
-- Run this in the Neon SQL editor or via psql against your DATABASE_URL

-- enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT,
  teaser TEXT,
  foot_text TEXT,
  image_url TEXT,
  image_public_id TEXT,
  sort_order INT DEFAULT 999,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);

-- Subcategories
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  category_slug TEXT,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  blurb TEXT,
  sort_order INT DEFAULT 999,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(category_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_slug ON subcategories(category_slug);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  category_slug TEXT,
  subcategory_slug TEXT,
  category_name TEXT,
  subcategory_name TEXT,
  price NUMERIC,
  tag TEXT,
  featured BOOLEAN DEFAULT false,
  images JSONB DEFAULT '[]',
  specs JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_category_slug ON products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_subcategory_slug ON products(subcategory_slug);

-- Run these if upgrading an existing database:
-- ALTER TABLE categories ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}';
-- ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}';
-- ALTER TABLE brands ADD COLUMN IF NOT EXISTS description TEXT;
-- ALTER TABLE brands ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}';
