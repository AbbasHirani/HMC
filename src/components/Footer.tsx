import Link from 'next/link';
import Image from 'next/image';
import { CONTACT, WA } from '@/lib/data';
import { getCategories } from '@/lib/queries';
import { IconPhone, IconWA, IconEnvelope, IconMapPin } from './Icons';

const T = {
  en: {
    blurb: (since: string) => <>Chennai&rsquo;s trusted supplier of water pumps, RO &amp; filtration systems, fountains and industrial equipment. Serving customers since {since}.</>,
    callNow: 'Call now', products: 'Products', viewAll: 'View all products →',
    company: 'Company', home: 'Home', services: 'Services', aboutUs: 'About us', allProducts: 'All products',
    contact: 'Contact us', hours: 'Mon – Sat, 9 am – 6 pm', sales: 'Sales enquiries',
    waEnquiry: 'WhatsApp enquiry', quick: 'Quick response', dropIn: 'Drop in for workshop service',
    rights: 'All rights reserved.',
    homeHref: '/', servicesHref: '/services',
  },
  ta: {
    blurb: (since: string) => <>தண்ணீர் பம்புகள், RO &amp; வடிகட்டி அமைப்புகள், நீரூற்றுகள் மற்றும் தொழிற்சாலை உபகரணங்களுக்கு சென்னையின் நம்பகமான கடை. {since} முதல் சேவையில்.</>,
    callNow: 'அழைக்கவும்', products: 'பொருட்கள்', viewAll: 'அனைத்து பொருட்களும் →',
    company: 'நிறுவனம்', home: 'முகப்பு', services: 'சேவைகள்', aboutUs: 'எங்களை பற்றி', allProducts: 'அனைத்து பொருட்கள்',
    contact: 'தொடர்பு கொள்ள', hours: 'திங்கள் – சனி, காலை 9 – மாலை 6', sales: 'விற்பனை விசாரணை',
    waEnquiry: 'WhatsApp விசாரணை', quick: 'விரைவான பதில்', dropIn: 'பழுது சேவைக்கு கடைக்கு வாருங்கள்',
    rights: 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    homeHref: '/ta', servicesHref: '/ta/services',
  },
};

export default async function Footer({ lang = 'en' }: { lang?: 'en' | 'ta' }) {
  const categories = await getCategories().catch(() => []);
  const year = new Date().getFullYear();
  const t = T[lang];

  return (
    <footer className="site-footer">
      <div className="foot-top">
        <div className="container">
          <div className="foot-grid">
            {/* Col 1 — Brand */}
            <div className="foot-col foot-about">
              <div className="foot-brand">
                <span className="brand-chip">
                  <Image src="/logo-mark.png" alt="HMC" width={32} height={32} />
                </span>
                <b>Hirani Marketing Combines</b>
              </div>
              <p>{t.blurb(CONTACT.since)}</p>
              <div className="foot-cta">
                <a className="btn btn-primary btn-sm" href={CONTACT.phoneHref}><IconPhone />{t.callNow}</a>
                <a className="btn btn-ghost-light btn-sm" href={WA} target="_blank" rel="noopener noreferrer"><IconWA />WhatsApp</a>
              </div>
            </div>

            {/* Col 2 — Products */}
            <div className="foot-col">
              <h4>{t.products}</h4>
              {categories.map(c => (
                <Link key={c.slug} href={`/catalogue?cat=${c.slug}`}>{c.name}</Link>
              ))}
              <Link href="/catalogue" className="foot-all">{t.viewAll}</Link>
            </div>

            {/* Col 3 — Company */}
            <div className="foot-col">
              <h4>{t.company}</h4>
              <Link href={t.homeHref}>{t.home}</Link>
              <Link href={t.servicesHref}>{t.services}</Link>
              <Link href={`${t.servicesHref}#about`}>{t.aboutUs}</Link>
              <Link href="/catalogue">{t.allProducts}</Link>
            </div>

            {/* Col 4 — Contact */}
            <div className="foot-col foot-contact">
              <h4>{t.contact}</h4>
              <div className="foot-addr">
                <div className="foot-addr-ic"><IconPhone /></div>
                <div className="foot-addr-content">
                  <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
                  <small>{t.hours}</small>
                </div>
              </div>
              <div className="foot-addr">
                <div className="foot-addr-ic"><IconEnvelope /></div>
                <div className="foot-addr-content">
                  <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                  <a href={`mailto:${CONTACT.emailAlt}`}>{CONTACT.emailAlt}</a>
                  <small>{t.sales}</small>
                </div>
              </div>
              <div className="foot-addr">
                <div className="foot-addr-ic"><IconWA /></div>
                <div className="foot-addr-content">
                  <a href={WA} target="_blank" rel="noopener noreferrer">{t.waEnquiry}</a>
                  <small>{t.quick}</small>
                </div>
              </div>
              <div className="foot-addr">
                <div className="foot-addr-ic"><IconMapPin /></div>
                <div className="foot-addr-content">
                  <a href="https://maps.google.com/?q=Parrys,Chennai,Tamil+Nadu" target="_blank" rel="noopener noreferrer">
                    {CONTACT.address}
                  </a>
                  <small>{t.dropIn}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="foot-bottom">
        <div className="container">
          <span>&copy; {year} Hirani Marketing Combines. {t.rights}</span>
          <span className="foot-tags">Water Pumps &middot; RO &amp; Filtration &middot; Fountains &middot; Pressure Washers &middot; Hydraulics &middot; Spares</span>
        </div>
      </div>
    </footer>
  );
}
