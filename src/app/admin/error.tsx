'use client';

import { useEffect } from 'react';
import Link from 'next/link';

// Admin pages are force-dynamic and read the database on every request, so the
// most likely cause here is the database being unreachable. Say so plainly —
// the audience is the shop owner, not an anonymous visitor.
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error boundary caught:', error);
  }, [error]);

  return (
    <>
      <div className="adm-topbar"><h1>Something went wrong</h1></div>
      <div className="adm-content">
        <div className="adm-err" style={{ maxWidth: 560 }}>
          This page couldn&rsquo;t load. If it keeps happening, the database
          connection is the most likely cause — check that the Neon project is
          awake and that <code>DATABASE_URL</code> is still valid.
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
          <button className="btn-adm btn-adm-primary" onClick={reset} type="button">
            Try again
          </button>
          <Link href="/admin" className="btn-adm btn-adm-ghost">Back to dashboard</Link>
        </div>

        {error.digest && (
          <p style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 26 }}>
            Reference:{' '}
            <code style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>{error.digest}</code>
          </p>
        )}
      </div>
    </>
  );
}
