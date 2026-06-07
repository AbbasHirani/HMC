import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  const rows = await sql`SELECT * FROM categories ORDER BY sort_order`;
  return NextResponse.json(rows.map(r => ({ ...r, _id: r.id })));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rows = await sql`
    INSERT INTO categories (slug, name, icon, teaser, foot_text, image_url, image_public_id, sort_order)
    VALUES (
      ${body.slug}, ${body.name}, ${body.icon ?? ''},
      ${body.teaser ?? ''}, ${body.footText ?? ''},
      ${body.imageUrl ?? null}, ${body.imagePublicId ?? null},
      ${body.order ?? 999}
    )
    RETURNING *
  `;
  const r = rows[0];
  return NextResponse.json({ ...r, _id: r.id }, { status: 201 });
}
