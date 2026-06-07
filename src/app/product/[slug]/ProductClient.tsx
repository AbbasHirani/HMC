'use client';
import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/data';
import { WA, CONTACT } from '@/lib/data';
import ProductCard from '@/components/ProductCard';
import QuoteModal from '@/components/QuoteModal';
import { IconPhone, IconWA, IconWrench, IconCheck, IconTruck, IconArrow } from '@/components/Icons';

const THUMB_LABELS = ['View 1', 'View 2', 'Detail', 'In use'];

interface Props {
  product: Product;
  related?: Product[];
}

export default function ProductClient({ product: p, related = [] }: Props) {
  const cn = p.catName || p.cat;
  const waLink = WA + encodeURIComponent(`${p.name} (${cn})`);
  const [activeThumb, setActiveThumb] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const mainImage = p.images?.[activeThumb]?.url ?? p.images?.[0]?.url;
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
              <div className="main">
                {mainImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mainImage} alt={p.name} style={{ width: '100%', height: 440, objectFit: 'contain', background: '#f9fafb' }} />
                ) : (
                  <div className="ph" data-label={p.name} style={{ height: 440, borderRadius: 0 }} />
                )}
                <span className="img-count">{activeThumb + 1} / {thumbs.length}</span>
              </div>
              <div className="thumbs">
                {thumbs.map((img, i) => (
                  <div key={i} className={`thumb-ph${i === activeThumb ? ' active' : ''}`} onClick={() => setActiveThumb(i)}>
                    {img.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={img.url} alt={`View ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
              <div className="pd-avail"><i />Available to order</div>
              <Link className="cat-link" href={`/catalogue?cat=${p.cat}&sub=${p.sub}`}>{p.subName} · {cn}</Link>
              <h1>{p.name}</h1>

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
                <a className="btn btn-primary btn-lg" href={CONTACT.phoneHref}><IconPhone />Call to order</a>
                <a className="btn btn-wa btn-lg" href={waLink} target="_blank" rel="noopener noreferrer"><IconWA />Enquire on WhatsApp</a>
                <button className="btn btn-ghost btn-lg" onClick={() => setShowModal(true)}>Get exact quote</button>
              </div>

              <div className="pd-sec-title">About this product</div>
              <p style={{ color: 'var(--slate)', fontSize: 15, lineHeight: 1.7, marginTop: 14 }}>{p.desc}</p>

              <div className="pd-sec-title">Key specifications</div>
              <table className="spec-table">
                <tbody>
                  {specRows.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}
                </tbody>
              </table>

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

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
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
        <a className="btn btn-primary" href={CONTACT.phoneHref}><IconPhone />Call to order</a>
        <a className="btn btn-wa" href={waLink} target="_blank" rel="noopener noreferrer"><IconWA />WhatsApp</a>
      </div>

      {showModal && (
        <QuoteModal productName={p.name} productCat={`${p.subName} · ${cn}`} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
