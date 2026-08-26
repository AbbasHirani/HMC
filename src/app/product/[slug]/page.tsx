import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductClient from './ProductClient';
import { findProductBySlug, getAllProductSlugs, getProducts, getMostEnquiredProducts } from '@/lib/queries';
import { jsonLd } from '@/lib/jsonLd';
import { buildProductSchema } from '@/lib/productSchema';

export const revalidate = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hiranimarketingcombines.in';

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const slugs = await getAllProductSlugs();
    return slugs.map(slug => ({ slug }));
  } catch { return []; }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await findProductBySlug(slug).catch(() => undefined);
  if (!p) return { title: 'Product Not Found' };

  // Admin SEO overrides win; otherwise fall back to auto-generated values.
  // Truncate product name at word boundary so the full title stays under 60 chars.
  const MAX_TITLE = 60;
  const suffix = ' — Buy in Chennai';
  const brandSuffix = p.brandName ? ` by ${p.brandName}` : '';
  const fullTitle = `${p.name}${brandSuffix}${suffix}`;
  const autoTitle = fullTitle.length <= MAX_TITLE
    ? fullTitle
    : fullTitle.length - brandSuffix.length <= MAX_TITLE
      ? `${p.name}${suffix}`
      : `${p.name.slice(0, MAX_TITLE - suffix.length).replace(/\s\S*$/, '')}${suffix}`;

  // Truncate at word boundary so the appended sentence doesn't look broken.
  const descBase = p.desc && p.desc.length > 140
    ? p.desc.slice(0, 140).replace(/\s+\S*$/, '') + '…'
    : (p.desc ?? '');
  const autoDesc = descBase
    ? `${descBase} Available at Hirani Marketing Combines, Parrys, Chennai.`
    : `Buy ${p.name} in Chennai at Hirani Marketing Combines. Genuine product, expert advice, workshop servicing available.`;

  const autoKeywords = [
    p.name, p.brandName, p.subName, p.catName,
    ...(p.useCases ?? []),
    'Chennai', 'Hirani Marketing Combines',
  ].filter((k): k is string => Boolean(k));

  const title       = p.seo?.title       || autoTitle;
  const description = p.seo?.description || autoDesc;
  const keywords    = p.seo?.keywords
    ? p.seo.keywords.split(',').map(k => k.trim()).filter(Boolean)
    : autoKeywords;

  // Use the product's own first image for both OG and Twitter cards.
  const productImage = p.images?.[0]?.url
    ? [{ url: p.images[0].url, alt: p.images[0].alt || p.name }]
    : undefined;

  return {
    // Absolute: skip the "| Hirani Marketing Combines" template so carefully
    // sized SEO titles aren't pushed past Google's ~65-char display limit.
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title,
      description,
      url: `/product/${slug}`,
      type: 'website',
      images: productImage,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: productImage?.map(i => i.url),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await findProductBySlug(slug).catch(() => undefined);
  if (!product) notFound();

  const related = await getProducts({ subcategorySlug: product.sub })
    .then(all => all.filter(r => r.slug !== slug).slice(0, 4))
    .catch(() => []);

  // Most-enquired products, excluding this one and anything already in "related".
  const relatedSlugs = new Set(related.map(r => r.slug));
  const popular = await getMostEnquiredProducts(slug, 8)
    .then(list => list.filter(r => !relatedSlugs.has(r.slug)).slice(0, 4))
    .catch(() => []);

  const productSchema = buildProductSchema(product, SITE);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',     item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE}/catalogue` },
      { '@type': 'ListItem', position: 3, name: product.catName ?? product.cat, item: `${SITE}/catalogue/${product.cat}` },
      { '@type': 'ListItem', position: 4, name: product.name, item: `${SITE}/product/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <Header active="products" />
      <ProductClient product={product} related={related} popular={popular} />
      <Footer />
    </>
  );
}
