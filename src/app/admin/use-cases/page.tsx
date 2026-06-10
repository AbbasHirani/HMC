import { sql } from '@/lib/db';
import AddUseCaseForm from './AddUseCaseForm';
import UseCaseDeleteBtn from './UseCaseDeleteBtn';

async function getUseCases() {
  try {
    const rows = await sql`SELECT id, name, slug FROM use_cases ORDER BY name`;
    return rows.map(r => ({ _id: r.id as string, name: r.name as string, slug: r.slug as string }));
  } catch { return []; }
}

export default async function UseCasesPage() {
  const useCases = await getUseCases();

  return (
    <>
      <div className="adm-topbar"><h1>Use Cases</h1></div>
      <div className="adm-content">

        <div className="adm-ph">
          <div>
            <h2>Use Cases</h2>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6b7280' }}>
              Tag products with use cases so customers can filter by their specific need.
            </p>
          </div>
          <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>{useCases.length} tag{useCases.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Add form */}
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '22px 24px', marginBottom: 28 }}>
          <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#9ca3af' }}>
            New use case
          </p>
          <AddUseCaseForm />
        </div>

        {/* Tag pills */}
        {useCases.length === 0 ? (
          <div className="adm-empty">
            <p>No use cases yet.</p>
            <p style={{ fontSize: 13, color: '#9ca3af' }}>
              Add some above — e.g. &ldquo;Home Use&rdquo;, &ldquo;Agriculture&rdquo;, &ldquo;Industrial&rdquo;, &ldquo;Car Washing&rdquo;, &ldquo;Swimming Pool&rdquo;, &ldquo;Fire Fighting&rdquo;.
            </p>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '22px 24px' }}>
            <p style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#9ca3af' }}>
              All tags
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {useCases.map(uc => (
                <div
                  key={uc._id}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '7px 14px', borderRadius: 999,
                    background: 'var(--navy)', color: '#fff',
                    fontSize: 13, fontWeight: 600,
                  }}
                >
                  {uc.name}
                  <UseCaseDeleteBtn id={uc._id} name={uc.name} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
