import Link from 'next/link';

// Without this, an admin notFound() falls through to the public 404, which
// renders the site header and footer inside the admin shell.
export default function AdminNotFound() {
  return (
    <>
      <div className="adm-topbar"><h1>Not found</h1></div>
      <div className="adm-content">
        <p style={{ color: 'var(--slate)', fontSize: 15, lineHeight: 1.7, maxWidth: 520 }}>
          That record doesn&rsquo;t exist. It may have been deleted, or the link
          may be pointing at an old id.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
          <Link href="/admin" className="btn-adm btn-adm-primary">Back to dashboard</Link>
          <Link href="/admin/products" className="btn-adm btn-adm-ghost">Products</Link>
          <Link href="/admin/categories" className="btn-adm btn-adm-ghost">Categories</Link>
        </div>
      </div>
    </>
  );
}
