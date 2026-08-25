import { describe, it, expect } from 'vitest';
import { reqStr, optStr, optHttpUrl, optNum, optArrayMax, check, ValidationError } from './validate';

describe('reqStr', () => {
  it('returns the value unchanged when present', () => {
    expect(reqStr('Kirloskar', 'brand')).toBe('Kirloskar');
  });

  it('rejects non-strings, empty strings, and whitespace-only strings', () => {
    for (const bad of [undefined, null, 42, '', '   ']) {
      expect(() => reqStr(bad, 'name')).toThrow(ValidationError);
    }
  });

  it('enforces the length cap', () => {
    expect(() => reqStr('x'.repeat(11), 'name', 10)).toThrow(/too long/);
    expect(reqStr('x'.repeat(10), 'name', 10)).toHaveLength(10);
  });

  it('names the offending field in the message', () => {
    expect(() => reqStr('', 'slug')).toThrow(/slug/);
  });
});

describe('optStr', () => {
  it('maps absent and empty values to null', () => {
    expect(optStr(undefined, 'tag')).toBeNull();
    expect(optStr(null, 'tag')).toBeNull();
    expect(optStr('', 'tag')).toBeNull();
  });

  it('keeps whitespace-only strings, unlike reqStr', () => {
    expect(optStr('   ', 'tag')).toBe('   ');
  });

  it('rejects non-strings and over-long values', () => {
    expect(() => optStr(42, 'tag')).toThrow(/must be text/);
    expect(() => optStr('x'.repeat(11), 'tag', 10)).toThrow(/too long/);
  });
});

describe('optHttpUrl', () => {
  it('accepts http and https, case-insensitively', () => {
    expect(optHttpUrl('https://res.cloudinary.com/a.png', 'logoUrl')).toBe('https://res.cloudinary.com/a.png');
    expect(optHttpUrl('HTTP://example.com/a.png', 'logoUrl')).toBe('HTTP://example.com/a.png');
  });

  it('returns null when absent', () => {
    expect(optHttpUrl(undefined, 'logoUrl')).toBeNull();
  });

  it('rejects other schemes', () => {
    for (const bad of ['javascript:alert(1)', 'data:text/html,x', 'ftp://example.com/a', '/relative.png']) {
      expect(() => optHttpUrl(bad, 'logoUrl')).toThrow(/http\(s\) URL/);
    }
  });
});

describe('optNum', () => {
  it('accepts numbers and numeric strings', () => {
    expect(optNum(5800, 'price')).toBe(5800);
    expect(optNum('5800', 'price')).toBe(5800);
    expect(optNum('12.5', 'price')).toBe(12.5);
  });

  it('treats absent and empty as null', () => {
    expect(optNum(undefined, 'price')).toBeNull();
    expect(optNum(null, 'price')).toBeNull();
    expect(optNum('', 'price')).toBeNull();
  });

  it('rejects non-finite values', () => {
    for (const bad of ['abc', Infinity, NaN]) {
      expect(() => optNum(bad, 'price')).toThrow(/must be a number/);
    }
  });

  it('accepts zero rather than treating it as absent', () => {
    expect(optNum(0, 'price')).toBe(0);
  });
});

describe('optArrayMax', () => {
  it('allows absent values and arrays within the cap', () => {
    expect(() => optArrayMax(undefined, 'images', 3)).not.toThrow();
    expect(() => optArrayMax([1, 2, 3], 'images', 3)).not.toThrow();
  });

  it('rejects non-arrays and over-long arrays', () => {
    expect(() => optArrayMax('nope', 'images')).toThrow(/must be a list/);
    expect(() => optArrayMax([1, 2, 3, 4], 'images', 3)).toThrow(/too many items/);
  });
});

describe('check', () => {
  it('returns null when the block passes', () => {
    expect(check(() => { reqStr('ok', 'name'); })).toBeNull();
  });

  it('returns the message of the first ValidationError', () => {
    expect(check(() => {
      reqStr('', 'slug');
      reqStr('', 'name');
    })).toMatch(/slug/);
  });

  it('rethrows anything that is not a ValidationError', () => {
    expect(() => check(() => { throw new TypeError('bug'); })).toThrow(TypeError);
  });
});
