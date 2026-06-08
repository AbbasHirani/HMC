'use client';
import Link from 'next/link';
import { CONTACT, WA } from '@/lib/data';
import { IconWA, IconPhone } from './Icons';

interface Props {
  active?: 'home' | 'products' | 'services' | 'about';
}

export default function Header({ active }: Props) {
  return (
    <header className="site-header">
      <div className="container">
        <nav className="nav">
          <Link href="/" className="brand" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="HMC mark" style={{ height: 44, width: 44, objectFit: 'contain', flexShrink: 0 }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-wordmark.png" alt="Hirani Marketing Combines" className="logo-wordmark" style={{ height: 34, width: 'auto', objectFit: 'contain' }} />
          </Link>

          <div className="nav-links">
            <Link href="/" className={active === 'home' ? 'active' : ''}>Home</Link>
            <Link href="/catalogue" className={active === 'products' ? 'active' : ''}>Products</Link>
            <Link href="/#categories">Categories</Link>
            <Link href="/services" className={active === 'services' ? 'active' : ''}>Services</Link>
            <Link href="/services#about" className={active === 'about' ? 'active' : ''}>About</Link>
          </div>

          <div className="nav-cta">
            <a className="nav-tel" href={CONTACT.phoneHref}>
              <small>Call us</small>
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
