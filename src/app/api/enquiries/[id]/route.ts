import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// PATCH/DELETE are admin-only via middleware (mutating methods on /api).

const STATUSES = new Set(['new', 'contacted', 'closed']);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const status = String(body.status ?? '');
  if (!STATUSES.has(status)) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }
  await sql`UPDATE enquiries SET status = ${status} WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await sql`DELETE FROM enquiries WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
