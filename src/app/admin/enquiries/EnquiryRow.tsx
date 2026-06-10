'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

const STATUS_STYLES: Record<string, { bg: string; fg: string }> = {
  new:       { bg: '#fef3c7', fg: '#92400e' },
  contacted: { bg: '#dbeafe', fg: '#1e40af' },
  closed:    { bg: '#e5e7eb', fg: '#4b5563' },
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' +
         d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
}

export default function EnquiryRow({ enquiry: e }: { enquiry: Enquiry }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function setStatus(status: string) {
    setBusy(true);
    await fetch(`/api/enquiries/${e._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    router.refresh();
  }

  async function del() {
    if (!confirm('Delete this enquiry?')) return;
    setBusy(true);
    await fetch(`/api/enquiries/${e._id}`, { method: 'DELETE' });
    router.refresh();
  }

  const ss = STATUS_STYLES[e.status] ?? STATUS_STYLES.new;

  return (
    <tr style={{ opacity: busy ? 0.5 : 1 }}>
      <td style={{ whiteSpace: 'nowrap', fontSize: 12.5, color: '#6b7280' }}>{fmtDate(e.createdAt)}</td>
      <td>
        <span style={{
          display: 'inline-block', padding: '3px 10px', borderRadius: 999,
          fontSize: 11.5, fontWeight: 800, letterSpacing: '.02em',
          background: e.source === 'chat' ? '#ede9fe' : '#e0f2fe',
          color: e.source === 'chat' ? '#6d28d9' : '#0369a1',
        }}>
          {e.source === 'chat' ? '🤖 Hira' : 'Form'}
        </span>
      </td>
      <td>
        {e.productSlug
          ? <a href={`/product/${e.productSlug}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--navy)', fontWeight: 700 }}>{e.productName ?? e.productSlug}</a>
          : <b>{e.productName ?? '—'}</b>}
      </td>
      <td><b>{e.name ?? '—'}</b></td>
      <td style={{ fontSize: 13 }}>
        {e.phone && <a href={`tel:${e.phone}`} style={{ display: 'block', color: 'var(--navy)', fontWeight: 600 }}>{e.phone}</a>}
        {e.email && <a href={`mailto:${e.email}`} style={{ display: 'block', color: '#6b7280' }}>{e.email}</a>}
        {!e.phone && !e.email && '—'}
      </td>
      <td style={{ maxWidth: 260, fontSize: 13, color: '#4b5563' }}>
        <span style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={e.message ?? ''}>
          {e.message ?? '—'}
        </span>
      </td>
      <td>
        <select
          value={e.status}
          disabled={busy}
          onChange={ev => setStatus(ev.target.value)}
          style={{
            padding: '5px 10px', borderRadius: 999, border: 'none',
            background: ss.bg, color: ss.fg, fontWeight: 700, fontSize: 12.5,
            cursor: 'pointer', appearance: 'auto',
          }}
        >
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
        </select>
      </td>
      <td>
        <button className="btn-adm btn-adm-danger btn-adm-sm" onClick={del} disabled={busy}>Delete</button>
      </td>
    </tr>
  );
}
