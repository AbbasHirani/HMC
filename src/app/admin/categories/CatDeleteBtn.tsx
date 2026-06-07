'use client';
import { useRouter } from 'next/navigation';

export default function CatDeleteBtn({ id, name }: { id: string; name: string }) {
  const router = useRouter();

  async function del() {
    if (!confirm(`Delete category "${name}"? This also deletes all its subcategories.`)) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <button className="btn-adm btn-adm-danger btn-adm-sm" onClick={del}>
      Delete
    </button>
  );
}
