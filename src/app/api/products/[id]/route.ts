import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { deleteFromCloudinary } from '@/lib/cloudinary';

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ...rows[0], _id: rows[0].id });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const existing = await sql`SELECT images, slug FROM products WHERE id = ${id}`;
  if (existing[0]?.images && Array.isArray(existing[0].images) && existing[0].images.length) {
    const newIds = new Set((body.images ?? []).map((i: { publicId: string }) => i.publicId));
    for (const img of existing[0].images as Array<{ publicId: string }>) {
      if (!newIds.has(img.publicId)) await deleteFromCloudinary(img.publicId);
    }
  }

  await sql`
    UPDATE products SET
      slug = ${body.slug},
      name = ${body.name},
      description = ${body.desc ?? ''},
      category_id = ${body.categoryId},
      subcategory_id = ${body.subcategoryId},
      category_slug = ${body.categorySlug},
      subcategory_slug = ${body.subcategorySlug},
      category_name = ${body.categoryName},
      subcategory_name = ${body.subcategoryName},
      price = ${body.price ?? null},
      tag = ${body.tag ?? null},
      featured = ${body.featured ?? false},
      images = ${JSON.stringify(body.images ?? [])}::jsonb,
      specs = ${JSON.stringify(body.specs ?? {})}::jsonb,
      brand = ${body.brand ?? null},
      updated_at = NOW()
    WHERE id = ${id}
  `;

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/');
  revalidatePath('/catalogue');
  revalidatePath(`/product/${body.slug}`);
  if (body.brand) revalidatePath(`/brand/${body.brand.toLowerCase()}`);
  if (existing[0]?.slug && existing[0].slug !== body.slug) {
    revalidatePath(`/product/${existing[0].slug}`);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const rows = await sql`SELECT images, slug FROM products WHERE id = ${id}`;
  if (rows[0]?.images && Array.isArray(rows[0].images) && rows[0].images.length) {
    await Promise.all(
      (rows[0].images as Array<{ publicId: string }>).map(img => deleteFromCloudinary(img.publicId))
    );
  }
  await sql`DELETE FROM products WHERE id = ${id}`;

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/');
  revalidatePath('/catalogue');
  if (rows[0]?.slug) revalidatePath(`/product/${rows[0].slug}`);

  return NextResponse.json({ ok: true });
}
