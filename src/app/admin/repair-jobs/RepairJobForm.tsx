'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const TAGS = ['Pump Repair', 'Filter Service', 'Motor Rewind', 'Compressor', 'Hydraulic', 'Reconditioning', 'Other'];

interface Props {
  mode: 'new' | 'edit';
  id?: string;
  initial?: {
    title: string; description: string; tag: string; order: number;
    imageUrl?: string; imagePublicId?: string;
  };
}

export default function RepairJobForm({ mode, id, initial }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [tag, setTag] = useState(initial?.tag ?? '');
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? '');
  const [imagePublicId, setImagePublicId] = useState(initial?.imagePublicId ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [deletedPublicId, setDeletedPublicId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleFile(file: File) {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function removeImage() {
    if (imagePublicId) setDeletedPublicId(imagePublicId);
    setImageUrl(''); setImagePublicId('');
    if (imagePreview) { URL.revokeObjectURL(imagePreview); setImagePreview(null); }
    setImageFile(null);
  }

  async function save() {
    if (!title) { setError('Title is required.'); return; }
    setSaving(true); setError('');

    if (deletedPublicId) {
      await fetch('/api/upload', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ publicId: deletedPublicId }) });
    }

    let finalImageUrl = imageUrl;
    let finalImagePublicId = imagePublicId;

    if (imageFile) {
      const fd = new FormData();
      fd.append('file', imageFile);
      fd.append('folder', 'repair-jobs');
      fd.append('publicId', `repair-${Date.now()}`);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) { finalImageUrl = data.url; finalImagePublicId = data.publicId; }
    }

    const body = { title, description, tag, order: Number(order), imageUrl: finalImageUrl, imagePublicId: finalImagePublicId, deletedPublicId };
    const url = mode === 'new' ? '/api/repair-jobs' : `/api/repair-jobs/${id}`;
    const method = mode === 'new' ? 'POST' : 'PUT';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    setSaving(false);

    if (!res.ok) { setError('Save failed. Try again.'); return; }
    router.push('/admin/repair-jobs');
    router.refresh();
  }

  const preview = imagePreview || imageUrl;

  return (
    <div className="adm-form">
      {error && <div className="adm-err" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="adm-form-section">
        <h3>Job details</h3>
        <div className="form-row">
          <div className="form-field" style={{ flex: 2 }}>
            <label>Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="1HP Monoblock Pump — Full Reconditioning" />
          </div>
          <div className="form-field">
            <label>Tag / type</label>
            <select value={tag} onChange={e => setTag(e.target.value)}>
              <option value="">— none —</option>
              {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="form-field">
          <label>Description <span style={{ fontWeight: 400, fontSize: 11, color: '#9ca3af' }}>(optional — shown as a caption)</span></label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Stripped down, bearings replaced, motor rewound, pressure-tested." />
        </div>
        <div className="form-field" style={{ maxWidth: 180 }}>
          <label>Sort order</label>
          <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} min={0} />
        </div>
      </div>

      <div className="adm-form-section">
        <h3>Photo</h3>
        {preview ? (
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ width: 200, height: 140, border: '1px solid #e5e7eb', borderRadius: 10, background: '#f9fafb', overflow: 'hidden' }}>
              <img src={preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn-adm btn-adm-ghost btn-adm-sm" type="button" onClick={() => fileRef.current?.click()}>Change photo</button>
              <button className="btn-adm btn-adm-danger btn-adm-sm" type="button" onClick={removeImage}>Remove</button>
            </div>
          </div>
        ) : (
          <div className="img-upload-zone" onClick={() => fileRef.current?.click()}>
            <div style={{ fontSize: 28 }}>🔧</div>
            <p>Click to upload job photo</p>
            <p style={{ fontSize: 11, color: '#9ca3af' }}>JPG or PNG recommended.</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn-adm btn-adm-primary" onClick={save} disabled={saving} type="button">
          {saving ? 'Saving…' : mode === 'new' ? 'Add job' : 'Save changes'}
        </button>
        <a href="/admin/repair-jobs" className="btn-adm btn-adm-ghost">Cancel</a>
      </div>
    </div>
  );
}
