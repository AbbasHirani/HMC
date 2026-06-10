// Small, dependency-free validation helpers for API route bodies.
// Helpers throw ValidationError on bad input; routes catch it and return 400.
// These run on top of auth (mutations are admin-only) as defense-in-depth:
// they cap field sizes and reject obviously malformed / unsafe values.

export class ValidationError extends Error {}

/** Required non-empty string, length-capped. */
export function reqStr(v: unknown, field: string, max = 500): string {
  if (typeof v !== 'string' || v.trim() === '') {
    throw new ValidationError(`${field} is required`);
  }
  if (v.length > max) throw new ValidationError(`${field} is too long (max ${max})`);
  return v;
}

/** Optional string → returns null when absent/empty, length-capped otherwise. */
export function optStr(v: unknown, field: string, max = 2000): string | null {
  if (v == null || v === '') return null;
  if (typeof v !== 'string') throw new ValidationError(`${field} must be text`);
  if (v.length > max) throw new ValidationError(`${field} is too long (max ${max})`);
  return v;
}

/** Optional http(s) URL (e.g. image/logo URLs) → null when absent. */
export function optHttpUrl(v: unknown, field: string): string | null {
  const s = optStr(v, field, 1000);
  if (s == null) return null;
  if (!/^https?:\/\//i.test(s)) throw new ValidationError(`${field} must be an http(s) URL`);
  return s;
}

/** Optional finite number (accepts numeric strings) → null when absent. */
export function optNum(v: unknown, field: string): number | null {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) throw new ValidationError(`${field} must be a number`);
  return n;
}

/** Validates an array field stays within a size cap (defends against bloat). */
export function optArrayMax(v: unknown, field: string, max = 30): void {
  if (v == null) return;
  if (!Array.isArray(v)) throw new ValidationError(`${field} must be a list`);
  if (v.length > max) throw new ValidationError(`${field} has too many items (max ${max})`);
}

/**
 * Wraps a validation block: runs `fn`, and if it throws a ValidationError,
 * returns the message so the route can respond 400. Returns null when valid.
 */
export function check(fn: () => void): string | null {
  try {
    fn();
    return null;
  } catch (e) {
    if (e instanceof ValidationError) return e.message;
    throw e;
  }
}
