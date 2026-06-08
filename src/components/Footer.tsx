import Link from 'next/link';
import { CONTACT, WA } from '@/lib/data';
import { getCategories } from '@/lib/queries';
import { IconPhone, IconWA, IconEnvelope, IconMapPin } from './Icons';

export default async function Footer() {
  const categories = await getCategories().catch(() => []);
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="foot-top">
        <div className="container">
          <div className="foot-grid">
            {/* Col 1 — Brand */}
            <div className="foot-col foot-about">
              <div className="foot-brand">
                <span className="brand-chip">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logo-mark.png" alt="HMC" />
                </span>
                <b>Hirani Marketing Combines</b>
              </div>
              <p>
                Chennai&rsquo;s trusted supplier of water pumps, RO &amp; filtration systems, fountains and industrial equipment. Serving customers since {CONTACT.since}.
              </p>
              <div className="foot-cta">
                <a className="btn btn-primary btn-sm" href={CONTACT.phoneHref}><IconPhone />Call now</a>
                <a className="btn btn-ghost-light btn-sm" href={WA} target="_blank" rel="noopener noreferrer"><IconWA />WhatsApp</a>
              </div>
            </div>

            {/* Col 2 — Products */}
            <div className="foot-col">
              <h4>Products</h4>
              {categories.map(c => (
                <Link key={c.slug} href={`/catalogue?cat=${c.slug}`}>{c.name}</Link>
              ))}
              <Link href="/catalogue" className="foot-all">View all products &rarr;</Link>
            </div>

            {/* Col 3 — Company */}
            <div className="foot-col">
              <h4>Company</h4>
              <Link href="/">Home</Link>
              <Link href="/services">Services</Link>
              <Link href="/services#about">About us</Link>
              <Link href="/catalogue">All products</Link>
            </div>

            {/* Col 4 — Contact */}
            <div className="foot-col foot-contact">
              <h4>Contact us</h4>
              <div className="foot-addr">
                <div className="foot-addr-ic"><IconPhone /></div>
                <div className="foot-addr-content">
                  <a href={CONTACT.phoneHref}>{CONTACT.phone}</a>
                  <small>Mon &ndash; Sat, 9 am &ndash; 6 pm</small>
                </div>
              </div>
              <div className="foot-addr">
                <div className="foot-addr-ic"><IconEnvelope /></div>
                <div className="foot-addr-content">
                  <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                  <a href={`mailto:${CONTACT.emailAlt}`}>{CONTACT.emailAlt}</a>
                  <small>Sales enquiries</small>
                </div>
              </div>
              <div className="foot-addr">
                <div className="foot-addr-ic"><IconWA /></div>
                <div className="foot-addr-content">
                  <a href={WA} target="_blank" rel="noopener noreferrer">WhatsApp enquiry</a>
                  <small>Quick response</small>
                </div>
              </div>
              <div className="foot-addr">
                <div className="foot-addr-ic"><IconMapPin /></div>
                <div className="foot-addr-content">
                  <a href="https://maps.google.com/?q=Parrys,Chennai,Tamil+Nadu" target="_blank" rel="noopener noreferrer">
                    {CONTACT.address}
                  </a>
                  <small>Drop in for workshop service</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="foot-bottom">
        <div className="container">
          <span>&copy; {year} Hirani Marketing Combines. All rights reserved.</span>
          <span className="foot-tags">Water Pumps &middot; RO &amp; Filtration &middot; Fountains &middot; Pressure Washers &middot; Hydraulics &middot; Spares</span>
        </div>
      </div>
    </footer>
  );
}
