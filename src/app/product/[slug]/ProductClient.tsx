'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/data';
import { WA, CONTACT } from '@/lib/data';
import { cdn } from '@/lib/img';
import ReactMarkdown from 'react-markdown';
import ProductCard from '@/components/ProductCard';
import RecentlyViewed from '@/components/RecentlyViewed';
import ImageZoom from './ImageZoom';
import dynamic from 'next/dynamic';

const QuoteModal = dynamic(() => import('@/components/QuoteModal'), {
  ssr: false,
});
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
  const [waLink, setWaLink] = useState(WA + encodeURIComponent(`${p.name} (${cn})`));

  useEffect(() => {
    // window.location is only available after mount, so SSR renders the short
    // link and hydration upgrades it to the full one.
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setWaLink(WA + encodeURIComponent(`${p.name} (${cn})\n\nLink: ${window.location.origin}/product/${p.slug}`));
    }
  }, [p.name, cn, p.slug]);
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

  // Combine images and videos for the gallery
  type MediaItem = { type: 'image'; url: string; alt?: string } | { type: 'youtube' | 'cloudinary-video'; url: string; thumbUrl?: string };
  const imgs = (p.images ?? []).map(img => ({ type: 'image' as const, url: cdn(img.url), alt: img.alt }));
  const vids = (p.videos ?? []).map(vid => {
    let finalUrl = vid.url;
    let thumbUrl = '';
    if (vid.type === 'cloudinary') {
      // Ensure a playable extension is present
      if (!/\.(mp4|webm|mov|mkv)$/i.test(finalUrl)) {
        finalUrl += '.mp4';
      }
      thumbUrl = finalUrl.replace(/\.(mp4|webm|mov|mkv)$/i, '.jpg');
    } else if (vid.type === 'youtube') {
      // Normalise all YouTube URL formats to an embed URL
      let videoId = '';
      try {
        if (finalUrl.includes('youtu.be/')) {
          videoId = finalUrl.split('youtu.be/')[1]?.split('?')[0] ?? '';
        } else if (finalUrl.includes('youtube.com')) {
          videoId = new URL(finalUrl).searchParams.get('v') ?? '';
          // already an embed URL — extract from path
          if (!videoId && finalUrl.includes('/embed/')) {
            videoId = finalUrl.split('/embed/')[1]?.split('?')[0] ?? '';
          }
        }
      } catch { /* malformed URL – leave as-is */ }
      if (videoId) {
        finalUrl = `https://www.youtube.com/embed/${videoId}`;
        thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }
    return { type: vid.type === 'youtube' ? 'youtube' as const : 'cloudinary-video' as const, url: finalUrl, thumbUrl };
  });
  const media: MediaItem[] = [...imgs, ...vids];

  const activeMedia = media[activeThumb] ?? imgs[0] ?? null;

  // Admin-set alt text wins; otherwise auto-generate from product name.
  const imgAlt = (i: number) =>
    p.images?.[i]?.alt
    || (i === 0 ? (p.brandName ? `${p.name} by ${p.brandName}` : p.name) : `${p.name} — view ${i + 1}`);
  const specRows = [
    ['Category', cn],
    ['Product type', p.subName],
    ...Object.entries(p.specs ?? {}),
  ];

  return (
    <>
      <section className="section" style={{ paddingTop: 12, paddingBottom: 0 }}>
        <div className="container">
          <nav className="crumb">
            <Link href="/">Home</Link><span>/</span>
            <Link href="/catalogue">Products</Link><span>/</span>
            <Link href={`/catalogue/${p.cat}`}>{cn}</Link>
          </nav>

          <div className="pd">
            <div className="pd-media">
              <div className="main" style={{ position: 'relative' }}>
                {p.tag && (
                  <span
                    className={`pd-badge ${p.tag.toLowerCase().includes('popular') ? 'popular' : 'seller'}`}
                    style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, fontSize: 10, padding: '4px 10px', margin: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}
                  >
                    {p.tag}
                  </span>
                )}
                {activeMedia ? (
                  activeMedia.type === 'image' ? (
                    <ImageZoom
                      src={activeMedia.url}
                      alt={activeMedia.alt || imgAlt(activeThumb)}
                      height="100%"
                      allImages={imgs.map(i => ({ url: i.url }))}
                      activeIndex={Math.min(activeThumb, imgs.length - 1)}
                      onIndexChange={setActiveThumb}
                    />
                  ) : activeMedia.type === 'youtube' ? (
                    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                      <iframe
                        src={activeMedia.url}
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '12px' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        onError={(e) => {
                          // If YouTube embedding is disabled, show a fallback overlay
                          const iframe = e.currentTarget;
                          const parent = iframe.parentElement;
                          if (parent) {
                            iframe.style.display = 'none';
                            const fallback = parent.querySelector('.yt-fallback') as HTMLElement | null;
                            if (fallback) fallback.style.display = 'flex';
                          }
                        }}
                      />
                      {/* Shown only if iframe errors (embedding disabled by uploader) */}
                      <div className="yt-fallback" style={{ display: 'none', position: 'absolute', inset: 0, background: '#000', borderRadius: '12px', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                        {activeMedia.thumbUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={activeMedia.thumbUrl} alt="Video" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4, borderRadius: '12px' }} />
                        )}
                        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                          <p style={{ color: '#fff', marginBottom: 12, fontSize: 14 }}>This video cannot be embedded.</p>
                          <a href={activeMedia.url.replace('/embed/', '/watch?v=')} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ff0000', color: '#fff', padding: '10px 20px', borderRadius: 8, fontWeight: 600, textDecoration: 'none', fontSize: 14 }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                            Watch on YouTube
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <video
                      src={activeMedia.url}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000', borderRadius: '12px' }}
                      controls
                      autoPlay
                      muted
                      playsInline
                    />
                  )
                ) : <div className="ph" data-label={p.name} style={{ height: '100%', borderRadius: 0 }} />}
                <span className="img-count">{activeThumb + 1} / {media.length || THUMB_LABELS.length}</span>
              </div>
              <div className="thumbs">
                {media.length > 0 ? media.map((item, i) => (
                  <div key={i} className={`thumb-ph${i === activeThumb ? ' active' : ''}`} onClick={() => setActiveThumb(i)}>
                    {item.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={item.alt || imgAlt(i)} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                    ) : (
                      <div style={{ position: 'relative', width: '100%', height: '100%', background: '#000', borderRadius: '4px', overflow: 'hidden' }}>
                        {item.thumbUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.thumbUrl} alt="Video thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                        )}
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                )) : THUMB_LABELS.map((label, i) => (
                  <div key={i} className="thumb-ph">
                    <div className="ph" data-label={label} style={{ height: '100%', borderRadius: 0 }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="pd-info">
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
              <div className="prod-desc-md">
                <ReactMarkdown>{p.desc}</ReactMarkdown>
              </div>

              {p.brand && (
                <a
                  href={`/brand/${p.brand}`}
                  className="pd-brand-box"
                >
                  {p.brandLogo && (
                    <div className="pd-brand-logo">
                      <img src={cdn(p.brandLogo)} alt={p.brandName ?? p.brand} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                  )}
                  <div className="pd-brand-text">
                    <span className="pd-brand-lbl">Brand</span>
                    <span className="pd-brand-name">{p.brandName ?? p.brand}</span>
                    <span className="pd-brand-link">View all {p.brandName ?? p.brand} products →</span>
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
                  <div className="pd-uc-chips">
                    {p.useCases.map(uc => (
                      <span key={uc} className="pd-uc-chip">
                        {uc}
                      </span>
                    ))}
                  </div>
                </>
              )}

              <div className="pd-sticky">
                {p.price ? (
                  <>
                    <a className="btn btn-primary" href={CONTACT.phoneHref} onClick={() => logClick('call', p)}><IconPhone />Call to order</a>
                    <a className="btn btn-wa" href={waLink} target="_blank" rel="noopener noreferrer" onClick={() => logClick('whatsapp', p)}><IconWA />WhatsApp</a>
                  </>
                ) : (
                  <>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>Get exact quote</button>
                    <a className="btn btn-wa" href={waLink} target="_blank" rel="noopener noreferrer" onClick={() => logClick('whatsapp', p)}><IconWA />WhatsApp</a>
                  </>
                )}
              </div>

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
              <Link className="btn btn-ghost" href={`/catalogue/${p.cat}/${p.sub}`}>View all</Link>
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 24, overflowX: 'auto', paddingBottom: 16, WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory', margin: '24px -20px 0', padding: '0 20px 16px' }}>
              {related.map(r => <div key={r.slug} style={{ flex: '0 0 240px', scrollSnapAlign: 'start' }}><ProductCard p={r} /></div>)}
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
            <div style={{ display: 'flex', gap: 20, marginTop: 24, overflowX: 'auto', paddingBottom: 16, WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory', margin: '24px -20px 0', padding: '0 20px 16px' }}>
              {popular.map(r => <div key={r.slug} style={{ flex: '0 0 240px', scrollSnapAlign: 'start' }}><ProductCard p={r} /></div>)}
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

      <div style={{ height: 16, display: 'block' }} className="mobile-only-spacer" />

      {showModal && (
        <QuoteModal productName={p.name} productCat={`${p.subName} · ${cn}`} productSlug={p.slug} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
