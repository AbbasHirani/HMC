'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReactCrop, { Crop, PixelCrop, centerCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

interface Props {
  mode: 'new' | 'edit';
  id?: string;
  initial?: {
    name: string; slug: string; order: number;
    logoUrl?: string; logoPublicId?: string;
    description?: string;
    seo?: { title?: string; description?: string; keywords?: string };
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
  const [description, setDescription] = useState(initial?.description ?? '');
  const [seoTitle, setSeoTitle] = useState(initial?.seo?.title ?? '');
  const [seoDescription, setSeoDescription] = useState(initial?.seo?.description ?? '');
  const [seoKeywords, setSeoKeywords] = useState(initial?.seo?.keywords ?? '');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function onNameChange(v: string) {
    setName(v);
    if (mode === 'new') setSlug(slugify(v));
  }

  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [cropImgSrc, setCropImgSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  useEffect(() => {
    // The blob URL is an external handle that has to be revoked later, so it
    // belongs in an effect rather than being derived during render.
    if (cropQueue.length > 0 && !cropImgSrc) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCropImgSrc(URL.createObjectURL(cropQueue[0]));
    }
  }, [cropQueue, cropImgSrc]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget;
    const initialCrop = centerCrop({ unit: '%', width: 90, height: 90, x: 5, y: 5 }, width, height);
    setCrop(initialCrop);
  }

  function handleCropSave() {
    if (!completedCrop || !imgRef.current) return;
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX, completedCrop.y * scaleY,
      completedCrop.width * scaleX, completedCrop.height * scaleY,
      0, 0, canvas.width, canvas.height
    );

    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], cropQueue[0].name.replace(/\.[^/.]+$/, "") + ".webp", { type: 'image/webp' });
      if (logoPreview) URL.revokeObjectURL(logoPreview);
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      URL.revokeObjectURL(cropImgSrc);
      setCropImgSrc('');
      setCropQueue(prev => prev.slice(1));
    }, 'image/webp', 0.95);
  }

  function handleCropCancel() {
    URL.revokeObjectURL(cropImgSrc);
    setCropImgSrc('');
    setCropQueue(prev => prev.slice(1));
  }

  function handleFile(file: File) {
    setCropQueue([file]);
  }

  function removeLogo() {
    if (logoPublicId) setDeletedPublicId(logoPublicId);
    setLogoUrl('');
    setLogoPublicId('');
    if (logoPreview) { URL.revokeObjectURL(logoPreview); setLogoPreview(null); }
    setLogoFile(null);
  }

  async function generateSeoWithAi() {
    if (!name.trim()) { setAiError('Fill in the brand name first.'); return; }
    setAiBusy(true); setAiError('');
    try {
      // Fetch this brand's actual products so the AI knows what it really sells.
      let products: { name: string; category: string; subcategory: string }[] = [];
      if (initial?.slug) {
        const pr = await fetch(`/api/products?brandSlug=${initial.slug}`).catch(() => null);
        if (pr?.ok) {
          const data = await pr.json();
          type ProductRow = {
            name: string;
            category_name?: string; category_slug?: string;
            subcategory_name?: string; subcategory_slug?: string;
          };
          products = (Array.isArray(data) ? data : []).map((p: ProductRow) => ({
            name: p.name,
            category: p.category_name ?? p.category_slug ?? '',
            subcategory: p.subcategory_name ?? p.subcategory_slug ?? '',
          }));
        }
      }

      const res = await fetch('/api/admin/brand-seo-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, products }),
      });
      const data = await res.json();
      if (!res.ok) { setAiError(data.error ?? 'AI generation failed.'); return; }
      setSeoTitle(data.title ?? '');
      setSeoDescription(data.description ?? '');
      setSeoKeywords(data.keywords ?? '');
      if (data.brandDescription && !description.trim()) setDescription(data.brandDescription);
    } catch {
      setAiError('Could not reach the AI service.');
    } finally {
      setAiBusy(false);
    }
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

    const body = {
      name, slug, order: Number(order),
      logoUrl: finalLogoUrl, logoPublicId: finalLogoPublicId,
      description: description.trim() || null,
      seo: {
        title: seoTitle.trim() || undefined,
        description: seoDescription.trim() || undefined,
        keywords: seoKeywords.trim() || undefined,
      },
    };
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

      <div className="adm-form-section">
        <h3>Brand description <span style={{ fontWeight: 400, fontSize: 11, color: '#9ca3af', textTransform: 'none' }}>(shown on the brand page)</span></h3>
        <div className="form-row single">
          <div className="form-field">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={`Browse all ${name || 'brand'} products available at Hirani Marketing Combines, Chennai.`}
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="adm-form-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>SEO <span style={{ fontWeight: 400, fontSize: 11, color: '#9ca3af', textTransform: 'none' }}>(optional — override auto-generated values)</span></h3>
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
            {aiBusy ? 'Generating…' : 'Auto-fill with AI'}
          </button>
        </div>
        {aiError && <div className="adm-err" style={{ marginBottom: 12 }}>{aiError}</div>}
        <div className="form-row single">
          <div className="form-field">
            <label>
              Meta title
              <span className="opt" style={{ float: 'right', color: seoTitle.length > 65 ? '#dc2626' : '#9ca3af' }}>{seoTitle.length}/65</span>
            </label>
            <input
              value={seoTitle}
              onChange={e => setSeoTitle(e.target.value)}
              placeholder={name ? `${name} Pumps & Water Systems in Chennai | Hirani Marketing` : 'Auto-generated from brand name'}
            />
          </div>
        </div>
        <div className="form-row single">
          <div className="form-field">
            <label>
              Meta description
              <span className="opt" style={{ float: 'right', color: seoDescription.length > 160 ? '#dc2626' : '#9ca3af' }}>{seoDescription.length}/160</span>
            </label>
            <textarea
              value={seoDescription}
              onChange={e => setSeoDescription(e.target.value)}
              placeholder={name ? `Browse all ${name} pumps, water systems and equipment at Hirani Marketing Combines, Chennai.` : 'Auto-generated from brand name'}
              rows={3}
            />
          </div>
        </div>
        <div className="form-row single">
          <div className="form-field">
            <label>Keywords</label>
            <input
              value={seoKeywords}
              onChange={e => setSeoKeywords(e.target.value)}
              placeholder={name ? `${name}, ${name.toLowerCase()} pumps, chennai` : 'comma, separated, keywords'}
            />
            <span className="hint">Comma-separated.</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-adm btn-adm-primary" onClick={save} disabled={saving} type="button">
          {saving ? 'Saving…' : mode === 'new' ? 'Create brand' : 'Save changes'}
        </button>
        <a href="/admin/brands" className="btn-adm btn-adm-ghost">Cancel</a>
      </div>

      {/* Cropper Modal */}
      {cropImgSrc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Crop Brand Logo</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Crop out any extra transparent space around the logo so it fits perfectly in the product cards.</p>
            <div style={{ overflow: 'auto', flex: 1, display: 'flex', justifyContent: 'center', background: '#e5e7eb', borderRadius: 8, padding: 20 }}>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                minWidth={20}
              >
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={cropImgSrc}
                  onLoad={onImageLoad}
                  style={{ maxHeight: '50vh', width: 'auto', display: 'block', background: '#fff' }}
                />
              </ReactCrop>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button type="button" onClick={handleCropCancel} className="btn-adm btn-adm-ghost">Cancel</button>
              <button type="button" onClick={handleCropSave} className="btn-adm btn-adm-orange">Crop & Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
