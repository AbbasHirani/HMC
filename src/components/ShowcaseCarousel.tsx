'use client';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';

import Image from 'next/image';
import type { Category } from '@/lib/data';

const FALLBACK_SLIDES = [
  { cat: 'Water Pumps',        name: 'Pressure Booster Pumps',   sub: 'Consistent pressure for buildings & pipelines',     priceLabel: 'Starting from', price: '₹5,800',   link: '/catalogue/water-pumps', image: '' },
  { cat: 'Water Filters & RO', name: 'Domestic RO Purifier',      sub: 'Safe, purified drinking water for homes & offices', priceLabel: 'Pricing',       price: 'On request', link: '/catalogue/water-filters', image: '' },
  { cat: 'Fountains',          name: 'Submersible Fountain Pump', sub: 'Smooth, energy-efficient water feature pump',       priceLabel: 'From',          price: '₹800',      link: '/catalogue/fountains', image: '' },
  { cat: 'Pressure Washers',   name: 'Electric Pressure Washer',  sub: 'Domestic & commercial high-pressure cleaning',      priceLabel: 'Starting from', price: '₹5,800',   link: '/catalogue/pressure-washers', image: '' },
  { cat: 'Hydraulic Equipment',name: 'Hydraulic Power Pack',      sub: 'Custom power units for industrial systems',         priceLabel: 'Pricing',       price: 'On request', link: '/catalogue/hydraulic', image: '' },
  { cat: 'Seals & Spare Parts',name: 'Mechanical Seals',          sub: 'Leak-free seals for pumps & rotating equipment',   priceLabel: 'Quick availability', price: 'On request', link: '/catalogue/spares', image: '' },
];

const INTERVAL = 3800;

interface Props {
  categories?: Category[];
}

export default function ShowcaseCarousel({ categories }: Props) {
  const [cur, setCur] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  // Which slides have been shown at least once, so they stay mounted instead
  // of remounting (and refetching their image) every cycle.
  const [visited, setVisited] = useState<Record<number, boolean>>({ 0: true });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const slides = categories && categories.length > 0 
    ? categories.map(c => ({
        cat: c.name,
        name: c.name,
        sub: c.teaser || 'Explore our comprehensive range',
        priceLabel: 'Available',
        price: 'Explore',
        link: `/catalogue/${c.slug}`,
        image: c.imageUrl
      }))
    : FALLBACK_SLIDES;

  const goTo = useCallback((n: number) => {
    setCur(n);
    setProgress(0);
    startTimeRef.current = performance.now();
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startTimeRef.current) % INTERVAL;
      setProgress((elapsed / INTERVAL) * 100);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    timerRef.current = setInterval(() => {
      setCur(c => (c + 1) % slides.length);
      startTimeRef.current = performance.now();
    }, INTERVAL);
  }, [slides.length]);

  useEffect(() => {
    if (!paused) startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [paused, startTimer]);

  useEffect(() => {
    // Deliberate setState-in-effect: this marks the slide that just became
    // current as mounted-for-good. It costs one extra render the first time
    // each slide is shown — at most slides.length times for the page's whole
    // lifetime — and settles immediately after, since the guard makes it a
    // no-op on every subsequent visit.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisited(prev => (prev[cur] ? prev : { ...prev, [cur]: true }));
  }, [cur]);

  const slide = slides[cur] || slides[0];
  if (!slide) return null;

  return (
    <div className="showcase" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="sc-top">
        <span className="tag"><i /><span>{slide.cat}</span></span>
        <span className="sku">CAT · HMC</span>
      </div>

      <div className="sc-slides">
        {slides.map((s, i) => {
          const isVisited = visited[i] || i === cur;
          if (!isVisited) return null;
          return (
            <Link key={i} className={`sc-slide${i === cur ? ' active' : ''}`} href={s.link}>
              {s.image ? (
                <div style={{ position: 'relative', width: '100%', height: '100%', borderBottom: '1px solid var(--line)', backgroundColor: '#fff' }}>
                  <Image src={s.image} alt={s.name} fill style={{ objectFit: 'contain' }} sizes="(max-width: 680px) 100vw, 50vw" priority={i === 0} />
                </div>
              ) : (
                <div className="ph" data-label={s.cat} style={{ height: '100%', borderRadius: 0, borderBottom: '1px solid var(--line)' }} />
              )}
            </Link>
          );
        })}

        <div className="sc-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`sc-dot${i === cur ? ' on' : ''}`}
              onClick={e => { e.preventDefault(); goTo(i); if (!paused) startTimer(); }}
            />
          ))}
        </div>

        <div className="sc-progress" style={{ width: `${progress}%` }} />
      </div>

      <div className="cap">
        <div>
          <h3>{slide.name}</h3>
          <p>{slide.sub}</p>
        </div>
        <div className="price">
          <small>{slide.priceLabel}</small>
          <b>{slide.price}</b>
        </div>
      </div>
    </div>
  );
}
