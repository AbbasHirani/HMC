import Link from 'next/link';
import { sql } from '@/lib/db';
import CatDeleteBtn from './CatDeleteBtn';

async function getCategories() {
  try {
    const [cats, subs] = await Promise.all([
      sql`SELECT id, slug, name, icon, sort_order FROM categories ORDER BY sort_order`,
      sql`SELECT category_slug FROM subcategories`,
    ]);
    return cats.map(c => ({
      _id: c.id as string,
      slug: c.slug as string,
      name: c.name as string,
      icon: c.icon as string,
      order: c.sort_order as number,
      subCount: subs.filter(s => s.category_slug === c.slug).length,
    }));
  } catch { return []; }
}

export default async function CategoriesPage() {
  const cats = await getCategories();

  return (
    <>
      <div className="adm-topbar"><h1>Categories</h1></div>
      <div className="adm-content">
        <div className="adm-ph">
          <h2>All categories ({cats.length})</h2>
          <Link href="/admin/categories/new" className="btn-adm btn-adm-primary">+ Add category</Link>
        </div>

        <div className="adm-table-wrap">
          {cats.length === 0 ? (
            <div className="adm-empty">
              <p>No categories yet.</p>
              <Link href="/admin/categories/new" className="btn-adm btn-adm-primary">Add your first category</Link>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Name</th><th>Slug</th><th>Icon</th><th>Subcategories</th><th>Order</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cats.map(c => (
                  <tr key={c._id}>
                    <td><b>{c.name}</b></td>
                    <td><span className="badge badge-gray">{c.slug}</span></td>
                    <td>{c.icon}</td>
                    <td><span className="badge badge-blue">{c.subCount}</span></td>
                    <td>{c.order}</td>
                    <td>
                      <div className="actions">
                        <Link href={`/admin/categories/${c._id}/edit`} className="btn-adm btn-adm-ghost btn-adm-sm">Edit</Link>
                        <CatDeleteBtn id={c._id} name={c.name} />
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
