'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  src: string;
  alt: string;
  height?: number | string;
  allImages?: { url: string }[];
  activeIndex?: number;
  onIndexChange?: (i: number) => void;
}

const SCALE = 2.6;

export default function ImageZoom({ src, alt, height = '100%', allImages = [], activeIndex = 0, onIndexChange }: Props) {
  const [hovered, setHovered] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const [lightbox, setLightbox] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const closeLightbox = useCallback(() => setLightbox(false), []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight' && allImages.length > 1)
        onIndexChange?.((activeIndex + 1) % allImages.length);
      if (e.key === 'ArrowLeft' && allImages.length > 1)
        onIndexChange?.((activeIndex - 1 + allImages.length) % allImages.length);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, closeLightbox, activeIndex, allImages.length, onIndexChange]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current!.getBoundingClientRect();
    const x = (((e.clientX - rect.left) / rect.width) * 100).toFixed(2);
    const y = (((e.clientY - rect.top) / rect.height) * 100).toFixed(2);
    setOrigin(`${x}% ${y}%`);
  };

  return (
    <>
      {/* ── Main image with hover zoom ── */}
      <div
        ref={ref}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMove}
        onClick={() => setLightbox(true)}
        style={{
          width: '100%',
          height,
          overflow: 'hidden',
          cursor: hovered ? 'zoom-in' : 'zoom-in',
          background: '#f9fafb',
          position: 'relative',
        }}
      >
        <img
          src={src}
          alt={alt}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fetchPriority={"high" as any}
          loading="eager"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            display: 'block',
            transform: hovered ? `scale(${SCALE})` : 'scale(1)',
            transformOrigin: origin,
            transition: hovered ? 'transform 0.12s ease-out' : 'transform 0.25s ease-out',
            willChange: 'transform',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
          draggable={false}
        />

      </div>

      {/* ── Lightbox — rendered via portal directly on body to escape all stacking contexts ── */}
      {lightbox && createPortal(
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed', inset: 0, zIndex: 100000,
            background: 'rgba(10,10,14,0.97)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          {/* Close button */}
          <button className="lb-close" onClick={closeLightbox}>✕</button>

          {/* Escape hint */}
          <span className="lb-hint">Press ESC to close{allImages.length > 1 ? ' · ← → to browse' : ''}</span>

          {/* Prev arrow */}
          {allImages.length > 1 && (
            <button
              className="lb-arrow left"
              onClick={e => { e.stopPropagation(); onIndexChange?.((activeIndex - 1 + allImages.length) % allImages.length); }}
            >‹</button>
          )}

          {/* Main zoomed image */}
          <img
            src={src}
            alt={alt}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '88vw', maxHeight: '88vh',
              objectFit: 'contain',
              borderRadius: 8,
              cursor: 'default',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
              userSelect: 'none',
            }}
            draggable={false}
          />

          {/* Next arrow */}
          {allImages.length > 1 && (
            <button
              className="lb-arrow right"
              onClick={e => { e.stopPropagation(); onIndexChange?.((activeIndex + 1) % allImages.length); }}
            >›</button>
          )}

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div
              className="lb-thumbs"
              onClick={e => e.stopPropagation()}
            >
              {allImages.map((img, i) => (
                <img
                  key={i}
                  src={img.url}
                  alt={`View ${i + 1}`}
                  onClick={() => onIndexChange?.(i)}
                  style={{
                    width: 56, height: 56, objectFit: 'contain', background: '#fff', padding: 3,
                    borderRadius: 7, cursor: 'pointer',
                    border: i === activeIndex
                      ? '2px solid #f97316'
                      : '2px solid rgba(255,255,255,0.2)',
                    opacity: i === activeIndex ? 1 : 0.55,
                    transition: 'opacity 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => { if (i !== activeIndex) e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={e => { if (i !== activeIndex) e.currentTarget.style.opacity = '0.55'; }}
                />
              ))}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
