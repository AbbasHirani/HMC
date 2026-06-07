import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

const secret = () =>
  new TextEncoder().encode(process.env.ADMIN_SECRET ?? 'change-me-32-chars-minimum-secret');

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }
  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret());

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
