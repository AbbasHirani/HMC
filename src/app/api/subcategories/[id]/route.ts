import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  await sql`
    UPDATE subcategories SET
      slug = ${body.slug},
      name = ${body.name},
      blurb = ${body.blurb ?? ''},
      sort_order = ${body.order ?? 999},
      seo = ${body.seo ?? '{}'},
      updated_at = NOW()
    WHERE id = ${id}
  `;
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  await sql`DELETE FROM subcategories WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
