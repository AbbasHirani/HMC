import type { Metadata } from 'next';
import './globals.css';
import { jsonLd } from '@/lib/jsonLd';
import ClientChatAssistant from '@/components/ClientChatAssistant';
import AnalyticsWrapper from '@/components/AnalyticsWrapper';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hiranimarketingcombines.in';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'Hirani Marketing Combines — Pumps, Water Systems & Industrial Supply, Chennai',
    template: '%s | Hirani Marketing Combines',
  },
  description:
    "Buy water pumps, pressure booster pumps, hydro test pumps, chemical pumps, high pressure washers, dosing pumps and RO systems in Parrys, Chennai. Hirani Marketing Combines offers sales, service and industrial pumping solutions.",
  openGraph: {
    siteName: 'Hirani Marketing Combines',
    locale: 'en_IN',
    type: 'website',
    url: SITE,
    images: [
      {
        url: `${SITE}/shop.jpg`,
        width: 1200,
        height: 630,
        alt: 'Hirani Marketing Combines — Storefront & Equipment Workshop',
        type: 'image/jpeg',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'myNNIhfRT3bfM6ZuZ7l5EM19cA5pFbYK-InSRTeSj6E',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hirani Marketing Combines — Pumps, Water Systems & Industrial Supply, Chennai',
    description:
      "Buy water pumps, pressure booster pumps, hydro test pumps, chemical pumps, high pressure washers, dosing pumps and RO systems in Parrys, Chennai. Hirani Marketing Combines offers sales, service and industrial pumping solutions.",
    images: [`${SITE}/shop.jpg`],
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE}/#organization`,
  name: 'Hirani Marketing Combines',
  url: SITE,
  logo: `${SITE}/logo-mark.png`,
  telephone: '+919840159762',
  email: 'hiranimarketingcombines@gmail.com',
  sameAs: [
    'https://share.google/sOaPiynM2Hl88l3Zn',
    'https://www.instagram.com/hiranimarketingcombines/',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE}/#website`,
  name: 'Hirani Marketing Combines',
  url: SITE,
};

const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE}/#localbusiness`,
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
  areaServed: [
    { '@type': 'City', name: 'Chennai' },
    { '@type': 'City', name: 'Parrys' },
    { '@type': 'City', name: 'George Town' },
    { '@type': 'AdministrativeArea', name: 'Tamil Nadu' },
  ],
  priceRange: '₹₹',
  currenciesAccepted: 'INR',
  paymentAccepted: 'Cash, Bank Transfer, UPI',
  description:
    "Chennai's authorised dealer for hydro test pumps, chemical pumps, RO systems, industrial pumps and pressure washers. Workshop repair & reconditioning at Parrys since 2008.",
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Pumps & Water Systems',
    itemListElement: [
      { '@type': 'OfferCatalog', name: 'Hydro Test Pumps' },
      { '@type': 'OfferCatalog', name: 'Chemical Pumps' },
      { '@type': 'OfferCatalog', name: 'Industrial Water Pumps' },
      { '@type': 'OfferCatalog', name: 'RO Systems & Water Filters' },
      { '@type': 'OfferCatalog', name: 'Pressure Booster Pumps' },
      { '@type': 'OfferCatalog', name: 'High Pressure Washers' },
      { '@type': 'OfferCatalog', name: 'Submersible Pumps' },
      { '@type': 'OfferCatalog', name: 'Air Equipment & Compressors' },
    ],
  },
  hasMap: 'https://maps.google.com/?q=Hirani+Marketing+Combines+Parrys+Chennai',
  sameAs: [
    'https://share.google/sOaPiynM2Hl88l3Zn',
    'https://www.instagram.com/hiranimarketingcombines/',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo-mark.png" />
        <link rel="apple-touch-icon" href="/logo-mark.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(localBusinessSchema) }}
        />
      </head>
      <body>
        {children}
        <ClientChatAssistant />
        <AnalyticsWrapper />
      </body>
    </html>
  );
}
