// Cloudinary delivery optimization: f_auto serves WebP/AVIF where supported,
// q_auto picks a visually-lossless compression level. Idempotent and safe on
// non-Cloudinary URLs (returned untouched).
export function cdn(url: string | null | undefined): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  if (/\/upload\/[^/]*\bf_auto\b/.test(url)) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
}
