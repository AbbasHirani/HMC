import './admin.css';
import AdminShell from './AdminShell';

export const metadata = { title: 'Admin — HMC' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
