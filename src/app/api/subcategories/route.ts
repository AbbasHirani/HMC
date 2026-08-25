import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { revalidatePath, revalidateTag } from 'next/cache';
import { check, reqStr, optStr } from '@/lib/validate';

export async function GET(req: NextRequest) {
  const catSlug = req.nextUrl.searchParams.get('categorySlug');
  const rows = catSlug
    ? await sql`SELECT * FROM subcategories WHERE category_slug = ${catSlug} ORDER BY sort_order`
    : await sql`SELECT * FROM subcategories ORDER BY sort_order`;
  return NextResponse.json(rows.map(r => ({ ...r, _id: r.id, categoryId: r.category_id })));
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const err = check(() => {
    reqStr(body.slug, 'slug', 200);
    reqStr(body.name, 'name', 200);
    optStr(body.blurb, 'blurb', 2000);
  });
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  // resolve category_slug from categoryId if needed
  let categorySlug = body.categorySlug as string | undefined;
  if (!categorySlug && body.categoryId) {
    const catRows = await sql`SELECT slug FROM categories WHERE id = ${body.categoryId}`;
    categorySlug = catRows[0]?.slug as string;
  }
  const rows = await sql`
    INSERT INTO subcategories (category_id, category_slug, slug, name, blurb, sort_order, seo)
    VALUES (
      ${body.categoryId}, ${categorySlug ?? ''},
      ${body.slug}, ${body.name}, ${body.blurb ?? ''},
      ${body.order ?? 999},
      ${body.seo ?? '{}'}
    )
    RETURNING *
  `;
  const r = rows[0];
  revalidateTag('categories', 'max');
  revalidatePath('/');
  revalidatePath('/catalogue');
  return NextResponse.json({ ...r, _id: r.id, categoryId: r.category_id }, { status: 201 });
}
