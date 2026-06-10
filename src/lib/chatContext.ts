// Server-only: builds & caches the product-catalog context that grounds the AI
// assistant. Do NOT import in 'use client' components.
import { getProducts, getCategories } from './queries';
import { sql } from './db';
import type { Product, Category } from './data';

interface UseCaseInfo {
  byProduct: Map<string, string[]>;          // product_id → use case names
  index: Array<{ name: string; slug: string }>;
}

async function getUseCaseInfo(): Promise<UseCaseInfo> {
  try {
    const rows = await sql`
      SELECT uc.name, uc.slug, puc.product_id
      FROM use_cases uc
      JOIN product_use_cases puc ON puc.use_case_id = uc.id
    `;
    const byProduct = new Map<string, string[]>();
    const index = new Map<string, string>();
    for (const r of rows) {
      index.set(r.slug as string, r.name as string);
      const list = byProduct.get(r.product_id as string) ?? [];
      list.push(r.name as string);
      byProduct.set(r.product_id as string, list);
    }
    return {
      byProduct,
      index: [...index.entries()].map(([slug, name]) => ({ slug, name })),
    };
  } catch {
    return { byProduct: new Map(), index: [] };
  }
}

interface CacheEntry { text: string; at: number }
let cache: CacheEntry | null = null;
const TTL = 5 * 60 * 1000; // 5 minutes — keeps the assistant fresh without hammering the DB

function priceLabel(price: number | null): string {
  if (price == null || Number.isNaN(price)) return 'Price on request';
  return `₹${price.toLocaleString('en-IN')}`;
}

function specLine(specs: Record<string, string>): string {
  const entries = Object.entries(specs).filter(([k, v]) => k && v);
  if (entries.length === 0) return '';
  return entries.map(([k, v]) => `${k}: ${v}`).join('; ');
}

function trim(s: string | undefined, max: number): string {
  if (!s) return '';
  const clean = s.replace(/\s+/g, ' ').trim();
  return clean.length > max ? clean.slice(0, max - 1).trimEnd() + '…' : clean;
}

function buildText(categories: Category[], products: Product[], uc: UseCaseInfo): string {
  const lines: string[] = [];

  // Category overview so the model understands the shape of the catalogue
  if (categories.length) {
    lines.push('## Categories');
    for (const c of categories) {
      const subs = c.subs.map(s => s.name).join(', ');
      lines.push(`- ${c.name}${subs ? ` (types: ${subs})` : ''} — ${trim(c.teaser, 120)}`);
    }
    lines.push('');
  }

  // Use-case tags — lets the assistant recommend by application and link
  // pre-filtered catalogue views.
  if (uc.index.length) {
    lines.push('## Use case index');
    lines.push('(Each tag below can be linked as a filtered catalogue view: /catalogue?uc=<slug>)');
    for (const u of uc.index) {
      lines.push(`- ${u.name} (slug: ${u.slug})`);
    }
    lines.push('');
  }

  lines.push('## Products');
  if (!products.length) {
    lines.push('(No products are currently loaded.)');
    return lines.join('\n');
  }

  // Group by category for readability
  const byCat = new Map<string, Product[]>();
  for (const p of products) {
    const key = p.catName || p.cat || 'Other';
    if (!byCat.has(key)) byCat.set(key, []);
    byCat.get(key)!.push(p);
  }

  for (const [catName, items] of byCat) {
    lines.push(`### ${catName}`);
    for (const p of items) {
      const parts: string[] = [];
      parts.push(`- **${p.name}**`);
      const meta: string[] = [];
      if (p.brandName || p.brand) meta.push(`Brand: ${p.brandName || p.brand}`);
      if (p.subName) meta.push(`Type: ${p.subName}`);
      meta.push(`Price: ${priceLabel(p.price)}`);
      meta.push(`Link: /product/${p.slug}`);
      parts.push(`  (${meta.join(' | ')})`);
      const specs = specLine(p.specs);
      if (specs) parts.push(`  Specs: ${specs}`);
      const tags = uc.byProduct.get(p._id);
      if (tags?.length) parts.push(`  Use cases: ${tags.join(', ')}`);
      const desc = trim(p.desc, 220);
      if (desc) parts.push(`  About: ${desc}`);
      lines.push(parts.join('\n'));
    }
    lines.push('');
  }

  return lines.join('\n').trim();
}

export async function getCatalogContext(): Promise<string> {
  if (cache && Date.now() - cache.at < TTL) return cache.text;
  const [categories, products, ucInfo] = await Promise.all([
    getCategories().catch(() => [] as Category[]),
    getProducts().catch(() => [] as Product[]),
    getUseCaseInfo(),
  ]);
  const text = buildText(categories, products, ucInfo);
  cache = { text, at: Date.now() };
  return text;
}
