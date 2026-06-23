import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== 'production';

// Content-Security-Policy tuned to what the site actually loads:
//  - Google Fonts (fonts.googleapis.com / fonts.gstatic.com)
//  - Google Maps embed (frame-src)
//  - Cloudinary images (res.cloudinary.com)
//  - same-origin /api/chat streaming (connect-src 'self')
// 'unsafe-inline' is needed for Next's inline bootstrap + inline JSON-LD/styles.
// In dev we additionally allow eval + websockets so HMR keeps working.
const csp = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `frame-ancestors 'self'`,
  `img-src 'self' data: blob: https://res.cloudinary.com`,
  `font-src 'self' https://fonts.gstatic.com`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  `frame-src https://www.google.com https://maps.google.com`,
  `form-action 'self'`,
  `upgrade-insecure-requests`,
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
];

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async redirects() {
    return [
      // /catalogue?cat=X&sub=Y → /catalogue/X/Y  (more specific — must come first)
      {
        source: '/catalogue',
        has: [
          { type: 'query', key: 'cat', value: '(?<cat>[^&]+)' },
          { type: 'query', key: 'sub', value: '(?<sub>[^&]+)' },
        ],
        destination: '/catalogue/:cat/:sub',
        permanent: true,
      },
      // /catalogue?cat=X → /catalogue/X
      {
        source: '/catalogue',
        has: [{ type: 'query', key: 'cat', value: '(?<cat>[^&]+)' }],
        destination: '/catalogue/:cat',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
