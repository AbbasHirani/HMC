'use client';
import Link from 'next/link';
import Image from 'next/image';
import { CONTACT, WA } from '@/lib/data';
import { IconWA, IconPhone } from './Icons';

interface Props {
  active?: 'home' | 'products' | 'services' | 'about';
  lang?: 'en' | 'ta';
}

const NAV = {
  en: { home: 'Home', products: 'Products', categories: 'Categories', services: 'Services', about: 'About', call: 'Call us' },
  ta: { home: 'முகப்பு', products: 'பொருட்கள்', categories: 'வகைகள்', services: 'சேவைகள்', about: 'எங்களை பற்றி', call: 'அழைக்கவும்' },
};

// Pages that exist in both languages — toggle swaps between them;
// everything else falls back to the other language's homepage.
const TOGGLE_MAP: Record<string, { en: string; ta: string }> = {
  home: { en: '/', ta: '/ta' },
  services: { en: '/services', ta: '/ta/services' },
};

export default function Header({ active, lang = 'en' }: Props) {
  const t = NAV[lang];
  const isTa = lang === 'ta';
  const home = isTa ? '/ta' : '/';
  const services = isTa ? '/ta/services' : '/services';
  const toggle = TOGGLE_MAP[active ?? 'home'] ?? TOGGLE_MAP.home;
  const toggleHref = isTa ? toggle.en : toggle.ta;

  return (
    <header className="site-header">
      <div className="container">
        <nav className="nav">
          <Link href={home} className="brand" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Image src="/logo-mark.png" alt="HMC mark" width={44} height={44} style={{ objectFit: 'contain', flexShrink: 0 }} priority />
            <Image src="/logo-wordmark.png" alt="Hirani Marketing Combines" width={136} height={34} className="logo-wordmark" style={{ objectFit: 'contain' }} priority />
          </Link>

          <div className="nav-links">
            <Link href={home} className={active === 'home' ? 'active' : ''}>{t.home}</Link>
            <Link href="/catalogue" className={active === 'products' ? 'active' : ''}>{t.products}</Link>
            <Link href={`${home}#categories`}>{t.categories}</Link>
            <Link href={services} className={active === 'services' ? 'active' : ''}>{t.services}</Link>
            <Link href={`${services}#about`} className={active === 'about' ? 'active' : ''}>{t.about}</Link>
          </div>

          <div className="nav-cta">
            <Link
              href={toggleHref}
              hrefLang={isTa ? 'en' : 'ta'}
              title={isTa ? 'Switch to English' : 'தமிழில் பார்க்க'}
              style={{
                display: 'inline-flex', alignItems: 'center',
                padding: '6px 12px', borderRadius: 999,
                border: '1.5px solid var(--line)', background: '#fff',
                fontSize: 12.5, fontWeight: 700, color: 'var(--navy)',
                textDecoration: 'none', whiteSpace: 'nowrap',
              }}
            >
              {isTa ? 'English' : 'தமிழ்'}
            </Link>
            <a className="nav-tel" href={CONTACT.phoneHref}>
              <small>{t.call}</small>
              <b>{CONTACT.phone}</b>
            </a>
            <a className="btn btn-primary btn-sm" href={WA} target="_blank" rel="noopener noreferrer">
              <IconWA />
              WhatsApp
            </a>
            <button className="menu-toggle" aria-label="Menu">
              <IconPhone />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
