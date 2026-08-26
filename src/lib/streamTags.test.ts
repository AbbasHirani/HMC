import { describe, it, expect } from 'vitest';
import { createTagStripper } from './streamTags';

/** Feeds text as a single chunk and returns everything visible. */
function whole(text: string) {
  const s = createTagStripper();
  const visible = s.push(text) + s.finish();
  return { visible, enquiries: [...s.enquiries], repairs: [...s.repairs] };
}

/** Feeds text one character at a time — the worst-case chunking. */
function perChar(text: string) {
  const s = createTagStripper();
  let visible = '';
  for (const ch of text) visible += s.push(ch);
  visible += s.finish();
  return { visible, enquiries: [...s.enquiries], repairs: [...s.repairs] };
}

/** Feeds text split at one specific index. */
function splitAt(text: string, i: number) {
  const s = createTagStripper();
  const visible = s.push(text.slice(0, i)) + s.push(text.slice(i)) + s.finish();
  return { visible, enquiries: [...s.enquiries], repairs: [...s.repairs] };
}

const ENQ = '[[ENQUIRY:{"name":"Rajan","phone":"9840159762"}]]';
const REP = '[[REPAIR:{"name":"Priya","phone":"9840159762","problem":"leaking"}]]';

describe('plain text', () => {
  it('passes text through unchanged', () => {
    expect(whole('Got it — the CRI pump suits that.').visible).toBe('Got it — the CRI pump suits that.');
  });

  it('passes text through unchanged no matter how it is chunked', () => {
    const text = 'Right, for a 3-floor tank you want about 25m of head.';
    expect(perChar(text).visible).toBe(text);
  });

  it('handles the empty stream', () => {
    const r = whole('');
    expect(r.visible).toBe('');
    expect(r.enquiries).toEqual([]);
  });
});

describe('tag capture', () => {
  it('captures an enquiry payload and hides the tag', () => {
    const r = whole(`I've noted that down.\n${ENQ}`);
    // The newline before the tag is ordinary text and is emitted as such;
    // only the tag itself is removed.
    expect(r.visible).toBe("I've noted that down.\n");
    expect(r.enquiries).toEqual(['{"name":"Rajan","phone":"9840159762"}']);
  });

  it('captures a repair payload and hides the tag', () => {
    const r = whole(`Logged with the workshop.\n${REP}`);
    expect(r.visible).toBe('Logged with the workshop.\n');
    expect(r.repairs).toEqual(['{"name":"Priya","phone":"9840159762","problem":"leaking"}']);
  });

  it('captures a payload that is valid JSON', () => {
    const parsed = JSON.parse(whole(ENQ).enquiries[0]);
    expect(parsed).toEqual({ name: 'Rajan', phone: '9840159762' });
  });

  it('keeps text on both sides of a mid-message tag', () => {
    expect(whole(`before ${ENQ} after`).visible).toBe('before  after');
  });

  it('captures both kinds in one stream, in order', () => {
    const r = whole(`a${ENQ}b${REP}c`);
    expect(r.visible).toBe('abc');
    expect(r.enquiries).toHaveLength(1);
    expect(r.repairs).toHaveLength(1);
  });
});

describe('chunk boundaries — the reason this code exists', () => {
  it('captures the tag when the stream is split at every possible point', () => {
    const text = `Sorted.\n${ENQ}`;
    for (let i = 0; i <= text.length; i++) {
      const r = splitAt(text, i);
      expect(r.enquiries, `split at ${i}`).toEqual(['{"name":"Rajan","phone":"9840159762"}']);
      expect(r.visible, `split at ${i}`).toBe('Sorted.\n');
    }
  });

  it('captures the tag when delivered one character at a time', () => {
    const r = perChar(`Sorted.\n${ENQ}`);
    expect(r.visible).toBe('Sorted.\n');
    expect(r.enquiries).toHaveLength(1);
  });

  it('never leaks a partial tag into the visible text', () => {
    const text = `ok ${ENQ}`;
    for (let i = 0; i <= text.length; i++) {
      expect(splitAt(text, i).visible).not.toContain('[[');
      expect(splitAt(text, i).visible).not.toContain('ENQUIRY');
    }
  });

  it('holds back a lone trailing bracket rather than showing it early', () => {
    const s = createTagStripper();
    expect(s.push('cost is 5800 [')).toBe('cost is 5800 ');
    expect(s.push('[ENQUIRY:{"phone":"1234567"}]]')).toBe('');
    expect(s.enquiries).toEqual(['{"phone":"1234567"}']);
  });
});

describe('text that only looks like a tag', () => {
  it('shows an unrecognised [[...]] block instead of eating it', () => {
    expect(whole('see [[note]] here').visible).toBe('see [[note]] here');
  });

  it('shows a single bracket pair normally', () => {
    expect(whole('array[0] and [link](/product/x)').visible).toBe('array[0] and [link](/product/x)');
  });

  it('releases a runaway unclosed tag rather than holding the stream forever', () => {
    const runaway = '[[ENQUIRY:' + 'x'.repeat(800);
    const r = whole(runaway);
    expect(r.visible).toContain('[[ENQUIRY:');
    expect(r.enquiries).toEqual([]);
  });

  it('keeps a trailing bracket that never becomes a tag', () => {
    expect(whole('price [').visible).toBe('price [');
  });
});

describe('finish()', () => {
  it('leaves already-emitted text alone', () => {
    const s = createTagStripper();
    expect(s.push('done   ')).toBe('done   ');
    expect(s.finish()).toBe('');
  });

  it('trims trailing whitespace off text it was still holding', () => {
    const s = createTagStripper();
    expect(s.push('[[X  ')).toBe('');   // looks like a tag opening, so held back
    expect(s.finish()).toBe('[[X');     // released on close, trimmed
  });

  it('reveals an unterminated tag rather than swallowing the text', () => {
    // Losing a real customer message would be worse than showing a stray tag,
    // so anything held that is not a *complete* [[...]] is released.
    const s = createTagStripper();
    expect(s.push('[[ENQUIRY:{"phone":"1"}')).toBe('');
    expect(s.finish()).toBe('[[ENQUIRY:{"phone":"1"}');
  });

  it('is safe to call on an untouched stripper', () => {
    expect(createTagStripper().finish()).toBe('');
  });
});
