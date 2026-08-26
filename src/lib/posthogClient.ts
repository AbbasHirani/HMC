// posthog-js is ~100+ KiB and was previously imported statically from both
// instrumentation-client.ts (runs before hydration) and AnalyticsWrapper.tsx,
// putting it on the critical path for every page load. Loading it through a
// single cached dynamic import lets both call sites share one init instead of
// racing, while keeping the module out of the initial JS bundle entirely.
let posthogPromise: Promise<typeof import('posthog-js').default> | null = null;

export function getPosthog(): Promise<typeof import('posthog-js').default> {
  if (!posthogPromise) {
    posthogPromise = import('posthog-js').then(({ default: posthog }) => {
      const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
      if (token) {
        posthog.init(token, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
          defaults: '2026-05-30',
          person_profiles: 'identified_only',
          capture_pageview: false, // We handle this manually in AnalyticsWrapper
          disable_session_recording: true, // We handle this manually in AnalyticsWrapper
          autocapture: {
            url_ignorelist: ['/admin.*', '.*/admin.*'],
          },
        });
      }
      return posthog;
    });
  }
  return posthogPromise;
}

// Defers the load to the browser's idle period (falling back to a short
// timeout on Safari, which has no requestIdleCallback) so it never competes
// with hydration or LCP for main-thread time.
export function schedulePosthogLoad(): void {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => void getPosthog());
  } else {
    setTimeout(() => void getPosthog(), 1);
  }
}
