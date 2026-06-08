import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM repair_jobs WHERE id = ${id} LIMIT 1`;
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(rows[0]);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { title, description, tag, imageUrl, imagePublicId, order, deletedPublicId } = body;

  if (deletedPublicId) {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/upload`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId: deletedPublicId }),
    });
  }

  const rows = await sql`
    UPDATE repair_jobs SET
      title = ${title},
      description = ${description ?? null},
      tag = ${tag ?? null},
      image_url = ${imageUrl ?? null},
      image_public_id = ${imagePublicId ?? null},
      sort_order = ${order ?? 0}
    WHERE id = ${id}
    RETURNING *
  `;
  revalidatePath('/services');
  return NextResponse.json(rows[0]);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM repair_jobs WHERE id = ${id}`;
  revalidatePath('/services');
  return NextResponse.json({ ok: true });
}
