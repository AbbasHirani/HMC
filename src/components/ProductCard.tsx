'use client';

import { useState, useEffect, useRef, TouchEvent, MouseEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/data';
import { cdn } from '@/lib/img';
import { IconArrow } from './Icons';

// --- Shared Mobile Observer ---
// Tracks which cards are currently intersecting the center of the viewport
const intersectingCards = new Map<string, IntersectionObserverEntry>();
let sharedObserver: IntersectionObserver | null = null;
let activeMobileSlug: string | null = null;
const scrollListeners = new Set<(slug: string | null) => void>();

function getSharedObserver() {
  if (typeof window === 'undefined') return null;
  if (!sharedObserver) {
    const thresholds = [];
    for (let i = 0; i <= 1.0; i += 0.1) thresholds.push(i);

    sharedObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const slug = (entry.target as HTMLElement).dataset.slug;
        if (!slug) return;
        if (entry.isIntersecting) {
          intersectingCards.set(slug, entry);
        } else {
          intersectingCards.delete(slug);
        }
      });

      let bestSlug: string | null = null;
      let minCenterDist = Infinity;
      const centerY = window.innerHeight / 2;

      intersectingCards.forEach((entry, slug) => {
        const rect = entry.boundingClientRect;
        const dist = Math.abs(rect.top + rect.height / 2 - centerY);
        if (dist < minCenterDist) {
          minCenterDist = dist;
          bestSlug = slug;
        }
      });

      if (activeMobileSlug !== bestSlug) {
        activeMobileSlug = bestSlug;
        scrollListeners.forEach(l => l(activeMobileSlug));
      }
    }, {
      rootMargin: "-25% 0px -25% 0px", // Focus on the middle 50% of the screen
      threshold: thresholds
    });
  }
  return sharedObserver;
}
// -----------------------------

export default function ProductCard({ p, dark, priority }: { p: Product; dark?: boolean; priority?: boolean }) {
  const images = p.images?.map(i => cdn(i.url, 800)).filter(Boolean) as string[] ?? [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const cardRef = useRef<HTMLAnchorElement>(null);

  // Intersection observer to detect when card is in center of viewport (mobile)
  useEffect(() => {
    if (typeof window === 'undefined' || window.matchMedia('(hover: hover)').matches) return;
    
    const obs = getSharedObserver();
    const el = cardRef.current;
    if (el && obs) {
      el.dataset.slug = p.slug;
      obs.observe(el);
    }
    
    const listener = (slug: string | null) => {
      setIsInView(slug === p.slug);
    };
    scrollListeners.add(listener);
    
    setIsInView(activeMobileSlug === p.slug);
    
    return () => {
      scrollListeners.delete(listener);
      if (el && obs) {
        obs.unobserve(el);
        intersectingCards.delete(p.slug);
      }
    };
  }, [p.slug]);

  // Auto-slideshow interval
  useEffect(() => {
    const shouldPlay = isHovered || isInView;
    if (!shouldPlay || images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 1250);
    return () => clearInterval(interval);
  }, [isHovered, isInView, images.length]);

  const handlePrev = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };

  const handleNext = (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % images.length);
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 30) {
      if (deltaX < 0) {
        handleNext(e);
      } else {
        handlePrev(e);
      }
    }
    touchStartX.current = null;
  };

  const handleDotClick = (e: MouseEvent | TouchEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(idx);
  };
  return (
    <Link
      ref={cardRef}
      className="prod-card"
      href={`/product/${p.slug}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentIndex(0);
      }}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
      onTouchCancel={() => setIsHovered(false)}
    >
      <div
        className="prod-thumb"
        style={{ position: 'relative', height: 184, overflow: 'hidden', background: '#fff' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.length > 0 ? (
          images.map((imgUrl, idx) => (
            <Image
              key={imgUrl}
              src={imgUrl}
              alt={`${p.name} image ${idx + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              style={{
                objectFit: 'contain',
                background: '#fff',
                padding: '10px',
                opacity: idx === currentIndex ? 1 : 0,
                transition: 'opacity 0.35s ease-in-out',
                zIndex: idx === currentIndex ? 1 : 0,
              }}
              priority={priority && idx === 0}
            />
          ))
        ) : (
          <div
            className={`ph${dark ? ' ph-dark' : ''}`}
            data-label={p.name}
            style={{ height: 184, borderRadius: 0, borderBottom: '1px solid var(--line)' }}
          />
        )}

        {/* Minimal Dot Indicators */}
        {images.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: 10,
              left: 0,
              right: 0,
              zIndex: 4,
              display: 'flex',
              justifyContent: 'center',
              gap: 5,
              pointerEvents: 'none',
            }}
          >
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`View photo ${idx + 1}`}
                onClick={e => handleDotClick(e, idx)}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  border: 'none',
                  padding: 0,
                  pointerEvents: 'auto',
                  cursor: 'pointer',
                  background:
                    idx === currentIndex
                      ? 'var(--orange, #ea580c)'
                      : 'rgba(0,0,0,0.25)',
                  transition: 'background 0.25s ease',
                }}
              />
            ))}
          </div>
        )}

        {/* Left / Right Arrow Navigation Overlay Buttons */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={handlePrev}
              style={{
                position: 'absolute',
                top: '50%',
                left: 6,
                transform: 'translateY(-50%)',
                zIndex: 4,
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.92)',
                border: '1px solid rgba(0,0,0,0.12)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--navy, #0f172a)',
                fontSize: 14,
                fontWeight: 700,
                opacity: isHovered ? 1 : 0.4,
                transition: 'opacity 0.25s ease',
              }}
            >
              ‹
            </button>

            <button
              type="button"
              aria-label="Next photo"
              onClick={handleNext}
              style={{
                position: 'absolute',
                top: '50%',
                right: 6,
                transform: 'translateY(-50%)',
                zIndex: 4,
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.92)',
                border: '1px solid rgba(0,0,0,0.12)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--navy, #0f172a)',
                fontSize: 14,
                fontWeight: 700,
                opacity: isHovered ? 1 : 0.4,
                transition: 'opacity 0.25s ease',
              }}
            >
              ›
            </button>
          </>
        )}

        {/* Product Tag */}
        {p.tag && <span className="prod-tag" style={{ zIndex: 3 }}>{p.tag}</span>}

        {/* Brand Logo / Badge */}
        {p.brand && (
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: 10,
              zIndex: 3,
              background: '#fff',
              borderRadius: 6,
              padding: '3px 7px',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: '0 1px 6px rgba(0,0,0,0.12)',
              border: '1px solid var(--line)',
            }}
          >
            {p.brandLogo ? (
              <div style={{ height: 20, maxWidth: 65, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={cdn(p.brandLogo)}
                  alt={p.brandName ?? p.brand ?? ''}
                  loading="lazy"
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', display: 'block' }}
                />
              </div>
            ) : (
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--navy)', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                {p.brandName ?? p.brand}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="prod-body">
        <h3>{p.name}</h3>
        <div className="pc-spec">
          {(p.desc || p.spec || '').replace(/[*#_\[\]`]/g, '').substring(0, 80)}
          {(p.desc || p.spec || '').length > 80 ? '...' : ''}
        </div>
        <div className="pc-foot">
          {p.price ? (
            <div className="pc-price">
              <small>Starting from</small>
              <b>₹{p.price.toLocaleString('en-IN')}</b>
            </div>
          ) : (
            <div className="pc-price req">
              <small>Pricing</small>
              <b>On request</b>
            </div>
          )}
          <span className="pc-link">
            View <IconArrow />
          </span>
        </div>
      </div>
    </Link>
  );
}
