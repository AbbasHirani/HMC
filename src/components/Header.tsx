'use client';
import { useState, useEffect, useRef } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const t = NAV[lang];
  const isTa = lang === 'ta';
  const home = isTa ? '/ta' : '/';
  const services = isTa ? '/ta/services' : '/services';
  const toggle = TOGGLE_MAP[active ?? 'home'] ?? TOGGLE_MAP.home;
  const toggleHref = isTa ? toggle.en : toggle.ta;
  const close = () => setMenuOpen(false);

  // The open menu covers the page, so it needs the things an overlay owes a
  // keyboard user: Escape to dismiss, no scrolling of the page underneath,
  // and focus handed back to the button that opened it.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Captured now rather than read in the cleanup: we want the button as it
    // was when the menu opened, and reading a ref during cleanup is unsafe.
    const opener = toggleRef.current;
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus();
    };
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="container">
        <nav className="nav">
          <Link href={home} className="brand" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <Image src="/logo-mark.png" alt="Hirani Marketing Combines Logo" width={44} height={44} style={{ objectFit: 'contain', flexShrink: 0, height: 'auto' }} priority />
            <Image src="/logo-wordmark.png" alt="Hirani Marketing Combines" width={136} height={34} className="logo-wordmark" style={{ objectFit: 'contain', height: 'auto' }} priority />
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
            <button
              ref={toggleRef}
              className="menu-toggle"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(o => !o)}
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </div>

      {menuOpen && (
        <>
          <div className="mobile-menu-backdrop" onClick={close} />
          <div className="mobile-menu" id="mobile-menu">
            <Link href={home} className={active === 'home' ? 'active' : ''} onClick={close}>{t.home}</Link>
            <Link href="/catalogue" className={active === 'products' ? 'active' : ''} onClick={close}>{t.products}</Link>
            <Link href={`${home}#categories`} onClick={close}>{t.categories}</Link>
            <Link href={services} className={active === 'services' ? 'active' : ''} onClick={close}>{t.services}</Link>
            <Link href={`${services}#about`} onClick={close}>{t.about}</Link>
            <Link href={toggleHref} onClick={close} style={{ color: 'var(--orange)', fontWeight: 700 }}>
              {isTa ? 'English' : 'தமிழ்'}
            </Link>
            <a
              href={CONTACT.phoneHref}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                marginTop: 14, padding: '13px', borderRadius: 10,
                background: 'var(--navy)', color: '#fff', fontWeight: 700, fontSize: 15,
                textDecoration: 'none', border: 'none',
              }}
            >
              <IconPhone />{CONTACT.phone}
            </a>
          </div>
        </>
      )}
    </header>
  );
}
