import Link from 'next/link';
import { sql } from '@/lib/db';
import BrandDeleteBtn from './BrandDeleteBtn';

async function getBrands() {
  try {
    const rows = await sql`SELECT * FROM brands ORDER BY sort_order, name`;
    return rows.map(r => ({
      _id: r.id as string,
      name: r.name as string,
      slug: r.slug as string,
      logoUrl: (r.logo_url as string | null) ?? null,
      order: (r.sort_order as number) ?? 0,
    }));
  } catch { return []; }
}

export default async function BrandsAdminPage() {
  const brands = await getBrands();

  return (
    <>
      <div className="adm-topbar"><h1>Brands</h1></div>
      <div className="adm-content">
        <div className="adm-ph">
          <h2>All brands ({brands.length})</h2>
          <Link href="/admin/brands/new" className="btn-adm btn-adm-primary">+ Add brand</Link>
        </div>

        <div className="adm-table-wrap">
          {brands.length === 0 ? (
            <div className="adm-empty">
              <p>No brands yet.</p>
              <Link href="/admin/brands/new" className="btn-adm btn-adm-primary">Add your first brand</Link>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr><th>Logo</th><th>Name</th><th>Slug</th><th>Order</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {brands.map(b => (
                  <tr key={b._id}>
                    <td>
                      {b.logoUrl
                        ? <img src={b.logoUrl} alt={b.name} style={{ height: 36, maxWidth: 80, objectFit: 'contain' }} />
                        : <span style={{ color: '#9ca3af', fontSize: 12 }}>No logo</span>}
                    </td>
                    <td><b>{b.name}</b></td>
                    <td><span className="badge badge-gray">{b.slug}</span></td>
                    <td>{b.order}</td>
                    <td>
                      <div className="actions">
                        <Link href={`/admin/brands/${b._id}/edit`} className="btn-adm btn-adm-ghost btn-adm-sm">Edit</Link>
                        <BrandDeleteBtn id={b._id} name={b.name} />
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
