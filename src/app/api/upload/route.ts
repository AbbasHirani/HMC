import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const folder = (formData.get('folder') as string) || 'misc';
  const publicId = (formData.get('publicId') as string) || `img-${Date.now()}`;

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadToCloudinary(buffer, `HMC/${folder}`, publicId);
  return NextResponse.json(result);
}

export async function DELETE(req: NextRequest) {
  const { publicId } = await req.json();
  if (!publicId) return NextResponse.json({ error: 'No publicId' }, { status: 400 });
  await deleteFromCloudinary(publicId);
  return NextResponse.json({ ok: true });
}
