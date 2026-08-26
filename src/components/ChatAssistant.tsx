'use client';
import { useState, useRef, useEffect, Fragment } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { IconAssistant, IconClose, IconSend } from './Icons';

interface Message { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'Help me pick a water pump for my home',
  'Best RO system for borewell water?',
  'I need a pump for a 3-floor overhead tank',
  'Show me pressure washers',
];

const GREETING =
  "Hey, I'm **Hira** from Hirani Marketing Combines. What are you looking for — a pump, water filter, fountain, pressure washer? Tell me what you need and I'll sort you out.";

const ADMIN_SUGGESTIONS = [
  'Suggest SEO meta tags for a new chemical pump',
  'Write an SEO-friendly category description',
  'Give me keywords for agricultural pumps',
  'Review and optimize current homepage metadata',
];

const ADMIN_GREETING =
  "Hi! I'm the **HMC SEO Agent**. I can help you write optimized meta titles, meta descriptions, focus keywords, or suggest product copy for your categories and products. What would you like to optimize today?";

// Only allow safe link targets — blocks javascript:, data:, etc. that could
// turn an assistant/product link into an XSS vector.
function safeHref(href: string): { kind: 'internal' | 'external' } | null {
  if (href.startsWith('/') && !href.startsWith('//')) return { kind: 'internal' };
  if (/^(https?:|mailto:|tel:)/i.test(href)) return { kind: 'external' };
  return null;
}

// ── Minimal markdown renderer: **bold**, [text](url), and "- " bullet lists ──
function renderInline(text: string, keyBase: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Tokenise links first, then bold within the remaining text.
  const linkRe = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = linkRe.exec(text)) !== null) {
    if (m.index > last) nodes.push(...renderBold(text.slice(last, m.index), `${keyBase}-t${i}`));
    const [, label, href] = m;
    const safe = safeHref(href);
    if (!safe) {
      // Unsafe scheme — render the label as plain text, no link.
      nodes.push(...renderBold(label, `${keyBase}-x${i}`));
    } else if (safe.kind === 'internal') {
      nodes.push(<Link key={`${keyBase}-l${i}`} href={href} className="hc-link">{label}</Link>);
    } else {
      nodes.push(
        <a key={`${keyBase}-l${i}`} href={href} target="_blank" rel="noopener noreferrer" className="hc-link">{label}</a>,
      );
    }
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) nodes.push(...renderBold(text.slice(last), `${keyBase}-end`));
  return nodes;
}

function renderBold(text: string, keyBase: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={`${keyBase}-b${i}`}>{p.slice(2, -2)}</strong>
      : <Fragment key={`${keyBase}-s${i}`}>{p}</Fragment>,
  );
}

