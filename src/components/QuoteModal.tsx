'use client';
import { useState, useEffect, useRef } from 'react';
import { IconDoc, IconClose, IconCheck } from './Icons';

interface Props {
  productName: string;
  productCat: string;
  productSlug?: string;
  onClose: () => void;
}

export default function QuoteModal({ productName, productCat, productSlug, onClose }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [success, setSuccess] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => nameRef.current?.focus(), 80);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function submit() {
    const errs: Record<string, boolean> = {};
    if (!name.trim()) errs.name = true;
    if (!email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) errs.email = true;
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSending(true); setSendError('');
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName, productSlug,
          name: name.trim(),
          phone: phone.trim() || undefined,
          email: email.trim(),
          message: msg.trim() || undefined,
          source: 'quote',
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setSendError(j.error ?? 'Could not send — please try again or call us.');
        return;
      }
      setSuccess(true);
    } catch {
      setSendError('Could not send — please check your connection or call us.');
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    onClose();
    setTimeout(() => { setSuccess(false); setName(''); setPhone(''); setEmail(''); setMsg(''); setErrors({}); }, 300);
  }

  return (
    <div className="modal-overlay open" role="dialog" aria-modal="true" onClick={e => { if (e.target === e.currentTarget) handleClose(); }}>
      <div className="modal">
        <div className="modal-head">
          <div className="mh-left">
            <div className="mh-ic"><IconDoc /></div>
            <div>
              <h3>Get a quote</h3>
              <p>We&rsquo;ll send you pricing within the same day.</p>
            </div>
          </div>
          <button className="modal-close" onClick={handleClose} aria-label="Close"><IconClose /></button>
        </div>

        {!success ? (
          <div className="modal-body">
            <div className="modal-product">
              <div className="mp-ph" />
              <div>
                <div className="mp-name">{productName}</div>
                <div className="mp-cat">{productCat}</div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="qName">Your name <span className="req-star">*</span></label>
                <input ref={nameRef} id="qName" type="text" placeholder="e.g. Rajan Kumar" autoComplete="name" value={name} onChange={e => setName(e.target.value)} className={errors.name ? 'error' : ''} />
              </div>
              <div className="form-field">
                <label htmlFor="qPhone">Phone number</label>
                <input id="qPhone" type="tel" placeholder="+91 98XXX XXXXX" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="qEmail">Email address <span className="req-star">*</span></label>
              <input id="qEmail" type="email" placeholder="you@example.com" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={errors.email ? 'error' : ''} />
            </div>

            <div className="form-field">
              <label htmlFor="qMsg">Application / requirements</label>
              <textarea id="qMsg" placeholder="Describe your use case, capacity needed, site conditions…" value={msg} onChange={e => setMsg(e.target.value)} />
            </div>

            {sendError && (
              <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#b91c1c', fontSize: 13.5, marginBottom: 4 }}>
                {sendError}
              </div>
            )}
            <button className="btn btn-primary modal-submit" onClick={submit} disabled={sending}>
              {sending ? 'Sending…' : 'Send quote request'}
            </button>
          </div>
        ) : (
          <div className="modal-success">
            <div className="ms-ic"><IconCheck /></div>
            <h3>Quote request sent!</h3>
            <p>Thank you — we&rsquo;ll get back to you with pricing and spec advice within the same business day.</p>
            <button className="btn btn-ghost" onClick={handleClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
