import Link from 'next/link';
import type { Category } from '@/lib/data';
import { CatIcon, IconArrow } from './Icons';

export default function CategoryCard({ cat }: { cat: Category }) {
  const subCount = cat.subs?.length ?? 0;
  const foot = (cat.foot === 'types' || !cat.foot) ? `${subCount}+ types` : cat.foot;

  return (
    <Link className="cat6" href={`/catalogue?cat=${cat.slug}`}>
      <div className="cat6-previews">
        {cat.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <>
            <div className="ph" data-label={cat.name} />
            <div className="ph" data-label={cat.teaser} />
            <div className="ph" data-label={cat.name} />
          </>
        )}
      </div>
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
