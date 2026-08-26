import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrustBar from '@/components/TrustBar';
import BrandsStrip from '@/components/BrandsStrip';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import ShowcaseCarousel from '@/components/ShowcaseCarousel';
import SetDocLang from '@/components/SetDocLang';
import { IconCheck, IconPhone, IconWA, IconWrench } from '@/components/Icons';
import { CONTACT, WA } from '@/lib/data';
import { getCategories, getProducts } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'தண்ணீர் பம்புகள் & RO சிஸ்டம் — சென்னை பம்ப் கடை',
  description:
    '2008 முதல் சென்னையின் நம்பகமான பம்ப் கடை — தண்ணீர் பம்புகள், RO, நீரூற்றுகள், பிரஷர் வாஷர்கள். பாரிஸில் பழுது சேவையும் உண்டு.',
  alternates: {
    canonical: '/ta',
    languages: { en: '/', ta: '/ta', 'x-default': '/' },
  },
  openGraph: {
    title: 'ஹிரானி மார்க்கெட்டிங் கம்பைன்ஸ் — பம்புகள் & தண்ணீர் சிஸ்டம், சென்னை',
    description: '2008 முதல் சென்னையின் நம்பகமான பம்ப் கடை. பாரிஸில் பழுது பார்க்கும் சேவை.',
    url: '/ta',
    type: 'website',
    locale: 'ta_IN',
  },
};

export const revalidate = 60;

// Tamil mirror of the homepage. Product/category names stay in English —
// that is how Tamil Nadu trade actually reads them.
const SVCS_TA = [
  { name: 'பம்ப் பழுது & மறுசீரமைப்பு', desc: 'எல்லா வகை பம்புகளும் — வீட்டு, சப்மெர்சிபிள், தொழிற்சாலை பம்புகள் முழுமையாக பழுது பார்க்கப்படும்.' },
  { name: 'வாட்டர் ஃபில்டர் சர்வீஸ்', desc: 'RO மெம்பிரேன், UV லேம்ப், கார்ட்ரிட்ஜ் மாற்றுதல் — வீடு மற்றும் வணிக சிஸ்டங்களுக்கு.' },
  { name: 'ஏர் கம்ப்ரசர் பழுது', desc: 'பிஸ்டன், பெல்ட்-டிரைவ் & ஸ்க்ரூ கம்ப்ரசர்கள் — ஓவர்ஹால் மற்றும் பராமரிப்பு.' },
  { name: 'ஹைட்ரோ டெஸ்ட் பம்ப் சர்வீஸ்', desc: 'பைப்லைன் டெஸ்டிங் & ஃபயர் சிஸ்டம் பம்புகள் — பழுது, சீல் & வால்வு மாற்றுதல்.' },
];

