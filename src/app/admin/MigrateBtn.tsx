'use client';
import { useState } from 'react';

export default function MigrateBtn() {
  const [status, setStatus] = useState<'idle' | 'running' | 'ok' | 'err'>('idle');

  async function run() {
    if (!confirm('Run DB migration? Safe to run multiple times.')) return;
    setStatus('running');
    try {
      const res = await fetch('/api/admin/migrate', { method: 'POST' });
      setStatus(res.ok ? 'ok' : 'err');
    } catch {
      setStatus('err');
    }
  }

  return (
    <div style={{ marginTop: 32, padding: '18px 22px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, maxWidth: 500 }}>
      <b style={{ fontSize: 13 }}>Database Migration</b>
      <p style={{ margin: '4px 0 12px', fontSize: 12, color: '#6b7280' }}>
        Run this after pulling new code that adds DB tables. Safe to re-run.
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="btn-adm btn-adm-ghost btn-adm-sm" onClick={run} disabled={status === 'running'}>
          {status === 'running' ? 'Running…' : 'Run migration'}
        </button>
        {status === 'ok' && <span style={{ color: '#16a34a', fontSize: 13, fontWeight: 600 }}>✓ Done</span>}
        {status === 'err' && <span style={{ color: '#dc2626', fontSize: 13, fontWeight: 600 }}>✗ Failed — check console</span>}
      </div>
    </div>
  );
}
