import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { revalidatePath, revalidateTag } from 'next/cache';
import { check, reqStr, optStr, optHttpUrl } from '@/lib/validate';

export async function GET() {
  const rows = await sql`SELECT * FROM categories ORDER BY sort_order`;
  return NextResponse.json(rows.map(r => ({ ...r, _id: r.id })));
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const err = check(() => {
    reqStr(body.slug, 'slug', 200);
    reqStr(body.name, 'name', 200);
    optStr(body.teaser, 'teaser', 2000);
    optStr(body.footText, 'footText', 2000);
    optHttpUrl(body.imageUrl, 'imageUrl');
  });
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const rows = await sql`
    INSERT INTO categories (slug, name, icon, teaser, foot_text, image_url, image_public_id, sort_order, seo)
    VALUES (
      ${body.slug}, ${body.name}, ${body.icon ?? ''},
      ${body.teaser ?? ''}, ${body.footText ?? ''},
      ${body.imageUrl ?? null}, ${body.imagePublicId ?? null},
      ${body.order ?? 999},
      ${body.seo ?? '{}'}
    )
    RETURNING *
  `;
  const r = rows[0];
  revalidateTag('categories', 'max');
  revalidatePath('/');
  revalidatePath('/catalogue');
  return NextResponse.json({ ...r, _id: r.id }, { status: 201 });
}
