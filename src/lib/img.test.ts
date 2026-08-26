import { describe, it, expect } from 'vitest';
import { cdn } from './img';

const UPLOAD = 'https://res.cloudinary.com/demo/image/upload';

describe('cdn', () => {
  it('inserts f_auto,q_auto into a Cloudinary upload URL', () => {
    expect(cdn(`${UPLOAD}/v1/pump.jpg`)).toBe(`${UPLOAD}/f_auto,q_auto/v1/pump.jpg`);
  });

  it('is idempotent — a URL that already has f_auto is left alone', () => {
    const already = `${UPLOAD}/f_auto,q_auto/v1/pump.jpg`;
    expect(cdn(already)).toBe(already);
    expect(cdn(cdn(`${UPLOAD}/v1/pump.jpg`))).toBe(already);
  });

  it('leaves other transformations in place rather than replacing them', () => {
    expect(cdn(`${UPLOAD}/w_400/v1/pump.jpg`)).toBe(`${UPLOAD}/f_auto,q_auto/w_400/v1/pump.jpg`);
  });

  it('adds a w_<n>,c_limit cap when maxWidth is given', () => {
    expect(cdn(`${UPLOAD}/v1/pump.jpg`, 800)).toBe(`${UPLOAD}/f_auto,q_auto,w_800,c_limit/v1/pump.jpg`);
  });

  it('is idempotent with maxWidth too — first call wins', () => {
    const capped = cdn(`${UPLOAD}/v1/pump.jpg`, 800);
    expect(cdn(capped, 1200)).toBe(capped);
  });

  it('passes non-Cloudinary URLs through untouched', () => {
    expect(cdn('https://example.com/upload/pump.jpg')).toBe('https://example.com/upload/pump.jpg');
    expect(cdn('/local/pump.jpg')).toBe('/local/pump.jpg');
  });

  it('returns an empty string for nullish input, so callers can treat it as falsy', () => {
    expect(cdn(null)).toBe('');
    expect(cdn(undefined)).toBe('');
    expect(cdn('')).toBe('');
  });
});
