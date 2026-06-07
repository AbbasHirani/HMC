import { sql } from '@/lib/db';
import ProductForm from '../ProductForm';

async function getData() {
  try {
    const [catRows, subRows] = await Promise.all([
      sql`SELECT id, name, slug FROM categories ORDER BY sort_order`,
      sql`SELECT id, name, slug, category_id FROM subcategories ORDER BY sort_order`,
    ]);
    return {
      cats: catRows.map(c => ({ _id: c.id as string, name: c.name as string, slug: c.slug as string })),
      subs: subRows.map(s => ({
        _id: s.id as string,
        name: s.name as string,
        slug: s.slug as string,
        categoryId: s.category_id as string,
      })),
    };
  } catch { return { cats: [], subs: [] }; }
}

export default async function NewProductPage() {
  const { cats, subs } = await getData();
  return (
    <>
      <div className="adm-topbar"><h1>New Product</h1></div>
      <div className="adm-content">
        <div className="adm-ph">
          <h2>Add product</h2>
          <a href="/admin/products" className="btn-adm btn-adm-ghost">← Back</a>
        </div>
        {cats.length === 0 ? (
          <div style={{ padding: 24, background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 10 }}>
            <b>No categories found.</b> <a href="/admin/categories/new">Add a category first</a> before adding products.
          </div>
        ) : (
          <ProductForm mode="new" cats={cats} allSubs={subs} />
        )}
      </div>
    </>
  );
}
