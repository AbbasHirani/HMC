import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Hirani Marketing Combines — Pumps, Water Systems & Industrial Supply, Chennai';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const NAVY  = '#0f172a';
const ORANGE = '#ea580c';
const MUTED = '#94a3b8';
const WHITE = '#ffffff';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: NAVY,
          padding: '64px 80px',
          position: 'relative',
        }}
      >
        {/* Background Image */}
        <img
          src="https://hiranimarketing.vercel.app/shop.jpg"
          alt="Shop Background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        {/* Dark overlay for text readability */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(15, 23, 42, 0.85)',
            display: 'flex',
          }}
        />
        {/* Top orange bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: ORANGE, display: 'flex' }} />

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, zIndex: 10 }}>
          <div style={{ width: 32, height: 4, background: ORANGE, borderRadius: 2, display: 'flex' }} />
          <span style={{ fontSize: 22, color: ORANGE, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Chennai · Since 2008
          </span>
          <div style={{ width: 32, height: 4, background: ORANGE, borderRadius: 2, display: 'flex' }} />
        </div>

        {/* Company name */}
        <div style={{ fontSize: 76, fontWeight: 800, color: WHITE, lineHeight: 1.08, letterSpacing: '-1px', display: 'flex', marginBottom: 20, zIndex: 10, textAlign: 'center' }}>
          Hirani Marketing Combines
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 32, color: '#cbd5e1', display: 'flex', marginBottom: 52, zIndex: 10, textAlign: 'center' }}>
          Pumps · Water Systems · Industrial Equipment
        </div>

        {/* Pill tags */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, zIndex: 10 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Water Pumps', 'RO & Filtration', 'Pressure Washers', 'Hydro Test Pumps'].map(label => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  background: 'rgba(234,88,12,0.2)',
                  border: '2px solid rgba(234,88,12,0.6)',
                  borderRadius: 12,
                  padding: '12px 28px',
                  color: '#fed7aa',
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Sales', 'Service'].map(label => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  background: 'rgba(255,255,255,0.1)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: 12,
                  padding: '10px 32px',
                  color: '#ffffff',
                  fontSize: 20,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom orange bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: ORANGE, display: 'flex' }} />
      </div>
    ),
    { ...size },
  );
}
