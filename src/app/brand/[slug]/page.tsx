import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CTABand from '@/components/CTABand';
import ProductCard from '@/components/ProductCard';
import { getBrands, getProducts } from '@/lib/queries';
import Link from 'next/link';

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brands = await getBrands().catch(() => []);
  const brand = brands.find(b => b.slug === slug);
  if (!brand) return {};
  return {
    title: `${brand.name} Products — Hirani Marketing Combines`,
    description: `Browse all ${brand.name} pumps, water systems and equipment at Hirani Marketing Combines, Chennai.`,
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

  return (
    <>
      <Header active="products" />

      <section className="list-head">
        <div className="container">
          <nav className="crumb">
            <Link href="/">Home</Link><span>/</span>
            <Link href="/brands">Brands</Link><span>/</span>
            <b>{brand.name}</b>
          </nav>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 14 }}>
            {brand.logoUrl && <img src={brand.logoUrl} alt={brand.name} style={{ height: 48, objectFit: 'contain' }} />}
            <h1 style={{ fontSize: 'clamp(28px,3.4vw,40px)' }}>{brand.name}</h1>
          </div>
          <p style={{ color: 'var(--slate)', fontSize: 16, marginTop: 10, maxWidth: 600 }}>
            Browse all {brand.name} products available at Hirani Marketing Combines, Chennai.
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
