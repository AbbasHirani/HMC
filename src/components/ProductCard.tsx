import Link from 'next/link';
import type { Product } from '@/lib/data';
import { IconArrow } from './Icons';

export default function ProductCard({ p, dark }: { p: Product; dark?: boolean }) {
  const mainImage = p.images?.[0]?.url;
  return (
    <Link className="prod-card" href={`/product/${p.slug}`}>
      <div className="prod-thumb">
        {mainImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mainImage} alt={p.name} style={{ width: '100%', height: 184, objectFit: 'contain', background: '#fff', padding: '10px' }} />
        ) : (
          <div className={`ph${dark ? ' ph-dark' : ''}`} data-label={p.name} style={{ height: 184, borderRadius: 0, borderBottom: '1px solid var(--line)' }} />
        )}
        {p.tag && <span className="prod-tag">{p.tag}</span>}
        {p.brand && (
          <div style={{
            position: 'absolute', bottom: 10, left: 10,
            background: '#fff', borderRadius: 6, padding: '4px 8px',
            display: 'flex', alignItems: 'center', gap: 5,
            boxShadow: '0 1px 6px rgba(0,0,0,0.12)',
            border: '1px solid var(--line)',
          }}>
            {p.brandLogo
              ? <img src={p.brandLogo} alt={p.brandName ?? p.brand} style={{ height: 14, maxWidth: 44, objectFit: 'contain' }} />
              : <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--navy)', letterSpacing: '.04em', textTransform: 'uppercase' }}>{p.brandName ?? p.brand}</span>
            }
          </div>
        )}
      </div>
      <div className="prod-body">
        <h3>{p.name}</h3>
        <p className="pc-spec">{p.desc || p.spec}</p>
        <div className="pc-foot">
          {p.price ? (
            <div className="pc-price">
              <small>Starting from</small>
              <b>₹{p.price.toLocaleString('en-IN')}</b>
            </div>
          ) : (
            <div className="pc-price req">
              <small>Pricing</small>
              <b>On request</b>
            </div>
          )}
          <span className="pc-link">View <IconArrow /></span>
        </div>
      </div>
    </Link>
  );
}
