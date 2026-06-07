'use client';
import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';

const SLIDES = [
  { cat: 'Water Pumps',        name: 'Pressure Booster Pumps',   sub: 'Consistent pressure for buildings & pipelines',     priceLabel: 'Starting from', price: '₹5,800',   link: '/catalogue?cat=water-pumps' },
  { cat: 'Water Filters & RO', name: 'Domestic RO Purifier',      sub: 'Safe, purified drinking water for homes & offices', priceLabel: 'Pricing',       price: 'On request', link: '/catalogue?cat=water-filters' },
  { cat: 'Fountains',          name: 'Submersible Fountain Pump', sub: 'Smooth, energy-efficient water feature pump',       priceLabel: 'From',          price: '₹800',      link: '/catalogue?cat=fountains' },
  { cat: 'Pressure Washers',   name: 'Electric Pressure Washer',  sub: 'Domestic & commercial high-pressure cleaning',      priceLabel: 'Starting from', price: '₹5,800',   link: '/catalogue?cat=pressure-washers' },
  { cat: 'Hydraulic Equipment',name: 'Hydraulic Power Pack',      sub: 'Custom power units for industrial systems',         priceLabel: 'Pricing',       price: 'On request', link: '/catalogue?cat=hydraulic' },
  { cat: 'Seals & Spare Parts',name: 'Mechanical Seals',          sub: 'Leak-free seals for pumps & rotating equipment',   priceLabel: 'Quick availability', price: 'On request', link: '/catalogue?cat=spares' },
];

const INTERVAL = 3800;

export default function ShowcaseCarousel() {
  const [cur, setCur] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

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
      setCur(c => (c + 1) % SLIDES.length);
      startTimeRef.current = performance.now();
    }, INTERVAL);
  }, []);

  useEffect(() => {
    if (!paused) startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [paused, startTimer]);

  const slide = SLIDES[cur];

  return (
    <div className="showcase" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="sc-top">
        <span className="tag"><i /><span>{slide.cat}</span></span>
        <span className="sku">CAT · HMC</span>
      </div>

      <div className="sc-slides">
        {SLIDES.map((s, i) => (
          <Link key={i} className={`sc-slide${i === cur ? ' active' : ''}`} href={s.link}>
            <div className="ph" data-label={s.cat} style={{ height: '100%', borderRadius: 0, borderBottom: '1px solid var(--line)' }} />
          </Link>
        ))}

        <div className="sc-dots">
          {SLIDES.map((_, i) => (
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
