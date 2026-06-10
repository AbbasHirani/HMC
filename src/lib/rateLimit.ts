// Lightweight in-memory sliding-window rate limiter.
//
// NOTE: state lives per server instance, so in a multi-instance / serverless
// deployment this is best-effort, not a hard guarantee. It still meaningfully
// blunts scripted abuse and runaway cost. For strong limits, back this with a
// shared store (e.g. Upstash/Redis) later.

interface Bucket { hits: number[] }
const store = new Map<string, Bucket>();

// Occasionally evict stale buckets so the map can't grow unbounded.
function sweep(now: number, windowMs: number) {
  if (store.size < 5000) return;
  for (const [key, b] of store) {
    if (b.hits.length === 0 || b.hits[b.hits.length - 1] < now - windowMs) store.delete(key);
  }
}

/**
 * Returns `{ ok }` — true if this key is under the limit, false if it should be
 * rejected. Counts the current request when allowed.
 */
export function rateLimit(key: string, max: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  sweep(now, windowMs);
  const bucket = store.get(key) ?? { hits: [] };
  bucket.hits = bucket.hits.filter(t => t > now - windowMs);
  if (bucket.hits.length >= max) {
    const retryAfter = Math.ceil((bucket.hits[0] + windowMs - now) / 1000);
    store.set(key, bucket);
    return { ok: false, retryAfter: Math.max(retryAfter, 1) };
  }
  bucket.hits.push(now);
  store.set(key, bucket);
  return { ok: true, retryAfter: 0 };
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}
