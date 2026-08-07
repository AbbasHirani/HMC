import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: '2026-05-30',
    person_profiles: 'identified_only',
    capture_pageview: false, // We handle this manually in AnalyticsWrapper
    disable_session_recording: true, // We handle this manually in AnalyticsWrapper
    autocapture: {
        url_ignorelist: ['/admin.*', '.*/admin.*']
    }
})
