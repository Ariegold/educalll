/**
 * LoginPage — Authentication entry point.
 * Three role tabs: Admin, Teacher, Kiosk.
 * Demo: any email/password works. Production: calls AuthContext.login().
 */
import React, { useState } from 'react';
import { useAuth }  from '../context/AuthContext';
import { Button }   from '../components/ui/Button';
import { Card }     from '../components/ui/Card';

const ROLES = [
  { id: 'admin',   emoji: '🏫', label: 'Admin'   },
  { id: 'teacher', emoji: '👩‍🏫', label: 'Teacher' },
  { id: 'kiosk',   emoji: '📲', label: 'Kiosk'   },
];

export function LoginPage({ onSuccess, onRegister, showToast }) {
  const { login, isLoading } = useAuth();
  const [role,  setRole]  = useState('admin');
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) { setError('Please enter your email address'); return; }
    setError('');
    const result = await login(email, pass, role);
    if (result.success) {
      onSuccess(result.user.role);
    } else {
      setError(result.error || 'Login failed');
    }
  }

  return (
    <div style={{
      minHeight:       '100vh',
      background:      'var(--surface)',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'var(--grad-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--font-headline)', fontSize: '28px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.03em' }}>EduCall</div>
          <div style={{ fontSize: '13px', color: 'var(--outline)', marginTop: '4px' }}>Biometric Subject Attendance · SS1–SS3</div>
        </div>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px', marginBottom: '24px' }}>
          {ROLES.map(r => (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              style={{
                padding:      '14px 8px',
                borderRadius: '12px',
                border:       'none',
                cursor:       'pointer',
                textAlign:    'center',
                background:   role === r.id ? 'var(--primary)' : 'var(--surface-container-low)',
                transition:   'background 0.15s',
                minHeight:    'var(--tap)',
              }}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{r.emoji}</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: role === r.id ? 'white' : 'var(--on-surface-variant)' }}>{r.label}</div>
            </button>
          ))}
        </div>

        <Card>
          <div style={{ fontFamily: 'var(--font-headline)', fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>Sign in</div>
          <div style={{ fontSize: '13px', color: 'var(--outline)', marginBottom: '20px' }}>Access your EduCall dashboard</div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@school.edu.ng" autoComplete="username"
                style={{ width: '100%', padding: '10px 14px', border: 'none', borderRadius: '8px', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '14px', boxShadow: '0 0 0 1.5px var(--outline-variant)', minHeight: 'var(--tap)', background: 'var(--surface-container-lowest)' }}
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Password</label>
              <input
                type="password" value={pass} onChange={e => setPass(e.target.value)}
                placeholder="••••••••" autoComplete="current-password"
                style={{ width: '100%', padding: '10px 14px', border: 'none', borderRadius: '8px', outline: 'none', fontFamily: 'var(--font-body)', fontSize: '14px', boxShadow: '0 0 0 1.5px var(--outline-variant)', minHeight: 'var(--tap)', background: 'var(--surface-container-lowest)' }}
              />
            </div>

            {error && (
              <div style={{ padding: '10px 14px', background: 'var(--error-container)', color: '#690005', borderRadius: '8px', fontSize: '12px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={isLoading} icon="login" style={{ height: '46px', fontSize: '14px', borderRadius: '10px' }}>
              Sign in to EduCall
            </Button>
          </form>

          <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--outline)' }}>
            Demo: any email/password · role sets your view
          </div>
        </Card>

        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--outline)' }}>
          New school?{' '}
          <span style={{ color: 'var(--surface-tint)', fontWeight: 600, cursor: 'pointer' }} onClick={onRegister}>
            Register here
          </span>
        </div>
      </div>
    </div>
  );
}
