import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const catSlug = searchParams.get('categorySlug');
  const subSlug = searchParams.get('subcategorySlug');
  const featured = searchParams.get('featured') === 'true';

  let rows;
  if (catSlug && subSlug) {
    rows = await sql`SELECT * FROM products WHERE category_slug = ${catSlug} AND subcategory_slug = ${subSlug} ORDER BY created_at DESC`;
  } else if (catSlug) {
    rows = await sql`SELECT * FROM products WHERE category_slug = ${catSlug} ORDER BY created_at DESC`;
  } else if (subSlug) {
    rows = await sql`SELECT * FROM products WHERE subcategory_slug = ${subSlug} ORDER BY created_at DESC`;
  } else if (featured) {
    rows = await sql`SELECT * FROM products WHERE featured = true ORDER BY created_at DESC`;
  } else {
    rows = await sql`SELECT * FROM products ORDER BY created_at DESC`;
  }
  return NextResponse.json(rows.map(r => ({ ...r, _id: r.id })));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const rows = await sql`
    INSERT INTO products (
      slug, name, description,
      category_id, subcategory_id,
      category_slug, subcategory_slug,
      category_name, subcategory_name,
      price, tag, featured, images, specs, brand
    ) VALUES (
      ${body.slug}, ${body.name}, ${body.desc ?? ''},
      ${body.categoryId}, ${body.subcategoryId},
      ${body.categorySlug}, ${body.subcategorySlug},
      ${body.categoryName}, ${body.subcategoryName},
      ${body.price ?? null}, ${body.tag ?? null},
      ${body.featured ?? false},
      ${JSON.stringify(body.images ?? [])}::jsonb,
      ${JSON.stringify(body.specs ?? {})}::jsonb,
      ${body.brand ?? null}
    )
    RETURNING *
  `;
  const r = rows[0];

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/');
  revalidatePath('/catalogue');
  revalidatePath(`/product/${body.slug}`);
  if (body.brand) revalidatePath(`/brand/${body.brand.toLowerCase()}`);

  return NextResponse.json({ ...r, _id: r.id }, { status: 201 });
}
