// Client-side image compression and optional WebP conversion.
// Uses createImageBitmap + canvas/OffscreenCanvas to resize and encode.
export async function compressImageFile(
  file: File,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number; convertToWebp?: boolean }
): Promise<File> {
  const { maxWidth = 1600, maxHeight = 1600, quality = 0.78, convertToWebp = true } = options ?? {};

  // Desired mime type for output
  const outType = convertToWebp ? 'image/webp' : file.type;

  // Try to create an ImageBitmap (fast, handles many image sources)
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file as Blob);
  } catch {
    // Fallback: load via Image element
    bitmap = await new Promise<ImageBitmap>((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = async () => {
        try {
          const c = document.createElement('canvas');
          c.width = img.naturalWidth;
          c.height = img.naturalHeight;
          const ctx = c.getContext('2d');
          if (!ctx) return reject(new Error('Canvas not supported'));
          ctx.drawImage(img, 0, 0);
          const bm = await createImageBitmap(c);
          URL.revokeObjectURL(url);
          resolve(bm);
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
      img.src = url;
    });
  }

  const scale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
  const targetW = Math.max(1, Math.round(bitmap.width * scale));
  const targetH = Math.max(1, Math.round(bitmap.height * scale));

  // Use OffscreenCanvas when available (worker-friendly), otherwise DOM canvas
  if (typeof OffscreenCanvas !== 'undefined') {
    const oc = new OffscreenCanvas(targetW, targetH);
    const ctx = oc.getContext('2d');
    if (!ctx) throw new Error('OffscreenCanvas 2D context not available');
    ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    // convertToBlob supported on OffscreenCanvas
    const blob = await oc.convertToBlob({ type: outType, quality });
    const name = file.name.replace(/\.[^/.]+$/, '') + (convertToWebp ? '.webp' : file.name.match(/\.[^.]+$/)?.[0] ?? '');
    return new File([blob], name, { type: blob.type });
  }

  // DOM canvas path
  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);

  const blob: Blob | null = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(b => resolve(b), outType, quality));
  if (!blob) throw new Error('Image compression failed');
  const name = file.name.replace(/\.[^/.]+$/, '') + (convertToWebp ? '.webp' : file.name.match(/\.[^.]+$/)?.[0] ?? '');
  return new File([blob], name, { type: blob.type });
}
