import Link from 'next/link';
import { sql } from '@/lib/db';
import MigrateBtn from './MigrateBtn';

async function getStats() {
  try {
    const [cats, subs, prods, featured] = await Promise.all([
      sql`SELECT COUNT(*) AS count FROM categories`,
      sql`SELECT COUNT(*) AS count FROM subcategories`,
      sql`SELECT COUNT(*) AS count FROM products`,
      sql`SELECT COUNT(*) AS count FROM products WHERE featured = true`,
    ]);
    return {
      cats: Number(cats[0].count),
      subs: Number(subs[0].count),
      prods: Number(prods[0].count),
      featured: Number(featured[0].count),
    };
  } catch {
    return { cats: 0, subs: 0, prods: 0, featured: 0 };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <>
      <div className="adm-topbar"><h1>Dashboard</h1></div>
      <div className="adm-content">
        <div className="adm-stats">
          <div className="adm-stat"><b>{stats.cats}</b><span>Categories</span></div>
          <div className="adm-stat"><b>{stats.subs}</b><span>Subcategories</span></div>
          <div className="adm-stat"><b>{stats.prods}</b><span>Products</span></div>
          <div className="adm-stat"><b>{stats.featured}</b><span>Featured</span></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 600 }}>
          <Link href="/admin/categories/new" className="btn-adm btn-adm-primary" style={{ justifyContent: 'center', padding: '14px' }}>
            + Add category
          </Link>
          <Link href="/admin/products/new" className="btn-adm btn-adm-orange" style={{ justifyContent: 'center', padding: '14px' }}>
            + Add product
          </Link>
          <Link href="/admin/categories" className="btn-adm btn-adm-ghost" style={{ justifyContent: 'center' }}>
            Manage categories
          </Link>
          <Link href="/admin/products" className="btn-adm btn-adm-ghost" style={{ justifyContent: 'center' }}>
            Manage products
          </Link>
        </div>

        <MigrateBtn />

        {stats.prods === 0 && (
          <div style={{ marginTop: 32, padding: 24, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, maxWidth: 500 }}>
            <b style={{ color: '#92400e' }}>No products yet</b>
            <p style={{ color: '#78350f', margin: '6px 0 0', fontSize: 13 }}>
              Start by adding categories and subcategories, then add your products.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
