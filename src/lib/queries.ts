// Server-only DB query functions — do NOT import in 'use client' components
import { sql } from './db';
import type { Category, FlatSubCategory, Product } from './data';

export async function getCategories(): Promise<Category[]> {
  const [cats, subs] = await Promise.all([
    sql`SELECT * FROM categories ORDER BY sort_order`,
    sql`SELECT * FROM subcategories ORDER BY sort_order`,
  ]);
  return cats.map(c => {
    const catSubs: FlatSubCategory[] = subs
      .filter(s => s.category_slug === c.slug)
      .map(s => ({
        _id: s.id as string,
        id: s.slug as string,
        slug: s.slug as string,
        cat: s.category_slug as string,
        name: s.name as string,
        blurb: (s.blurb as string) ?? '',
        count: 0,
      }));
    return {
      _id: c.id as string,
      slug: c.slug as string,
      id: c.slug as string,
      name: c.name as string,
      icon: c.icon as string,
      teaser: c.teaser as string,
      foot: (c.foot_text as string) ?? '',
      footText: (c.foot_text as string) ?? '',
      imageUrl: c.image_url as string | undefined,
      imagePublicId: c.image_public_id as string | undefined,
      order: (c.sort_order as number) ?? 0,
      subs: catSubs,
    };
  });
}

export async function getProducts(opts?: {
  categorySlug?: string;
  subcategorySlug?: string;
  featured?: boolean;
}): Promise<Product[]> {
  const catSlug = opts?.categorySlug;
  const subSlug = opts?.subcategorySlug;
  const featured = opts?.featured;

  let rows;
  if (catSlug && subSlug) {
    rows = await sql`SELECT * FROM products WHERE category_slug = ${catSlug} AND subcategory_slug = ${subSlug} ORDER BY created_at DESC`;
  } else if (catSlug && featured) {
    rows = await sql`SELECT * FROM products WHERE category_slug = ${catSlug} AND featured = true ORDER BY created_at DESC`;
  } else if (catSlug) {
    rows = await sql`SELECT * FROM products WHERE category_slug = ${catSlug} ORDER BY created_at DESC`;
  } else if (subSlug) {
    rows = await sql`SELECT * FROM products WHERE subcategory_slug = ${subSlug} ORDER BY created_at DESC`;
  } else if (featured) {
    rows = await sql`SELECT * FROM products WHERE featured = true ORDER BY created_at DESC`;
  } else {
    rows = await sql`SELECT * FROM products ORDER BY created_at DESC`;
  }
  return rows.map(toProduct);
}

export async function findProductBySlug(slug: string): Promise<Product | undefined> {
  const rows = await sql`SELECT * FROM products WHERE slug = ${slug} LIMIT 1`;
  return rows[0] ? toProduct(rows[0]) : undefined;
}

export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM products`;
  return rows.map(r => r.slug as string);
}

function toProduct(row: Record<string, unknown>): Product {
  return {
    _id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    cat: row.category_slug as string,
    sub: row.subcategory_slug as string,
    subName: row.subcategory_name as string,
    catName: row.category_name as string,
    desc: row.description as string,
    spec: row.description as string,
    price: (row.price as number | null) ?? null,
    tag: (row.tag as string | null) ?? null,
    featured: (row.featured as boolean) ?? false,
    images: (row.images as Array<{ url: string; publicId: string }>) ?? [],
    specs: (row.specs as Record<string, string>) ?? {},
  };
}
