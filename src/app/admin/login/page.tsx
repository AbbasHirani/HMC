'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/admin');
    } else {
      setError('Incorrect password. Try again.');
    }
  }

  return (
    <div className="adm-login">
      <div className="adm-login-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: '#fff', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px', boxShadow: 'var(--shadow-sm)' }}>
            <img src="/logo-mark.png" alt="HMC Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <h1 style={{ margin: 0 }}>HMC Admin</h1>
        </div>
        <p>Sign in to manage products and categories</p>
        {error && <div className="adm-err">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-field" style={{ marginBottom: 16 }}>
            <label>Password</label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              required
              autoFocus
              placeholder="Enter admin password"
            />
          </div>
          <button
            className="btn-adm btn-adm-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '11px 14px', fontSize: 14 }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
