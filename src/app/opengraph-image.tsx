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
          alignItems: 'flex-start',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: NAVY,
          padding: '64px 80px',
          position: 'relative',
        }}
      >
        {/* Top orange bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: ORANGE, display: 'flex' }} />

        {/* Eyebrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{ width: 32, height: 4, background: ORANGE, borderRadius: 2, display: 'flex' }} />
          <span style={{ fontSize: 20, color: ORANGE, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Chennai · Since 2008
          </span>
        </div>

        {/* Company name */}
        <div style={{ fontSize: 68, fontWeight: 800, color: WHITE, lineHeight: 1.08, letterSpacing: '-1px', display: 'flex', marginBottom: 24 }}>
          Hirani Marketing Combines
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 28, color: MUTED, display: 'flex', marginBottom: 52 }}>
          Pumps · Water Systems · Industrial Equipment · Repair &amp; Service
        </div>

        {/* Pill tags */}
        <div style={{ display: 'flex', gap: 14 }}>
          {['Water Pumps', 'RO & Filtration', 'Pressure Washers', 'Workshop Repair'].map(label => (
            <div
              key={label}
              style={{
                display: 'flex',
                background: 'rgba(234,88,12,0.14)',
                border: '1.5px solid rgba(234,88,12,0.45)',
                borderRadius: 10,
                padding: '10px 22px',
                color: '#fb923c',
                fontSize: 19,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bottom orange bar */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: ORANGE, display: 'flex' }} />
      </div>
    ),
    { ...size },
  );
}
