import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { check, reqStr, optStr, optNum, optArrayMax } from '@/lib/validate';

type Params = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const ucRows = await sql`SELECT use_case_id FROM product_use_cases WHERE product_id = ${id}`;
  const useCaseIds = ucRows.map(r => r.use_case_id as string);
  return NextResponse.json({ ...rows[0], _id: rows[0].id, useCaseIds });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json();

  const err = check(() => {
    reqStr(body.slug, 'slug', 200);
    reqStr(body.name, 'name', 300);
    optStr(body.desc, 'desc', 10000);
    optStr(body.tag, 'tag', 100);
    optNum(body.price, 'price');
    optArrayMax(body.images, 'images', 30);
    optStr(body.seo?.title, 'seo.title', 200);
    optStr(body.seo?.description, 'seo.description', 500);
    optStr(body.seo?.keywords, 'seo.keywords', 1000);
  });
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const existing = await sql`SELECT images, videos, slug FROM products WHERE id = ${id}`;
  if (existing[0]?.images && Array.isArray(existing[0].images) && existing[0].images.length) {
    const newIds = new Set((body.images ?? []).map((i: { publicId: string }) => i.publicId));
    for (const img of existing[0].images as Array<{ publicId: string }>) {
      if (!newIds.has(img.publicId)) await deleteFromCloudinary(img.publicId, 'image');
    }
  }
  if (existing[0]?.videos && Array.isArray(existing[0].videos) && existing[0].videos.length) {
    const newVideoIds = new Set((body.videos ?? []).filter((v: any) => v.type === 'cloudinary').map((v: any) => v.publicId));
    for (const vid of existing[0].videos as Array<{ type: string, publicId?: string }>) {
      if (vid.type === 'cloudinary' && vid.publicId && !newVideoIds.has(vid.publicId)) {
        await deleteFromCloudinary(vid.publicId, 'video');
      }
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
      videos = ${JSON.stringify(body.videos ?? [])}::jsonb,
      specs = ${JSON.stringify(body.specs ?? {})}::jsonb,
      brand = ${body.brand ?? null},
      seo = ${JSON.stringify(body.seo ?? {})}::jsonb,
      updated_at = NOW()
    WHERE id = ${id}
  `;

  await sql`DELETE FROM product_use_cases WHERE product_id = ${id}`;
  if (Array.isArray(body.useCaseIds) && body.useCaseIds.length) {
    for (const ucId of body.useCaseIds as string[]) {
      await sql`
        INSERT INTO product_use_cases (product_id, use_case_id)
        VALUES (${id}, ${ucId})
        ON CONFLICT DO NOTHING
      `;
    }
  }

  const { revalidatePath, revalidateTag } = await import('next/cache');
  revalidateTag('products', {});
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
  const rows = await sql`SELECT images, videos, slug FROM products WHERE id = ${id}`;
  if (rows[0]?.images && Array.isArray(rows[0].images) && rows[0].images.length) {
    await Promise.all(
      (rows[0].images as Array<{ publicId: string }>).map(img => deleteFromCloudinary(img.publicId, 'image'))
    );
  }
  if (rows[0]?.videos && Array.isArray(rows[0].videos) && rows[0].videos.length) {
    await Promise.all(
      (rows[0].videos as Array<{ type: string, publicId?: string }>)
        .filter(v => v.type === 'cloudinary' && v.publicId)
        .map(v => deleteFromCloudinary(v.publicId!, 'video'))
    );
  }
  await sql`DELETE FROM products WHERE id = ${id}`;

  const { revalidatePath, revalidateTag } = await import('next/cache');
  revalidateTag('products', {});
  revalidatePath('/');
  revalidatePath('/catalogue');
  if (rows[0]?.slug) revalidatePath(`/product/${rows[0].slug}`);

  return NextResponse.json({ ok: true });
}
