/**
 * RegisterPage — 3-step school registration wizard.
 *
 * Step 1: School details (name, country, state, city, type)
 * Step 2: Admin account (name, email, password, phone)
 * Step 3: Class setup (select which classes this school uses)
 *
 * On completion: saves a school record to localStorage so the login
 * page can find it. In production (Taiwo): replace localStorage with
 * a POST to /api/schools/register → Neon → return schoolId + JWT.
 *
 * Security:
 *   - Passwords are only stored in localStorage for demo purposes.
 *   - In production: NEVER store passwords on the client. POST to backend,
 *     backend hashes with bcrypt and stores in Neon. Return a JWT.
 *   - Form inputs are controlled React state — no innerHTML risk.
 */
import React, { useState } from 'react';
import { useAuth }  from '../context/AuthContext';
import { Button }   from '../components/ui/Button';
import { Card }     from '../components/ui/Card';
import { Badge }    from '../components/ui/Badge';
import { Icon }     from '../components/ui/Icon';
import { CLASSES }  from '../data/seedData';
import { toSlug }   from '../utils/helpers';

/* ── CONSTANTS ───────────────────────────────────────────────── */
const SCHOOL_TYPES = ['Public Secondary School', 'Private Secondary School', 'Faith-based School', 'International School', 'Technical College'];
const COUNTRIES    = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania', 'Rwanda', 'United Kingdom'];
const STATES_NG    = ['Lagos', 'Abuja (FCT)', 'Kano', 'Rivers', 'Oyo', 'Kaduna', 'Kwara', 'Ogun', 'Enugu', 'Anambra', 'Delta', 'Plateau', 'Other'];

