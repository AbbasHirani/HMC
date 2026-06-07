'use client';
import { useRouter } from 'next/navigation';

export default function ProdDeleteBtn({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  async function del() {
    if (!confirm(`Delete "${name}"? This also removes its Cloudinary images.`)) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    router.refresh();
  }
  return <button className="btn-adm btn-adm-danger btn-adm-sm" onClick={del}>Delete</button>;
}
