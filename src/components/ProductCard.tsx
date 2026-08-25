import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/data';
import { cdn } from '@/lib/img';
import { IconArrow } from './Icons';

export default function ProductCard({ p, dark, priority }: { p: Product; dark?: boolean; priority?: boolean }) {
  const mainImage = cdn(p.images?.[0]?.url);
  return (
    <Link className="prod-card" href={`/product/${p.slug}`}>
      <div className="prod-thumb" style={{ position: 'relative', height: 184 }}>
        {mainImage ? (
          <Image
            src={mainImage}
            alt={p.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            style={{ objectFit: 'contain', background: '#fff', padding: '10px' }}
            priority={priority}
          />
        ) : (
          <div className={`ph${dark ? ' ph-dark' : ''}`} data-label={p.name} style={{ height: 184, borderRadius: 0, borderBottom: '1px solid var(--line)' }} />
        )}
        {p.tag && <span className="prod-tag">{p.tag}</span>}
        {p.brand && (
          <div style={{
            position: 'absolute', bottom: 10, left: 10, zIndex: 1,
            background: '#fff', borderRadius: 6, padding: '4px 8px',
            display: 'flex', alignItems: 'center', gap: 5,
            boxShadow: '0 1px 6px rgba(0,0,0,0.12)',
            border: '1px solid var(--line)',
          }}>
            {p.brandLogo
              ? (
                <div style={{ height: 22, maxWidth: 70, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={cdn(p.brandLogo)} alt={p.brandName ?? p.brand ?? ''} loading="lazy" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', display: 'block' }} />
                </div>
              )
              : <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--navy)', letterSpacing: '.04em', textTransform: 'uppercase' }}>{p.brandName ?? p.brand}</span>
            }
          </div>
        )}
      </div>
      <div className="prod-body">
        <h3>{p.name}</h3>
        <div className="pc-spec">
          {(p.desc || p.spec || '').replace(/[*#_\[\]`]/g, '').substring(0, 80)}
          {(p.desc || p.spec || '').length > 80 ? '...' : ''}
        </div>
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
