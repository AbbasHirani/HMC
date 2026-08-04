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
import { jsonLd } from '@/lib/jsonLd';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hiranimarketing.vercel.app';

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Where can I buy a hydro test pump in Chennai?',
      acceptedAnswer: { '@type': 'Answer', text: 'Hirani Marketing Combines stocks hand-operated, belt-driven and motorised hydrostatic test pumps at our Parrys, George Town shop in Chennai. Visit us at 279, Thambu Chetty Street or call for pricing.' },
    },
    {
      '@type': 'Question',
      name: 'Do you supply chemical pumps and dosing pumps in Chennai?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes — we stock seal-less magnetic drive chemical pumps, SS316 centrifugal chemical pumps, and chemical dosing pumps for acids, alkalis and corrosive fluids used in industrial plants and laboratories across Tamil Nadu.' },
    },
    {
      '@type': 'Question',
      name: 'Which RO water purifier brands are available at Hirani Marketing Combines?',
      acceptedAnswer: { '@type': 'Answer', text: 'We carry domestic and commercial RO water purifiers from Kent, Aquaguard and other trusted brands, along with RO filter spares, membrane replacements and filtration accessories at our Parrys store.' },
    },
    {
      '@type': 'Question',
      name: 'Do you repair hydro test pumps and industrial pumps?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes — our in-house workshop at Parrys, George Town repairs, reconditions and overhauls hydro test pumps, chemical pumps, centrifugal pumps, submersible pumps and pressure washers. Drop in for a same-day inspection and quote.' },
    },
    {
      '@type': 'Question',
      name: 'What industrial pump brands does Hirani Marketing Combines carry?',
      acceptedAnswer: { '@type': 'Answer', text: 'We are authorised dealers for CRI, Kirloskar, Grundfos, Crompton, Kent, Aquaguard and specialist brands. Our range covers centrifugal pumps, submersible pumps, chemical pumps, hydro test pumps and high pressure washers for industrial, commercial and residential use in Chennai.' },
    },
  ],
};

