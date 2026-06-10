// Shared admin-session helpers. Used by middleware (edge) and the login route.
// jose is edge-compatible, so this file is safe to import from middleware.
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

/**
 * Returns the signing key for admin JWTs.
 * Throws (fails closed) if ADMIN_SECRET is missing or too weak — we never fall
 * back to a hardcoded default, which would let anyone forge an admin token.
 */
export function getAdminSecret(): Uint8Array {
  const s = process.env.ADMIN_SECRET;
  if (!s || s.length < 16) {
    throw new Error('ADMIN_SECRET is not set or is shorter than 16 characters.');
  }
  return new TextEncoder().encode(s);
}

/** True only if the request carries a valid, unexpired admin session cookie. */
export async function hasValidAdminSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('hmc_admin')?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getAdminSecret());
    return true;
  } catch {
    return false;
  }
}
