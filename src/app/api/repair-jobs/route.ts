import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET() {
  try {
    const rows = await sql`SELECT * FROM repair_jobs ORDER BY sort_order, created_at DESC`;
    return NextResponse.json(rows);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, tag, imageUrl, imagePublicId, order } = body;
  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  const rows = await sql`
    INSERT INTO repair_jobs (title, description, tag, image_url, image_public_id, sort_order)
    VALUES (${title}, ${description ?? null}, ${tag ?? null}, ${imageUrl ?? null}, ${imagePublicId ?? null}, ${order ?? 0})
    RETURNING *
  `;
  revalidatePath('/services');
  return NextResponse.json(rows[0], { status: 201 });
}
