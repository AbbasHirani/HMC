import Link from 'next/link';
import { sql } from '@/lib/db';
import RepairJobDeleteBtn from './RepairJobDeleteBtn';

async function getJobs() {
  try {
    const rows = await sql`SELECT * FROM repair_jobs ORDER BY sort_order, created_at DESC`;
    return rows.map(r => ({
      _id: r.id as string,
      title: r.title as string,
      tag: (r.tag as string | null) ?? '',
      imageUrl: (r.image_url as string | null) ?? null,
      order: (r.sort_order as number) ?? 0,
    }));
  } catch { return []; }
}

export default async function RepairJobsAdminPage() {
  const jobs = await getJobs();

  return (
    <>
      <div className="adm-topbar"><h1>Repair Jobs</h1></div>
      <div className="adm-content">
        <div className="adm-ph">
          <h2>All repair jobs ({jobs.length})</h2>
          <Link href="/admin/repair-jobs/new" className="btn-adm btn-adm-primary">+ Add job</Link>
        </div>

        <div className="adm-table-wrap">
          {jobs.length === 0 ? (
            <div className="adm-empty">
              <p>No repair jobs yet. Add your first one to showcase your work.</p>
              <Link href="/admin/repair-jobs/new" className="btn-adm btn-adm-primary">Add first job</Link>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr><th>Photo</th><th>Title</th><th>Tag</th><th>Order</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {jobs.map(j => (
                  <tr key={j._id}>
                    <td>
                      {j.imageUrl
                        ? <img src={j.imageUrl} alt={j.title} style={{ height: 48, width: 72, objectFit: 'cover', borderRadius: 6 }} />
                        : <span style={{ color: '#9ca3af', fontSize: 12 }}>No photo</span>}
                    </td>
                    <td><b>{j.title}</b></td>
                    <td>{j.tag ? <span className="badge badge-gray">{j.tag}</span> : '—'}</td>
                    <td>{j.order}</td>
                    <td>
                      <div className="actions">
                        <Link href={`/admin/repair-jobs/${j._id}/edit`} className="btn-adm btn-adm-ghost btn-adm-sm">Edit</Link>
                        <RepairJobDeleteBtn id={j._id} title={j.title} />
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
