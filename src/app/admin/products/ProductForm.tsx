'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TAGS = ['', 'Best seller', 'Popular'];

function slugify(s: string) {
  return s.toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

interface Cat { _id: string; name: string; slug: string; }
interface Sub { _id: string; name: string; slug: string; categoryId: string; }
interface BrandOpt { _id: string; name: string; slug: string; logoUrl?: string | null; }
interface ImgEntry { url: string; publicId: string; }
interface SpecRow { key: string; value: string; }

type ImgState =
  | { type: 'existing'; url: string; publicId: string }
  | { type: 'new'; file: File; previewUrl: string };

interface Props {
  mode: 'new' | 'edit';
  id?: string;
  cats: Cat[];
  allSubs: Sub[];
  brands?: BrandOpt[];
  initial?: {
    name: string; slug: string; categoryId: string; subcategoryId: string;
    desc: string; price: string; tag: string; featured: boolean;
    brand: string;
    specs: Record<string, string>;
    images: ImgEntry[];
  };
}

export default function ProductForm({ mode, id, cats, allSubs, brands = [], initial }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [catId, setCatId] = useState(initial?.categoryId ?? (cats[0]?._id ?? ''));
  const [subId, setSubId] = useState(initial?.subcategoryId ?? '');
  const [desc, setDesc] = useState(initial?.desc ?? '');
  const [price, setPrice] = useState(initial?.price ?? '');
  const [tag, setTag] = useState(initial?.tag ?? '');
  const [brand, setBrand] = useState(initial?.brand ?? '');
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [images, setImages] = useState<ImgState[]>(
    initial?.images?.map(img => ({ type: 'existing', url: img.url, publicId: img.publicId })) ?? []
  );
  const [deletedPublicIds, setDeletedPublicIds] = useState<string[]>([]);

  const initSpecs: SpecRow[] = initial?.specs
    ? Object.entries(initial.specs).map(([key, value]) => ({ key, value }))
    : [{ key: '', value: '' }];
  const [specs, setSpecs] = useState<SpecRow[]>(initSpecs);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const subs = allSubs.filter(s => s.categoryId === catId);

  useEffect(() => {
    if (subs.length > 0 && !subs.find(s => s._id === subId)) {
      setSubId(subs[0]._id);
    }
  }, [catId]);

  function onNameChange(v: string) {
    setName(v);
    if (mode === 'new') setSlug(slugify(v));
  }

  function handleFileSelect(files: FileList) {
    const newImgs = Array.from(files).map(file => ({
      type: 'new' as const,
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImgs]);
  }

  function removeImage(idx: number) {
    const img = images[idx];
    if (img.type === 'existing') {
      setDeletedPublicIds(prev => [...prev, img.publicId]);
    } else {
      URL.revokeObjectURL(img.previewUrl);
    }
    setImages(prev => prev.filter((_, i) => i !== idx));
  }

  function makeMain(idx: number) {
    if (idx === 0) return;
    setImages(prev => {
      const newImages = [...prev];
      const [moved] = newImages.splice(idx, 1);
      newImages.unshift(moved);
      return newImages;
    });
  }

  function addSpec() { setSpecs(prev => [...prev, { key: '', value: '' }]); }
  function removeSpec(i: number) { setSpecs(prev => prev.filter((_, j) => j !== i)); }
  function updateSpec(i: number, field: 'key' | 'value', val: string) {
    setSpecs(prev => prev.map((s, j) => j === i ? { ...s, [field]: val } : s));
  }

  async function save() {
    if (!name || !slug || !catId || !subId) { setError('Name, slug, category and subcategory are required.'); return; }
    setSaving(true); setError('');

    const selectedCat = cats.find(c => c._id === catId)!;
    const selectedSub = allSubs.find(s => s._id === subId)!;
    const specsRecord = Object.fromEntries(specs.filter(s => s.key.trim()).map(s => [s.key.trim(), s.value.trim()]));

    // 1. Process deletes
    for (const pid of deletedPublicIds) {
      await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicId: pid }) });
    }

    // 2. Process uploads
    const folder = `products/${selectedCat.slug}/${selectedSub.slug}`;
    const finalImages: ImgEntry[] = [];
    for (const img of images) {
      if (img.type === 'existing') {
        finalImages.push({ url: img.url, publicId: img.publicId });
      } else {
        const fd = new FormData();
        fd.append('file', img.file);
        fd.append('folder', folder);
        fd.append('publicId', slugify(name || 'product') + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7));
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.url) finalImages.push({ url: data.url, publicId: data.publicId });
      }
    }

    const body = {
      name, slug,
      categoryId: catId, categorySlug: selectedCat.slug, categoryName: selectedCat.name,
      subcategoryId: subId, subcategorySlug: selectedSub.slug, subcategoryName: selectedSub.name,
      desc, price: price ? Number(price) : null,
      tag: tag || null, featured, brand: brand || null, images: finalImages, specs: specsRecord,
    };

    const url = mode === 'new' ? '/api/products' : `/api/products/${id}`;
    const method = mode === 'new' ? 'POST' : 'PUT';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaving(false);

    if (!res.ok) { setError('Save failed. Check all fields and try again.'); return; }
    router.push('/admin/products');
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
            <label>Product name</label>
            <input value={name} onChange={e => onNameChange(e.target.value)} placeholder="Single-Phase Booster Pump" />
          </div>
          <div className="form-field">
            <label>Slug</label>
            <input value={slug} onChange={e => setSlug(slugify(e.target.value))} placeholder="single-phase-booster-pump" />
            <span className="hint">URL: /product/{slug || 'slug'}</span>
          </div>
        </div>
        <div className="form-row single">
          <div className="form-field">
            <label>Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What the product does and its key use case…" />
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="adm-form-section">
        <h3>Category & subcategory</h3>
        <div className="form-row">
          <div className="form-field">
            <label>Category</label>
            <select value={catId} onChange={e => setCatId(e.target.value)}>
              {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-field">
            <label>Subcategory</label>
            <select value={subId} onChange={e => setSubId(e.target.value)}>
              {subs.length === 0
                ? <option value="">— Add subcategories to this category first —</option>
                : subs.map(s => <option key={s._id} value={s._id}>{s.name}</option>)
              }
            </select>
            <span className="hint">Cloudinary folder: HMC/products/{cats.find(c => c._id === catId)?.slug ?? '…'}/{allSubs.find(s => s._id === subId)?.slug ?? '…'}/</span>
          </div>
        </div>
      </div>

      {/* Brand */}
      <div className="adm-form-section">
        <h3>Brand</h3>
        <div className="form-row">
          <div className="form-field">
            <label>Brand <span className="opt">(optional)</span></label>
            {brands.length === 0 ? (
              <div style={{ padding: '10px 14px', background: '#fff3cd', border: '1px solid #ffc107', borderRadius: 8, fontSize: 13 }}>
                No brands added yet. <a href="/admin/brands/new" target="_blank" style={{ color: 'var(--navy)', fontWeight: 600 }}>Add brands first</a>, then come back.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select value={brand} onChange={e => setBrand(e.target.value)}>
                  <option value="">— No brand / unbranded —</option>
                  {brands.map(b => <option key={b._id} value={b.slug}>{b.name}</option>)}
                </select>
                {brand && brands.find(b => b.slug === brand)?.logoUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                    <img src={brands.find(b => b.slug === brand)!.logoUrl!} alt={brand} style={{ height: 28, objectFit: 'contain' }} />
                    <span style={{ fontSize: 13, color: 'var(--slate)' }}>{brands.find(b => b.slug === brand)?.name}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing & tag */}
      <div className="adm-form-section">
        <h3>Pricing & visibility</h3>
        <div className="form-row triple">
          <div className="form-field">
            <label>Price (₹) <span className="opt">leave blank = "On request"</span></label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="5800" min={0} />
          </div>
          <div className="form-field">
            <label>Tag <span className="opt">(optional)</span></label>
            <select value={tag} onChange={e => setTag(e.target.value)}>
              {TAGS.map(t => <option key={t} value={t}>{t || '— None —'}</option>)}
            </select>
          </div>
          <div className="form-field" style={{ justifyContent: 'flex-end', paddingBottom: 4 }}>
            <label>Featured on homepage</label>
            <div className="toggle-row" style={{ marginTop: 8 }}>
              <label className="toggle">
                <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} />
                <span className="toggle-track" />
              </label>
              <span style={{ fontSize: 13, color: featured ? '#1E1D5C' : '#9ca3af' }}>{featured ? 'Featured' : 'Not featured'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="adm-form-section">
        <h3>Specifications</h3>
        <table className="specs-table">
          <thead><tr><th>Spec name</th><th>Value</th><th></th></tr></thead>
          <tbody>
            {specs.map((s, i) => (
              <tr key={i}>
                <td><input value={s.key} onChange={e => updateSpec(i, 'key', e.target.value)} placeholder="e.g. Phase" /></td>
                <td><input value={s.value} onChange={e => updateSpec(i, 'value', e.target.value)} placeholder="e.g. Single phase" /></td>
                <td><button type="button" onClick={() => removeSpec(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 16 }}>×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="btn-adm btn-adm-ghost btn-adm-sm" type="button" onClick={addSpec}>+ Add spec row</button>
      </div>

      {/* Images */}
      <div className="adm-form-section">
        <h3>Product images <span style={{ fontWeight: 400, fontSize: 11, color: '#9ca3af', textTransform: 'none' }}>(first image = main display image)</span></h3>
        <div
          className="img-upload-zone"
          onClick={() => fileRef.current?.click()}
          style={{ marginBottom: 14 }}
        >
          <div style={{ fontSize: 28 }}>📸</div>
          <p>Click to select images (multiple allowed)</p>
          <p style={{ fontSize: 11, color: '#9ca3af' }}>Images will be uploaded on save.</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => e.target.files && handleFileSelect(e.target.files)} />

        {images.length > 0 && (
          <div className="img-previews">
            {images.map((img, i) => (
              <div key={i} className="img-preview">
                <img src={img.type === 'existing' ? img.url : img.previewUrl} alt={`Image ${i + 1}`} />
                {i === 0 ? (
                  <span className="img-main-badge">MAIN</span>
                ) : (
                  <button 
                    type="button" 
                    onClick={() => makeMain(i)}
                    style={{ position: 'absolute', bottom: '6px', left: '6px', background: 'rgba(30,29,92,.8)', color: '#fff', fontSize: '9.5px', fontWeight: 800, padding: '3px 6px', borderRadius: '4px', letterSpacing: '.05em', textTransform: 'uppercase', cursor: 'pointer', border: 'none', transition: '.15s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--navy)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(30,29,92,.8)'}
                  >
                    Set Main
                  </button>
                )}
                <button className="img-del" type="button" onClick={() => removeImage(i)}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-adm btn-adm-orange" onClick={save} disabled={saving} type="button">
          {saving ? 'Saving and uploading…' : mode === 'new' ? 'Create product' : 'Save changes'}
        </button>
        <a href="/admin/products" className="btn-adm btn-adm-ghost">Cancel</a>
      </div>
    </div>
  );
}
