import posthog from 'posthog-js'

// PostHog is optional. Without a project token (local dev, preview branches,
// forks) posthog.init logs a critical error and no-ops, and every later
// capture call logs "You must initialize PostHog before calling ...". Skipping
// init entirely keeps those environments quiet; AnalyticsWrapper checks the
// same env var before calling into posthog.
const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN

if (token) {
    posthog.init(token, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        defaults: '2026-05-30',
        person_profiles: 'identified_only',
        capture_pageview: false, // We handle this manually in AnalyticsWrapper
        disable_session_recording: true, // We handle this manually in AnalyticsWrapper
        autocapture: {
            url_ignorelist: ['/admin.*', '.*/admin.*']
        }
    })
}
