import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CTABand from '@/components/CTABand';
import CatalogueClient from '../CatalogueClient';
import { getCategories, getProducts, getUseCaseFilters } from '@/lib/queries';
import { jsonLd } from '@/lib/jsonLd';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hiranimarketing.vercel.app';

export const revalidate = 60;

type Props = { params: Promise<{ category: string }> };

export async function generateStaticParams() {
  const categories = await getCategories().catch(() => []);
  return categories.map(c => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const categories = await getCategories().catch(() => []);
  const catObj = categories.find(c => c.slug === category);
  if (!catObj) return { title: 'Category Not Found' };

  // Use admin-configured SEO title/description; fall back to auto-generated values.
  const suffix = ' | Hirani Marketing Combines';
  const base = `${catObj.name} in Chennai`;
  const autoTitle = (base + suffix).length <= 60 ? base + suffix : base;
  const title = catObj.seo?.title || autoTitle;
  const description = catObj.seo?.description || catObj.teaser || '';
  const keywords = catObj.seo?.keywords || undefined;

  return {
    title: { absolute: title },
    description,
    keywords: keywords || undefined,
    alternates: { canonical: `/catalogue/${category}` },
    openGraph: {
      title,
      description,
      url: `/catalogue/${category}`,
      type: 'website',
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;

  const [categories, products, ucFilters] = await Promise.all([
    getCategories().catch(() => []),
    getProducts().catch(() => []),
    getUseCaseFilters(),
  ]);

  const catObj = categories.find(c => c.slug === category);
  if (!catObj) notFound();

  for (const p of products) {
    p.ucSlugs = ucFilters.byProduct.get(p._id) ?? [];
  }

  const h1 = `${catObj.name} in Chennai`;
  const desc = catObj.teaser || catObj.seo?.description || '';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE}/catalogue` },
      { '@type': 'ListItem', position: 3, name: catObj.name, item: `${SITE}/catalogue/${category}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <Header active="products" />
      <section className="list-head">
        <div className="container">
          <nav className="crumb">
            <a href="/">Home</a><span>/</span><a href="/catalogue">Products</a>
          </nav>
          <h1 style={{ fontSize: 'clamp(28px,3.4vw,40px)', marginTop: 8 }}>{h1}</h1>
          {desc && <p style={{ color: 'var(--slate)', fontSize: 16, marginTop: 8, maxWidth: 680 }}>{desc}</p>}
        </div>
      </section>
      <Suspense
        fallback={
          <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--muted)' }}>
            Loading products…
          </div>
        }
      >
        <CatalogueClient
          categories={categories}
          products={products}
          useCases={ucFilters.options}
          initialCat={category}
          titleAs="h2"
        />
      </Suspense>
      <CTABand />
      <Footer />
    </>
  );
}
