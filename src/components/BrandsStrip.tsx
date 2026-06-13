import Image from 'next/image';
import { getBrands } from '@/lib/queries';
import { BRANDS as STATIC_BRANDS } from '@/lib/data';

export default async function BrandsStrip() {
  const dbBrands = await getBrands().catch(() => []);
  const brands = dbBrands.length > 0
    ? dbBrands
    : STATIC_BRANDS.map(b => ({ _id: b.slug, name: b.name, slug: b.slug, logoUrl: null, logoPublicId: null, order: 0 }));

  return (
    <div className="brands">
      {brands.map(b => (
        <a className="brand-pill" key={b.slug} href={`/brand/${b.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, textDecoration: 'none' }}>
          {b.logoUrl
            ? <Image src={b.logoUrl} alt={b.name} width={80} height={20} style={{ objectFit: 'contain', height: 'auto' }} />
            : b.name}
        </a>
      ))}
    </div>
  );
}
