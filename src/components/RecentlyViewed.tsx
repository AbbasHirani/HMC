'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cdn } from '@/lib/img';

interface RecentEntry {
  slug: string;
  name: string;
  image: string | null;
  price: number | null;
  ts: number;
}

export default function RecentlyViewed({ excludeSlug }: { excludeSlug?: string }) {
  const [items, setItems] = useState<RecentEntry[]>([]);

  useEffect(() => {
    // localStorage is only readable after mount; SSR must render the empty
    // state and hydrate to it, so a post-mount setState is the correct pattern.
    try {
      const list: RecentEntry[] = JSON.parse(localStorage.getItem('hmc_recent') ?? '[]');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(list.filter(e => e.slug !== excludeSlug).slice(0, 6));
    } catch { /* localStorage unavailable */ }
  }, [excludeSlug]);

  if (items.length === 0) return null;

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="sec-head">
          <span className="eyebrow">Pick up where you left off</span>
          <h2 style={{ fontSize: 'clamp(22px,2.6vw,30px)' }}>Recently viewed</h2>
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 28, overflowX: 'auto', paddingBottom: 8, WebkitOverflowScrolling: 'touch' }}>
          {items.map(item => (
            <Link
              key={item.slug}
              href={`/product/${item.slug}`}
              style={{
                flex: '0 0 200px', textDecoration: 'none',
                border: '1.5px solid var(--line)', borderRadius: 14,
                background: '#fff', overflow: 'hidden',
                transition: 'border-color .18s, box-shadow .18s',
              }}
            >
              <div style={{ height: 130, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                {item.image
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={cdn(item.image)} alt={item.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} loading="lazy" />
                  : <span style={{ fontSize: 12, color: 'var(--muted)' }}>{item.name}</span>}
              </div>
              <div style={{ padding: '12px 14px' }}>
                <span style={{
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  fontSize: 13.5, fontWeight: 700, color: 'var(--navy)', lineHeight: 1.35,
                }}>
                  {item.name}
                </span>
                <span style={{ display: 'block', marginTop: 6, fontSize: 13, fontWeight: 600, color: item.price ? 'var(--orange)' : 'var(--muted)' }}>
                  {item.price ? `₹${item.price.toLocaleString('en-IN')}` : 'Price on request'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
