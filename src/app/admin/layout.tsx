import './admin.css';
import AdminShell from './AdminShell';

// Admin pages read live DB data — never prerender them at build time.
export const dynamic = 'force-dynamic';

export const metadata = { title: 'Admin — HMC' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
