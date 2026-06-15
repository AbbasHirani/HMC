import { CONTACT, WA } from '@/lib/data';
import { IconPhone, IconWA } from './Icons';

interface Props {
  title?: string;
  body?: string;
}

export default function CTABand({
  title = 'Tell us your application',
  body = "We'll recommend the correct spec and share rates the same day.",
}: Props) {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="cta-band">
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30, flexWrap: 'wrap' }}>
            <div>
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
            <div className="cta-band-btns">
              <a className="btn btn-primary btn-lg" href={CONTACT.phoneHref}>
                <IconPhone />Call now
              </a>
              <a className="btn btn-ghost-light btn-lg" href={WA} target="_blank" rel="noopener noreferrer">
                <IconWA />WhatsApp us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
