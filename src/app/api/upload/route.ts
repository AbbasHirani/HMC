import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';

// Raster images only. SVG is deliberately excluded — it can carry inline
// <script> and become stored XSS when served from our Cloudinary domain.
const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif',
  'video/mp4', 'video/webm', 'video/quicktime'
]);
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB to allow videos

// Keep folder / publicId to safe characters so they can't traverse or inject.
function sanitizeSegment(v: string, fallback: string): string {
  const cleaned = v.replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 100);
  return cleaned || fallback;
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file');
  const folder = sanitizeSegment(String(formData.get('folder') ?? 'misc'), 'misc');
  const publicId = sanitizeSegment(String(formData.get('publicId') ?? `img-${Date.now()}`), `img-${Date.now()}`);

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type. Upload an image or video.' }, { status: 415 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'File must be between 1 byte and 50 MB.' }, { status: 413 });
  }

  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadToCloudinary(buffer, `HMC/${folder}`, publicId, resourceType);
  return NextResponse.json({ ...result, resourceType });
}

export async function DELETE(req: NextRequest) {
  const { publicId, resourceType } = await req.json();
  if (!publicId || typeof publicId !== 'string') {
    return NextResponse.json({ error: 'No publicId' }, { status: 400 });
  }
  await deleteFromCloudinary(publicId, resourceType === 'video' ? 'video' : 'image');
  return NextResponse.json({ ok: true });
}
