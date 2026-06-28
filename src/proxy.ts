import { NextRequest, NextResponse } from 'next/server';
import { hasValidAdminSession } from '@/lib/adminAuth';

// Mutating methods that must be authenticated on /api routes.
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// /api routes that authenticate themselves or are intentionally public.
// (auth = login/logout, migrate = checks the admin session itself,
//  chat = public assistant, enquiries POST = public quote form, rate-limited.)
const API_PUBLIC = new Set(['/api/admin/auth', '/api/admin/migrate', '/api/chat', '/api/enquiries']);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin pages: require a valid session, redirect to login otherwise ──
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();
    if (await hasValidAdminSession(request)) return NextResponse.next();
    const res = NextResponse.redirect(new URL('/admin/login', request.url));
    res.cookies.delete('hmc_admin');
    return res;
  }

  // ── API: reads stay public; mutations require a valid admin session ──
  if (pathname.startsWith('/api')) {
    if (!MUTATING.has(request.method)) return NextResponse.next();
    if (API_PUBLIC.has(pathname)) return NextResponse.next();
    if (await hasValidAdminSession(request)) return NextResponse.next();
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/api/:path*'] };
