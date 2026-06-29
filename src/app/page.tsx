import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
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

export const metadata: Metadata = {
  title: { absolute: 'Hirani Marketing Combines | Water Pumps, RO Systems & Industrial Supply in Chennai' },
  description:
    "Buy water pumps, pressure booster pumps, hydro test pumps, chemical pumps, high pressure washers, dosing pumps and RO systems in Parrys, Chennai. Hirani Marketing Combines offers sales, service and industrial pumping solutions.",
  alternates: {
    canonical: '/',
    languages: { en: '/', ta: '/ta', 'x-default': '/' },
  },
  openGraph: {
    title: 'Hirani Marketing Combines — Pumps & Water Systems, Chennai',
    description: "Chennai's trusted supplier of water pumps, RO systems, water purifiers, pressure washers and industrial equipment since 2008. Sales, service and pump repair in Parrys, George Town.",
    url: '/',
    type: 'website',
    images: [
      {
        url: '/logo-stacked.png',
        width: 1200,
        height: 630,
        alt: 'Hirani Marketing Combines Logo',
      },
    ],
  },
};

export const revalidate = 60;

export default async function HomePage() {
  const [categories, allProducts] = await Promise.all([
    getCategories().catch(() => []),
    getProducts().catch(() => []),
  ]);

  const featured = allProducts.filter(p => p.featured).slice(0, 8);
  const displayProducts = featured;

  return (
    <>
      <Header active="home" />

      {/* HERO */}
      <section className="heroB">
        <div className="container">
          <div className="grid">
            <div className="copy">
              <span className="eyebrow">Pumps · Water Systems · Industrial Supply</span>
              <h1>Hirani Marketing Combines – Water Pumps, RO Systems &amp; Industrial Equipment in Chennai</h1>
              <p className="sub">
                Trusted since 2008 — water purifiers, RO water purifiers, RO spares, water filters, industrial pumps and pressure washers available from our Parrys, George Town shop. Sales, service and pump repair under one roof.
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
              <ShowcaseCarousel categories={categories} />
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
            <div className="prod-grid prod-carousel" style={{ marginTop: 38 }}>
              {displayProducts.map((p) => (
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
          <div className="svc-grid" style={{ marginTop: 40 }}>
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
          <div className="about-grid">
            <div>
              <span className="eyebrow">About us</span>
              <h2 style={{ fontSize: 'clamp(26px,3vw,36px)', marginTop: 14 }}>What is Hirani Marketing Combines?</h2>
              <p style={{ color: 'var(--slate)', fontSize: 16, lineHeight: 1.7, marginTop: 16 }}>
                Hirani Marketing Combines is Chennai&rsquo;s leading pump and water-systems specialist. Since 2008, we have supplied and repaired industrial equipment, RO systems, and over 10,000 water pumps for homes, businesses, and manufacturing plants across Tamil Nadu.
              </p>
              <p style={{ color: 'var(--slate)', fontSize: 15.5, lineHeight: 1.7, marginTop: 12 }}>
                Our Parrys, George Town shop stocks water purifiers, RO water purifiers, water filters, RO spares, industrial pumps, pressure washers and hydraulic equipment. We also offer pump repair and reconditioning — drop your equipment in for a same-day inspection and quote.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 26, flexWrap: 'wrap' }}>
                <a className="btn btn-navy" href={CONTACT.phoneHref}><IconPhone />Call us</a>
                <Link className="btn btn-ghost" href="/catalogue">See the catalogue</Link>
              </div>
            </div>
            <div className="about-img-wrap">
              <Image src="/shop.jpg" alt="Hirani Marketing Combines — Parrys store" fill style={{ objectFit: 'cover', objectPosition: 'center' }} sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
          </div>
          </div>
          
          <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--muted)', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', margin: '54px 0 18px', textAlign: 'center' }}>
            Trusted brands we carry
          </p>
          <div className="brands-full-wrapper">
            <BrandsStrip />
          </div>
      </section>

      {/* FIND US */}
      <section className="section" style={{ background: '#fff', borderTop: '1px solid var(--line)' }}>
        <div className="container">
          <div className="find-us-grid">
            {/* Details */}
            <div>
              <span className="eyebrow">Visit our shop</span>
              <h2 style={{ fontSize: 'clamp(24px,3vw,34px)', marginTop: 12 }}>Find us here</h2>
              <p className="find-us-text">
                Drop by our Parrys store for pumps, water systems, and expert advice — or bring your equipment in for repair and servicing.
              </p>

              <div className="find-us-list">
                <div className="find-us-item">
                  <span className="fu-ic">📍</span>
                  <div>
                    <b>Address</b>
                    <span>Old No.133 / New No.279, Thambu Chetty St,<br />opposite TNEB office, Parrys, George Town,<br />Chennai – 600001</span>
                  </div>
                </div>
                <div className="find-us-item">
                  <span className="fu-ic">📞</span>
                  <div>
                    <b>Phone</b>
                    <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
                  </div>
                </div>
                <div className="find-us-item">
                  <span className="fu-ic">✉️</span>
                  <div>
                    <b>Email</b>
                    <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                  </div>
                </div>
              </div>

              <div className="find-us-cta">
                <a
                  className="btn btn-primary"
                  href="https://share.google/KeoILUOJjoljr4Pby"
                  target="_blank"
                  rel="noopener noreferrer"
                >View on Google Maps</a>
                <a className="btn btn-ghost" href={CONTACT.phoneHref}><IconPhone />Call us</a>
              </div>
            </div>

            {/* Map */}
            <div className="find-us-map">
              <iframe
                src="https://maps.google.com/maps?q=Hirani+Marketing+Combines+Parrys+Chennai&output=embed&hl=en"
                width="100%"
                height="380"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Hirani Marketing Combines location"
              />
            </div>
          </div>
        </div>
      </section>

      <CTABand />
      <Footer />
    </>
  );
}
