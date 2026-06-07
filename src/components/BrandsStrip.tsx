import { BRANDS } from '@/lib/data';

export default function BrandsStrip() {
  return (
    <div className="brands">
      {BRANDS.map(b => (
        <span className="brand-pill" key={b}>{b}</span>
      ))}
    </div>
  );
}
