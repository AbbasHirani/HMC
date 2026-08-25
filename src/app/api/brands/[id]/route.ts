import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { deleteFromCloudinary } from '@/lib/cloudinary';

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM brands WHERE id = ${id}`;
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ...rows[0], _id: rows[0].id });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const existing = await sql`SELECT logo_public_id, slug FROM brands WHERE id = ${id}`;
  if (existing[0]?.logo_public_id && existing[0].logo_public_id !== body.logoPublicId) {
    await deleteFromCloudinary(existing[0].logo_public_id as string);
  }

  await sql`
    UPDATE brands SET
      name = ${body.name},
      slug = ${body.slug},
      logo_url = ${body.logoUrl ?? null},
      logo_public_id = ${body.logoPublicId ?? null},
      sort_order = ${body.order ?? 0},
      description = ${body.description ?? null},
      seo = ${body.seo ? JSON.stringify(body.seo) : null}
    WHERE id = ${id}
  `;

  const { revalidatePath, revalidateTag } = await import('next/cache');
  revalidateTag('brands', 'max');
  revalidatePath('/');
  revalidatePath('/brands');
  revalidatePath(`/brand/${body.slug}`);
  if (existing[0]?.slug && existing[0].slug !== body.slug) {
    revalidatePath(`/brand/${existing[0].slug}`);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const rows = await sql`SELECT logo_public_id, slug FROM brands WHERE id = ${id}`;
  if (rows[0]?.logo_public_id) {
    await deleteFromCloudinary(rows[0].logo_public_id as string);
  }
  await sql`DELETE FROM brands WHERE id = ${id}`;

  const { revalidatePath, revalidateTag } = await import('next/cache');
  revalidateTag('brands', 'max');
  revalidatePath('/');
  revalidatePath('/brands');
  if (rows[0]?.slug) revalidatePath(`/brand/${rows[0].slug}`);

  return NextResponse.json({ ok: true });
}