export const metadata: Metadata = {
  title: { absolute: 'Industrial Pump Dealer Chennai | Hirani Marketing Combines' },
  description:
    "Buy hydro test pumps, chemical pumps, RO systems & industrial water pumps in Parrys, Chennai. Authorised dealer since 2008 — sales, repair & workshop service.",
  keywords: [
    'water pump dealer Chennai', 'hydro test pump Chennai', 'chemical pump Chennai',
    'industrial pump dealer Parrys', 'RO system Chennai', 'magnetic drive pump Chennai',
    'hydraulic test pump Chennai', 'pump supplier George Town', 'Hirani Marketing Combines',
  ],
  alternates: {
    canonical: '/',
    languages: { en: '/', ta: '/ta', 'x-default': '/' },
  },
  openGraph: {
    title: 'Industrial Pump Dealer Chennai | Hirani Marketing Combines',
    description: "Chennai's authorised dealer for hydro test pumps, chemical pumps, RO systems and industrial water pumps since 2008. Sales, service and pump repair at Parrys, George Town.",
    url: '/',
    type: 'website',
    // No `images` override here — lets the branded opengraph-image.tsx
    // file convention render for this route instead of the static logo.
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }} />
      <Header active="home" />

      {/* HERO */}
      <section className="heroB">
        <div className="container">
          <div className="grid">
            <div className="copy">
              <span className="eyebrow">Pumps · Water Systems · Industrial Supply</span>
              <h1>Water Pumps, Hydro Test Pumps, Chemical Pumps &amp; RO Systems in Chennai</h1>
              <p className="sub">
                Hirani Marketing Combines — authorised dealer in Parrys, George Town since 2008. We stock hydro test pumps, seal-less chemical pumps, industrial water pumps, RO water purifiers and pressure washers. Sales, repair and pump reconditioning under one roof.
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

      {/* FOCUS PRODUCTS */}
      <section className="section" style={{ background: 'var(--paper)', borderTop: '1px solid var(--line)' }}>
        <div className="container">
          <div className="sec-head">
            <span className="eyebrow">What we specialise in</span>
            <h2>Hydro Test Pumps, Chemical Pumps, RO Systems &amp; Industrial Pumps in Chennai</h2>
            <p style={{ maxWidth: 620 }}>Authorised dealer and repair workshop for the four most in-demand industrial pump categories in Tamil Nadu.</p>
          </div>
          <div className="focus-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, marginTop: 40 }}>

            <Link href="/catalogue/hydraulic-test-pumps" className="focus-card">
              <h3>Hydro Test Pumps</h3>
              <p>Hand-operated, belt-driven and engine-driven hydrostatic test pumps for pipeline pressure testing, boiler testing and leak detection. Manual and motorised models available in Chennai.</p>
              <span className="focus-card-link">Browse hydro test pumps →</span>
            </Link>

            <Link href="/catalogue/chemical-pumps" className="focus-card">
              <h3>Chemical Pumps</h3>
              <p>Seal-less magnetic drive chemical pumps, SS316 centrifugal pumps and chemical dosing pumps for safe handling of acids, alkalis and corrosive fluids in industrial plants and laboratories.</p>
              <span className="focus-card-link">Browse chemical pumps →</span>
            </Link>

            <Link href="/catalogue/water-pumps" className="focus-card">
              <h3>Industrial &amp; Water Pumps</h3>
              <p>Centrifugal pumps, submersible pumps, pressure booster pumps and monoblock pumps from CRI, Kirloskar, Grundfos and Crompton. For residential, commercial and industrial water supply in Tamil Nadu.</p>
              <span className="focus-card-link">Browse water pumps →</span>
            </Link>

            <Link href="/catalogue" className="focus-card">
              <h3>RO Systems &amp; Water Filters</h3>
              <p>Commercial RO water purifiers, domestic RO systems, water filter spares and filtration equipment. Kent, Aquaguard and branded RO systems available at our Parrys store in Chennai.</p>
              <span className="focus-card-link">Browse RO systems →</span>
            </Link>

          </div>
        </div>
      </section>

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

      {/* FAQ */}
      <section className="section" style={{ background: 'var(--paper)', borderTop: '1px solid var(--line)' }}>
        <div className="container" style={{ maxWidth: 800 }}>
          <div className="sec-head" style={{ marginBottom: 36 }}>
            <span className="eyebrow">Common questions</span>
            <h2>Frequently Asked Questions</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              {
                q: 'Where can I buy a hydro test pump in Chennai?',
                a: 'Hirani Marketing Combines stocks hand-operated, belt-driven and motorised hydrostatic test pumps at our Parrys, George Town shop in Chennai. We carry manual hydro test pumps for low-pressure pipeline testing and motorised models for high-pressure applications. Visit us at 279, Thambu Chetty Street, or call for availability and pricing.',
              },
              {
                q: 'Do you supply chemical pumps and dosing pumps in Chennai?',
                a: 'Yes — we stock seal-less magnetic drive chemical pumps, SS316 centrifugal chemical pumps, and chemical dosing pumps suitable for acids, alkalis and corrosive fluids. Our chemical pump range is used in industrial plants, water treatment facilities and laboratories across Tamil Nadu. Visit our catalogue or call for a quote.',
              },
              {
                q: 'Which RO water purifier brands are available at Hirani Marketing Combines?',
                a: 'We carry domestic and commercial RO water purifiers from Kent, Aquaguard and other trusted brands, along with RO filter spares, membrane replacements and filtration accessories. Our Parrys store also provides RO servicing and filter replacement.',
              },
              {
                q: 'Do you repair hydro test pumps and industrial pumps?',
                a: 'Yes — our in-house workshop at Parrys, George Town handles pump repair, reconditioning and overhauling for hydro test pumps, chemical pumps, centrifugal pumps, submersible pumps and pressure washers. Drop your equipment in for a same-day inspection and quote.',
              },
              {
                q: 'What industrial pump brands does Hirani Marketing Combines carry?',
                a: 'We are authorised dealers for CRI, Kirloskar, Grundfos, Crompton, Kent, Aquaguard and several specialist brands. Our range covers centrifugal pumps, submersible pumps, pressure booster pumps, chemical pumps, high pressure washers and hydraulic test pumps for industrial, commercial and residential applications in Chennai.',
              },
            ].map(({ q, a }, i) => (
              <details key={i} style={{ borderBottom: '1px solid var(--line)', padding: '20px 0' }}>
                <summary style={{ fontWeight: 700, fontSize: 16, color: 'var(--navy)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  {q}
                  <span style={{ flexShrink: 0, fontSize: 20, fontWeight: 300, color: 'var(--muted)' }}>+</span>
                </summary>
                <p style={{ margin: '12px 0 0', color: 'var(--slate)', fontSize: 15, lineHeight: 1.7 }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CTABand />
      <Footer />
    </>
  );
}
