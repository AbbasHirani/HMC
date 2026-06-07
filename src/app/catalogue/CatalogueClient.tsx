'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { IconSearch } from '@/components/Icons';
import { WA } from '@/lib/data';
import type { Category, FlatSubCategory, Product } from '@/lib/data';

interface Props {
  categories: Category[];
  products: Product[];
}

export default function CatalogueClient({ categories, products: allProducts }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [cat, setCat] = useState<string | null>(searchParams.get('cat'));
  const [sub, setSub] = useState<string | null>(searchParams.get('sub'));
  const [q, setQ] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (cat) params.set('cat', cat);
    if (sub) params.set('sub', sub);
    router.replace('/catalogue' + (params.toString() ? '?' + params.toString() : ''), { scroll: false });
  }, [cat, sub, router]);

  const catObj = cat ? categories.find(c => c.slug === cat) : null;
  const subs: FlatSubCategory[] = catObj?.subs ?? [];
  const subObj = sub ? subs.find(s => s.slug === sub) : null;

  let products = allProducts.filter(p => (!cat || p.cat === cat) && (!sub || p.sub === sub));
  if (q.trim()) {
    const qLow = q.toLowerCase();
    products = products.filter(p => (p.name + ' ' + p.desc + ' ' + p.subName).toLowerCase().includes(qLow));
  }

  const catName = (slug: string) => categories.find(c => c.slug === slug)?.name ?? slug;
  const catProdCount = (slug: string) => allProducts.filter(p => p.cat === slug).length;
  const subProdCount = (catSlug: string, subSlug: string) => allProducts.filter(p => p.cat === catSlug && p.sub === subSlug).length;

  const title = subObj ? subObj.name : (catObj ? catObj.name : 'All products');
  const subtitle = subObj?.blurb
    || (catObj ? catObj.teaser : 'Browse the full Hirani Marketing Combines catalogue — pumps, water systems, fountains, pressure washers, hydraulics and spares.');

  return (
    <>
      <section className="list-head">
        <div className="container">
          <nav className="crumb">
            <Link href="/">Home</Link><span>/</span>
            {!cat && <b>Products</b>}
            {cat && !sub && (
              <><Link href="/catalogue">Products</Link><span>/</span><b>{catName(cat)}</b></>
            )}
            {cat && sub && (
              <><Link href="/catalogue">Products</Link><span>/</span>
              <Link href={`/catalogue?cat=${cat}`}>{catName(cat)}</Link><span>/</span>
              <b>{title}</b></>
            )}
          </nav>
          <h1 style={{ fontSize: 'clamp(28px,3.4vw,40px)', marginTop: 14 }}>{title}</h1>
          <p style={{ color: 'var(--slate)', fontSize: 16, marginTop: 10, maxWidth: 600 }}>{subtitle}</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="list-layout">
            {/* FILTER RAIL */}
            <aside className="filter-rail">
              <div className="fgroup">
                <h4>Categories</h4>
                <button className={`filter-link${!cat ? ' on' : ''}`} onClick={() => { setCat(null); setSub(null); }}>
                  All products <span>{allProducts.length}</span>
                </button>
                {categories.map(c => (
                  <button
                    key={c.slug}
                    className={`filter-link${cat === c.slug ? ' on' : ''}`}
                    onClick={() => { setCat(c.slug); setSub(null); }}
                  >
                    {c.name} <span>{catProdCount(c.slug)}</span>
                  </button>
                ))}
              </div>

              {cat && subs.length > 0 && (
                <div className="fgroup">
                  <h4>{catName(cat)} types</h4>
                  <button className={`filter-link${!sub ? ' on' : ''}`} onClick={() => setSub(null)}>
                    All {catName(cat)} <span>{catProdCount(cat)}</span>
                  </button>
                  {subs.map(s => (
                    <button
                      key={s.slug}
                      className={`filter-link${sub === s.slug ? ' on' : ''}`}
                      onClick={() => setSub(s.slug)}
                    >
                      {s.name} <span>{subProdCount(cat, s.slug)}</span>
                    </button>
                  ))}
                </div>
              )}

              <a className="btn btn-primary btn-sm" href={WA} target="_blank" rel="noopener noreferrer" style={{ width: '100%', justifyContent: 'center' }}>
                Enquire on WhatsApp
              </a>
            </aside>

            {/* MAIN */}
            <div>
              <div className="list-toolbar">
                <span className="lt-count"><b>{products.length}</b> products</span>
                <div className="searchbox">
                  <IconSearch />
                  <input type="text" placeholder="Search products…" value={q} onChange={e => setQ(e.target.value)} />
                </div>
              </div>

              {cat && subs.length > 0 && (
                <div className="chips-row">
                  <button className={`fchip${!sub ? ' on' : ''}`} onClick={() => setSub(null)}>All {catName(cat)}</button>
                  {subs.map(s => (
                    <button key={s.slug} className={`fchip${sub === s.slug ? ' on' : ''}`} onClick={() => setSub(s.slug)}>
                      {s.name}
                    </button>
                  ))}
                </div>
              )}

              {products.length > 0 ? (
                <div className="prod-grid">
                  {products.map(p => <ProductCard key={p.slug} p={p} />)}
                </div>
              ) : (
                <div className="empty">No products match — try another search or category.</div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
