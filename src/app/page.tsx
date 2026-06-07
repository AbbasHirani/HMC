import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrustBar from '@/components/TrustBar';
import BrandsStrip from '@/components/BrandsStrip';
import CTABand from '@/components/CTABand';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import ShowcaseCarousel from '@/components/ShowcaseCarousel';
import { IconCheck, IconWA, IconPhone, IconWrench } from '@/components/Icons';
import { SERVICES, CONTACT, WA } from '@/lib/data';
import { getCategories, getProducts } from '@/lib/queries';

export const revalidate = 60;

export default async function HomePage() {
  const [categories, allProducts] = await Promise.all([
    getCategories().catch(() => []),
    getProducts().catch(() => []),
  ]);

  const featured = allProducts.filter(p => p.featured).slice(0, 8);
  const displayProducts = featured.length >= 4 ? featured : allProducts.slice(0, 8);

  return (
    <>
      <Header active="home" />

      {/* HERO */}
      <section className="heroB">
        <div className="container">
          <div className="grid">
            <div className="copy">
              <span className="eyebrow">Pumps · Water Systems · Industrial Supply</span>
              <h1>The right equipment, <em>backed by service.</em></h1>
              <p className="sub">
                Chennai&rsquo;s single source for water pumps, RO &amp; filtration, fountains and hydraulic equipment — supplied to spec, with workshop repair &amp; servicing available at our Parrys shop.
              </p>
              <div className="h-cta">
                <Link className="btn btn-primary btn-lg" href="/catalogue">Browse the catalogue</Link>
                <a className="btn btn-ghost btn-lg" href={WA} target="_blank" rel="noopener noreferrer">Enquire on WhatsApp</a>
              </div>
              <div className="hstats">
                <div><b>{allProducts.length || '70'}<em>+</em></b><span>Products</span></div>
                <div><b>{categories.length || '6'}</b><span>Categories</span></div>
                <div><b>Since&nbsp;&apos;08</b><span>In the trade</span></div>
              </div>
            </div>

            <div className="visual" style={{ position: 'relative' }}>
              <div className="float-spec">
                <IconCheck />
                <div>
                  <b>Genuine brands</b>
                  <span>Kent · Aquaguard · CRI</span>
                </div>
              </div>
              <ShowcaseCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section style={{ padding: 0, marginTop: -1 }}>
        <div className="container" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <TrustBar />
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="section" id="categories">
          <div className="container">
            <div className="secline">
              <div className="sec-head">
                <span className="eyebrow">Browse by category</span>
                <h2>Everything you need — pumps, filters, fountains &amp; more</h2>
              </div>
              <Link className="btn btn-ghost" href="/catalogue">View all products</Link>
            </div>
            <div className="cat6-grid" style={{ marginTop: 40 }}>
              {categories.map(cat => (
                <CategoryCard key={cat.slug} cat={cat} />
              ))}
            </div>
            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13.5, fontWeight: 600, marginTop: 26 }}>
              Tap any card to explore its sub-categories &amp; products
            </p>
          </div>
        </section>
      )}

      {/* FEATURED */}
      {displayProducts.length > 0 && (
        <section className="section" style={{ background: 'var(--navy)' }}>
          <div className="container">
            <div className="secline">
              <div className="sec-head">
                <span className="eyebrow" style={{ color: '#ff9c75' }}>Best sellers</span>
                <h2 style={{ color: '#fff' }}>Featured products</h2>
              </div>
              <Link className="btn btn-ghost-light" href="/catalogue">View all</Link>
            </div>
            <div className="prod-grid" style={{ marginTop: 38 }}>
              {displayProducts.map(p => (
                <ProductCard key={p.slug} p={p} dark />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SERVICES */}
      <section className="section" id="services">
        <div className="container">
          <div className="sec-head">
            <span className="eyebrow">Beyond supply</span>
            <h2>Repair, reconditioning &amp; maintenance</h2>
            <p>We keep your equipment running — pumps, filters, compressors and hydraulic systems serviced by our own team.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 18, marginTop: 40 }}>
            {SERVICES.map((s, i) => (
              <div className="svc-card" key={i}>
                <span className="trust-ic"><IconWrench /></span>
                <h3>{s.name}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT & BRANDS */}
      <section className="section" id="about" style={{ background: 'var(--paper)', borderTop: '1px solid var(--line)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
            <div>
              <span className="eyebrow">About us</span>
              <h2 style={{ fontSize: 'clamp(26px,3vw,36px)', marginTop: 14 }}>A trusted name in Chennai&rsquo;s hardware trade</h2>
              <p style={{ color: 'var(--slate)', fontSize: 16, lineHeight: 1.7, marginTop: 16 }}>
                Hirani Marketing Combines supplies pumps, water-treatment systems, fountains and industrial equipment to homes, businesses and plants across Tamil Nadu.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 26, flexWrap: 'wrap' }}>
                <a className="btn btn-navy" href={CONTACT.phoneHref}><IconPhone />Call us</a>
                <Link className="btn btn-ghost" href="/catalogue">See the catalogue</Link>
              </div>
            </div>
            <div className="ph" data-label="Workshop / storefront photo" style={{ height: 330 }} />
          </div>
          <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--muted)', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', margin: '54px 0 18px', textAlign: 'center' }}>
            Trusted brands we carry
          </p>
          <BrandsStrip />
        </div>
      </section>

      <CTABand />
      <Footer />
    </>
  );
}
