import Link from 'next/link';
import { sql } from '@/lib/db';
import ProdDeleteBtn from './ProdDeleteBtn';

async function getProducts() {
  try {
    const rows = await sql`
      SELECT id, name, slug, category_name, subcategory_name, price, tag, featured, images
      FROM products ORDER BY created_at DESC
    `;
    return rows.map(p => ({
      _id: p.id as string,
      name: p.name as string,
      slug: p.slug as string,
      categoryName: p.category_name as string,
      subcategoryName: p.subcategory_name as string,
      // NUMERIC arrives as a string from the driver — see lib/queries.ts.
      price: p.price == null ? null : Number(p.price),
      tag: p.tag as string | null,
      featured: p.featured as boolean,
      imageCount: Array.isArray(p.images) ? p.images.length : 0,
    }));
  } catch { return []; }
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <>
      <div className="adm-topbar"><h1>Products</h1></div>
      <div className="adm-content">
        <div className="adm-ph">
          <h2>All products ({products.length})</h2>
          <Link href="/admin/products/new" className="btn-adm btn-adm-orange">+ Add product</Link>
        </div>

        <div className="adm-table-wrap">
          {products.length === 0 ? (
            <div className="adm-empty">
              <p>No products yet. Add categories first, then add products.</p>
              <Link href="/admin/products/new" className="btn-adm btn-adm-orange">Add first product</Link>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Product</th><th>Category</th><th>Subcategory</th>
                  <th>Price</th><th>Tag</th><th>Featured</th><th>Images</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div><b>{p.name}</b></div>
                      <div style={{ fontSize: 11, color: '#9ca3af' }}>{p.slug}</div>
                    </td>
                    <td>{p.categoryName}</td>
                    <td>{p.subcategoryName}</td>
                    <td>{p.price ? `₹${p.price.toLocaleString('en-IN')}` : <span className="badge badge-gray">On request</span>}</td>
                    <td>{p.tag ? <span className="badge badge-orange">{p.tag}</span> : '—'}</td>
                    <td>{p.featured ? <span className="badge badge-green">Yes</span> : '—'}</td>
                    <td><span className="badge badge-blue">{p.imageCount}</span></td>
                    <td>
                      <div className="actions">
                        <Link href={`/admin/products/${p._id}/edit`} className="btn-adm btn-adm-ghost btn-adm-sm">Edit</Link>
                        <ProdDeleteBtn id={p._id} name={p.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
