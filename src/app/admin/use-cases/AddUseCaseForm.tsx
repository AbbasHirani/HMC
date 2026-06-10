'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function AddUseCaseForm() {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true); setError('');
    const res = await fetch('/api/use-cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed, slug: slugify(trimmed) }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? 'Already exists or failed');
      return;
    }
    setName('');
    router.refresh();
  }

  return (
    <div style={{ marginBottom: 32 }}>
      {error && <div className="adm-err" style={{ marginBottom: 10 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 10 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="e.g. Home Use, Agriculture, Car Washing, Industrial…"
          style={{ flex: 1 }}
        />
        <button
          className="btn-adm btn-adm-primary"
          onClick={add}
          disabled={saving || !name.trim()}
          style={{ whiteSpace: 'nowrap' }}
        >
          {saving ? 'Adding…' : '+ Add'}
        </button>
      </div>
      <p style={{ margin: '7px 0 0', fontSize: 12, color: '#9ca3af' }}>
        Press Enter or click Add. Slug auto-generated.
      </p>
    </div>
  );
}
