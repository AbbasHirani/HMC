import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { check, reqStr, optStr, optNum, optArrayMax } from '@/lib/validate';

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

  const rows = await sql`
    INSERT INTO products (
      slug, name, description,
      category_id, subcategory_id,
      category_slug, subcategory_slug,
      category_name, subcategory_name,
      price, tag, featured, images, videos, specs, brand, seo
    ) VALUES (
      ${body.slug}, ${body.name}, ${body.desc ?? ''},
      ${body.categoryId}, ${body.subcategoryId},
      ${body.categorySlug}, ${body.subcategorySlug},
      ${body.categoryName}, ${body.subcategoryName},
      ${body.price ?? null}, ${body.tag ?? null},
      ${body.featured ?? false},
      ${JSON.stringify(body.images ?? [])}::jsonb,
      ${JSON.stringify(body.videos ?? [])}::jsonb,
      ${JSON.stringify(body.specs ?? {})}::jsonb,
      ${body.brand ?? null},
      ${JSON.stringify(body.seo ?? {})}::jsonb
    )
    RETURNING *
  `;
  const r = rows[0];

  if (Array.isArray(body.useCaseIds) && body.useCaseIds.length) {
    for (const ucId of body.useCaseIds as string[]) {
      await sql`
        INSERT INTO product_use_cases (product_id, use_case_id)
        VALUES (${r.id}, ${ucId})
        ON CONFLICT DO NOTHING
      `;
    }
  }

  const { revalidatePath } = await import('next/cache');
  revalidatePath('/');
  revalidatePath('/catalogue');
  revalidatePath(`/product/${body.slug}`);
  if (body.brand) revalidatePath(`/brand/${body.brand.toLowerCase()}`);

  return NextResponse.json({ ...r, _id: r.id }, { status: 201 });
}
