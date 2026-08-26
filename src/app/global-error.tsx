'use client';

import { useEffect } from 'react';

// Last-resort boundary: this replaces the root layout, so it must render its
// own <html> and <body>. Everything here is inline and self-contained on
// purpose — no globals.css, no shared components, no fonts. If this file
// needed any of those, the failure that got us here could take it down too.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error boundary caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#f6f5f8', color: '#1b1b29', fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif' }}>
        <main style={{ maxWidth: 560, margin: '0 auto', padding: '96px 24px', textAlign: 'center' }}>
          <div style={{ width: 44, height: 4, background: '#FA5A22', borderRadius: 2, margin: '0 auto 28px' }} />

          <h1 style={{ fontSize: 27, lineHeight: 1.25, margin: 0, color: '#1E1D5C', fontWeight: 800 }}>
            Hirani Marketing Combines
          </h1>
          <p style={{ fontSize: 16.5, lineHeight: 1.65, color: '#5a5a6b', marginTop: 16 }}>
            The site hit an unexpected problem and couldn&rsquo;t finish loading.
            Please try again in a moment — or contact us directly and we&rsquo;ll
            help you straight away.
          </p>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 30 }}>
            <button
              onClick={reset}
              type="button"
              style={{
                padding: '12px 24px', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: '#FA5A22', color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
              }}
            >
              Try again
            </button>
            <a
              href="tel:+919840159762"
              style={{
                padding: '12px 24px', borderRadius: 7, textDecoration: 'none',
                background: '#fff', color: '#1E1D5C', border: '1.5px solid #e9e8ee',
                fontSize: 15, fontWeight: 700,
              }}
            >
              +91 98401 59762
            </a>
            <a
              href="https://wa.me/919840159762"
              style={{
                padding: '12px 24px', borderRadius: 7, textDecoration: 'none',
                background: '#fff', color: '#1E1D5C', border: '1.5px solid #e9e8ee',
                fontSize: 15, fontWeight: 700,
              }}
            >
              WhatsApp
            </a>
          </div>

          <p style={{ fontSize: 13, color: '#8a8a99', marginTop: 34, lineHeight: 1.6 }}>
            Parrys, George Town, Chennai · Mon–Sat, 9 am – 6 pm
          </p>

          {error.digest && (
            <p style={{ fontSize: 12, color: '#8a8a99', marginTop: 10 }}>
              Reference: <code style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}>{error.digest}</code>
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
