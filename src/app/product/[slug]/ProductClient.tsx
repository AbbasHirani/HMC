'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/data';
import { WA, CONTACT } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import QuoteModal from '@/components/QuoteModal';
import RecentlyViewed from '@/components/RecentlyViewed';
import ImageZoom from './ImageZoom';
import { IconPhone, IconWA, IconWrench, IconCheck, IconTruck, IconArrow } from '@/components/Icons';

const THUMB_LABELS = ['View 1', 'View 2', 'Detail', 'In use'];

interface Props {
  product: Product;
  related?: Product[];
  popular?: Product[];
}

// Fire-and-forget click log so WhatsApp/Call taps show up in the admin inbox.
function logClick(source: 'whatsapp' | 'call', p: Product) {
  try {
    fetch('/api/enquiries', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productName: p.name, productSlug: p.slug, source }),
    }).catch(() => null);
  } catch { /* never block the navigation */ }
}

export default function ProductClient({ product: p, related = [], popular = [] }: Props) {
  const cn = p.catName || p.cat;
  const waLink = WA + encodeURIComponent(`${p.name} (${cn})`);
  const [activeThumb, setActiveThumb] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Record this product in the visitor's "recently viewed" list (localStorage).
  useEffect(() => {
    try {
      const entry = { slug: p.slug, name: p.name, image: p.images?.[0]?.url ?? null, price: p.price, ts: Date.now() };
      const list: typeof entry[] = JSON.parse(localStorage.getItem('hmc_recent') ?? '[]');
      const next = [entry, ...list.filter(e => e.slug !== p.slug)].slice(0, 8);
      localStorage.setItem('hmc_recent', JSON.stringify(next));
    } catch { /* localStorage unavailable */ }
  }, [p.slug, p.name, p.price, p.images]);

  const mainImage = p.images?.[activeThumb]?.url ?? p.images?.[0]?.url;
  // Admin-set alt text wins; otherwise auto-generate from product name.
  const imgAlt = (i: number) =>
    p.images?.[i]?.alt
    || (i === 0 ? (p.brandName ? `${p.name} by ${p.brandName}` : p.name) : `${p.name} — view ${i + 1}`);
  const specRows = [
    ['Category', cn],
    ['Product type', p.subName],
    ...Object.entries(p.specs ?? {}),
  ];
  const thumbs = p.images?.length
    ? p.images
    : THUMB_LABELS.map(() => ({ url: '', publicId: '' }));

  return (
    <>
      <section className="section" style={{ paddingTop: 26, paddingBottom: 0 }}>
        <div className="container">
          <nav className="crumb">
            <Link href="/">Home</Link><span>/</span>
            <Link href="/catalogue">Products</Link><span>/</span>
            <Link href={`/catalogue?cat=${p.cat}`}>{cn}</Link><span>/</span>
            <b>{p.name}</b>
          </nav>

          <div className="pd">
            <div className="pd-media">
              <div className="main" style={{ position: 'relative' }}>
                {mainImage
                  ? <ImageZoom
                      src={mainImage}
                      alt={imgAlt(activeThumb)}
                      height="100%"
                      allImages={p.images ?? []}
                      activeIndex={activeThumb}
                      onIndexChange={setActiveThumb}
                    />
                  : <div className="ph" data-label={p.name} style={{ height: '100%', borderRadius: 0 }} />
                }
                <span className="img-count">{activeThumb + 1} / {thumbs.length}</span>
              </div>
              <div className="thumbs">
                {thumbs.map((img, i) => (
                  <div key={i} className={`thumb-ph${i === activeThumb ? ' active' : ''}`} onClick={() => setActiveThumb(i)}>
                    {img.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img.url} alt={imgAlt(i)} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                    ) : (
                      <div className="ph" data-label={THUMB_LABELS[i] ?? `View ${i + 1}`} style={{ height: '100%', borderRadius: 0 }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pd-info">
              {p.tag && (
                <span className={`pd-badge ${p.tag.toLowerCase().includes('popular') ? 'popular' : 'seller'}`}>{p.tag}</span>
              )}

              <h1>{p.name}</h1>
              {p.brand && (
                <p style={{ fontSize: 13.5, color: 'var(--slate)', marginTop: 6, fontWeight: 500 }}>
                  by <a href={`/brand/${p.brand}`} style={{ color: 'var(--navy)', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3 }}>{p.brandName ?? p.brand}</a>
                </p>
              )}

              <div className="pd-price-box">
                <div className="pd-price-row">
                  <div className={`pp${!p.price ? ' req' : ''}`}>
                    {p.price
                      ? <><small>Starting from</small><b>₹{p.price.toLocaleString('en-IN')}</b></>
                      : <><small>Pricing</small><b>On request</b></>}
                  </div>
                </div>
                <p className="pd-price-note">Prices vary with capacity, material &amp; specification. Contact us for an exact quote.</p>
              </div>

              <div className="pd-cta">
                <a className="btn btn-primary btn-lg" href={CONTACT.phoneHref} onClick={() => logClick('call', p)}><IconPhone />Call to order</a>
                <a className="btn btn-wa btn-lg" href={waLink} target="_blank" rel="noopener noreferrer" onClick={() => logClick('whatsapp', p)}><IconWA />Enquire on WhatsApp</a>
                <button className="btn btn-ghost btn-lg" onClick={() => setShowModal(true)}>Get exact quote</button>
              </div>

              <a
                href={`/api/products/${p.slug}/pdf`}
                download
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  marginTop: 12, padding: '9px 18px',
                  border: '1.5px solid var(--line)', borderRadius: 10,
                  fontSize: 13.5, fontWeight: 600, color: 'var(--navy)',
                  textDecoration: 'none', background: 'var(--paper)',
                  transition: 'border-color .18s, background .18s',
                  width: 'fit-content',
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--navy)'; el.style.background = '#fff'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--line)'; el.style.background = 'var(--paper)'; }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download product sheet (PDF)
              </a>

              <div className="pd-sec-title">About this product</div>
              <p style={{ color: 'var(--slate)', fontSize: 15.5, lineHeight: 1.8, marginTop: 14, letterSpacing: '-0.005em' }}>{p.desc}</p>

              {p.brand && (
                <a
                  href={`/brand/${p.brand}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 20,
                    marginTop: 22, padding: '18px 22px',
                    border: '1.5px solid var(--line)',
                    borderRadius: 14,
                    background: 'var(--paper)',
                    textDecoration: 'none',
                    transition: 'border-color .18s, box-shadow .18s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'var(--navy)';
                    el.style.boxShadow = '0 4px 18px rgba(20,20,63,.09)';
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.borderColor = 'var(--line)';
                    el.style.boxShadow = 'none';
                  }}
                >
                  {p.brandLogo && (
                    <div style={{
                      width: 88, height: 56, flexShrink: 0,
                      background: '#fff', borderRadius: 10,
                      border: '1px solid var(--line)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 10,
                    }}>
                      <img src={p.brandLogo} alt={p.brandName ?? p.brand} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>Brand</span>
                    <span style={{ display: 'block', fontSize: 16, fontWeight: 800, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>{p.brandName ?? p.brand}</span>
                    <span style={{ display: 'block', fontSize: 12.5, color: 'var(--orange)', fontWeight: 600, marginTop: 3 }}>View all {p.brandName ?? p.brand} products →</span>
                  </div>
                </a>
              )}

              <div className="pd-sec-title">Key specifications</div>
              <table className="spec-table">
                <tbody>
                  {specRows.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}
                </tbody>
              </table>

              {p.useCases && p.useCases.length > 0 && (
                <>
                  <div className="pd-sec-title">Common applications</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                    {p.useCases.map(uc => (
                      <span
                        key={uc}
                        style={{
                          display: 'inline-block',
                          padding: '5px 14px',
                          borderRadius: 999,
                          background: 'rgba(20,20,63,.07)',
                          color: 'var(--navy)',
                          fontSize: 13,
                          fontWeight: 600,
                          border: '1px solid rgba(20,20,63,.12)',
                        }}
                      >
                        {uc}
                      </span>
                    ))}
                  </div>
                </>
              )}

              <div className="pd-why">
                {[
                  { icon: <IconCheck />, title: 'Genuine brands only', sub: 'We stock Kent, Grundfos, Kirloskar & other trusted names.' },
                  { icon: <IconWrench />, title: 'Workshop repair & service', sub: 'Drop your product at our Parrys shop — we repair and recondition.' },
                  { icon: <IconTruck />, title: 'Fast supply across TN', sub: 'Same-day dispatch available for in-stock items across Tamil Nadu.' },
                ].map((item, i) => (
                  <div className="pd-why-item" key={i}>
                    <span className="wi-ic">{item.icon}</span>
                    <div><b>{item.title}</b><span>{item.sub}</span></div>
                  </div>
                ))}
              </div>

              <div className="svc-strip">
                <div className="ss-left">
                  <div className="ss-ic"><IconWrench /></div>
                  <div>
                    <h3>Need repair or reconditioning?</h3>
                    <p>Drop your product at our Parrys shop — we repair and service pumps, filters and more.</p>
                  </div>
                </div>
                <Link className="btn btn-ghost" href="/services">See our services <IconArrow /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section" id="relSec">
          <div className="container">
            <div className="secline">
              <div className="sec-head">
                <span className="eyebrow">{p.subName}</span>
                <h2>You may also need</h2>
              </div>
              <Link className="btn btn-ghost" href={`/catalogue?cat=${p.cat}&sub=${p.sub}`}>View all</Link>
            </div>
            <div className="prod-grid" style={{ marginTop: 36 }}>
              {related.map(r => <ProductCard key={r.slug} p={r} />)}
            </div>
          </div>
        </section>
      )}

      {popular.length > 0 && (
        <section className="section" style={{ paddingTop: related.length > 0 ? 0 : undefined }}>
          <div className="container">
            <div className="sec-head">
              <span className="eyebrow">Popular right now</span>
              <h2>People also enquired about</h2>
            </div>
            <div className="prod-grid" style={{ marginTop: 36 }}>
              {popular.map(r => <ProductCard key={r.slug} p={r} />)}
            </div>
          </div>
        </section>
      )}

      <RecentlyViewed excludeSlug={p.slug} />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band" style={{ marginTop: related.length > 0 ? 0 : 40 }}>
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30, flexWrap: 'wrap' }}>
              <div>
                <h2>Not sure this is the right spec?</h2>
                <p>Send us your application and capacity — we&rsquo;ll confirm the correct model and quote the same day.</p>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a className="btn btn-primary btn-lg" href={CONTACT.phoneHref}><IconPhone />Call now</a>
                <a className="btn btn-ghost-light btn-lg" href={WA} target="_blank" rel="noopener noreferrer"><IconWA />WhatsApp us</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="pd-sticky">
        <a className="btn btn-primary" href={CONTACT.phoneHref} onClick={() => logClick('call', p)}><IconPhone />Call to order</a>
        <a className="btn btn-wa" href={waLink} target="_blank" rel="noopener noreferrer" onClick={() => logClick('whatsapp', p)}><IconWA />WhatsApp</a>
      </div>

      {showModal && (
        <QuoteModal productName={p.name} productCat={`${p.subName} · ${cn}`} productSlug={p.slug} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
