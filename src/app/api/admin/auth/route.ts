import { NextRequest, NextResponse } from 'next/server';
import { createHash, timingSafeEqual } from 'crypto';
import { SignJWT } from 'jose';
import { getAdminSecret } from '@/lib/adminAuth';
import { rateLimit, clientIp } from '@/lib/rateLimit';

export const runtime = 'nodejs';

// Constant-time equality via fixed-length SHA-256 digests (avoids leaking the
// password length or matching prefix through response timing).
function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function POST(req: NextRequest) {
  // Throttle brute-force attempts: 8 tries per IP per 10 minutes.
  const limit = rateLimit(`login:${clientIp(req)}`, 8, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  let password = '';
  try {
    ({ password } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (typeof password !== 'string' || !safeEqual(password, expected)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  let token: string;
  try {
    token = await new SignJWT({ admin: true })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(getAdminSecret());
  } catch {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('hmc_admin', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('hmc_admin');
  return res;
}
