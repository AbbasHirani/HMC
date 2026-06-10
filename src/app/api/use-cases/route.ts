import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { check, reqStr } from '@/lib/validate';

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM use_cases ORDER BY name`;
    return NextResponse.json(rows.map(r => ({ ...r, _id: r.id })));
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const err = check(() => {
    reqStr(body.name, 'name', 100);
    reqStr(body.slug, 'slug', 120);
  });
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  try {
    const rows = await sql`
      INSERT INTO use_cases (name, slug)
      VALUES (${body.name}, ${body.slug})
      ON CONFLICT (slug) DO NOTHING
      RETURNING *
    `;
    if (!rows[0]) return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    return NextResponse.json({ ...rows[0], _id: rows[0].id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create use case' }, { status: 500 });
  }
}
