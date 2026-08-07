'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import { IconSearch } from '@/components/Icons';
import { WA } from '@/lib/data';
import type { Category, FlatSubCategory, Product } from '@/lib/data';
import { BRANDS } from '@/lib/data';
import { jsonLd } from '@/lib/jsonLd';

interface UseCaseOpt { slug: string; name: string; }

interface Props {
  categories: Category[];
  products: Product[];
  useCases?: UseCaseOpt[];
  /** Slug pre-selected from the URL path (e.g. /catalogue/chemical-pumps). */
  initialCat?: string | null;
  /** Slug pre-selected from the URL path (e.g. /catalogue/chemical-pumps/monoblock). */
  initialSub?: string | null;
  /** Use h2 when the server page already renders an h1 (category/subcategory routes). */
  titleAs?: 'h1' | 'h2';
}

export default function CatalogueClient({ categories, products: allProducts, useCases = [], initialCat, initialSub, titleAs = 'h1' }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [cat, setCat] = useState<string | null>(initialCat ?? searchParams.get('cat'));
  const [sub, setSub] = useState<string | null>(initialSub ?? searchParams.get('sub'));
  const [brand, setBrand] = useState<string | null>(searchParams.get('brand'));
  const [uc, setUc] = useState<string | null>(searchParams.get('uc'));
  const [q, setQ] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeFilterCount = [cat, sub, brand, uc].filter(Boolean).length;

  // Skip the very first render so we don't trigger a spurious navigation on mount.
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    // Build a clean path-based URL: /catalogue/[cat]/[sub]
    let path = '/catalogue';
    if (cat) path += `/${cat}`;
    if (sub) path += `/${sub}`;
    // Brand and use-case stay as query params (they are UI-only filters, not pages).
    const params = new URLSearchParams();
    if (brand) params.set('brand', brand);
    if (uc) params.set('uc', uc);
    router.replace(path + (params.toString() ? '?' + params.toString() : ''), { scroll: false });
  }, [cat, sub, brand, uc, router]);

  const catObj = cat ? categories.find(c => c.slug === cat) : null;
  const subs: FlatSubCategory[] = catObj?.subs ?? [];
  const subObj = sub ? subs.find(s => s.slug === sub) : null;

  let baseProducts = allProducts.filter(p =>
    (!cat || p.cat === cat) &&
    (!sub || p.sub === sub)
  );
  if (q.trim()) {
    const qLow = q.toLowerCase();
    baseProducts = baseProducts.filter(p => (p.name + ' ' + p.desc + ' ' + p.subName).toLowerCase().includes(qLow));
  }

  const products = baseProducts.filter(p =>
    (!brand || p.brand?.toLowerCase() === brand.toLowerCase()) &&
    (!uc || p.ucSlugs?.includes(uc))
  );

  const brandsInUse = BRANDS.filter(b => baseProducts.some(p => p.brand?.toLowerCase() === b.slug));
  const ucsInUse = useCases.filter(u => baseProducts.some(p => p.ucSlugs?.includes(u.slug)));

  const catName = (slug: string) => categories.find(c => c.slug === slug)?.name ?? slug;
  const catProdCount = (slug: string) => allProducts.filter(p => p.cat === slug).length;
  const subProdCount = (catSlug: string, subSlug: string) => allProducts.filter(p => p.cat === catSlug && p.sub === subSlug).length;

  const title = subObj ? subObj.name : (catObj ? catObj.name : 'All products');
  const subtitle = subObj?.blurb
    || (catObj ? catObj.teaser : 'Browse the full Hirani Marketing Combines catalogue — pumps, water systems, fountains, pressure washers, hydraulics and spares.');

  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hiranimarketingcombines.in';
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description: subtitle,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE}/product/${p.slug}`,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(itemListSchema) }} />
      {titleAs !== 'h2' && (
        <section className="list-head">
          <div className="container">
            <nav className="crumb">
              <Link href="/">Home</Link>
              {cat && (
                <><span>/</span><Link href="/catalogue">Products</Link></>
              )}
              {cat && sub && (
                <><span>/</span><Link href={`/catalogue/${cat}`}>{catName(cat)}</Link></>
              )}
            </nav>
            <h1 style={{ fontSize: 'clamp(28px,3.4vw,40px)', marginTop: 8 }}>{title}</h1>
            <p style={{ color: 'var(--slate)', fontSize: 16, marginTop: 8, maxWidth: 600 }}>{subtitle}</p>
          </div>
        </section>
      )}

      <section className="section" style={{ paddingTop: 12 }}>
        <div className="container">
          <div className="list-layout">
            {/* FILTER RAIL — desktop sidebar */}
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

              {brandsInUse.length > 0 && (
                <div className="fgroup">
                  <h4>Brand</h4>
                  <button className={`filter-link${!brand ? ' on' : ''}`} onClick={() => setBrand(null)}>
                    All brands <span>{baseProducts.length}</span>
                  </button>
                  {brandsInUse.map(b => (
                    <button
                      key={b.slug}
                      className={`filter-link${brand === b.slug ? ' on' : ''}`}
                      onClick={() => setBrand(b.slug)}
                    >
                      {b.name} <span>{baseProducts.filter(p => p.brand?.toLowerCase() === b.slug).length}</span>
                    </button>
                  ))}
                </div>
              )}

              {ucsInUse.length > 0 && (
                <div className="fgroup">
                  <h4>Use case</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {ucsInUse.map(u => {
                      const on = uc === u.slug;
                      return (
                        <button
                          key={u.slug}
                          onClick={() => setUc(on ? null : u.slug)}
                          style={{
                            padding: '6px 13px', borderRadius: 999, fontSize: 12.5, fontWeight: 600,
                            cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit',
                            background: on ? 'var(--navy)' : '#f1f5f9',
                            color: on ? '#fff' : '#475569',
                            border: `1.5px solid ${on ? 'var(--navy)' : 'transparent'}`,
                          }}
                        >
                          {u.name} <span style={{ opacity: 0.65 }}>{baseProducts.filter(p => p.ucSlugs?.includes(u.slug)).length}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <a className="btn btn-primary btn-sm" href={WA} target="_blank" rel="noopener noreferrer" style={{ width: '100%', justifyContent: 'center' }}>
                Enquire on WhatsApp
              </a>
            </aside>

            {/* MAIN */}
            <div style={{ minWidth: 0 }}>
              <div className="sticky-mobile-header">
                <div className="list-toolbar">
                  <span className="lt-count desktop-only"><b>{products.length}</b> products</span>
                  <div className="searchbox">
                    <IconSearch />
                    <input type="text" placeholder="Search products…" value={q} onChange={e => setQ(e.target.value)} />
                  </div>
                  <button className="filter-toggle" onClick={() => setDrawerOpen(true)}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                    Filters
                    {activeFilterCount > 0 && <span className="filter-badge" />}
                  </button>
                </div>

                {/* Mobile categories removed */}
              </div>

              {cat && subs.length > 0 && (
                <div className="chips-row desktop-only">
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

      {/* MOBILE FILTER DRAWER */}
      {drawerOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,30,0.5)', zIndex: 1000 }}
          />
          {/* Drawer */}
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1001,
            background: '#fff', borderRadius: '20px 20px 0 0',
            height: '88vh', maxHeight: '88vh', display: 'flex', flexDirection: 'column',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.2)',
            animation: 'drawerUp 0.28s cubic-bezier(0.4,0,0.2,1)',
          }}>
            {/* Handle */}
            <div style={{ width: 40, height: 4, background: '#e2e8f0', borderRadius: 2, margin: '14px auto 0', flexShrink: 0 }} />
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 14px', borderBottom: '1px solid #e8eaf0', flexShrink: 0 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)', fontFamily: 'var(--font-head)' }}>
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </span>
              <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', fontSize: 22, color: '#94a3b8', cursor: 'pointer', padding: '4px', lineHeight: 1 }}>✕</button>
            </div>
            {/* Body */}
            <div style={{ overflowY: 'auto', padding: '20px 20px 8px', flex: 1 }}>
              <div style={{ borderBottom: '1px solid #e8eaf0', paddingBottom: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10, fontFamily: 'var(--font-head)', fontWeight: 800 }}>Categories</div>
                <button className={`filter-link${!cat ? ' on' : ''}`} onClick={() => { setCat(null); setSub(null); }}>All products <span>{allProducts.length}</span></button>
                {categories.map(c => (
                  <button key={c.slug} className={`filter-link${cat === c.slug ? ' on' : ''}`} onClick={() => { setCat(c.slug); setSub(null); }}>
                    {c.name} <span>{catProdCount(c.slug)}</span>
                  </button>
                ))}
              </div>
              {cat && subs.length > 0 && (
                <div style={{ borderBottom: '1px solid #e8eaf0', paddingBottom: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10, fontFamily: 'var(--font-head)', fontWeight: 800 }}>{catName(cat)} Types</div>
                  <button className={`filter-link${!sub ? ' on' : ''}`} onClick={() => setSub(null)}>All {catName(cat)} <span>{catProdCount(cat)}</span></button>
                  {subs.map(s => (
                    <button key={s.slug} className={`filter-link${sub === s.slug ? ' on' : ''}`} onClick={() => setSub(s.slug)}>
                      {s.name} <span>{subProdCount(cat, s.slug)}</span>
                    </button>
                  ))}
                </div>
              )}
              {brandsInUse.length > 0 && (
                <div style={{ borderBottom: '1px solid #e8eaf0', paddingBottom: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10, fontFamily: 'var(--font-head)', fontWeight: 800 }}>Brand</div>
                  <button className={`filter-link${!brand ? ' on' : ''}`} onClick={() => setBrand(null)}>All brands <span>{baseProducts.length}</span></button>
                  {brandsInUse.map(b => (
                    <button key={b.slug} className={`filter-link${brand === b.slug ? ' on' : ''}`} onClick={() => setBrand(b.slug)}>
                      {b.name} <span>{baseProducts.filter(p => p.brand?.toLowerCase() === b.slug).length}</span>
                    </button>
                  ))}
                </div>
              )}
              {ucsInUse.length > 0 && (
                <div style={{ paddingBottom: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 10, fontFamily: 'var(--font-head)', fontWeight: 800 }}>Use case</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {ucsInUse.map(u => {
                      const on = uc === u.slug;
                      return (
                        <button
                          key={u.slug}
                          onClick={() => setUc(on ? null : u.slug)}
                          style={{
                            padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'inherit',
                            background: on ? 'var(--navy)' : '#f1f5f9',
                            color: on ? '#fff' : '#475569',
                            border: `1.5px solid ${on ? 'var(--navy)' : 'transparent'}`,
                          }}
                        >
                          {u.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {/* Footer */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #e8eaf0', display: 'flex', gap: 12, flexShrink: 0 }}>
              <button
                onClick={() => { setCat(null); setSub(null); setBrand(null); setUc(null); }}
                style={{ flex: 1, background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: 13, fontSize: 14, fontWeight: 700, color: '#64748b', cursor: 'pointer', fontFamily: 'inherit' }}
              >Clear all</button>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{ flex: 2, background: 'var(--navy)', border: 'none', borderRadius: 8, padding: 13, fontSize: 14, fontWeight: 700, color: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
              >Show {products.length} products</button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
