'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RepairJobDeleteBtn({ id, title }: { id: string; title: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function del() {
    if (!confirm(`Delete "${title}"?`)) return;
    setBusy(true);
    await fetch(`/api/repair-jobs/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <button className="btn-adm btn-adm-danger btn-adm-sm" onClick={del} disabled={busy}>
      {busy ? '…' : 'Delete'}
    </button>
  );
}
