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

export const metadata: Metadata = {
  title: 'Water Pumps, RO Systems & Industrial Equipment in Chennai',
  description: 'Shop water pumps, RO & filtration systems, fountains, pressure washers, air compressors and hydraulic equipment in Chennai. 70+ products from Kent, CRI, Grundfos, Kirloskar and more. Workshop repair at Parrys.',
  // All filtered views (?cat=, ?sub=, ?brand=, ?uc=) serve this same page —
  // consolidate them onto the clean URL.
  alternates: { canonical: '/catalogue' },
};

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