function RichText({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];
  let key = 0;

  const flush = () => {
    if (bullets.length) {
      const items = [...bullets];
      blocks.push(
        <ul className="hc-list" key={`ul${key++}`}>
          {items.map((b, i) => <li key={i}>{renderInline(b, `li${key}-${i}`)}</li>)}
        </ul>,
      );
      bullets = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]);
    } else if (line.trim() === '') {
      flush();
    } else {
      flush();
      blocks.push(<p className="hc-p" key={`p${key++}`}>{renderInline(line, `p${key}`)}</p>);
    }
  }
  flush();
  return <>{blocks}</>;
}

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pathname = usePathname();
  const isProductPage = pathname?.startsWith('/product/');
  const isAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open, busy]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Dynamically adjust FAB position based on sticky CTA resting state
  // Only meaningful on a product page, so derive that rather than resetting
  // the state from inside the effect.
  const [stickyRaw, setIsStickyActive] = useState(isProductPage);
  const isStickyActive = isProductPage && stickyRaw;
  useEffect(() => {
    if (!isProductPage) return;
    const updateFab = () => {
      const sticky = document.querySelector('.pd-sticky');
      if (!sticky) return;
      // When sticky CTA scrolls up into its resting place, its bottom is less than window height
      if (sticky.getBoundingClientRect().bottom < window.innerHeight - 5) {
        setIsStickyActive(false);
      } else {
        setIsStickyActive(true);
      }
    };
    window.addEventListener('scroll', updateFab, { passive: true });
    window.addEventListener('resize', updateFab);
    // Initial check after a slight delay for render
    setTimeout(updateFab, 100);
    return () => {
      window.removeEventListener('scroll', updateFab);
      window.removeEventListener('resize', updateFab);
    };
  }, [isProductPage]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setInput('');

    const history: Message[] = [...messages, { role: 'user', content }];
    // Add the user message + an empty assistant slot to stream into.
    setMessages([...history, { role: 'assistant', content: '' }]);
    setBusy(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, isAdmin: isAdminPage, currentPath: pathname }),
      });

      if (!res.ok || !res.body) {
        let msg = 'Sorry, I had trouble responding. Please try again, or contact us on WhatsApp.';
        try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: msg };
          return next;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        setMessages(prev => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = { role: 'assistant', content: last.content + chunk };
          return next;
        });
      }
      // If nothing streamed back, leave a graceful fallback in the empty bubble.
      setMessages(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last.role === 'assistant' && !last.content.trim()) {
          next[next.length - 1] = {
            role: 'assistant',
            content: "I didn't catch that — could you rephrase? You can also reach us on WhatsApp for quick help.",
          };
        }
        return next;
      });
    } catch {
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'assistant',
          content: 'Something went wrong on my end. Please try again in a moment, or message us on WhatsApp.',
        };
        return next;
      });
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  const lastIsStreaming = busy && messages.length > 0 && messages[messages.length - 1].role === 'assistant';
  const showTyping = lastIsStreaming && messages[messages.length - 1].content === '';

  return (
    <>
      {/* Launcher */}
      <button
        className={`hc-fab${open ? ' hidden' : ''}${isStickyActive ? ' hc-fab-product' : ''}`}
        onClick={() => setOpen(true)}
        aria-label={isAdminPage ? "Open SEO assistant" : "Open product assistant"}
      >
        <span className="hc-fab-tip">{isAdminPage ? "Need help with SEO writing?" : "Need help choosing a product?"}</span>
        <span className="hc-fab-ic"><IconAssistant /></span>
      </button>

      {/* Panel */}
      <div className={`hc-panel${open ? ' open' : ''}`} role="dialog" aria-label={isAdminPage ? "SEO assistant" : "Product assistant"} aria-modal="false">
        <header className="hc-head">
          <div className="hc-head-id">
            <span className="hc-avatar"><img src="/logo-mark.png" alt="HMC" /></span>
            <div>
              <b>{isAdminPage ? 'HMC SEO Agent' : 'Hira · Product Assistant'}</b>
              <span>{isAdminPage ? 'SEO & Content Specialist' : 'Hirani Marketing Combines'}</span>
            </div>
          </div>
          <button className="hc-close" onClick={() => setOpen(false)} aria-label="Close assistant"><IconClose /></button>
        </header>

        <div className="hc-body" ref={scrollRef}>
          <div className="hc-msg assistant">
            <div className="hc-bubble"><RichText text={isAdminPage ? ADMIN_GREETING : GREETING} /></div>
          </div>

          {messages.map((m, i) => (
            <div className={`hc-msg ${m.role}`} key={i}>
              <div className="hc-bubble">
                {m.role === 'assistant' && i === messages.length - 1 && showTyping
                  ? <span className="hc-typing"><i /><i /><i /></span>
                  : <RichText text={m.content} />}
              </div>
            </div>
          ))}

          {messages.length === 0 && (
            <div className="hc-suggest">
              {(isAdminPage ? ADMIN_SUGGESTIONS : SUGGESTIONS).map(s => (
                <button key={s} className="hc-chip" onClick={() => send(s)} disabled={busy}>{s}</button>
              ))}
            </div>
          )}
        </div>

        <form className="hc-input" onSubmit={onSubmit}>
          <textarea
            ref={inputRef}
            rows={1}
            placeholder={isAdminPage ? "Ask for metadata suggestions, copy refinement..." : "Ask about a product or your need…"}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={busy}
          />
          <button type="submit" className="hc-send" disabled={busy || !input.trim()} aria-label="Send"><IconSend /></button>
        </form>
        <p className="hc-foot">
          {isAdminPage 
            ? "AI SEO assistant · check suggestion lengths against Google limits." 
            : "AI assistant · answers from our live catalogue. Confirm critical details with our team."}
        </p>
      </div>
    </>
  );
}
