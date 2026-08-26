import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CTABand from '@/components/CTABand';
import { getCategories } from '@/lib/queries';
import { CONTACT, WA } from '@/lib/data';
import { IconPhone, IconWA, IconSearch } from '@/components/Icons';

export const metadata: Metadata = {
  title: { absolute: 'Page not found | Hirani Marketing Combines' },
  description: 'That page could not be found. Browse our pumps, RO systems and industrial equipment, or get in touch with our Parrys, Chennai store.',
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  // Never let a database problem break the 404 page itself — an empty list
  // still renders a useful page.
  const categories = await getCategories().catch(() => []);

  return (
    <>
      <Header />
      <main>

      <section className="section" style={{ paddingTop: 64, paddingBottom: 48 }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <span className="eyebrow">Error 404</span>
          <h1 style={{ fontSize: 'clamp(30px,4vw,46px)', marginTop: 12, lineHeight: 1.15 }}>
            We couldn&rsquo;t find that page
          </h1>
          <p style={{ color: 'var(--slate)', fontSize: 16.5, lineHeight: 1.7, marginTop: 14, maxWidth: 560 }}>
            The link may be out of date, or the product may have been renamed or
            withdrawn. Everything we stock is in the catalogue — or call us and
            we&rsquo;ll point you straight to it.
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <Link className="btn btn-primary btn-lg" href="/catalogue">
              <IconSearch />
              Browse the catalogue
            </Link>
            <a className="btn btn-ghost btn-lg" href={CONTACT.phoneHref}>
              <IconPhone />
              {CONTACT.phone}
            </a>
            <a className="btn btn-ghost btn-lg" href={WA} target="_blank" rel="noopener noreferrer">
              <IconWA />
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="section" style={{ background: 'var(--paper)', borderTop: '1px solid var(--line)', paddingTop: 48 }}>
          <div className="container" style={{ maxWidth: 760 }}>
            <p style={{
              fontFamily: 'var(--font-head)', fontWeight: 800, color: 'var(--muted)',
              fontSize: 11.5, letterSpacing: '.14em', textTransform: 'uppercase', margin: '0 0 18px',
            }}>
              Or jump to a category
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {categories.map(c => (
                <Link
                  key={c.slug}
                  href={`/catalogue/${c.slug}`}
                  style={{
                    padding: '9px 16px', borderRadius: 999, background: '#fff',
                    border: '1.5px solid var(--line)', color: 'var(--navy)',
                    fontSize: 13.5, fontWeight: 700, textDecoration: 'none',
                  }}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <CTABand />
      </main>
      <Footer />
    </>
  );
}
