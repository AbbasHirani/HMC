// Generates unique, data-driven descriptions for category/subcategory pages.
// Replaces the old fixed template ("Leading X supplier in Parrys, Chennai
// offering Y with expert technical sales and support.") that was repeated
// near-verbatim across every category and subcategory, which Google was
// flagging as thin/templated content ("Crawled - currently not indexed").
import type { Product } from './data';

function priceRange(products: Product[]): string | null {
  const prices = products
    .map(p => p.price)
    .filter((p): p is number => typeof p === 'number' && p > 0);
  if (!prices.length) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  return min === max ? fmt(min) : `${fmt(min)}–${fmt(max)}`;
}

function brandList(products: Product[]): string[] {
  return [...new Set(products.map(p => p.brandName).filter((b): b is string => Boolean(b)))];
}

function joinNatural(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export function buildCategoryDescription(opts: {
  name: string;
  teaser?: string;
  subCount: number;
  products: Product[];
}): string {
  const { name, teaser, subCount, products } = opts;
  const brands = brandList(products);
  const range = priceRange(products);

  const intro = teaser || `${name} available at Hirani Marketing Combines, Parrys, Chennai.`;

  const countBit = products.length
    ? ` We stock ${products.length} ${products.length === 1 ? 'model' : 'models'}${subCount > 1 ? ` across ${subCount} types` : ''}.`
    : '';
  const brandBit = brands.length ? ` Brands available: ${joinNatural(brands)}.` : '';
  const priceBit = range ? ` Priced ${range}.` : '';

  return `${intro}${countBit}${brandBit}${priceBit} Visit our Parrys, Chennai store for expert advice and workshop support.`.trim();
}

export function buildSubcategoryDescription(opts: {
  name: string;
  blurb?: string;
  products: Product[];
}): string {
  const { name, blurb, products } = opts;
  const brands = brandList(products);
  const range = priceRange(products);

  const intro = blurb || `${name} available at Hirani Marketing Combines, Parrys, Chennai.`;

  const names = products.slice(0, 4).map(p => p.name);
  const stockBit = names.length
    ? ` Currently in stock: ${joinNatural(names)}.`
    : ' Enquire for current availability and pricing.';
  const brandBit = brands.length ? ` Available from ${joinNatural(brands)}.` : '';
  const priceBit = range ? ` Priced ${range}.` : '';

  return `${intro}${stockBit}${brandBit}${priceBit} Visit our Parrys store or call for technical advice.`.trim();
}

/** Truncates at a word boundary so meta descriptions don't cut mid-word. */
export function truncateAtWord(text: string, max = 158): string {
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}
