// Cloudinary delivery optimization: f_auto serves WebP/AVIF where supported,
// q_auto picks a visually-lossless compression level. maxWidth adds a
// c_limit cap (never upscales, only shrinks originals bigger than that) so
// `next/image` — which runs with `unoptimized: true` and therefore does no
// resizing of its own — doesn't ship a full-resolution original to a phone
// screen. Idempotent and safe on non-Cloudinary URLs (returned untouched).
export function cdn(url: string | null | undefined, maxWidth?: number): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  if (/\/upload\/[^/]*\bf_auto\b/.test(url)) return url;
  const transform = maxWidth ? `f_auto,q_auto,w_${maxWidth},c_limit` : 'f_auto,q_auto';
  return url.replace('/upload/', `/upload/${transform}/`);
}
