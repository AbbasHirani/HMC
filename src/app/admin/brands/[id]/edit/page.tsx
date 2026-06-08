import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import BrandForm from '../../BrandForm';

interface Props { params: Promise<{ id: string }> }

export default async function EditBrandPage({ params }: Props) {
  const { id } = await params;
  let brand: Record<string, unknown>;
  try {
    const rows = await sql`SELECT * FROM brands WHERE id = ${id}`;
    if (!rows[0]) notFound();
    brand = rows[0];
  } catch { notFound(); }

  return (
    <>
      <div className="adm-topbar"><h1>Edit Brand</h1></div>
      <div className="adm-content">
        <div className="adm-ph">
          <h2>Edit: {brand!.name as string}</h2>
          <a href="/admin/brands" className="btn-adm btn-adm-ghost">← Back</a>
        </div>
        <BrandForm
          mode="edit"
          id={id}
          initial={{
            name: brand!.name as string,
            slug: brand!.slug as string,
            order: (brand!.sort_order as number) ?? 0,
            logoUrl: (brand!.logo_url as string) ?? '',
            logoPublicId: (brand!.logo_public_id as string) ?? '',
          }}
        />
      </div>
    </>
  );
}
