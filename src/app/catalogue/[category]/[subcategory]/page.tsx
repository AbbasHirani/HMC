import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CTABand from '@/components/CTABand';
import CatalogueClient from '../../CatalogueClient';
import { getCategories, getProducts, getUseCaseFilters } from '@/lib/queries';
import { jsonLd } from '@/lib/jsonLd';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hiranimarketing.vercel.app';

export const revalidate = 60;

type Props = { params: Promise<{ category: string; subcategory: string }> };

export async function generateStaticParams() {
  const categories = await getCategories().catch(() => []);
  return categories.flatMap(c =>
    c.subs.map(s => ({ category: c.slug, subcategory: s.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, subcategory } = await params;
  const categories = await getCategories().catch(() => []);
  const catObj = categories.find(c => c.slug === category);
  if (!catObj) return { title: 'Category Not Found' };
  const subObj = catObj.subs.find(s => s.slug === subcategory);
  if (!subObj) return { title: 'Sub-category Not Found' };

  // Use admin-configured SEO title/description; fall back to auto-generated values.
  const suffix = ' | Hirani Marketing Combines';
  const base = `${subObj.name} in Chennai`;
  const autoTitle = (base + suffix).length <= 60 ? base + suffix : base;
  const title = subObj.seo?.title || autoTitle;
  const description = subObj.seo?.description || subObj.blurb || catObj.teaser || '';
  const keywords = subObj.seo?.keywords || catObj.seo?.keywords || undefined;

  return {
    title: { absolute: title },
    description,
    keywords: keywords || undefined,
    alternates: { canonical: `/catalogue/${category}/${subcategory}` },
    openGraph: {
      title,
      description,
      url: `/catalogue/${category}/${subcategory}`,
      type: 'website',
    },
  };
}

export default async function SubcategoryPage({ params }: Props) {
  const { category, subcategory } = await params;

  const [categories, products, ucFilters] = await Promise.all([
    getCategories().catch(() => []),
    getProducts().catch(() => []),
    getUseCaseFilters(),
  ]);

  const catObj = categories.find(c => c.slug === category);
  if (!catObj) notFound();
  const subObj = catObj.subs.find(s => s.slug === subcategory);
  if (!subObj) notFound();

  for (const p of products) {
    p.ucSlugs = ucFilters.byProduct.get(p._id) ?? [];
  }

  const h1 = `${subObj.name} in Chennai`;
  const desc = subObj.blurb || subObj.seo?.description || catObj.teaser || catObj.seo?.description || '';

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Products', item: `${SITE}/catalogue` },
      { '@type': 'ListItem', position: 3, name: catObj.name, item: `${SITE}/catalogue/${category}` },
      { '@type': 'ListItem', position: 4, name: subObj.name, item: `${SITE}/catalogue/${category}/${subcategory}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
      <Header active="products" />
      <section className="list-head">
        <div className="container">
          <nav className="crumb">
            <a href="/">Home</a><span>/</span><a href="/catalogue">Products</a><span>/</span><a href={`/catalogue/${category}`}>{catObj.name}</a>
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
          initialSub={subcategory}
          titleAs="h2"
        />
      </Suspense>
      <CTABand />
      <Footer />
    </>
  );
}
