import type { Metadata } from 'next';
import './globals.css';
import ChatAssistant from '@/components/ChatAssistant';
import { jsonLd } from '@/lib/jsonLd';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hiranimarketing.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Hirani Marketing Combines — Pumps, Water Systems & Industrial Supply, Chennai',
    template: '%s | Hirani Marketing Combines',
  },
  description:
    "Chennai's trusted pump & water-systems specialist since 2008. Water pumps, RO & filtration, fountains, pressure washers and hydraulic equipment — supplied to spec with workshop repair at our Parrys shop.",
  openGraph: {
    siteName: 'Hirani Marketing Combines',
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/logo-mark.png', width: 512, height: 512, alt: 'Hirani Marketing Combines' }],
  },
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Hirani Marketing Combines',
  image: `${SITE}/logo-mark.png`,
  url: SITE,
  telephone: '+919840159762',
  email: 'hiranimarketingcombines@gmail.com',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Old No.133 / New No.279, Thambu Chetty St, opposite TNEB office',
    addressLocality: 'Parrys, George Town',
    addressRegion: 'Tamil Nadu',
    postalCode: '600001',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 13.0918,
    longitude: 80.2872,
  },
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '09:00',
    closes: '18:00',
  },
  priceRange: '₹₹',
  description:
    "Chennai's trusted supplier of water pumps, RO & filtration systems, fountains, pressure washers and industrial equipment. Workshop repair & reconditioning at Parrys.",
  hasMap: 'https://maps.google.com/?q=Hirani+Marketing+Combines+Parrys+Chennai',
  sameAs: [],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-mark.png" />
        <link rel="apple-touch-icon" href="/logo-mark.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(localBusinessSchema) }}
        />
      </head>
      <body>
        {children}
        <ChatAssistant />
      </body>
    </html>
  );
}
