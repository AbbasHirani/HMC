'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import CTABand from '@/components/CTABand';
import { CONTACT, WA } from '@/lib/data';
import { IconPhone, IconWA } from '@/components/Icons';

// Note: no <Footer /> here. Footer is an async server component (it reads
// categories from the database) and this boundary has to be a client
// component, so CTABand carries the contact details instead.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Route error boundary caught:', error);
  }, [error]);

  return (
    <>
      <Header />
      <main>

      <section className="section" style={{ paddingTop: 64, paddingBottom: 56 }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <span className="eyebrow">Something went wrong</span>
          <h1 style={{ fontSize: 'clamp(28px,3.6vw,42px)', marginTop: 12, lineHeight: 1.15 }}>
            This page didn&rsquo;t load
          </h1>
          <p style={{ color: 'var(--slate)', fontSize: 16.5, lineHeight: 1.7, marginTop: 14, maxWidth: 560 }}>
            A temporary problem on our side, not anything you did. Try again — and
            if it keeps happening, call or WhatsApp us and we&rsquo;ll help you
            directly.
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={reset} type="button">
              Try again
            </button>
            <Link className="btn btn-ghost btn-lg" href="/catalogue">
              Browse the catalogue
            </Link>
            <a className="btn btn-ghost btn-lg" href={CONTACT.phoneHref}>
              <IconPhone />
              {CONTACT.phone}
            </a>
            <a className="btn btn-ghost btn-lg" href={WA} target="_blank" rel="noopener noreferrer">
              <IconWA />
              WhatsApp
            </a>
          </div>

          {error.digest && (
            <p style={{ color: 'var(--muted)', fontSize: 12.5, marginTop: 30 }}>
              If you contact us, quoting this reference helps us find the problem:{' '}
              <code style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                background: 'var(--paper)', border: '1px solid var(--line)',
                borderRadius: 'var(--radius-sm)', padding: '2px 7px', color: 'var(--slate)',
              }}>
                {error.digest}
              </code>
            </p>
          )}
        </div>
      </section>

      <CTABand />
      </main>
    </>
  );
}
