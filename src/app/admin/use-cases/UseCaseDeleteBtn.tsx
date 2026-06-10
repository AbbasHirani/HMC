'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UseCaseDeleteBtn({ id, name }: { id: string; name: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function del() {
    if (!confirm(`Delete "${name}"? This removes it from all products.`)) return;
    setBusy(true);
    await fetch(`/api/use-cases/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <button
      onClick={del}
      disabled={busy}
      title={`Delete ${name}`}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        width: 20, height: 20, borderRadius: '50%',
        background: 'rgba(239,68,68,.12)', color: '#ef4444',
        border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
        lineHeight: 1, padding: 0, flexShrink: 0,
        transition: 'background .15s',
      }}
      onMouseOver={e => (e.currentTarget.style.background = 'rgba(239,68,68,.25)')}
      onMouseOut={e => (e.currentTarget.style.background = 'rgba(239,68,68,.12)')}
    >
      {busy ? '…' : '×'}
    </button>
  );
}
