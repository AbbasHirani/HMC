'use client';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/admin/login') return <>{children}</>;

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
          <a href="/admin/repair-jobs" className={active('/admin/repair-jobs')}>Repair Jobs</a>
          <div className="sep" />
          <a href="/" target="_blank" rel="noopener noreferrer">View site ↗</a>
        </nav>
        <button className="adm-logout" onClick={logout}>Sign out</button>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
