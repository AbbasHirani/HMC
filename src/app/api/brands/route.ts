import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET() {
  const rows = await sql`SELECT * FROM brands ORDER BY sort_order, name`;
  return NextResponse.json(rows.map(r => ({ ...r, _id: r.id })));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rows = await sql`
    INSERT INTO brands (name, slug, logo_url, logo_public_id, sort_order)
    VALUES (${body.name}, ${body.slug}, ${body.logoUrl ?? null}, ${body.logoPublicId ?? null}, ${body.order ?? 0})
    RETURNING *
  `;
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/');
  revalidatePath('/brands');
  revalidatePath(`/brand/${body.slug}`);
  return NextResponse.json({ ...rows[0], _id: rows[0].id }, { status: 201 });
}