export default async function TamilHomePage() {
  const [categories, allProducts] = await Promise.all([
    getCategories().catch(() => []),
    getProducts().catch(() => []),
  ]);

  const featured = allProducts.filter(p => p.featured).slice(0, 8);
  const displayProducts = featured;

  return (
    <>
      <SetDocLang lang="ta" />
      <Header active="home" lang="ta" />
      <main>

      {/* HERO */}
      <section className="heroB">
        <div className="container">
          <div className="grid">
            <div className="copy">
              <span className="eyebrow">பம்புகள் · தண்ணீர் சிஸ்டம் · தொழிற்சாலை உபகரணங்கள்</span>
              <h1>சரியான உபகரணம், <em>சேவையுடன் சேர்த்து.</em></h1>
              <p className="sub">
                தண்ணீர் பம்புகள், RO &amp; வடிகட்டிகள், நீரூற்றுகள், ஹைட்ராலிக் உபகரணங்கள் — எல்லாம் ஒரே இடத்தில். பாரிஸ் கடையில் பழுது பார்க்கும் சேவையும் உண்டு.
              </p>
              <div className="h-cta">
                <Link className="btn btn-primary btn-lg" href="/catalogue">பொருட்களை பாருங்கள்</Link>
                <a className="btn btn-ghost btn-lg" href={WA} target="_blank" rel="noopener noreferrer">WhatsApp-ல் கேளுங்கள்</a>
              </div>
              <div className="hstats">
                <div><b>{allProducts.length || '70'}<em>+</em></b><span>பொருட்கள்</span></div>
                <div><b>{categories.length || '6'}</b><span>வகைகள்</span></div>
                <div><b>2008&nbsp;முதல்</b><span>இந்த துறையில்</span></div>
              </div>
            </div>

            <div className="visual" style={{ position: 'relative' }}>
              <div className="float-spec">
                <IconCheck />
                <div>
                  <b>ஒரிஜினல் பிராண்டுகள்</b>
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
          <TrustBar lang="ta" />
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="section" id="categories">
          <div className="container">
            <div className="secline">
              <div className="sec-head">
                <span className="eyebrow">வகை வாரியாக பாருங்கள்</span>
                <h2>பம்புகள், ஃபில்டர்கள், நீரூற்றுகள் — எல்லாம் இங்கே</h2>
              </div>
              <Link className="btn btn-ghost" href="/catalogue">அனைத்து பொருட்களும்</Link>
            </div>
            <div className="cat6-grid" style={{ marginTop: 40 }}>
              {categories.map(cat => (
                <CategoryCard key={cat.slug} cat={cat} />
              ))}
            </div>
            <p style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13.5, fontWeight: 600, marginTop: 26 }}>
              எந்த கார்டையும் தட்டி உள்ளே உள்ள வகைகளையும் பொருட்களையும் பாருங்கள்
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
                <span className="eyebrow" style={{ color: '#ff9c75' }}>அதிகம் விற்பனையாகும்</span>
                <h2 style={{ color: '#fff' }}>சிறப்பு பொருட்கள்</h2>
              </div>
              <Link className="btn btn-ghost-light" href="/catalogue">அனைத்தும்</Link>
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
            <span className="eyebrow">விற்பனைக்கு அப்பால்</span>
            <h2>பழுது பார்த்தல், மறுசீரமைப்பு &amp; பராமரிப்பு</h2>
            <p>பம்புகள், ஃபில்டர்கள், கம்ப்ரசர்கள் — உங்கள் உபகரணங்களை எங்கள் சொந்த டீம் சரி செய்கிறது.</p>
          </div>
          <div className="svc-grid" style={{ marginTop: 40 }}>
            {SVCS_TA.map((s, i) => (
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
              <span className="eyebrow">எங்களை பற்றி</span>
              <h2 style={{ fontSize: 'clamp(26px,3vw,36px)', marginTop: 14 }}>சென்னை ஹார்டுவேர் வியாபாரத்தில் நம்பகமான பெயர்</h2>
              <p style={{ color: 'var(--slate)', fontSize: 16, lineHeight: 1.7, marginTop: 16 }}>
                ஹிரானி மார்க்கெட்டிங் கம்பைன்ஸ் — வீடுகள், வணிகங்கள், தொழிற்சாலைகளுக்கு பம்புகள், தண்ணீர் சுத்திகரிப்பு சிஸ்டங்கள், நீரூற்றுகள் மற்றும் உபகரணங்களை தமிழ்நாடு முழுவதும் வழங்குகிறோம்.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 26, flexWrap: 'wrap' }}>
                <a className="btn btn-navy" href={CONTACT.phoneHref}><IconPhone />அழைக்கவும்</a>
                <Link className="btn btn-ghost" href="/catalogue">பொருட்களை பாருங்கள்</Link>
              </div>
            </div>
            <div className="about-img-wrap">
              <Image src="/shop.jpg" alt="ஹிரானி மார்க்கெட்டிங் கம்பைன்ஸ் — பாரிஸ் கடை" fill style={{ objectFit: 'cover', objectPosition: 'center' }} sizes="(max-width: 768px) 100vw, 50vw" />
            </div>
          </div>
          <p style={{ fontFamily: 'var(--font-head)', fontWeight: 700, color: 'var(--muted)', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', margin: '54px 0 18px', textAlign: 'center' }}>
            நாங்கள் விற்கும் நம்பகமான பிராண்டுகள்
          </p>
          <div className="brands-full-wrapper">
            <BrandsStrip />
          </div>
        </div>
      </section>

      {/* FIND US */}
      <section className="section" style={{ background: '#fff', borderTop: '1px solid var(--line)' }}>
        <div className="container">
          <div className="find-us-grid">
            <div>
              <span className="eyebrow">கடைக்கு வாருங்கள்</span>
              <h2 style={{ fontSize: 'clamp(24px,3vw,34px)', marginTop: 12 }}>எங்கள் முகவரி</h2>
              <p className="find-us-text">
                பம்புகள், தண்ணீர் சிஸ்டம், ஆலோசனை — பாரிஸ் கடைக்கு நேரில் வாருங்கள். பழுது பார்க்க உபகரணத்தையும் கொண்டு வரலாம்.
              </p>

              <div className="find-us-list">
                <div className="find-us-item">
                  <span className="fu-ic">📍</span>
                  <div>
                    <b>முகவரி</b>
                    <span>Old No.133 / New No.279, Thambu Chetty St,<br />TNEB ஆபீஸ் எதிரில், Parrys, George Town,<br />Chennai – 600001</span>
                  </div>
                </div>
                <div className="find-us-item">
                  <span className="fu-ic">📞</span>
                  <div>
                    <b>போன்</b>
                    <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
                  </div>
                </div>
                <div className="find-us-item">
                  <span className="fu-ic">✉️</span>
                  <div>
                    <b>மின்னஞ்சல்</b>
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
                >Google Maps-ல் பார்க்க</a>
                <a className="btn btn-ghost" href={CONTACT.phoneHref}><IconPhone />அழைக்கவும்</a>
              </div>
            </div>

            <div className="find-us-map">
              <iframe
                src="https://maps.google.com/maps?q=Hirani+Marketing+Combines+Parrys+Chennai&output=embed&hl=ta"
                width="100%"
                height="380"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="ஹிரானி மார்க்கெட்டிங் கம்பைன்ஸ் இருப்பிடம்"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30, flexWrap: 'wrap' }}>
              <div>
                <h2>உங்கள் தேவையை சொல்லுங்கள்</h2>
                <p>சரியான பம்பையும் விலையையும் அன்றே சொல்கிறோம்.</p>
              </div>
              <div className="cta-band-btns">
                <a className="btn btn-primary btn-lg" href={CONTACT.phoneHref}><IconPhone />இப்போது அழைக்கவும்</a>
                <a className="btn btn-ghost-light btn-lg" href={WA} target="_blank" rel="noopener noreferrer"><IconWA />WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      </main>
      <Footer lang="ta" />
    </>
  );
}
