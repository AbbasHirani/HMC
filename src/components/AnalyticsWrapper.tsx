'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { getPosthog } from '@/lib/posthogClient';
import { Analytics } from '@vercel/analytics/react';

// Mirrors the guard in posthogClient.ts — posthog is never initialized
// without a token, so calling into it here would just log errors on every nav.
const POSTHOG_ENABLED = Boolean(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN);

export default function AnalyticsWrapper() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    if (!POSTHOG_ENABLED) return;
    getPosthog().then(posthog => {
      if (isAdmin) {
        // Ensure session recording is stopped if they navigate to admin
        posthog.stopSessionRecording();
      } else {
        // Manually capture pageviews for non-admin routes
        posthog.capture('$pageview');
        // Start session recording (only takes effect if enabled in PostHog project settings)
        posthog.startSessionRecording();
      }
    });
  }, [pathname, isAdmin]);

  // Do not render Vercel Analytics for admin routes
  if (isAdmin) {
    return null;
  }

  return <Analytics />;
}
