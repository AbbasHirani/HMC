'use client';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [newEnquiries, setNewEnquiries] = useState(0);

  const onLogin = pathname === '/admin/login';

  // Refresh the unread badge on every admin navigation.
  useEffect(() => {
    if (onLogin) return;
    fetch('/api/enquiries?countOnly=1')
      .then(r => r.ok ? r.json() : { count: 0 })
      .then(d => setNewEnquiries(d.count ?? 0))
      .catch(() => null);
  }, [pathname, onLogin]);

  if (onLogin) return <>{children}</>;

  const active = (path: string) => pathname === path || pathname.startsWith(path + '/') ? 'active' : '';

  async function logout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  }

  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/logo-mark.png" alt="HMC Logo" style={{ width: '28px', height: '28px', objectFit: 'contain', background: '#fff', padding: '3px', borderRadius: '6px' }} />
          <div>HMC <span>Admin</span></div>
        </div>
        <nav className="adm-nav">
          <a href="/admin" className={pathname === '/admin' ? 'active' : ''}>Dashboard</a>
          <a href="/admin/categories" className={active('/admin/categories')}>Categories</a>
          <a href="/admin/products" className={active('/admin/products')}>Products</a>
          <a href="/admin/brands" className={active('/admin/brands')}>Brands</a>
          <a href="/admin/use-cases" className={active('/admin/use-cases')}>Use Cases</a>
          <a href="/admin/repair-jobs" className={active('/admin/repair-jobs')}>Repair Jobs</a>
          <a href="/admin/enquiries" className={active('/admin/enquiries')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Enquiries
            {newEnquiries > 0 && (
              <span style={{
                background: '#f97316', color: '#fff', fontSize: 11, fontWeight: 800,
                borderRadius: 999, padding: '2px 8px', lineHeight: 1.4, minWidth: 20, textAlign: 'center',
              }}>
                {newEnquiries}
              </span>
            )}
          </a>
          <div className="sep" />
          <a href="/" target="_blank" rel="noopener noreferrer">View site ↗</a>
        </nav>
        <button className="adm-logout" onClick={logout}>Sign out</button>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
