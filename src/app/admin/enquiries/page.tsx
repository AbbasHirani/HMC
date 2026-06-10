import { sql } from '@/lib/db';
import EnquiryRow from './EnquiryRow';

interface Enquiry {
  _id: string;
  productName: string | null;
  productSlug: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  message: string | null;
  source: string;
  status: string;
  createdAt: string;
}

async function getEnquiries(): Promise<Enquiry[]> {
  try {
    const rows = await sql`SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 500`;
    return rows.map(r => ({
      _id: r.id as string,
      productName: (r.product_name as string | null) ?? null,
      productSlug: (r.product_slug as string | null) ?? null,
      name: (r.name as string | null) ?? null,
      phone: (r.phone as string | null) ?? null,
      email: (r.email as string | null) ?? null,
      message: (r.message as string | null) ?? null,
      source: r.source as string,
      status: r.status as string,
      createdAt: String(r.created_at),
    }));
  } catch { return []; }
}

export default async function EnquiriesPage() {
  const all = await getEnquiries();
  // "Leads" = actionable enquiries with contact details (quote form + chat captures).
  const quotes = all.filter(e => e.source === 'quote' || e.source === 'chat');
  const clicks = all.filter(e => e.source === 'whatsapp' || e.source === 'call');
  const newCount = quotes.filter(e => e.status === 'new').length;

  // Click counts per product for the simple analytics block.
  const clickStats = new Map<string, { name: string; whatsapp: number; call: number }>();
  for (const c of clicks) {
    const key = c.productSlug ?? c.productName ?? 'unknown';
    const entry = clickStats.get(key) ?? { name: c.productName ?? key, whatsapp: 0, call: 0 };
    if (c.source === 'whatsapp') entry.whatsapp++;
    if (c.source === 'call') entry.call++;
    clickStats.set(key, entry);
  }
  const topClicked = [...clickStats.values()].sort((a, b) => (b.whatsapp + b.call) - (a.whatsapp + a.call)).slice(0, 10);

  return (
    <>
      <div className="adm-topbar"><h1>Enquiries</h1></div>
      <div className="adm-content">

        <div className="adm-stats">
          <div className="adm-stat"><b>{newCount}</b><span>New quote requests</span></div>
          <div className="adm-stat"><b>{quotes.length}</b><span>Total quotes</span></div>
          <div className="adm-stat"><b>{clicks.filter(c => c.source === 'whatsapp').length}</b><span>WhatsApp taps</span></div>
          <div className="adm-stat"><b>{clicks.filter(c => c.source === 'call').length}</b><span>Call taps</span></div>
        </div>

        <div className="adm-ph" style={{ marginTop: 28 }}>
          <h2>Leads ({quotes.length})</h2>
        </div>
        <div className="adm-table-wrap">
          {quotes.length === 0 ? (
            <div className="adm-empty">
              <p>No leads yet.</p>
              <p style={{ fontSize: 13, color: '#9ca3af' }}>
                Quote-form submissions and callback requests captured by Hira (the chat assistant) land here.
              </p>
            </div>
          ) : (
            <table className="adm-table">
              <thead>
                <tr><th>When</th><th>Via</th><th>Product</th><th>Customer</th><th>Contact</th><th>Message</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {quotes.map(e => <EnquiryRow key={e._id} enquiry={e} />)}
              </tbody>
            </table>
          )}
        </div>

        {topClicked.length > 0 && (
          <>
            <div className="adm-ph" style={{ marginTop: 40 }}>
              <div>
                <h2>WhatsApp &amp; call taps by product</h2>
                <p style={{ margin: '2px 0 0', fontSize: 13, color: '#6b7280' }}>
                  Which products make people reach for the phone — your real demand signal.
                </p>
              </div>
            </div>
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead><tr><th>Product</th><th>WhatsApp</th><th>Calls</th><th>Total</th></tr></thead>
                <tbody>
                  {topClicked.map((c, i) => (
                    <tr key={i}>
                      <td><b>{c.name}</b></td>
                      <td>{c.whatsapp}</td>
                      <td>{c.call}</td>
                      <td><b>{c.whatsapp + c.call}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