/* ── STEP INDICATOR ──────────────────────────────────────────── */
function StepBar({ current, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '32px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <React.Fragment key={i}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-headline)', fontSize: '13px', fontWeight: 700,
            background: i < current ? 'var(--primary)' : i === current ? 'var(--primary)' : 'var(--surface-container-high)',
            color:      i <= current ? 'white' : 'var(--outline)',
            transition: 'all 0.3s',
          }}>
            {i < current ? <Icon name="check" size={16} style={{ color: 'white' }} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div style={{ flex: 1, height: '2px', background: i < current ? 'var(--primary)' : 'var(--surface-container-high)', transition: 'background 0.3s' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── FORM FIELD ──────────────────────────────────────────────── */
function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
        {label}
      </label>
      {children}
      {error && <div style={{ fontSize: '11px', color: 'var(--error)', marginTop: '4px' }}>{error}</div>}
    </div>
  );
}

/* ── REGISTER PAGE ───────────────────────────────────────────── */
export function RegisterPage({ onRegistered, onBackToLogin, showToast }) {
  const { login } = useAuth();

  const [step, setStep]   = useState(0);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  /* School details (Step 1) */
  const [school, setSchool] = useState({
    schoolName: '', type: 'Private Secondary School',
    country: 'Nigeria', state: 'Lagos', city: '',
  });

  /* Admin account (Step 2) */
  const [admin, setAdmin] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
  });

  /* Class setup (Step 3) */
  const [selectedClasses, setSelectedClasses] = useState(['SS1A', 'SS1B', 'SS2A', 'SS2B', 'SS3A', 'SS3B']);

  /* ── SHARED HELPERS ── */
  const inputStyle = {
    width: '100%', padding: '10px 14px', border: 'none', borderRadius: '8px',
    outline: 'none', fontFamily: 'var(--font-body)', fontSize: '14px',
    boxShadow: '0 0 0 1.5px var(--outline-variant)', minHeight: '44px',
    background: 'var(--surface-container-lowest)', boxSizing: 'border-box',
  };

  const setS  = key => e => setSchool(f => ({ ...f, [key]: e.target.value }));
  const setA  = key => e => setAdmin(f => ({ ...f, [key]: e.target.value }));
  const toggleClass = cls => setSelectedClasses(prev =>
    prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
  );

  /* ── VALIDATION ── */
  function validateStep(s) {
    const e = {};
    if (s === 0) {
      if (!school.schoolName.trim()) e.schoolName = 'School name is required';
      if (!school.city.trim())       e.city       = 'City is required';
    }
    if (s === 1) {
      if (!admin.name.trim())                        e.name            = 'Your name is required';
      if (!admin.email.includes('@'))                e.email           = 'Valid email required';
      if (admin.password.length < 8)                 e.password        = 'Password must be at least 8 characters';
      if (admin.password !== admin.confirmPassword)  e.confirmPassword = 'Passwords do not match';
    }
    if (s === 2) {
      if (selectedClasses.length === 0) e.classes = 'Select at least one class';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validateStep(step)) return;
    setStep(s => s + 1);
  }

  /* ── SUBMIT ── */
  async function handleRegister() {
    if (!validateStep(2)) return;
    setSaving(true);

    try {
      // Build the school record
      const record = {
        schoolId:    toSlug(school.schoolName),
        schoolName:  school.schoolName,
        type:        school.type,
        country:     school.country,
        state:       school.state,
        city:        school.city,
        name:        admin.name,
        email:       admin.email,
        password:    admin.password, // Demo only — Taiwo: send to POST /api/schools/register, never store plain password
        phone:       admin.phone,
        classes:     selectedClasses,
        academicYear:'2025/2026',
        role:        'admin',
        isDemo:      false,
        createdAt:   new Date().toISOString(),
      };

      // Save to localStorage (demo mode)
      const existing = JSON.parse(localStorage.getItem('educall_schools') || '[]');
      const alreadyExists = existing.some(s => s.email === admin.email);
      if (alreadyExists) {
        setErrors({ email: 'An account with this email already exists' });
        setStep(1);
        setSaving(false);
        return;
      }
      localStorage.setItem('educall_schools', JSON.stringify([...existing, record]));

      // Auto-login after registration
      await login(admin.email, admin.password, 'admin');
      showToast(`Welcome to EduCall, ${admin.name.split(' ')[0]}!`);
      onRegistered();

    } catch (err) {
      showToast('Registration failed — please try again', 'error');
    } finally {
      setSaving(false);
    }
  }

  /* ── RENDER ── */
  const stepTitles    = ['School Details', 'Admin Account', 'Class Setup'];
  const stepSubtitles = [
    'Tell us about your school',
    'Create your administrator login',
    'Which classes does your school run?',
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--font-headline)', fontSize: '22px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>Register your school</div>
          <div style={{ fontSize: '12px', color: 'var(--outline)', marginTop: '4px' }}>Takes about 2 minutes · Free pilot access</div>
        </div>

        <Card elevated>
          {/* Progress bar */}
          <StepBar current={step} total={3} />

          {/* Step heading */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>{stepTitles[step]}</div>
            <div style={{ fontSize: '13px', color: 'var(--outline)' }}>{stepSubtitles[step]}</div>
          </div>

          {/* ── STEP 1: School details ── */}
          {step === 0 && (
            <div>
              <Field label="School Name *" error={errors.schoolName}>
                <input style={{ ...inputStyle, boxShadow: errors.schoolName ? '0 0 0 2px var(--error)' : '0 0 0 1.5px var(--outline-variant)' }}
                  value={school.schoolName} onChange={setS('schoolName')} placeholder="e.g. Sunshine Secondary School" />
              </Field>
              <Field label="School Type">
                <select style={{ ...inputStyle, cursor: 'pointer' }} value={school.type} onChange={setS('type')}>
                  {SCHOOL_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Field label="Country">
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={school.country} onChange={setS('country')}>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="State / Region">
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={school.state} onChange={setS('state')}>
                    {STATES_NG.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="City / Town *" error={errors.city}>
                <input style={{ ...inputStyle, boxShadow: errors.city ? '0 0 0 2px var(--error)' : '0 0 0 1.5px var(--outline-variant)' }}
                  value={school.city} onChange={setS('city')} placeholder="e.g. Lagos Island" />
              </Field>
            </div>
          )}

          {/* ── STEP 2: Admin account ── */}
          {step === 1 && (
            <div>
              <Field label="Your Full Name *" error={errors.name}>
                <input style={{ ...inputStyle, boxShadow: errors.name ? '0 0 0 2px var(--error)' : '0 0 0 1.5px var(--outline-variant)' }}
                  value={admin.name} onChange={setA('name')} placeholder="e.g. Mrs Adaeze Okonkwo" />
              </Field>
              <Field label="Email Address *" error={errors.email}>
                <input type="email" style={{ ...inputStyle, boxShadow: errors.email ? '0 0 0 2px var(--error)' : '0 0 0 1.5px var(--outline-variant)' }}
                  value={admin.email} onChange={setA('email')} placeholder="admin@yourschool.edu.ng" autoComplete="username" />
              </Field>
              <Field label="Phone (WhatsApp)">
                <input type="tel" style={inputStyle} value={admin.phone} onChange={setA('phone')} placeholder="+234 800 000 0000" />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <Field label="Password *" error={errors.password}>
                  <input type="password" style={{ ...inputStyle, boxShadow: errors.password ? '0 0 0 2px var(--error)' : '0 0 0 1.5px var(--outline-variant)' }}
                    value={admin.password} onChange={setA('password')} placeholder="Min. 8 characters" autoComplete="new-password" />
                </Field>
                <Field label="Confirm Password *" error={errors.confirmPassword}>
                  <input type="password" style={{ ...inputStyle, boxShadow: errors.confirmPassword ? '0 0 0 2px var(--error)' : '0 0 0 1.5px var(--outline-variant)' }}
                    value={admin.confirmPassword} onChange={setA('confirmPassword')} placeholder="Repeat password" autoComplete="new-password" />
                </Field>
              </div>
              <div style={{ padding: '10px 14px', background: 'var(--surface-container-low)', borderRadius: '8px', fontSize: '11px', color: 'var(--outline)' }}>
                🔒 Your password is secured. In the live version it is hashed server-side — never stored as plain text.
              </div>
            </div>
          )}

          {/* ── STEP 3: Class setup ── */}
          {step === 2 && (
            <div>
              <div style={{ fontSize: '13px', color: 'var(--outline)', marginBottom: '16px' }}>
                Select all classes your school runs. You can add or remove classes later in Settings.
              </div>
              {errors.classes && (
                <div style={{ padding: '8px 12px', background: 'var(--error-container)', color: '#690005', borderRadius: '8px', fontSize: '12px', marginBottom: '12px' }}>{errors.classes}</div>
              )}
              {/* Group by year */}
              {['SS1', 'SS2', 'SS3'].map(year => {
                const yearClasses = CLASSES.filter(c => c.startsWith(year));
                return (
                  <div key={year} style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{year}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {yearClasses.map(cls => {
                        const selected = selectedClasses.includes(cls);
                        return (
                          <button
                            key={cls}
                            onClick={() => toggleClass(cls)}
                            style={{
                              padding: '8px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                              fontWeight: 600, fontSize: '13px', fontFamily: 'var(--font-body)', minHeight: '40px',
                              background: selected ? 'var(--primary)' : 'var(--surface-container-low)',
                              color:      selected ? 'white'          : 'var(--on-surface-variant)',
                              transition: 'all 0.15s',
                            }}
                          >
                            {cls}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <div style={{ padding: '12px 14px', background: 'var(--surface-container-low)', borderRadius: '8px', fontSize: '12px', color: 'var(--outline)', marginTop: '8px' }}>
                <strong>Selected:</strong> {selectedClasses.length === 0 ? 'None' : selectedClasses.join(', ')}
              </div>
            </div>
          )}

          {/* ── NAVIGATION BUTTONS ── */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '28px' }}>
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep(s => s - 1)} icon="arrow_back" style={{ flex: 1 }}>Back</Button>
            )}
            {step < 2 && (
              <Button variant="primary" onClick={next} icon="arrow_forward" style={{ flex: 1 }}>Continue</Button>
            )}
            {step === 2 && (
              <Button variant="primary" onClick={handleRegister} loading={saving} icon="check" style={{ flex: 1 }}>
                Create School Account
              </Button>
            )}
          </div>
        </Card>

        {/* Back to login */}
        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--outline)' }}>
          Already registered?{' '}
          <span style={{ color: 'var(--surface-tint)', fontWeight: 600, cursor: 'pointer' }} onClick={onBackToLogin}>
            Sign in here
          </span>
        </div>
      </div>
    </div>
  );
}
