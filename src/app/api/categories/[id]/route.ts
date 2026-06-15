import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { deleteFromCloudinary } from '@/lib/cloudinary';

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM categories WHERE id = ${id}`;
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ...rows[0], _id: rows[0].id });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();
  await sql`
    UPDATE categories SET
      slug = ${body.slug},
      name = ${body.name},
      icon = ${body.icon ?? ''},
      teaser = ${body.teaser ?? ''},
      foot_text = ${body.footText ?? ''},
      image_url = ${body.imageUrl ?? null},
      image_public_id = ${body.imagePublicId ?? null},
      sort_order = ${body.order ?? 999},
      seo = ${body.seo ?? '{}'},
      updated_at = NOW()
    WHERE id = ${id}
  `;
  const { revalidatePath } = await import('next/cache');
  revalidatePath('/');
  revalidatePath('/catalogue');
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const rows = await sql`SELECT image_public_id FROM categories WHERE id = ${id}`;
  if (rows[0]?.image_public_id) await deleteFromCloudinary(rows[0].image_public_id as string);
  // subcategories cascade-delete via FK
  await sql`DELETE FROM categories WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
