import { describe, it, expect } from 'vitest';
import { buildProductSchema } from './productSchema';
import type { Product } from './data';

const SITE = 'https://hiranimarketingcombines.in';

function product(over: Partial<Product> = {}): Product {
  return {
    _id: 'id', slug: 'cri-pump', name: 'CRI Pump', cat: 'water-pumps', sub: 'monoblock',
    subName: 'Monoblock', catName: 'Water Pumps', desc: 'A pump.', price: 5800, tag: null,
    featured: false, images: [{ url: 'https://res.cloudinary.com/a.jpg', publicId: 'a' }],
    specs: {}, brandName: 'CRI', ...over,
  } as Product;
}

/** What Google actually receives, after undefined values are dropped. */
function emitted(p: Product) {
  return JSON.parse(JSON.stringify(buildProductSchema(p, SITE)));
}

describe('offers — the Search Console critical issue', () => {
  it('emits an Offer with a price when the product has one', () => {
    const offers = emitted(product({ price: 5800 })).offers;
    expect(offers.price).toBe(5800);
    expect(offers.priceCurrency).toBe('INR');
  });

  it('omits offers entirely when the product has no price', () => {
    // Google requires price or priceSpecification.price inside an Offer.
    // Emitting an Offer without either is the error this guards against:
    // 'Either "price" or "priceSpecification.price" should be specified'.
    expect(emitted(product({ price: null })).offers).toBeUndefined();
  });

  it('never emits an Offer that lacks a price', () => {
    for (const price of [null, undefined] as (number | null | undefined)[]) {
      const offers = emitted(product({ price: price as number | null })).offers;
      if (offers !== undefined) {
        expect(offers.price ?? offers.priceSpecification?.price).toBeDefined();
      }
    }
  });

  it('treats a genuine zero price as a price, not as missing', () => {
    expect(emitted(product({ price: 0 })).offers?.price).toBe(0);
  });

  it('does not invent a placeholder price for unpriced products', () => {
    const json = JSON.stringify(buildProductSchema(product({ price: null }), SITE));
    expect(json).not.toContain('priceSpecification');
    expect(json).not.toContain('"price"');
  });
});

describe('core product fields', () => {
  it('uses the canonical product URL for @id and url', () => {
    const s = emitted(product());
    expect(s['@id']).toBe(`${SITE}/product/cri-pump`);
    expect(s.url).toBe(`${SITE}/product/cri-pump`);
  });

  it('includes brand when known and omits it when not', () => {
    expect(emitted(product({ brandName: 'CRI' })).brand).toEqual({ '@type': 'Brand', name: 'CRI' });
    expect(emitted(product({ brandName: null })).brand).toBeUndefined();
  });

  it('lists every image', () => {
    const s = emitted(product({
      images: [
        { url: 'https://res.cloudinary.com/a.jpg', publicId: 'a' },
        { url: 'https://res.cloudinary.com/b.jpg', publicId: 'b' },
      ],
    }));
    expect(s.image).toEqual(['https://res.cloudinary.com/a.jpg', 'https://res.cloudinary.com/b.jpg']);
  });

  it('emits an empty image array rather than undefined when there are none', () => {
    expect(emitted(product({ images: [] })).image).toEqual([]);
  });

  it('falls back to the category slug when the display name is absent', () => {
    expect(emitted(product({ catName: undefined })).category).toBe('water-pumps');
  });

  it('is serialisable — no undefined survives into the emitted JSON', () => {
    expect(JSON.stringify(buildProductSchema(product({ price: null, brandName: null }), SITE)))
      .not.toContain('undefined');
  });
});
