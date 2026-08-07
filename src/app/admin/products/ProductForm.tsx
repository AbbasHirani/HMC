'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { compressImageFile } from '@/lib/imageCompress';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const TAGS = ['', 'Best seller', 'Popular'];

function slugify(s: string) {
  return s.toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

interface Cat { _id: string; name: string; slug: string; }
interface Sub { _id: string; name: string; slug: string; categoryId: string; }
interface BrandOpt { _id: string; name: string; slug: string; logoUrl?: string | null; }
interface UseCaseOpt { _id: string; name: string; slug: string; }
interface ImgEntry { url: string; publicId: string; alt?: string; }
interface VidEntry { type: 'cloudinary' | 'youtube'; url: string; publicId?: string; }
interface SpecRow { key: string; value: string; }
interface SeoData { title?: string; description?: string; keywords?: string; }

type ImgState =
  | { id?: string; type: 'existing'; url: string; publicId: string; alt: string }
  | {
      id: string;
      type: 'new';
      file: File;
      previewUrl: string;
      alt: string;
      originalSize: number;
      compressed?: { file: File; previewUrl: string; size: number };
      compressing?: boolean;
      uploadProgress?: number;
    };

type VidState =
  | { id?: string; stateType: 'existing'; type: 'cloudinary' | 'youtube'; url: string; publicId?: string }
  | { id: string; stateType: 'new_youtube'; type: 'youtube'; url: string }
  | { id: string; stateType: 'new_upload'; type: 'cloudinary'; file: File; previewUrl: string; uploadProgress?: number };

interface Props {
  mode: 'new' | 'edit';
  id?: string;
  cats: Cat[];
  allSubs: Sub[];
  brands?: BrandOpt[];
  useCases?: UseCaseOpt[];
  initial?: {
    name: string; slug: string; categoryId: string; subcategoryId: string;
    desc: string; price: string; tag: string; featured: boolean;
    brand: string;
    specs: Record<string, string>;
    images: ImgEntry[];
    videos?: VidEntry[];
    useCaseIds: string[];
    seo?: SeoData;
  };
}

export default function ProductForm({ mode, id, cats, allSubs, brands = [], useCases = [], initial }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const initCatId = initial?.categoryId ?? (cats[0]?._id ?? '');
  const [catId, setCatId] = useState(initCatId);
  const [subId, setSubId] = useState(
    initial?.subcategoryId ?? (allSubs.find(s => s.categoryId === initCatId)?._id ?? '')
  );
  const [desc, setDesc] = useState(initial?.desc ?? '');
  const [price, setPrice] = useState(initial?.price ?? '');
  const [tag, setTag] = useState(initial?.tag ?? '');
  const [brand, setBrand] = useState(initial?.brand ?? '');
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [images, setImages] = useState<ImgState[]>(
    initial?.images?.map(img => ({ id: img.publicId, type: 'existing', url: img.url, publicId: img.publicId, alt: img.alt ?? '' })) ?? []
  );
  const [deletedPublicIds, setDeletedPublicIds] = useState<string[]>([]);
  const [videos, setVideos] = useState<VidState[]>(
    initial?.videos?.map((v, i) => {
      let finalUrl = v.url;
      if (v.type === 'cloudinary') {
        if (!/\.(mp4|webm|mov|mkv)$/i.test(finalUrl)) {
          finalUrl += '.mp4';
        }
        if (!finalUrl.includes('/vc_auto/')) {
          finalUrl = finalUrl.replace('/upload/', '/upload/vc_auto/');
        }
      }
      return { id: `vid-${i}`, stateType: 'existing', type: v.type, url: finalUrl, publicId: v.publicId };
    }) ?? []
  );
  const [deletedVideoPublicIds, setDeletedVideoPublicIds] = useState<string[]>([]);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const [ytInput, setYtInput] = useState('');

  // Compression settings (adjustable in UI)
  const [compressMaxWidth, setCompressMaxWidth] = useState<number>(2048);
  const [compressQuality, setCompressQuality] = useState<number>(0.98);
  const [convertToWebp, setConvertToWebp] = useState<boolean>(true);

  // Cropper State
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [cropImgSrc, setCropImgSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  useEffect(() => {
    if (cropQueue.length > 0 && !cropImgSrc) {
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
      processNewImageFile(file);
      URL.revokeObjectURL(cropImgSrc);
      setCropImgSrc('');
      setCropQueue(prev => prev.slice(1));
    }, 'image/webp', 1.0);
  }

  function handleCropCancel() {
    URL.revokeObjectURL(cropImgSrc);
    setCropImgSrc('');
    setCropQueue(prev => prev.slice(1));
  }

  function processNewImageFile(file: File) {
    const tmpId = generateTmpId();
    const newImg = {
      id: tmpId, type: 'new' as const, file,
      previewUrl: URL.createObjectURL(file), alt: '',
      originalSize: file.size, compressing: true, uploadProgress: 0,
    };
    setImages(prev => [...prev, newImg]);

    (async () => {
      try {
        const compressed = await compressImageFile(file, { maxWidth: compressMaxWidth, quality: compressQuality, convertToWebp });
        const compressedPreview = URL.createObjectURL(compressed);
        setImages(prev => prev.map(it => it.id === tmpId ? { ...(it as any), compressed: { file: compressed, previewUrl: compressedPreview, size: compressed.size }, compressing: false } : it));
      } catch {
        setImages(prev => prev.map(it => it.id === tmpId ? { ...(it as any), compressing: false } : it));
      }
    })();
  }

  function generateTmpId() {
    return 'tmp-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }

  const initSpecs: SpecRow[] = initial?.specs
    ? Object.entries(initial.specs).map(([key, value]) => ({ key, value }))
    : [{ key: '', value: '' }];
  const [specs, setSpecs] = useState<SpecRow[]>(initSpecs);

  const [selectedUseCases, setSelectedUseCases] = useState<string[]>(initial?.useCaseIds ?? []);

  const [seoTitle, setSeoTitle] = useState(initial?.seo?.title ?? '');
  const [seoDesc, setSeoDesc] = useState(initial?.seo?.description ?? '');
  const [seoKeywords, setSeoKeywords] = useState(initial?.seo?.keywords ?? '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState('');
  const [descAiBusy, setDescAiBusy] = useState(false);
  const [descAiError, setDescAiError] = useState('');

  // ── Auto-generated SEO values (used when the override fields are left blank) ──
  const brandName = brands.find(b => b.slug === brand)?.name ?? '';
  const autoSeoTitle = name
    ? (brandName ? `${name} by ${brandName} — Buy in Chennai` : `${name} — Buy in Chennai`)
    : '';
  const autoSeoDesc = desc
    ? `${desc.slice(0, 140)}. Available at Hirani Marketing Combines, Parrys, Chennai.`
    : (name ? `Buy ${name} in Chennai at Hirani Marketing Combines. Genuine product, expert advice, workshop servicing available.` : '');
  const autoSeoKeywords = [
    name, brandName,
    allSubs.find(s => s._id === subId)?.name,
    cats.find(c => c._id === catId)?.name,
    ...useCases.filter(uc => selectedUseCases.includes(uc._id)).map(uc => uc.name),
    'Chennai', 'Hirani Marketing Combines',
  ].filter(Boolean).join(', ');
  const autoAlt = (i: number) =>
    name
      ? (i === 0
          ? (brandName ? `${name} by ${brandName}` : name)
          : `${name} — view ${i + 1}`)
      : `Product image ${i + 1}`;

  const effTitle = seoTitle.trim() || autoSeoTitle;
  const effDesc = seoDesc.trim() || autoSeoDesc;

  const subs = allSubs.filter(s => s.categoryId === catId);

  function onCatChange(newCatId: string) {
    setCatId(newCatId);
    const newSubs = allSubs.filter(s => s.categoryId === newCatId);
    if (!newSubs.find(s => s._id === subId)) {
      setSubId(newSubs[0]?._id ?? '');
    }
  }

  function onNameChange(v: string) {
    setName(v);
    if (mode === 'new') setSlug(slugify(v));
  }

  function handleFileSelect(files: FileList) {
    if (files && files.length > 0) {
      setCropQueue(prev => [...prev, ...Array.from(files)]);
    }
  }

  function removeImage(idx: number) {
    const img = images[idx] as ImgState;
    if ((img as any).type === 'existing') {
      setDeletedPublicIds(prev => [...prev, (img as any).publicId]);
    } else {
      const ni = img as Extract<ImgState, { type: 'new' }>;
      if (ni.previewUrl) URL.revokeObjectURL(ni.previewUrl);
      if (ni.compressed?.previewUrl) URL.revokeObjectURL(ni.compressed.previewUrl);
    }
    setImages(prev => prev.filter((_, i) => i !== idx));
  }

  function handleVideoSelect(files: FileList) {
    if (files && files.length > 0) {
      let file = files[0];
      // On some OSes, file.type might be empty or generic. Force it for common extensions.
      if (!file.type || file.type === 'application/octet-stream') {
        const ext = file.name.split('.').pop()?.toLowerCase();
        let mime = 'video/mp4';
        if (ext === 'webm') mime = 'video/webm';
        else if (ext === 'mov') mime = 'video/quicktime';
        file = new File([file], file.name, { type: mime });
      }
      
      setVideos(prev => [...prev, {
        id: generateTmpId(), stateType: 'new_upload', type: 'cloudinary', file, previewUrl: URL.createObjectURL(file), uploadProgress: 0
      }]);
    }
  }

  function addYoutubeVideo() {
    if (!ytInput.trim()) return;
    setVideos(prev => [...prev, { id: generateTmpId(), stateType: 'new_youtube', type: 'youtube', url: ytInput.trim() }]);
    setYtInput('');
  }

  function removeVideo(idx: number) {
    const vid = videos[idx] as any;
    if (vid.stateType === 'existing' && vid.type === 'cloudinary' && vid.publicId) {
      setDeletedVideoPublicIds(prev => [...prev, vid.publicId]);
    }
    if (vid.stateType === 'new_upload' && vid.previewUrl) URL.revokeObjectURL(vid.previewUrl);
    setVideos(prev => prev.filter((_, i) => i !== idx));
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

  function updateAlt(idx: number, alt: string) {
    setImages(prev => prev.map((img, i) => i === idx ? { ...img, alt } : img));
  }

  async function generateSeoWithAi() {
    if (!name.trim()) { setAiError('Fill in the product name first.'); return; }
    setAiBusy(true); setAiError('');
    try {
      const imagesPayload = await Promise.all(images.map(async (img) => {
        if ((img as any).type === 'existing') {
          return { type: 'url', data: (img as any).url };
        } else {
          const ni = img as Extract<ImgState, { type: 'new' }>;
          return new Promise<{ type: 'base64', mime: string, data: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const res = reader.result as string;
              resolve({ type: 'base64', mime: ni.file.type, data: res.split(',')[1] });
            };
            reader.onerror = () => resolve({ type: 'base64', mime: '', data: '' });
            reader.readAsDataURL(ni.file);
          });
        }
      }));
      const validImages = imagesPayload.filter(img => img.data);

      const res = await fetch('/api/admin/seo-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          brand: brandName || undefined,
          category: cats.find(c => c._id === catId)?.name,
          subcategory: allSubs.find(s => s._id === subId)?.name,
          desc,
          price: price ? Number(price) : null,
          specs: Object.fromEntries(specs.filter(s => s.key.trim()).map(s => [s.key.trim(), s.value.trim()])),
          useCases: useCases.filter(uc => selectedUseCases.includes(uc._id)).map(uc => uc.name),
          imageCount: images.length,
          images: validImages,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setAiError(data.error ?? 'AI generation failed.'); return; }
      setSeoTitle(data.title ?? '');
      setSeoDesc(data.description ?? '');
      setSeoKeywords(data.keywords ?? '');
      if (Array.isArray(data.imageAlts) && data.imageAlts.length) {
        setImages(prev => prev.map((img, i) => ({ ...img, alt: data.imageAlts[i] ?? img.alt })));
      }
    } catch {
      setAiError('Could not reach the AI service.');
    } finally {
      setAiBusy(false);
    }
  }

  async function generateDescWithAi() {
    if (!name.trim()) { setDescAiError('Fill in the product name first.'); return; }
    setDescAiBusy(true); setDescAiError('');
    try {
      const res = await fetch('/api/admin/desc-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          brand: brandName || undefined,
          category: cats.find(c => c._id === catId)?.name,
          subcategory: allSubs.find(s => s._id === subId)?.name,
          specs: Object.fromEntries(specs.filter(s => s.key.trim()).map(s => [s.key.trim(), s.value.trim()])),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setDescAiError(data.error ?? 'AI generation failed.'); return; }
      setDesc(data.description ?? '');
    } catch {
      setDescAiError('Could not reach the AI service.');
    } finally {
      setDescAiBusy(false);
    }
  }

  const hasSeoOverrides = Boolean(seoTitle.trim() || seoDesc.trim() || seoKeywords.trim() || images.some(img => img.alt.trim()));

  function resetSeoToAuto() {
    setSeoTitle('');
    setSeoDesc('');
    setSeoKeywords('');
    setImages(prev => prev.map(img => ({ ...img, alt: '' })));
    setAiError('');
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
      await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicId: pid, resourceType: 'image' }) });
    }
    for (const pid of deletedVideoPublicIds) {
      await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicId: pid, resourceType: 'video' }) });
    }

    // 2. Process uploads (with per-image progress)
    const folder = `products/${selectedCat.slug}/${selectedSub.slug}`;
    const finalImages: ImgEntry[] = [];

    async function uploadWithProgress(file: Blob | File, folderPath: string, publicId: string, onProgress: (p: number) => void) {
      return new Promise<any>((resolve, reject) => {
        const fd = new FormData();
        const f = file instanceof File ? file : new File([file], `${publicId}.webp`, { type: (file as any).type || 'image/webp' });
        fd.append('file', f, f.name);
        fd.append('folder', folderPath);
        fd.append('publicId', publicId);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload');
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try { resolve(JSON.parse(xhr.responseText)); } catch (err) { reject(err); }
          } else {
            reject(new Error(`Upload failed ${xhr.status}`));
          }
        };
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(fd);
      });
    }

    for (const img of images) {
      const alt = (img as any).alt?.trim() || undefined;
      if ((img as any).type === 'existing') {
        finalImages.push({ url: (img as any).url, publicId: (img as any).publicId, alt });
      } else {
        const publicId = slugify(name || 'product') + '-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
        const compressedFile = (img as any).compressed?.file as File | undefined;
        const fileToUpload = compressedFile ?? (img as any).file;
        try {
          const result = await uploadWithProgress(fileToUpload, folder, publicId, (p) => {
            setImages(prev => prev.map(it => it.id === (img as any).id ? { ...(it as any), uploadProgress: p } : it));
          });
          if (result?.url) finalImages.push({ url: result.url, publicId: result.publicId, alt });
        } catch (err) {
          setError('Image upload failed.');
          setSaving(false);
          return;
        }
      }
    }

    const finalVideos: VidEntry[] = [];
    for (const vid of videos as any[]) {
      if (vid.stateType === 'existing' || vid.stateType === 'new_youtube') {
        finalVideos.push({ type: vid.type, url: vid.url, publicId: vid.publicId });
      } else if (vid.stateType === 'new_upload') {
        const publicId = slugify(name || 'product') + '-vid-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
        try {
          const result = await uploadWithProgress(vid.file, folder, publicId, (p) => {
            setVideos(prev => prev.map(it => it.id === vid.id ? { ...it, uploadProgress: p } : it));
          });
          if (result?.url) finalVideos.push({ type: 'cloudinary', url: result.url, publicId: result.publicId });
        } catch (err) {
          setError('Video upload failed.');
          setSaving(false);
          return;
        }
      }
    }

    const body = {
      name, slug,
      categoryId: catId, categorySlug: selectedCat.slug, categoryName: selectedCat.name,
      subcategoryId: subId, subcategorySlug: selectedSub.slug, subcategoryName: selectedSub.name,
      desc, price: price ? Number(price) : null,
      tag: tag || null, featured, brand: brand || null, images: finalImages, videos: finalVideos, specs: specsRecord,
      useCaseIds: selectedUseCases,
      seo: {
        title: seoTitle.trim() || undefined,
        description: seoDesc.trim() || undefined,
        keywords: seoKeywords.trim() || undefined,
      },
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
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Description</span>
              <button
                type="button"
                onClick={generateDescWithAi}
                disabled={descAiBusy}
                style={{
                  background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 600,
                  color: 'var(--navy)', cursor: descAiBusy ? 'not-allowed' : 'pointer', opacity: descAiBusy ? 0.5 : 1,
                  display: 'flex', alignItems: 'center', gap: 4
                }}
              >
                {descAiBusy ? '⏳ Searching web & writing...' : '✨ Write with AI (Web Search)'}
              </button>
            </label>
            {descAiError && <span style={{ color: '#dc2626', fontSize: 12, marginTop: -4, marginBottom: 4 }}>{descAiError}</span>}
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="What the product does and its key use case…" rows={8} />
          </div>
        </div>
      </div>

      {/* Category */}
      <div className="adm-form-section">
        <h3>Category & subcategory</h3>
        <div className="form-row">
          <div className="form-field">
            <label>Category</label>
            <select value={catId} onChange={e => onCatChange(e.target.value)}>
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

      {/* Use Cases */}
      <div className="adm-form-section">
        <h3>Use Cases <span style={{ fontWeight: 400, fontSize: 11, color: '#9ca3af', textTransform: 'none' }}>(optional — tick all that apply)</span></h3>
        {useCases.length === 0 ? (
          <div style={{ padding: '10px 14px', background: '#f3f4f6', borderRadius: 8, fontSize: 13, color: '#6b7280' }}>
            No use cases added yet.{' '}
            <a href="/admin/use-cases" target="_blank" style={{ color: 'var(--navy)', fontWeight: 600 }}>Add use cases</a>
            {' '}first, then come back.
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {useCases.map(uc => {
              const checked = selectedUseCases.includes(uc._id);
              return (
                <label
                  key={uc._id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer',
                    padding: '6px 14px', borderRadius: 999,
                    background: checked ? 'var(--navy)' : '#f3f4f6',
                    color: checked ? '#fff' : '#374151',
                    fontWeight: checked ? 700 : 500, fontSize: 13,
                    border: `2px solid ${checked ? 'var(--navy)' : 'transparent'}`,
                    transition: 'all .15s',
                    userSelect: 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    style={{ display: 'none' }}
                    onChange={e =>
                      setSelectedUseCases(prev =>
                        e.target.checked ? [...prev, uc._id] : prev.filter(i => i !== uc._id)
                      )
                    }
                  />
                  {uc.name}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Pricing & tag */}
      <div className="adm-form-section">
        <h3>Pricing & visibility</h3>
        <div className="form-row triple">
          <div className="form-field">
            <label>Price (₹) <span className="opt">leave blank = &ldquo;On request&rdquo;</span></label>
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

        {/* Compression controls */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', margin: '8px 0 12px' }}>
          <label style={{ fontSize: 13 }}>
            Max width
            <input type="number" value={compressMaxWidth} onChange={e => setCompressMaxWidth(Number(e.target.value) || 0)} style={{ marginLeft: 8, width: 96 }} />
          </label>
          <label style={{ fontSize: 13 }}>
            Quality
            <input type="range" min={0.4} max={0.95} step={0.01} value={compressQuality} onChange={e => setCompressQuality(Number(e.target.value))} style={{ marginLeft: 8 }} />
            <span style={{ marginLeft: 6 }}>{Math.round(compressQuality * 100)}%</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <input type="checkbox" checked={convertToWebp} onChange={e => setConvertToWebp(e.target.checked)} /> Convert to WebP
          </label>
          <button
            type="button"
            onClick={async () => {
              // Recompress all pending new images with current settings
              const pending = images.filter((it: any) => it.type === 'new');
              for (const it of pending) {
                    try {
                      setImages(prev => prev.map(p => p.id === (it as any).id ? { ...(p as any), compressing: true } : p));
                      const compressed = await compressImageFile((it as any).file, { maxWidth: compressMaxWidth, quality: compressQuality, convertToWebp });
                      const preview = URL.createObjectURL(compressed);
                      setImages(prev => prev.map(p => p.id === (it as any).id ? { ...(p as any), compressed: { file: compressed, previewUrl: preview, size: compressed.size }, compressing: false } : p));
                    } catch {
                      setImages(prev => prev.map(p => p.id === (it as any).id ? { ...(p as any), compressing: false } : p));
                    }
                  }
            }}
            className="btn-adm btn-adm-ghost"
          >Recompress</button>
        </div>

        {images.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {images.map((img, i) => {
              const isExisting = (img as any).type === 'existing';
              const previewSrc = isExisting ? (img as any).url : ((img as any).compressed?.previewUrl ?? (img as any).previewUrl);
              const originalSize = (img as any).originalSize as number | undefined;
              const compressedSize = (img as any).compressed?.size as number | undefined;
              const compressing = (img as any).compressing as boolean | undefined;
              const uploadProgress = (img as any).uploadProgress as number | undefined;

              function fmtBytes(b?: number) {
                if (!b && b !== 0) return '';
                if (b < 1024) return b + ' B';
                if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
                return (b / (1024 * 1024)).toFixed(2) + ' MB';
              }

              return (
                <div key={img.id ?? i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '10px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10 }}>
                  <div className="img-preview" style={{ flexShrink: 0, position: 'relative' }}>
                    <img src={previewSrc} alt={`Image ${i + 1}`} style={{ width: 140, height: 100, objectFit: 'cover' }} />
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
                    <button className="img-del" type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: 6, right: 6 }}>×</button>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>
                      Alt text (SEO) {!((img as any).alt || '').trim() && <span style={{ color: '#16a34a', textTransform: 'none', fontWeight: 600 }}>· auto</span>}
                    </label>
                    <input
                      value={(img as any).alt}
                      onChange={e => updateAlt(i, e.target.value)}
                      placeholder={autoAlt(i)}
                      style={{ width: '100%' }}
                    />
                    <div style={{ marginTop: 8, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                      {!isExisting && (
                        <>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>
                            Orig: {fmtBytes(originalSize)}
                          </div>
                          <div style={{ fontSize: 12, color: '#6b7280' }}>
                            {compressing ? 'Compressing…' : (compressedSize ? `Now: ${fmtBytes(compressedSize)}` : '')}
                          </div>
                        </>
                      )}
                      {uploadProgress ? (
                        <div style={{ width: 160, background: '#fff', border: '1px solid #e5e7eb', height: 8, borderRadius: 6, overflow: 'hidden' }}>
                          <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg,#1E1D5C,#4338ca)' }} />
                        </div>
                      ) : null}
                      <span className="hint">Describes the image for Google &amp; screen readers. Blank = auto-generated.</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Videos */}
      <div className="adm-form-section">
        <h3>Product videos <span style={{ fontWeight: 400, fontSize: 11, color: '#9ca3af', textTransform: 'none' }}>(optional)</span></h3>
        
        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <button type="button" className="btn-adm btn-adm-ghost" onClick={() => videoFileRef.current?.click()}>
            Upload Video (MP4/WebM)
          </button>
          <input ref={videoFileRef} type="file" accept="video/mp4,video/webm,video/quicktime" style={{ display: 'none' }} onChange={e => e.target.files && handleVideoSelect(e.target.files)} />
          <div style={{ display: 'flex', flex: 1, gap: 8 }}>
            <input value={ytInput} onChange={e => setYtInput(e.target.value)} placeholder="Or paste YouTube URL here..." style={{ flex: 1 }} />
            <button type="button" className="btn-adm btn-adm-ghost" onClick={addYoutubeVideo}>Add YouTube</button>
          </div>
        </div>

        {videos.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {videos.map((vid: any, i) => {
              const uploadProgress = vid.uploadProgress;
              return (
                <div key={vid.id ?? i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '10px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, position: 'relative' }}>
                  <button className="img-del" type="button" onClick={() => removeVideo(i)} style={{ position: 'absolute', top: 6, right: 6, zIndex: 10 }}>×</button>
                  <div style={{ flexShrink: 0, width: 180, height: 100, background: '#000', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                    {vid.type === 'youtube' ? (
                      <iframe width="180" height="100" src={vid.url.includes('watch?v=') ? vid.url.replace('watch?v=', 'embed/') : vid.url} frameBorder="0" allowFullScreen></iframe>
                    ) : (
                      <>
                        <video 
                          src={vid.stateType === 'existing' ? vid.url : vid.previewUrl} 
                          width="180" 
                          height="100" 
                          style={{ objectFit: 'cover' }} 
                          controls 
                          muted 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                        <div style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', background: '#374151', color: '#9ca3af', fontSize: 11, textAlign: 'center', padding: 8, lineHeight: 1.4 }}>
                          Preview unavailable<br/>(will process on upload)
                        </div>
                      </>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>
                      {vid.type === 'youtube' ? 'YouTube Video' : 'Uploaded Video'}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4, wordBreak: 'break-all' }}>
                      {vid.type === 'youtube' ? vid.url : vid.stateType === 'existing' ? vid.url : vid.file?.name}
                    </div>
                    {uploadProgress !== undefined && uploadProgress > 0 && (
                      <div style={{ width: '100%', background: '#fff', border: '1px solid #e5e7eb', height: 8, borderRadius: 6, overflow: 'hidden', marginTop: 8 }}>
                        <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'linear-gradient(90deg,#1E1D5C,#4338ca)' }} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SEO */}
      <div className="adm-form-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
          <h3 style={{ margin: 0 }}>SEO <span style={{ fontWeight: 400, fontSize: 11, color: '#9ca3af', textTransform: 'none' }}>(auto-generated — override any field if you want)</span></h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {hasSeoOverrides && (
              <button
                type="button"
                onClick={resetSeoToAuto}
                disabled={aiBusy}
                title="Clear all SEO overrides and image alt texts — everything goes back to auto-generated"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 9,
                  background: '#fff', color: '#6b7280',
                  border: '1.5px solid #e5e7eb', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  transition: 'border-color .15s, color .15s',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#dc2626'; e.currentTarget.style.color = '#dc2626'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; }}
              >
                ↺ Reset to auto
              </button>
            )}
            <button
              type="button"
              onClick={generateSeoWithAi}
              disabled={aiBusy}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '8px 16px', borderRadius: 9,
                background: aiBusy ? '#9ca3af' : 'linear-gradient(135deg, #1E1D5C, #4338ca)',
                color: '#fff', border: 'none', cursor: aiBusy ? 'wait' : 'pointer',
                fontSize: 13, fontWeight: 700,
                boxShadow: aiBusy ? 'none' : '0 2px 10px rgba(67,56,202,.3)',
                transition: 'opacity .15s',
              }}
            >
              <span style={{ fontSize: 15 }}>✨</span>
              {aiBusy ? 'Generating…' : 'Generate with AI'}
            </button>
          </div>
        </div>
        <p style={{ margin: '0 0 16px', fontSize: 12, color: '#6b7280' }}>
          AI reads the product name, brand, specs &amp; use cases and writes Google-optimised title, description, keywords and image alt texts. Review and tweak before saving.
        </p>
        {aiError && <div className="adm-err" style={{ marginBottom: 14 }}>{aiError}</div>}

        {/* Google preview */}
        <div style={{ padding: '14px 18px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, marginBottom: 18, maxWidth: 600 }}>
          <p style={{ margin: '0 0 8px', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: '#9ca3af' }}>Google preview</p>
          <p style={{ margin: 0, fontSize: 12, color: '#1a7f3c' }}>hiranimarketingcombines.in › product › {slug || 'slug'}</p>
          <p style={{ margin: '2px 0 0', fontSize: 17, color: '#1a0dab', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {effTitle || 'Product title appears here'}
          </p>
          <p style={{ margin: '3px 0 0', fontSize: 13, color: '#4d5156', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {effDesc || 'Meta description appears here.'}
          </p>
        </div>

        <div className="form-row single">
          <div className="form-field">
            <label>
              Meta title {!seoTitle.trim() && <span style={{ color: '#16a34a', fontWeight: 600, textTransform: 'none' }}>· auto</span>}
              <span className="opt" style={{ float: 'right', color: effTitle.length > 65 ? '#dc2626' : '#9ca3af' }}>{effTitle.length}/65</span>
            </label>
            <input value={seoTitle} onChange={e => setSeoTitle(e.target.value)} placeholder={autoSeoTitle || 'Auto-generated from product name + brand'} />
          </div>
        </div>
        <div className="form-row single">
          <div className="form-field">
            <label>
              Meta description {!seoDesc.trim() && <span style={{ color: '#16a34a', fontWeight: 600, textTransform: 'none' }}>· auto</span>}
              <span className="opt" style={{ float: 'right', color: effDesc.length > 320 ? '#dc2626' : '#9ca3af' }}>{effDesc.length}/320</span>
            </label>
            <textarea value={seoDesc} onChange={e => setSeoDesc(e.target.value)} placeholder={autoSeoDesc || 'Auto-generated from the product description'} rows={3} />
          </div>
        </div>
        <div className="form-row single">
          <div className="form-field">
            <label>Keywords {!seoKeywords.trim() && <span style={{ color: '#16a34a', fontWeight: 600, textTransform: 'none' }}>· auto</span>}</label>
            <input value={seoKeywords} onChange={e => setSeoKeywords(e.target.value)} placeholder={autoSeoKeywords || 'comma, separated, keywords'} />
            <span className="hint">Comma-separated. Blank = auto from name, brand, category &amp; use cases.</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-adm btn-adm-orange" onClick={save} disabled={saving} type="button">
          {saving ? 'Saving and uploading…' : mode === 'new' ? 'Create product' : 'Save changes'}
        </button>
        <a href="/admin/products" className="btn-adm btn-adm-ghost">Cancel</a>
      </div>
      {/* Cropper Modal */}
      {cropImgSrc && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Crop Image (Free-form)</h3>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>Draw a box tightly around the product. It doesn't have to be a square! The website will automatically fit whatever shape you crop perfectly into the grid.</p>
            <div style={{ overflow: 'auto', flex: 1, display: 'flex', justifyContent: 'center', background: '#f3f4f6', borderRadius: 8 }}>
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                minWidth={100}
              >
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={cropImgSrc}
                  onLoad={onImageLoad}
                  style={{ maxHeight: '60vh', width: 'auto', display: 'block' }}
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
