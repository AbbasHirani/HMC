// Builds the schema.org Product JSON-LD for a product page.
//
// Kept out of the page component so the Offer rules can be tested — Search
// Console reports breakage here days later and only for pages it happens to
// have crawled, which is a slow and partial feedback loop.
import type { Product } from './data';

const SELLER_NAME = 'Hirani Marketing Combines';

export function buildProductSchema(product: Product, site: string): Record<string, unknown> {
  const url = `${site}/product/${product.slug}`;

  // Google requires `price` (or `priceSpecification.price`) inside an Offer.
  // A product with no listed price has neither, so it gets no Offer at all —
  // an incomplete Offer is a hard error, whereas a Product without one is
  // simply not eligible for a price-bearing rich result, which is the honest
  // outcome when there is no price to show. Never substitute a placeholder:
  // a 0 here would surface as "₹0" in search results.
  const offers =
    product.price != null
      ? {
          '@type': 'Offer',
          url,
          priceCurrency: 'INR',
          price: product.price,
          availability: 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@type': 'Organization', name: SELLER_NAME, url: site },
        }
      : undefined;

  // Undefined values are dropped by JSON.stringify, so optional branches
  // simply disappear from the emitted JSON-LD.
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': url,
    name: product.name,
    description: product.desc,
    url,
    image: product.images?.map(img => img.url) ?? [],
    brand: product.brandName ? { '@type': 'Brand', name: product.brandName } : undefined,
    offers,
    category: product.catName ?? product.cat,
  };
}
