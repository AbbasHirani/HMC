'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

interface Job {
  id: string;
  title: string;
  description: string | null;
  tag: string | null;
  imageUrl: string | null;
}

export default function RepairJobsCarousel({ jobs }: { jobs: Job[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = jobs.length;

  const goTo = useCallback((i: number) => {
    setActive((i + count) % count);
  }, [count]);

  const next = useCallback(() => goTo(active + 1), [active, goTo]);
  const prev = useCallback(() => goTo(active - 1), [active, goTo]);

  // Auto-advance
  useEffect(() => {
    if (paused || count <= 1) return;
    timerRef.current = setTimeout(next, 3800);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [active, paused, next, count]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  // Drag / swipe
  const dragStart = useRef<number | null>(null);
  function onPointerDown(e: React.PointerEvent) { dragStart.current = e.clientX; }
  function onPointerUp(e: React.PointerEvent) {
    if (dragStart.current === null) return;
    const dx = e.clientX - dragStart.current;
    if (Math.abs(dx) > 40) dx < 0 ? next() : prev();
    dragStart.current = null;
  }

  const visible = 3; // cards visible at once on desktop
  // Build offset so active card is centred
  // We duplicate the array for seamless feel
  const displayJobs = count < visible ? [...jobs, ...jobs, ...jobs] : jobs;
  const displayCount = displayJobs.length;

  return (
    <div
      style={{ position: 'relative', overflow: 'hidden', padding: '8px 0 28px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Track */}
      <div
        ref={trackRef}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        style={{
          display: 'flex',
          gap: 24,
          transition: 'transform 0.55s cubic-bezier(0.4,0,0.2,1)',
          transform: `translateX(calc(-${active * (100 / visible)}% - ${active * 24 / visible}px + ${(100 / visible) * ((visible - 1) / 2)}% + ${24 * ((visible - 1) / 2) / visible}px))`,
          willChange: 'transform',
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        {displayJobs.map((j, i) => {
          const relIdx = ((i - active) % displayCount + displayCount) % displayCount;
          const isActive = i % count === active % count;
          return (
            <div
              key={`${j.id}-${i}`}
              style={{
                flex: `0 0 calc(${100 / visible}% - ${24 * (visible - 1) / visible}px)`,
                background: '#fff',
                borderRadius: 18,
                border: `2px solid ${isActive ? 'var(--navy)' : 'var(--line)'}`,
                overflow: 'hidden',
                boxShadow: isActive
                  ? '0 12px 40px rgba(20,20,63,.16)'
                  : '0 2px 12px rgba(20,20,63,.05)',
                transform: isActive ? 'scale(1.03)' : 'scale(0.97)',
                transition: 'transform 0.45s cubic-bezier(0.4,0,0.2,1), box-shadow 0.45s, border-color 0.45s, opacity 0.45s',
                opacity: relIdx === 0 ? 1 : relIdx === 1 || relIdx === displayCount - 1 ? 0.72 : 0.4,
              }}
            >
              {/* Image */}
              <div style={{ height: 210, background: 'var(--paper)', position: 'relative', overflow: 'hidden' }}>
                {j.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={j.imageUrl}
                    alt={j.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s ease', transform: isActive ? 'scale(1.04)' : 'scale(1)' }}
                    draggable={false}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,var(--paper) 60%,#e8eaf0)' }}>
                    <span style={{ fontSize: 48, opacity: 0.35 }}>🔧</span>
                  </div>
                )}
                {/* Gradient overlay on image */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(14,14,42,0.55) 0%, transparent 55%)', pointerEvents: 'none' }} />
                {j.tag && (
                  <span style={{
                    position: 'absolute', top: 12, left: 12,
                    background: 'var(--orange)', color: '#fff',
                    fontSize: 10.5, fontWeight: 800, letterSpacing: '.09em', textTransform: 'uppercase',
                    padding: '4px 10px', borderRadius: 20,
                  }}>
                    {j.tag}
                  </span>
                )}
              </div>

              {/* Body */}
              <div style={{ padding: '18px 20px 22px' }}>
                <h3 style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--navy)', margin: 0, lineHeight: 1.35 }}>{j.title}</h3>
                {j.description && (
                  <p style={{ fontSize: 13.5, color: 'var(--slate)', marginTop: 8, lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {j.description}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14 }}>
                  <span style={{ width: 28, height: 3, borderRadius: 2, background: isActive ? 'var(--orange)' : 'var(--line)', transition: 'background 0.4s' }} />
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: isActive ? 'var(--orange)' : 'var(--muted)', transition: 'color 0.4s', letterSpacing: '.04em' }}>Completed job</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev / Next arrows */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            style={{
              position: 'absolute', top: '38%', left: 0,
              width: 44, height: 44, borderRadius: '50%',
              background: '#fff', border: '1.5px solid var(--line)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: 'var(--navy)', zIndex: 2,
              transition: 'box-shadow .2s, border-color .2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--navy)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)'; }}
          >‹</button>
          <button
            onClick={next}
            aria-label="Next"
            style={{
              position: 'absolute', top: '38%', right: 0,
              width: 44, height: 44, borderRadius: '50%',
              background: '#fff', border: '1.5px solid var(--line)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: 'var(--navy)', zIndex: 2,
              transition: 'box-shadow .2s, border-color .2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--navy)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)'; }}
          >›</button>
        </>
      )}

      {/* Dot indicators */}
      {count > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginTop: 4 }}>
          {jobs.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to ${i + 1}`}
              style={{
                width: i === active ? 24 : 8,
                height: 8, borderRadius: 4,
                background: i === active ? 'var(--orange)' : 'var(--line)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'width 0.35s, background 0.35s',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
