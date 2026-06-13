import Link from 'next/link';
import Image from 'next/image';
import type { Category } from '@/lib/data';
import { CatIcon, IconArrow } from './Icons';

export default function CategoryCard({ cat }: { cat: Category }) {
  const subCount = cat.subs?.length ?? 0;
  const foot = (cat.foot === 'types' || !cat.foot) ? `${subCount}+ types` : cat.foot;

  return (
    <Link className="cat6" href={`/catalogue?cat=${cat.slug}`}>
      {cat.imageUrl ? (
        <div style={{ position: 'relative', aspectRatio: '4/3', borderBottom: '1px solid var(--line)', background: '#fff' }}>
          <Image
            src={cat.imageUrl}
            alt={cat.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            style={{ objectFit: 'contain', padding: '16px' }}
          />
        </div>
      ) : (
        <div className="cat6-previews">
          <div className="ph" data-label={cat.name} />
          <div className="ph" data-label={cat.teaser} />
          <div className="ph" data-label={cat.name} />
        </div>
      )}
      <div className="cat6-body">
        <span className="cat6-ic">
          <CatIcon name={cat.icon} />
        </span>
        <h3>{cat.name}</h3>
        <p>{cat.teaser}</p>
        <span className="cat6-foot">
          {foot} <IconArrow />
        </span>
      </div>
    </Link>
  );
}
