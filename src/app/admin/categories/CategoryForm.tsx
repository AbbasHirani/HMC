'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const ICONS = ['drop', 'filter', 'wave', 'spray', 'gauge', 'wrench', 'shield', 'truck', 'check', 'phone'];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

interface Sub { _id?: string; name: string; slug: string; order: number; isNew?: boolean; blurb?: string; }
interface Props {
  mode: 'new' | 'edit';
  id?: string;
  initial?: {
    name: string; slug: string; icon: string; teaser: string; footText: string; order: number;
    imageUrl?: string; imagePublicId?: string;
  };
  initialSubs?: Sub[];
}

export default function CategoryForm({ mode, id, initial, initialSubs = [] }: Props) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [icon, setIcon] = useState(initial?.icon ?? 'drop');
  const [teaser, setTeaser] = useState(initial?.teaser ?? '');
  const [footText, setFootText] = useState(initial?.footText ?? '');
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [imagePublicId, setImagePublicId] = useState(initial?.imagePublicId ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [deletedPublicId, setDeletedPublicId] = useState<string | null>(null);

  const [subs, setSubs] = useState<Sub[]>(initialSubs);
  const [newSubName, setNewSubName] = useState('');
  const [newSubBlurb, setNewSubBlurb] = useState('');
  const [editSubId, setEditSubId] = useState<string | null>(null);
  const [editSubName, setEditSubName] = useState('');
  const [editSubBlurb, setEditSubBlurb] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function onNameChange(v: string) {
    setName(v);
    if (mode === 'new') setSlug(slugify(v));
  }

  function handleFileSelect(file: File) {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  }

  function removeImage() {
    if (imagePublicId) { setDeletedPublicId(imagePublicId); }
    setImageUrl(''); 
    setImagePublicId('');
    if (imagePreviewUrl) { URL.revokeObjectURL(imagePreviewUrl); setImagePreviewUrl(null); }
    setImageFile(null);
  }

  function addSub() {
    if (!newSubName.trim()) return;
    setSubs(prev => [...prev, { name: newSubName.trim(), slug: slugify(newSubName), blurb: newSubBlurb.trim(), order: prev.length, isNew: true }]);
    setNewSubName('');
    setNewSubBlurb('');
  }

  function removeSub(idx: number) {
    setSubs(prev => prev.filter((_, i) => i !== idx));
  }

  function startEditSub(idx: number) {
    setEditSubId(String(idx));
    setEditSubName(subs[idx].name);
    setEditSubBlurb(subs[idx].blurb ?? '');
  }

  function saveEditSub(idx: number) {
    setSubs(prev => prev.map((s, i) => i === idx ? { ...s, name: editSubName, slug: slugify(editSubName), blurb: editSubBlurb } : s));
    setEditSubId(null);
  }

  async function save() {
    if (!name || !slug) { setError('Name and slug are required.'); return; }
    setSaving(true); setError('');

    if (deletedPublicId) {
      await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicId: deletedPublicId }) });
    }

    let finalImageUrl = imageUrl;
    let finalImagePublicId = imagePublicId;

    if (imageFile) {
      const fd = new FormData();
      fd.append('file', imageFile);
      fd.append('folder', 'categories');
      fd.append('publicId', slugify(slug || name || 'category') + '-' + Date.now());
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) { finalImageUrl = data.url; finalImagePublicId = data.publicId; }
    }

    const body = { name, slug, icon, teaser, footText, order: Number(order), imageUrl: finalImageUrl, imagePublicId: finalImagePublicId };

    let catId = id;
    if (mode === 'new') {
      const res = await fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Save failed'); setSaving(false); return; }
      catId = data._id;
    } else {
      const res = await fetch(`/api/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { setError('Save failed'); setSaving(false); return; }
    }

    // Sync subcategories
    for (const sub of subs) {
      const subBody = { categoryId: catId, categorySlug: slug, slug: sub.slug, name: sub.name, order: sub.order, blurb: sub.blurb };
      if (sub.isNew || !sub._id) {
        await fetch('/api/subcategories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(subBody) });
      } else {
        await fetch(`/api/subcategories/${sub._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(subBody) });
      }
    }

    router.push('/admin/categories');
    router.refresh();
  }

  return (
    <div className="adm-form">
      {error && <div className="adm-err" style={{ marginBottom: 16 }}>{error}</div>}

      {/* Basic info */}
      <div className="adm-form-section">
        <h3>Basic info</h3>
        <div className="form-row">
          <div className="form-field">
            <label>Name</label>
            <input value={name} onChange={e => onNameChange(e.target.value)} placeholder="Water Pumps" />
          </div>
          <div className="form-field">
            <label>Slug</label>
            <input value={slug} onChange={e => setSlug(slugify(e.target.value))} placeholder="water-pumps" />
            <span className="hint">Auto-generated from name. URL: /catalogue?cat={slug || 'slug'}</span>
          </div>
        </div>
        <div className="form-row">
          <div className="form-field">
            <label>Icon</label>
            <select value={icon} onChange={e => setIcon(e.target.value)}>
              {ICONS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Order <span className="opt">(for sorting)</span></label>
            <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} min={0} />
          </div>
        </div>
        <div className="form-row single">
          <div className="form-field">
            <label>Teaser <span className="opt">(short tag-line for category card)</span></label>
            <input value={teaser} onChange={e => setTeaser(e.target.value)} placeholder="Domestic · booster · sewage · dewatering" />
          </div>
        </div>
        <div className="form-row single">
          <div className="form-field">
            <label>Foot text <span className="opt">(appears at bottom of category card, e.g. &ldquo;12 types&rdquo;)</span></label>
            <input value={footText} onChange={e => setFootText(e.target.value)} placeholder="12 types" />
          </div>
        </div>
      </div>

      {/* Category image */}
      <div className="adm-form-section">
        <h3>Category image <span style={{ fontWeight: 400, fontSize: 11, color: '#9ca3af', textTransform: 'none' }}>(optional — used on category card)</span></h3>
        {imageUrl || imagePreviewUrl ? (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <img src={(imagePreviewUrl || imageUrl)!} alt="Category" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }} />
            <button className="btn-adm btn-adm-danger btn-adm-sm" onClick={removeImage} type="button">Remove</button>
          </div>
        ) : (
          <>
            <div
              className="img-upload-zone"
              onClick={() => fileRef.current?.click()}
            >
              <div style={{ fontSize: 28 }}>🖼</div>
              <p>Click to select category image</p>
              <p style={{ fontSize: 11, color: '#9ca3af' }}>Image will be uploaded on save.</p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])} />
          </>
        )}
      </div>

      {/* Subcategories */}
      <div className="adm-form-section">
        <h3>Subcategories</h3>
        {subs.length > 0 && (
          <div className="sub-list">
            {subs.map((sub, i) => (
              <div className="sub-item" key={i}>
                {editSubId === String(i) ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        value={editSubName}
                        onChange={e => setEditSubName(e.target.value)}
                        className="adm-input"
                        style={{ padding: '7px 12px', flex: 1 }}
                        autoFocus
                      />
                      <button className="btn-adm btn-adm-primary btn-adm-sm" type="button" onClick={() => saveEditSub(i)}>Save</button>
                      <button className="btn-adm btn-adm-ghost btn-adm-sm" type="button" onClick={() => setEditSubId(null)}>Cancel</button>
                    </div>
                    <textarea
                      value={editSubBlurb}
                      onChange={e => setEditSubBlurb(e.target.value)}
                      className="adm-input"
                      placeholder="Optional blurb/description for this subcategory..."
                      style={{ minHeight: 60, padding: '7px 12px', resize: 'vertical' }}
                    />
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 4, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className="sub-item-name">{sub.name}</span>
                        <span className="sub-item-slug">{sub.slug}</span>
                      </div>
                      {sub.blurb && (
                        <span style={{ fontSize: 12, color: 'var(--slate)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sub.blurb}
                        </span>
                      )}
                    </div>
                    <button className="btn-adm btn-adm-ghost btn-adm-sm" style={{ flexShrink: 0 }} type="button" onClick={() => startEditSub(i)}>Edit</button>
                    <button className="btn-adm btn-adm-danger btn-adm-sm" style={{ flexShrink: 0 }} type="button" onClick={() => removeSub(i)}>×</button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={newSubName}
              onChange={e => setNewSubName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSub())}
              placeholder="New subcategory name…"
              className="adm-input"
              style={{ flex: 1 }}
            />
            <button className="btn-adm btn-adm-ghost" type="button" onClick={addSub}>+ Add</button>
          </div>
          <textarea
            value={newSubBlurb}
            onChange={e => setNewSubBlurb(e.target.value)}
            placeholder="Optional blurb/description for the new subcategory..."
            className="adm-input"
            style={{ minHeight: 60, padding: '7px 12px', resize: 'vertical' }}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-adm btn-adm-primary" onClick={save} disabled={saving} type="button">
          {saving ? 'Saving and uploading…' : mode === 'new' ? 'Create category' : 'Save changes'}
        </button>
        <a href="/admin/categories" className="btn-adm btn-adm-ghost">Cancel</a>
      </div>
    </div>
  );
}
