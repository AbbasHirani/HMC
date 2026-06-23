import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CTABand from '@/components/CTABand';
import CatalogueClient from '../../CatalogueClient';
import { getCategories, getProducts, getUseCaseFilters } from '@/lib/queries';

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
  const title = subObj.seo?.title || `${subObj.name} in Chennai | Hirani Marketing Combines`;
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

  // Attach use-case slugs so CatalogueClient can filter by them.
  for (const p of products) {
    p.ucSlugs = ucFilters.byProduct.get(p._id) ?? [];
  }

  return (
    <>
      <Header active="products" />
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
        />
      </Suspense>
      <CTABand />
      <Footer />
    </>
  );
}
