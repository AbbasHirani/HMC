import { Suspense } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CTABand from '@/components/CTABand';
import CatalogueClient from './CatalogueClient';
import { getCategories, getProducts } from '@/lib/queries';
import { sql } from '@/lib/db';

export const revalidate = 60;

/** All use cases + which products carry each, for the catalogue filter. */
async function getUseCaseFilters() {
  try {
    const rows = await sql`
      SELECT uc.slug, uc.name, puc.product_id
      FROM use_cases uc
      JOIN product_use_cases puc ON puc.use_case_id = uc.id
    `;
    const byProduct = new Map<string, string[]>();
    const options = new Map<string, string>();
    for (const r of rows) {
      options.set(r.slug as string, r.name as string);
      const list = byProduct.get(r.product_id as string) ?? [];
      list.push(r.slug as string);
      byProduct.set(r.product_id as string, list);
    }
    return {
      byProduct,
      options: [...options.entries()].map(([slug, name]) => ({ slug, name })).sort((a, b) => a.name.localeCompare(b.name)),
    };
  } catch {
    return { byProduct: new Map<string, string[]>(), options: [] };
  }
}

type Props = { searchParams: Promise<{ cat?: string; sub?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { cat, sub } = await searchParams;
  
  const categories = await getCategories().catch(() => []);
  const catObj = cat ? categories.find(c => c.slug === cat) : null;
  const subObj = sub && catObj ? catObj.subs.find(s => s.slug === sub) : null;

  const baseDesc = 'Shop water pumps, RO & filtration systems, fountains, pressure washers, air compressors and hydraulic equipment in Chennai. 70+ products from Kent, CRI, Grundfos, Kirloskar and more. Workshop repair at Parrys.';
  
  let title = 'Water Pumps, RO Systems & Industrial Equipment in Chennai';
  let description = baseDesc;
  let keywords = '';

  if (subObj) {
    title = subObj.seo?.title || `${subObj.name} in Chennai | Hirani Marketing Combines`;
    description = subObj.seo?.description || subObj.blurb || catObj?.teaser || baseDesc;
    keywords = subObj.seo?.keywords || catObj?.seo?.keywords || '';
  } else if (catObj) {
    title = catObj.seo?.title || `${catObj.name} in Chennai | Hirani Marketing Combines`;
    description = catObj.seo?.description || catObj.teaser || baseDesc;
    keywords = catObj.seo?.keywords || '';
  }
      
  const params = new URLSearchParams();
  if (cat) params.set('cat', cat);
  if (sub) params.set('sub', sub);
  const qs = params.toString() ? `?${params.toString()}` : '';

  return {
    title: { absolute: title },
    description,
    keywords: keywords || undefined,
    alternates: { canonical: `/catalogue${qs}` },
    openGraph: {
      title,
      description,
      url: `/catalogue${qs}`,
      type: 'website',
    },
  };
}

export default async function CataloguePage() {
  const [categories, products, ucFilters] = await Promise.all([
    getCategories().catch(() => []),
    getProducts().catch(() => []),
    getUseCaseFilters(),
  ]);

  // Attach use-case slugs so the client can filter by them.
  for (const p of products) {
    p.ucSlugs = ucFilters.byProduct.get(p._id) ?? [];
  }

  return (
    <>
      <Header active="products" />
      <Suspense fallback={<div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--muted)' }}>Loading products…</div>}>
        <CatalogueClient categories={categories} products={products} useCases={ucFilters.options} />
      </Suspense>
      <CTABand />
      <Footer />
    </>
  );
}
