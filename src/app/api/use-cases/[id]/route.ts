import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { revalidatePath, revalidateTag } from 'next/cache';

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_: NextRequest, { params }: Params) {
  const { id } = await params;
  await sql`DELETE FROM use_cases WHERE id = ${id}`;
  revalidateTag('use-cases', 'max');
  revalidatePath('/catalogue');
  return NextResponse.json({ ok: true });
}
