'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import posthog from 'posthog-js';
import { Analytics } from '@vercel/analytics/react';

export default function AnalyticsWrapper() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) {
      // Ensure session recording is stopped if they navigate to admin
      posthog.stopSessionRecording();
    } else {
      // Manually capture pageviews for non-admin routes
      posthog.capture('$pageview');
      // Start session recording (only takes effect if enabled in PostHog project settings)
      posthog.startSessionRecording();
    }
  }, [pathname, isAdmin]);

  // Do not render Vercel Analytics for admin routes
  if (isAdmin) {
    return null;
  }

  return <Analytics />;
}
