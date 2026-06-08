import { Suspense } from 'react';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CTABand from '@/components/CTABand';
import CatalogueClient from './CatalogueClient';
import { getCategories, getProducts } from '@/lib/queries';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Water Pumps, RO Systems & Industrial Equipment in Chennai',
  description: 'Shop water pumps, RO & filtration systems, fountains, pressure washers, air compressors and hydraulic equipment in Chennai. 70+ products from Kent, CRI, Grundfos, Kirloskar and more. Workshop repair at Parrys.',
};

export default async function CataloguePage() {
  const [categories, products] = await Promise.all([
    getCategories().catch(() => []),
    getProducts().catch(() => []),
  ]);

  return (
    <>
      <Header active="products" />
      <Suspense fallback={<div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--muted)' }}>Loading products…</div>}>
        <CatalogueClient categories={categories} products={products} />
      </Suspense>
      <CTABand />
      <Footer />
    </>
  );
}
