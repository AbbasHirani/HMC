import { CONTACT } from '@/lib/data';
import { IconCalendar, IconShield, IconTruck, IconCheck } from './Icons';

export default function TrustBar({ lang = 'en' }: { lang?: 'en' | 'ta' }) {
  const items = lang === 'ta' ? [
    { icon: <IconCalendar />, title: `${CONTACT.since} முதல்`,    sub: 'சென்னையின் நம்பகமான கடை' },
    { icon: <IconShield />,   title: 'பழுது பார்க்கும் சேவை',      sub: 'கடைக்கு கொண்டு வாருங்கள்' },
    { icon: <IconTruck />,    title: 'விரைவான டெலிவரி',           sub: 'தமிழ்நாடு முழுவதும்' },
    { icon: <IconCheck />,    title: 'ஒரிஜினல் பிராண்டுகள்',       sub: 'Kent, Aquaguard மற்றும் பல' },
  ] : [
    { icon: <IconCalendar />, title: `Since ${CONTACT.since}`, sub: 'Trusted Chennai supplier' },
    { icon: <IconShield />,   title: 'Workshop service',        sub: 'Drop in for repair & servicing' },
    { icon: <IconTruck />,    title: 'Fast supply',             sub: 'Across Tamil Nadu' },
    { icon: <IconCheck />,    title: 'Genuine brands',          sub: 'Kent, Aquaguard & more' },
  ];

  return (
    <div className="trust" style={{ borderLeft: 'none', borderRight: 'none' }}>
      {items.map((item, i) => (
        <div className="trust-item" key={i}>
          <span className="trust-ic">{item.icon}</span>
          <div>
            <b>{item.title}</b>
            <span>{item.sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
