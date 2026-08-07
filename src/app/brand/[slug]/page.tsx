import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CTABand from '@/components/CTABand';
import ProductCard from '@/components/ProductCard';
import Image from 'next/image';
import { getBrands, getProducts } from '@/lib/queries';
import { jsonLd } from '@/lib/jsonLd';
import Link from 'next/link';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brands = await getBrands().catch(() => []);
  const brand = brands.find(b => b.slug === slug);
  if (!brand) return {};

  const brandSuffix = ' | Hirani Marketing Combines';
  const brandBase = `${brand.name} in Chennai`;
  const autoTitle = (brandBase + brandSuffix).length <= 60 ? brandBase + brandSuffix : brandBase;
  const autoDesc = brand.description || `Browse all ${brand.name} pumps, water systems and equipment at Hirani Marketing Combines, Chennai.`;

  const title = brand.seo?.title || autoTitle;
  const description = brand.seo?.description || autoDesc;
  const keywords = brand.seo?.keywords || undefined;

  return {
    title: { absolute: title },
    description,
    keywords: keywords || undefined,
    alternates: { canonical: `/brand/${slug}` },
    openGraph: { title, description, url: `/brand/${slug}`, type: 'website' },
  };
}

export async function generateStaticParams() {
  const brands = await getBrands().catch(() => []);
  return brands.map(b => ({ slug: b.slug }));
}

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const [brands, products] = await Promise.all([
    getBrands().catch(() => []),
    getProducts({ brandSlug: slug }).catch(() => []),
  ]);
  const brand = brands.find(b => b.slug === slug);
  if (!brand) notFound();

  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hiranimarketingcombines.in';
  
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${brand.name} Pumps & Water Systems in Chennai`,
    description: `Browse all ${brand.name} products available at Hirani Marketing Combines, Chennai.`,
    url: `${SITE}/brand/${slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: products.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE}/product/${p.slug}`,
      })),
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Brands', item: `${SITE}/brands` },
      { '@type': 'ListItem', position: 3, name: brand.name, item: `${SITE}/brand/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(collectionSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <Header active="products" />

      <section className="list-head">
        <div className="container">
          <nav className="crumb">
            <Link href="/">Home</Link><span>/</span>
            <Link href="/brands">Brands</Link><span>/</span>
            <b>{brand.name}</b>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 14 }}>
            {brand.logoUrl && <Image src={brand.logoUrl} alt={brand.name} width={120} height={48} style={{ objectFit: 'contain' }} />}
            <h1 style={{ fontSize: 'clamp(28px,3.4vw,40px)' }}>{brand.name}</h1>
          </div>
          <p style={{ color: 'var(--slate)', fontSize: 16, marginTop: 10, maxWidth: 600 }}>
            {brand.description || `Browse all ${brand.name} products available at Hirani Marketing Combines, Chennai.`}
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          {products.length > 0 ? (
            <>
              <p style={{ color: 'var(--muted)', fontSize: 13.5, fontWeight: 600, marginBottom: 28 }}>
                {products.length} product{products.length !== 1 ? 's' : ''}
              </p>
              <div className="prod-grid">
                {products.map(p => <ProductCard key={p.slug} p={p} />)}
              </div>
            </>
          ) : (
            <div className="empty">
              No {brand.name} products listed yet — <Link href="/catalogue">browse all products</Link> or <a href="https://wa.me/919840159762">enquire on WhatsApp</a>.
            </div>
          )}
        </div>
      </section>

      <CTABand />
      <Footer />
    </>
  );
}
