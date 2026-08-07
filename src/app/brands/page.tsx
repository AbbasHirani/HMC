import type { Metadata } from 'next';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CTABand from '@/components/CTABand';
import Link from 'next/link';
import { getBrands, getProducts } from '@/lib/queries';
import { jsonLd } from '@/lib/jsonLd';

export const revalidate = 60;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hiranimarketingcombines.in';

export const metadata: Metadata = {
  title: 'Pump & Water System Brands We Carry in Chennai',
  description: 'Browse products by brand — Kent, Aquaguard, Grundfos, Kirloskar, CRI, Crompton and more at Hirani Marketing Combines, Chennai.',
  alternates: { canonical: '/brands' },
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

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home',   item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: 'Brands', item: `${SITE}/brands` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
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
                  ? <Image src={b.logoUrl} alt={b.name} width={120} height={48} style={{ objectFit: 'contain' }} />
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
