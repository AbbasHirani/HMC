import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import CategoryForm from '../../CategoryForm';

interface Props { params: Promise<{ id: string }> }

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  let cat: Record<string, unknown>, subs: { _id: string; name: string; slug: string; order: number }[];
  try {
    const [catRows, subRows] = await Promise.all([
      sql`SELECT * FROM categories WHERE id = ${id}`,
      sql`SELECT * FROM subcategories WHERE category_id = ${id} ORDER BY sort_order`,
    ]);
    if (!catRows[0]) notFound();
    cat = catRows[0];
    subs = subRows.map(s => ({
      _id: s.id as string,
      name: s.name as string,
      slug: s.slug as string,
      order: (s.sort_order as number) ?? 0,
    }));
  } catch { notFound(); }

  return (
    <>
      <div className="adm-topbar"><h1>Edit Category</h1></div>
      <div className="adm-content">
        <div className="adm-ph">
          <h2>Edit: {cat!.name as string}</h2>
          <a href="/admin/categories" className="btn-adm btn-adm-ghost">← Back</a>
        </div>
        <CategoryForm
          mode="edit"
          id={id}
          initial={{
            name: cat!.name as string,
            slug: cat!.slug as string,
            icon: cat!.icon as string,
            teaser: cat!.teaser as string,
            footText: (cat!.foot_text as string) ?? '',
            order: (cat!.sort_order as number) ?? 0,
            imageUrl: cat!.image_url as string | undefined,
            imagePublicId: cat!.image_public_id as string | undefined,
          }}
          initialSubs={subs!}
        />
      </div>
    </>
  );
}
