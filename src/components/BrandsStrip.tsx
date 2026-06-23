import Image from 'next/image';
import { getBrands } from '@/lib/queries';
import { BRANDS as STATIC_BRANDS } from '@/lib/data';

export default async function BrandsStrip() {
  const dbBrands = await getBrands().catch(() => []);
  const brands = dbBrands.length > 0
    ? dbBrands
    : STATIC_BRANDS.map(b => ({ _id: b.slug, name: b.name, slug: b.slug, logoUrl: null, logoPublicId: null, order: 0 }));

  const mid = Math.ceil(brands.length / 2);
  const topBrands = brands.slice(0, mid);
  const bottomBrands = brands.slice(mid);

  // Duplicate items enough times so the marquee can scroll seamlessly on any screen size.
  // We calculate repeats dynamically to target at least 20 items per row. This ensures
  // seamless scrolling on wide screens while avoiding rendering excessive components.
  const minItems = 20;
  const topRepeats = Math.max(2, Math.ceil(minItems / Math.max(1, topBrands.length)));
  const bottomRepeats = Math.max(2, Math.ceil(minItems / Math.max(1, bottomBrands.length)));

  const topMarquee = Array(topRepeats).fill(topBrands).flat();
  const bottomMarquee = Array(bottomRepeats).fill(bottomBrands).flat();

  return (
    <div className="brands-container">
      {/* Top Row: Scrolls Left */}
      <div className="brands-track track-left">
        {topMarquee.map((b, i) => (
          <a className="brand-pill" key={`top-${b.slug}-${i}`} href={`/brand/${b.slug}`}>
            {b.logoUrl
              ? <Image src={b.logoUrl} alt={b.name} width={160} height={60} style={{ objectFit: 'contain', height: 'auto' }} />
              : b.name}
          </a>
        ))}
      </div>

      {/* Bottom Row: Scrolls Right */}
      <div className="brands-track track-right" style={{ marginTop: 12 }}>
        {bottomMarquee.map((b, i) => (
          <a className="brand-pill" key={`bot-${b.slug}-${i}`} href={`/brand/${b.slug}`}>
            {b.logoUrl
              ? <Image src={b.logoUrl} alt={b.name} width={160} height={60} style={{ objectFit: 'contain', height: 'auto' }} />
              : b.name}
          </a>
        ))}
      </div>
    </div>
  );
}
