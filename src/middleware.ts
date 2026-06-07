import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = () =>
  new TextEncoder().encode(process.env.ADMIN_SECRET ?? 'change-me-32-chars-minimum-secret');

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === '/admin/login') return NextResponse.next();

  const token = request.cookies.get('hmc_admin')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  try {
    await jwtVerify(token, secret());
  } catch {
    const res = NextResponse.redirect(new URL('/admin/login', request.url));
    res.cookies.delete('hmc_admin');
    return res;
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*'] };
