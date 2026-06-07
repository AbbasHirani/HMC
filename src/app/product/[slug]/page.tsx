import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductClient from './ProductClient';
import { findProductBySlug, getAllProductSlugs } from '@/lib/queries';

export const revalidate = 60;

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
  if (!p) return { title: 'Product — Hirani Marketing Combines' };
  return { title: `${p.name} — Hirani Marketing Combines`, description: p.desc };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await findProductBySlug(slug).catch(() => undefined);
  if (!product) notFound();
  return (
    <>
      <Header active="products" />
      <ProductClient product={product!} />
      <Footer />
    </>
  );
}
