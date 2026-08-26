import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { hasValidAdminSession } from '@/lib/adminAuth';
import { rateLimit, clientIp } from '@/lib/rateLimit';
import { check, optStr } from '@/lib/validate';

const SOURCES = new Set(['quote', 'whatsapp', 'call', 'chat']);

// Public endpoint — customers submit quote requests / click logs from the site.
export async function POST(req: NextRequest) {
  // 10 enquiries per IP per minute blunts scripted spam.
  const limit = rateLimit(`enq:${clientIp(req)}`, 10, 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const err = check(() => {
    optStr(body.productName, 'productName', 300);
    optStr(body.productSlug, 'productSlug', 200);
    optStr(body.name, 'name', 200);
    optStr(body.phone, 'phone', 50);
    optStr(body.email, 'email', 200);
    optStr(body.message, 'message', 3000);
  });
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  // Honeypot: a hidden field no human can fill. Write nothing, but mirror the
  // success response exactly — same status and same shape, id included — so a
  // bot cannot tell its submissions are being dropped.
  if (typeof body.company === 'string' && body.company.trim() !== '') {
    return NextResponse.json({ ok: true, id: crypto.randomUUID() }, { status: 201 });
  }

  const source = SOURCES.has(String(body.source)) ? String(body.source) : 'quote';
  // A quote request must carry at least a name — click logs (whatsapp/call) don't.
  if (source === 'quote' && !(typeof body.name === 'string' && body.name.trim())) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO enquiries (product_name, product_slug, name, phone, email, message, source)
    VALUES (
      ${(body.productName as string) ?? null},
      ${(body.productSlug as string) ?? null},
      ${(body.name as string) ?? null},
      ${(body.phone as string) ?? null},
      ${(body.email as string) ?? null},
      ${(body.message as string) ?? null},
      ${source}
    )
    RETURNING id
  `;
  return NextResponse.json({ ok: true, id: rows[0].id }, { status: 201 });
}

// Admin-only — the inbox list (GETs bypass the middleware auth, so check here).
export async function GET(req: NextRequest) {
  if (!await hasValidAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (req.nextUrl.searchParams.get('countOnly') === '1') {
    const rows = await sql`SELECT COUNT(*) AS count FROM enquiries WHERE status = 'new' AND source IN ('quote', 'chat')`.catch(() => [{ count: 0 }]);
    return NextResponse.json({ count: Number(rows[0].count) });
  }

  const rows = await sql`SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 500`.catch(() => []);
  return NextResponse.json(rows.map(r => ({ ...r, _id: r.id })));
}
