'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const ICONS = ['drop', 'filter', 'wave', 'spray', 'gauge', 'wrench', 'shield', 'truck', 'check', 'phone'];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

interface Sub { _id?: string; name: string; slug: string; order: number; isNew?: boolean; blurb?: string; seo?: { title?: string; description?: string; keywords?: string }; }
interface Props {
  mode: 'new' | 'edit';
  id?: string;
  initial?: {
    name: string; slug: string; icon: string; teaser: string; footText: string; order: number;
    imageUrl?: string; imagePublicId?: string;
    seo?: { title?: string; description?: string; keywords?: string };
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
  const [seoTitle, setSeoTitle] = useState(initial?.seo?.title ?? '');
  const [seoDescription, setSeoDescription] = useState(initial?.seo?.description ?? '');
  const [seoKeywords, setSeoKeywords] = useState(initial?.seo?.keywords ?? '');
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
  const [editSubSeoTitle, setEditSubSeoTitle] = useState('');
  const [editSubSeoDescription, setEditSubSeoDescription] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');
  const [subAiBusy, setSubAiBusy] = useState(false);
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
    setEditSubSeoTitle(subs[idx].seo?.title ?? '');
    setEditSubSeoDescription(subs[idx].seo?.description ?? '');
  }

  function saveEditSub(idx: number) {
    setSubs(prev => prev.map((s, i) => i === idx ? { ...s, name: editSubName, slug: slugify(editSubName), blurb: editSubBlurb, seo: { title: editSubSeoTitle, description: editSubSeoDescription } } : s));
    setEditSubId(null);
  }

  async function generateSeoWithAi() {
    if (!name.trim()) { setAiError('Fill in the category name first.'); return; }
    setAiBusy(true); setAiError('');
    try {
      const res = await fetch('/api/admin/category-seo-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          teaser,
          subs: subs.map(s => s.name),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setAiError(data.error ?? 'AI generation failed.'); return; }
      setSeoTitle(data.title ?? '');
      setSeoDescription(data.description ?? '');
      setSeoKeywords(data.keywords ?? '');
      if (data.teaser) setTeaser(data.teaser);
      if (data.footText) setFootText(data.footText);
    } catch {
      setAiError('Could not reach the AI service.');
    } finally {
      setAiBusy(false);
    }
  }

  async function generateSubSeoWithAi() {
    if (!editSubName.trim()) return;
    setSubAiBusy(true);
    try {
      const res = await fetch('/api/admin/category-seo-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editSubName,
          teaser: editSubBlurb,
          subs: [],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setEditSubSeoTitle(data.title ?? '');
        setEditSubSeoDescription(data.description ?? '');
        if (data.teaser) setEditSubBlurb(data.teaser);
      }
    } catch {
      // Silently fail for subcategories or show a toast if we had one
    } finally {
      setSubAiBusy(false);
    }
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

    const body = { name, slug, icon, teaser, footText, order: Number(order), imageUrl: finalImageUrl, imagePublicId: finalImagePublicId, seo: { title: seoTitle, description: seoDescription, keywords: seoKeywords } };

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
      const subBody = { categoryId: catId, categorySlug: slug, slug: sub.slug, name: sub.name, order: sub.order, blurb: sub.blurb, seo: sub.seo };
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
            <label>Teaser <span className="opt">(short descriptive sentence for category card)</span></label>
            <textarea value={teaser} onChange={e => setTeaser(e.target.value)} placeholder="Explore our range of high-performance pumps suitable for industrial and residential applications." className="adm-input" style={{ minHeight: 60, padding: '7px 12px', resize: 'vertical' }} />
          </div>
        </div>
        <div className="form-row single">
          <div className="form-field">
            <label>Foot text <span className="opt">(appears at bottom of category card, e.g. &ldquo;12 types&rdquo;)</span></label>
            <input value={footText} onChange={e => setFootText(e.target.value)} placeholder="12 types" />
          </div>
        </div>
      </div>

      {/* Category SEO */}
      <div className="adm-form-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>SEO Settings <span style={{ fontWeight: 400, fontSize: 11, color: '#9ca3af', textTransform: 'none' }}>(optional)</span></h3>
          <button
            type="button"
            onClick={generateSeoWithAi}
            disabled={aiBusy}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 6,
              background: aiBusy ? '#e5e7eb' : 'linear-gradient(135deg, #1E1D5C, #4338ca)',
              color: aiBusy ? '#9ca3af' : '#fff', border: 'none', cursor: aiBusy ? 'wait' : 'pointer',
              fontSize: 12, fontWeight: 600, transition: 'opacity .15s',
            }}
          >
            <span style={{ fontSize: 14 }}>✨</span>
            {aiBusy ? 'Generating…' : 'Auto-fill SEO & Copy'}
          </button>
        </div>
        {aiError && <div className="adm-err" style={{ marginBottom: 12 }}>{aiError}</div>}
        <div className="form-row single">
          <div className="form-field">
            <label>Custom Meta Title</label>
            <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder="e.g. Best Water Pumps in Chennai | Hirani Marketing" />
          </div>
        </div>
        <div className="form-row single">
          <div className="form-field">
            <label>Custom Meta Description</label>
            <textarea value={seoDescription} onChange={e => setSeoDescription(e.target.value)} placeholder="Write a compelling meta description under 160 characters..." style={{ minHeight: 60, padding: '7px 12px', resize: 'vertical' }} className="adm-input" />
          </div>
        </div>
        <div className="form-row single">
          <div className="form-field">
            <label>Meta Keywords</label>
            <input value={seoKeywords} onChange={e => setSeoKeywords(e.target.value)} placeholder="e.g. water pumps, ro systems, chennai (comma separated)" />
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
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                        <input
                          value={editSubSeoTitle}
                          onChange={e => setEditSubSeoTitle(e.target.value)}
                          className="adm-input"
                          placeholder="Custom Meta Title..."
                          style={{ padding: '7px 12px' }}
                        />
                        <input
                          value={editSubSeoDescription}
                          onChange={e => setEditSubSeoDescription(e.target.value)}
                          className="adm-input"
                          placeholder="Custom Meta Description..."
                          style={{ padding: '7px 12px' }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={generateSubSeoWithAi}
                        disabled={subAiBusy}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '6px 10px', borderRadius: 6,
                          background: subAiBusy ? '#e5e7eb' : '#fff',
                          color: subAiBusy ? '#9ca3af' : 'var(--navy)',
                          border: '1px solid #e5e7eb', cursor: subAiBusy ? 'wait' : 'pointer',
                          fontSize: 11, fontWeight: 600, flexShrink: 0,
                        }}
                      >
                        <span style={{ fontSize: 13 }}>✨</span>
                        {subAiBusy ? 'Wait…' : 'Auto-fill SEO & Desc'}
                      </button>
                    </div>
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
