import { schedulePosthogLoad } from './lib/posthogClient'

// PostHog is optional (see posthogClient.ts for the no-token no-op) and is
// loaded lazily during idle time — see posthogClient.ts for why.
schedulePosthogLoad()
