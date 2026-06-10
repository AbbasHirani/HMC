import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hasValidAdminSession } from '@/lib/adminAuth';

export async function POST(req: NextRequest) {
  if (!await hasValidAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS brand text`;
  await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS seo JSONB DEFAULT '{}'::jsonb`;
  await sql`
    CREATE TABLE IF NOT EXISTS brands (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      logo_url TEXT,
      logo_public_id TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS repair_jobs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      tag TEXT,
      image_url TEXT,
      image_public_id TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS use_cases (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS product_use_cases (
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      use_case_id UUID NOT NULL REFERENCES use_cases(id) ON DELETE CASCADE,
      PRIMARY KEY (product_id, use_case_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS enquiries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_name TEXT,
      product_slug TEXT,
      name TEXT,
      phone TEXT,
      email TEXT,
      message TEXT,
      source TEXT NOT NULL DEFAULT 'quote',
      status TEXT NOT NULL DEFAULT 'new',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  return NextResponse.json({ ok: true, message: 'Migration complete' });
}
