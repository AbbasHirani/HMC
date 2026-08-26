// Filters hidden [[ENQUIRY:{...}]] / [[REPAIR:{...}]] tags out of the AI
// assistant's reply as it streams, and collects their payloads for the caller
// to persist.
//
// The hard part is that the model's output arrives in arbitrary chunks: a tag
// can be split across any number of them, even mid-delimiter. So text is held
// back as soon as it *might* be the start of a tag, and only released once we
// know it isn't. Getting this wrong either leaks a raw tag into the chat
// window or silently drops a customer's message.

const TAG_START_ENQUIRY = '[[ENQUIRY:';
const TAG_START_REPAIR = '[[REPAIR:';

/**
 * A tag that never closes would otherwise hold text back forever. Past this
 * many characters we give up and release it as visible text, on the grounds
 * that showing a stray tag beats showing nothing.
 */
const TAG_MAX = 700;

export interface TagStripper {
  /** Feed one chunk. Returns the text that is now safe to show. */
  push(text: string): string;
  /** Call once upstream ends. Returns any held text that should still be shown. */
  finish(): string;
  /** JSON payloads captured from [[ENQUIRY:...]] tags, in order. */
  readonly enquiries: readonly string[];
  /** JSON payloads captured from [[REPAIR:...]] tags, in order. */
  readonly repairs: readonly string[];
}

export function createTagStripper(): TagStripper {
  let held = '';
  const enquiries: string[] = [];
  const repairs: string[] = [];

  function push(text: string): string {
    let out = '';
    held += text;

    for (;;) {
      const idx = held.indexOf('[[');

      if (idx === -1) {
        // No tag opening in sight. A single trailing '[' might be the first
        // half of one, so keep it back until the next chunk decides.
        const keep = held.endsWith('[') ? 1 : 0;
        out += held.slice(0, held.length - keep);
        held = held.slice(held.length - keep);
        return out;
      }

      // Everything before the opening is ordinary text.
      out += held.slice(0, idx);
      held = held.slice(idx);

      const end = held.indexOf(']]');
      if (end === -1) {
        // Tag is still open. Wait for more, unless it has run away.
        if (held.length > TAG_MAX) {
          out += held;
          held = '';
        }
        return out;
      }

      const token = held.slice(0, end + 2);
      held = held.slice(end + 2);

      if (token.startsWith(TAG_START_ENQUIRY)) {
        enquiries.push(token.slice(TAG_START_ENQUIRY.length, -2));
      } else if (token.startsWith(TAG_START_REPAIR)) {
        repairs.push(token.slice(TAG_START_REPAIR.length, -2));
      } else {
        // Some other [[...]] the model produced — not ours, so show it.
        out += token;
      }
    }
  }

  function finish(): string {
    // A complete-looking tag we never recognised is dropped rather than shown;
    // anything else still held back is real text the user should see.
    if (held && !(held.startsWith('[[') && held.endsWith(']]'))) {
      const rest = held.trimEnd();
      held = '';
      return rest;
    }
    held = '';
    return '';
  }

  return {
    push,
    finish,
    get enquiries() { return enquiries; },
    get repairs() { return repairs; },
  };
}
