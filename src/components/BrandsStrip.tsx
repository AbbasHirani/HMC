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
  // Since we split the array in half, we duplicate it 10 times to ensure it's wider than any screen.
  const topMarquee = Array(10).fill(topBrands).flat();
  const bottomMarquee = Array(10).fill(bottomBrands).flat();

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
