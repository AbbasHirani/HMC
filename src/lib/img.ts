const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hiranimarketingcombines.in';

// Cloudinary delivery optimization: f_auto serves WebP/AVIF where supported,
// q_auto picks a visually-lossless compression level. Idempotent and safe on
// non-Cloudinary URLs (returned untouched).
export function cdn(url: string | null | undefined): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  if (/\/upload\/[^/]*\bf_auto\b/.test(url)) return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
}

/**
 * Formats product/brand/category images for WhatsApp large cards (1200x630px, 1.91:1 ratio).
 * Pads raw image centered on white background without text overlay.
 */
export function ogImage(url: string | null | undefined, fallbackPath = '/shop.jpg'): string {
  if (!url) {
    return fallbackPath.startsWith('http') ? fallbackPath : `${SITE}${fallbackPath}`;
  }
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    if (/\/upload\/[^/]*\bc_pad\b/.test(url)) return url;
    return url.replace('/upload/', '/upload/c_pad,w_1200,h_630,b_white,f_jpg,q_auto/');
  }
  return url.startsWith('http') ? url : `${SITE}${url}`;
}
