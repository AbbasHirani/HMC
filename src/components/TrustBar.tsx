import { CONTACT } from '@/lib/data';
import { IconCalendar, IconShield, IconTruck, IconCheck } from './Icons';

export default function TrustBar() {
  const items = [
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
