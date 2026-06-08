import { notFound } from 'next/navigation';
import { sql } from '@/lib/db';
import RepairJobForm from '../../RepairJobForm';

export default async function EditRepairJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await sql`SELECT * FROM repair_jobs WHERE id = ${id} LIMIT 1`;
  const j = rows[0];
  if (!j) notFound();

  return (
    <>
      <div className="adm-topbar"><h1>Edit Repair Job</h1></div>
      <div className="adm-content">
        <RepairJobForm
          mode="edit"
          id={id}
          initial={{
            title: j.title as string,
            description: (j.description as string) ?? '',
            tag: (j.tag as string) ?? '',
            order: (j.sort_order as number) ?? 0,
            imageUrl: (j.image_url as string) ?? '',
            imagePublicId: (j.image_public_id as string) ?? '',
          }}
        />
      </div>
    </>
  );
}
