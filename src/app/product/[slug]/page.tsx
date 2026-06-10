import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductClient from './ProductClient';
import { findProductBySlug, getAllProductSlugs, getProducts } from '@/lib/queries';
import { jsonLd } from '@/lib/jsonLd';

export const revalidate = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hiranimarketing.vercel.app';

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
  const autoTitle = p.brandName
    ? `${p.name} by ${p.brandName} — Buy in Chennai`
    : `${p.name} — Buy in Chennai`;
  const autoDesc = p.desc
    ? `${p.desc.slice(0, 140)}. Available at Hirani Marketing Combines, Parrys, Chennai.`
    : `Buy ${p.name} in Chennai at Hirani Marketing Combines. Genuine product, expert advice, workshop servicing available.`;
  const autoKeywords = [
    p.name, p.brandName, p.subName, p.catName,
    ...(p.useCases ?? []),
    'Chennai', 'Hirani Marketing Combines',
  ].filter((k): k is string => Boolean(k));

  const title = p.seo?.title || autoTitle;
  const description = p.seo?.description || autoDesc;
  const keywords = p.seo?.keywords
    ? p.seo.keywords.split(',').map(k => k.trim()).filter(Boolean)
    : autoKeywords;

  return {
    title,
    description,
    keywords,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title,
      description,
      url: `/product/${slug}`,
      type: 'website',
      images: p.images?.[0]?.url
        ? [{ url: p.images[0].url, alt: p.images[0].alt || p.name }]
        : undefined,
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

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.desc,
    image: product.images?.map(img => img.url) ?? [],
    brand: product.brandName
      ? { '@type': 'Brand', name: product.brandName }
      : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'INR',
      price: product.price ?? undefined,
      priceSpecification: product.price
        ? undefined
        : { '@type': 'UnitPriceSpecification', description: 'Price on request' },
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Hirani Marketing Combines' },
    },
    category: product.catName ?? product.cat,
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',     item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE}/catalogue` },
      { '@type': 'ListItem', position: 3, name: product.catName ?? product.cat, item: `${SITE}/catalogue?cat=${product.cat}` },
      { '@type': 'ListItem', position: 4, name: product.name, item: `${SITE}/product/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <Header active="products" />
      <ProductClient product={product} related={related} />
      <Footer />
    </>
  );
}
