// Server-only DB query functions — do NOT import in 'use client' components
import { unstable_cache } from 'next/cache';
import { sql } from './db';
import type { Brand, Category, FlatSubCategory, Product } from './data';

export const getCategories: () => Promise<Category[]> = unstable_cache(
  async (): Promise<Category[]> => {
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
          seo: (s.seo as { title?: string; description?: string; keywords?: string } | null) ?? {},
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
        seo: (c.seo as { title?: string; description?: string; keywords?: string } | null) ?? {},
        subs: catSubs,
      };
    });
  },
  ['categories'],
  { revalidate: 60, tags: ['categories'] }
);

export const getBrands: () => Promise<Brand[]> = unstable_cache(
  async (): Promise<Brand[]> => {
    const rows = await sql`SELECT * FROM brands ORDER BY sort_order, name`;
    return rows.map(r => ({
      _id: r.id as string,
      name: r.name as string,
      slug: r.slug as string,
      logoUrl: (r.logo_url as string | null) ?? null,
      logoPublicId: (r.logo_public_id as string | null) ?? null,
      order: (r.sort_order as number) ?? 0,
      description: (r.description as string | null) ?? null,
      seo: (r.seo as { title?: string; description?: string; keywords?: string } | null) ?? null,
    }));
  },
  ['brands'],
  { revalidate: 60, tags: ['brands'] }
);

type ProductOpts = { categorySlug?: string; subcategorySlug?: string; brandSlug?: string; featured?: boolean };

export const getProducts: (opts?: ProductOpts) => Promise<Product[]> = unstable_cache(
  async (opts?: ProductOpts): Promise<Product[]> => {
    const catSlug = opts?.categorySlug;
    const subSlug = opts?.subcategorySlug;
    const brandSlug = opts?.brandSlug;
    const featured = opts?.featured;

    let rows;
    if (brandSlug) {
      rows = await sql`SELECT p.*, b.logo_url AS brand_logo_url, b.name AS brand_display_name FROM products p LEFT JOIN brands b ON b.slug = LOWER(p.brand) WHERE LOWER(p.brand) = ${brandSlug} ORDER BY p.created_at DESC`;
    } else if (catSlug && subSlug) {
      rows = await sql`SELECT p.*, b.logo_url AS brand_logo_url, b.name AS brand_display_name FROM products p LEFT JOIN brands b ON b.slug = LOWER(p.brand) WHERE p.category_slug = ${catSlug} AND p.subcategory_slug = ${subSlug} ORDER BY p.created_at DESC`;
    } else if (catSlug && featured) {
      rows = await sql`SELECT p.*, b.logo_url AS brand_logo_url, b.name AS brand_display_name FROM products p LEFT JOIN brands b ON b.slug = LOWER(p.brand) WHERE p.category_slug = ${catSlug} AND p.featured = true ORDER BY p.created_at DESC`;
    } else if (catSlug) {
      rows = await sql`SELECT p.*, b.logo_url AS brand_logo_url, b.name AS brand_display_name FROM products p LEFT JOIN brands b ON b.slug = LOWER(p.brand) WHERE p.category_slug = ${catSlug} ORDER BY p.created_at DESC`;
    } else if (subSlug) {
      rows = await sql`SELECT p.*, b.logo_url AS brand_logo_url, b.name AS brand_display_name FROM products p LEFT JOIN brands b ON b.slug = LOWER(p.brand) WHERE p.subcategory_slug = ${subSlug} ORDER BY p.created_at DESC`;
    } else if (featured) {
      rows = await sql`SELECT p.*, b.logo_url AS brand_logo_url, b.name AS brand_display_name FROM products p LEFT JOIN brands b ON b.slug = LOWER(p.brand) WHERE p.featured = true ORDER BY p.created_at DESC`;
    } else {
      rows = await sql`SELECT p.*, b.logo_url AS brand_logo_url, b.name AS brand_display_name FROM products p LEFT JOIN brands b ON b.slug = LOWER(p.brand) ORDER BY p.created_at DESC`;
    }
    return rows.map(toProduct);
  },
  ['products'],
  { revalidate: 60, tags: ['products'] }
);

export async function findProductBySlug(slug: string): Promise<Product | undefined> {
  const rows = await sql`
    SELECT p.*, b.logo_url AS brand_logo_url, b.name AS brand_display_name
    FROM products p
    LEFT JOIN brands b ON b.slug = LOWER(p.brand)
    WHERE p.slug = ${slug} LIMIT 1
  `;
  if (!rows[0]) return undefined;
  const product = toProduct(rows[0]);
  const ucRows = await sql`
    SELECT uc.name FROM use_cases uc
    JOIN product_use_cases puc ON puc.use_case_id = uc.id
    WHERE puc.product_id = ${product._id}
    ORDER BY uc.name
  `.catch(() => []);
  product.useCases = ucRows.map(r => r.name as string);
  return product;
}

/** Products ranked by how often customers enquired about them (quote forms + WhatsApp/call taps). */
export async function getMostEnquiredProducts(excludeSlug: string, limit = 4): Promise<Product[]> {
  const rows = await sql`
    SELECT p.*, b.logo_url AS brand_logo_url, b.name AS brand_display_name, COUNT(e.id) AS enq_count
    FROM enquiries e
    JOIN products p ON p.slug = e.product_slug
    LEFT JOIN brands b ON b.slug = LOWER(p.brand)
    WHERE e.product_slug <> ${excludeSlug}
    GROUP BY p.id, b.logo_url, b.name
    ORDER BY enq_count DESC
    LIMIT ${limit}
  `.catch(() => []);
  return rows.map(toProduct);
}

export async function getAllProductSlugs(): Promise<string[]> {
  const rows = await sql`SELECT slug FROM products`;
  return rows.map(r => r.slug as string);
}

const _cachedUseCaseData = unstable_cache(
  async (): Promise<{ byProduct: Record<string, string[]>; options: { slug: string; name: string }[] }> => {
    const rows = await sql`
      SELECT uc.slug, uc.name, puc.product_id
      FROM use_cases uc
      JOIN product_use_cases puc ON puc.use_case_id = uc.id
    `;
    const byProduct: Record<string, string[]> = {};
    const options = new Map<string, string>();
    for (const r of rows) {
      options.set(r.slug as string, r.name as string);
      const list = byProduct[r.product_id as string] ?? [];
      list.push(r.slug as string);
      byProduct[r.product_id as string] = list;
    }
    return {
      byProduct,
      options: [...options.entries()]
        .map(([slug, name]) => ({ slug, name }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    };
  },
  ['use-case-filters'],
  { revalidate: 60, tags: ['use-cases'] }
);

export async function getUseCaseFilters(): Promise<{
  byProduct: Map<string, string[]>;
  options: { slug: string; name: string }[];
}> {
  try {
    const data = await _cachedUseCaseData();
    return {
      byProduct: new Map(Object.entries(data.byProduct)),
      options: data.options,
    };
  } catch {
    return { byProduct: new Map<string, string[]>(), options: [] };
  }
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
    images: (row.images as Array<{ url: string; publicId: string; alt?: string }>) ?? [],
    videos: (row.videos as Array<{ type: 'cloudinary' | 'youtube'; url: string; publicId?: string }>) ?? [],
    specs: (row.specs as Record<string, string>) ?? {},
    brand: (row.brand as string | null) ?? null,
    brandName: (row.brand_display_name as string | null) ?? null,
    brandLogo: (row.brand_logo_url as string | null) ?? null,
    seo: (row.seo as { title?: string; description?: string; keywords?: string } | null) ?? {},
  };
}
