import { describe, it, expect } from 'vitest';
import { buildCategoryDescription, buildSubcategoryDescription, truncateAtWord } from './seoContent';
import type { Product } from './data';

function product(over: Partial<Product> = {}): Product {
  return {
    _id: 'id', slug: 'p', name: 'Pump', cat: 'water-pumps', sub: 'monoblock',
    subName: 'Monoblock', catName: 'Water Pumps', desc: '', price: null, tag: null,
    featured: false, images: [], specs: {}, brandName: null, ...over,
  } as Product;
}

describe('truncateAtWord', () => {
  it('leaves text at or under the limit alone', () => {
    expect(truncateAtWord('short text', 20)).toBe('short text');
  });

  it('cuts at a word boundary and appends an ellipsis', () => {
    const out = truncateAtWord('the quick brown fox jumps', 16);
    expect(out).toBe('the quick brown…');
    expect(out).not.toMatch(/\s…$/);
  });

  it('defaults to a meta-description-sized limit', () => {
    expect(truncateAtWord('x '.repeat(200)).length).toBeLessThanOrEqual(159);
  });
});

describe('buildCategoryDescription', () => {
  it('leads with the teaser when one is given', () => {
    const out = buildCategoryDescription({ name: 'Water Pumps', teaser: 'Pumps for every job.', subCount: 2, products: [] });
    expect(out.startsWith('Pumps for every job.')).toBe(true);
  });

  it('falls back to a generated opener when the teaser is missing', () => {
    const out = buildCategoryDescription({ name: 'Water Pumps', subCount: 1, products: [] });
    expect(out).toContain('Water Pumps');
    expect(out).toContain('Chennai');
  });

  it('reports the model count and pluralises it', () => {
    const one = buildCategoryDescription({ name: 'C', subCount: 1, products: [product()] });
    expect(one).toContain('1 model');
    const many = buildCategoryDescription({ name: 'C', subCount: 1, products: [product(), product()] });
    expect(many).toContain('2 models');
  });

  it('mentions the type count only when there is more than one', () => {
    expect(buildCategoryDescription({ name: 'C', subCount: 1, products: [product()] })).not.toContain('across');
    expect(buildCategoryDescription({ name: 'C', subCount: 3, products: [product()] })).toContain('across 3 types');
  });

  it('lists distinct brands without repeating them', () => {
    const out = buildCategoryDescription({
      name: 'C', subCount: 1,
      products: [product({ brandName: 'CRI' }), product({ brandName: 'CRI' }), product({ brandName: 'Texmo' })],
    });
    expect(out).toContain('CRI and Texmo');
    expect(out.match(/CRI/g)).toHaveLength(1);
  });

  it('renders a single price as one figure and a spread as a range', () => {
    expect(buildCategoryDescription({ name: 'C', subCount: 1, products: [product({ price: 5800 })] }))
      .toContain('Priced ₹5,800.');
    expect(buildCategoryDescription({ name: 'C', subCount: 1, products: [product({ price: 5800 }), product({ price: 12000 })] }))
      .toContain('₹5,800–₹12,000');
  });

  it('ignores null and non-positive prices', () => {
    const out = buildCategoryDescription({ name: 'C', subCount: 1, products: [product({ price: null }), product({ price: 0 })] });
    expect(out).not.toContain('Priced');
  });

  it('omits the count and brand clauses entirely when there is no stock', () => {
    const out = buildCategoryDescription({ name: 'C', teaser: 'T.', subCount: 1, products: [] });
    expect(out).not.toContain('We stock');
    expect(out).not.toContain('Brands available');
  });
});

describe('buildSubcategoryDescription', () => {
  it('names the products actually in stock, up to four', () => {
    const products = ['A', 'B', 'C', 'D', 'E'].map(n => product({ name: n }));
    const out = buildSubcategoryDescription({ name: 'Monoblock', products });
    expect(out).toContain('A, B, C and D');
    expect(out).not.toContain('E');
  });

  it('invites an enquiry when nothing is in stock', () => {
    const out = buildSubcategoryDescription({ name: 'Monoblock', products: [] });
    expect(out).toContain('Enquire for current availability');
  });

  it('prefers the blurb as its opening line', () => {
    const out = buildSubcategoryDescription({ name: 'Monoblock', blurb: 'Single-stage pumps.', products: [] });
    expect(out.startsWith('Single-stage pumps.')).toBe(true);
  });

  it('produces different copy for different stock, which is the whole point', () => {
    const a = buildSubcategoryDescription({ name: 'S', products: [product({ name: 'Alpha' })] });
    const b = buildSubcategoryDescription({ name: 'S', products: [product({ name: 'Beta' })] });
    expect(a).not.toBe(b);
  });
});
