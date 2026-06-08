'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function BrandDeleteBtn({ id, name }: { id: string; name: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function del() {
    if (!confirm(`Delete brand "${name}"? This won't affect existing products.`)) return;
    setBusy(true);
    await fetch(`/api/brands/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <button className="btn-adm btn-adm-danger btn-adm-sm" onClick={del} disabled={busy}>
      {busy ? '…' : 'Delete'}
    </button>
  );
}
