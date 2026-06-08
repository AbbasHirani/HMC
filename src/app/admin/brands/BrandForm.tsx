'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

interface Props {
  mode: 'new' | 'edit';
  id?: string;
  initial?: {
    name: string; slug: string; order: number;
    logoUrl?: string; logoPublicId?: string;
  };
}

export default function BrandForm({ mode, id, initial }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl ?? '');
  const [logoPublicId, setLogoPublicId] = useState(initial?.logoPublicId ?? '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [deletedPublicId, setDeletedPublicId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function onNameChange(v: string) {
    setName(v);
    if (mode === 'new') setSlug(slugify(v));
  }

  function handleFile(file: File) {
    if (logoPreview) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function removeLogo() {
    if (logoPublicId) setDeletedPublicId(logoPublicId);
    setLogoUrl('');
    setLogoPublicId('');
    if (logoPreview) { URL.revokeObjectURL(logoPreview); setLogoPreview(null); }
    setLogoFile(null);
  }

  async function save() {
    if (!name || !slug) { setError('Name and slug are required.'); return; }
    setSaving(true); setError('');

    if (deletedPublicId) {
      await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicId: deletedPublicId }) });
    }

    let finalLogoUrl = logoUrl;
    let finalLogoPublicId = logoPublicId;

    if (logoFile) {
      const fd = new FormData();
      fd.append('file', logoFile);
      fd.append('folder', 'brands');
      fd.append('publicId', `brand-${slug}-${Date.now()}`);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) { finalLogoUrl = data.url; finalLogoPublicId = data.publicId; }
    }

    const body = { name, slug, order: Number(order), logoUrl: finalLogoUrl, logoPublicId: finalLogoPublicId };
    const url = mode === 'new' ? '/api/brands' : `/api/brands/${id}`;
    const method = mode === 'new' ? 'POST' : 'PUT';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaving(false);

    if (!res.ok) { setError('Save failed. Try again.'); return; }
    router.push('/admin/brands');
    router.refresh();
  }

  const preview = logoPreview || logoUrl;

  return (
    <div className="adm-form">
      {error && <div className="adm-err" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="adm-form-section">
        <h3>Brand info</h3>
        <div className="form-row">
          <div className="form-field">
            <label>Brand name</label>
            <input value={name} onChange={e => onNameChange(e.target.value)} placeholder="Kent" />
          </div>
          <div className="form-field">
            <label>Slug</label>
            <input value={slug} onChange={e => setSlug(slugify(e.target.value))} placeholder="kent" />
            <span className="hint">URL: /brand/{slug || 'slug'}</span>
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label>Sort order</label>
            <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} min={0} />
          </div>
        </div>
      </div>

      <div className="adm-form-section">
        <h3>Brand logo <span style={{ fontWeight: 400, fontSize: 11, color: '#9ca3af', textTransform: 'none' }}>(PNG with transparent background recommended)</span></h3>
        {preview ? (
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 140, height: 80, border: '1px solid #e5e7eb', borderRadius: 10, background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
              <img src={preview} alt="Logo preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn-adm btn-adm-ghost btn-adm-sm" type="button" onClick={() => fileRef.current?.click()}>Change logo</button>
              <button className="btn-adm btn-adm-danger btn-adm-sm" type="button" onClick={removeLogo}>Remove</button>
            </div>
          </div>
        ) : (
          <div className="img-upload-zone" onClick={() => fileRef.current?.click()}>
            <div style={{ fontSize: 28 }}>🏷</div>
            <p>Click to upload brand logo</p>
            <p style={{ fontSize: 11, color: '#9ca3af' }}>PNG or SVG with transparent background works best.</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-adm btn-adm-primary" onClick={save} disabled={saving} type="button">
          {saving ? 'Saving…' : mode === 'new' ? 'Create brand' : 'Save changes'}
        </button>
        <a href="/admin/brands" className="btn-adm btn-adm-ghost">Cancel</a>
      </div>
    </div>
  );
}
