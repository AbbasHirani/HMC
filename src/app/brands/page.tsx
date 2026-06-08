import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CTABand from '@/components/CTABand';
import Link from 'next/link';
import { getBrands, getProducts } from '@/lib/queries';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Brands — Hirani Marketing Combines',
  description: 'Browse products by brand — Kent, Aquaguard, Grundfos, Kirloskar, CRI, Crompton and more at Hirani Marketing Combines, Chennai.',
};

export default async function BrandsPage() {
  const [allBrands, allProducts] = await Promise.all([
    getBrands().catch(() => []),
    getProducts().catch(() => []),
  ]);

  const brandsWithCount = allBrands.map(b => ({
    ...b,
    count: allProducts.filter(p => p.brand?.toLowerCase() === b.slug).length,
  }));

  return (
    <>
      <Header active="products" />

      <section className="list-head">
        <div className="container">
          <nav className="crumb">
            <Link href="/">Home</Link><span>/</span>
            <b>Brands</b>
          </nav>
          <h1 style={{ fontSize: 'clamp(28px,3.4vw,40px)', marginTop: 14 }}>Shop by brand</h1>
          <p style={{ color: 'var(--slate)', fontSize: 16, marginTop: 10, maxWidth: 600 }}>
            We stock genuine products from the most trusted names in pumps and water systems.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
            {brandsWithCount.map(b => (
              <Link
                key={b.slug}
                href={`/brand/${b.slug}`}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 10, padding: '32px 20px', borderRadius: 14,
                  border: '1.5px solid var(--line)', background: '#fff',
                  textDecoration: 'none', transition: 'box-shadow 0.18s, border-color 0.18s',
                }}
              >
                {b.logoUrl
                  ? <img src={b.logoUrl} alt={b.name} style={{ height: 48, maxWidth: 120, objectFit: 'contain' }} />
                  : <span style={{ fontSize: 24, fontFamily: 'var(--font-head)', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>{b.name}</span>
                }
                <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>
                  {b.count > 0 ? `${b.count} product${b.count !== 1 ? 's' : ''}` : 'Coming soon'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTABand />
      <Footer />
    </>
  );
}
