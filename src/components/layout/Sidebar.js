/**
 * Sidebar — Left navigation panel.
 * Renders different nav items depending on user role (admin vs teacher).
 * Active item is highlighted and indicated with a left accent bar.
 *
 * Props:
 *   currentView (string)  — active nav item id
 *   onNavigate  (fn)      — called with view id when nav item clicked
 *   user        (object)  — from AuthContext
 *   onLogout    (fn)
 */
import React from 'react';
import { Icon }   from '../ui/Icon';
import { Badge }  from '../ui/Badge';
import { useApp } from '../../context/AppContext';

/* ── NAV DEFINITIONS ────────────────────────────────────────── */
const ADMIN_NAV = [
  { id: 'dashboard',  icon: 'dashboard',    label: 'Dashboard'           },
  { id: 'timetable',  icon: 'calendar_month',label: 'Subject Timetable'  },
  { id: 'biometric',  icon: 'fingerprint',  label: 'Biometric Attendance'},
  { id: 'students',   icon: 'groups',       label: 'Students',   badge: 'students'  },
  { id: 'teachers',   icon: 'school',       label: 'Teachers',   badge: 'teachers'  },
  { id: 'enrolment',  icon: 'fingerprint',  label: 'Biometric Enrolment' },
  { id: 'reports',    icon: 'bar_chart',    label: 'Reports & Analytics' },
  { id: 'alerts',     icon: 'notifications',label: 'Parent Alerts', badge: 'alerts' },
  { id: 'settings',   icon: 'settings',     label: 'Settings'            },
];

const TEACHER_NAV = [
  { id: 'dashboard',  icon: 'dashboard',    label: 'Dashboard'     },
  { id: 'biometric',  icon: 'fingerprint',  label: 'Class Attendance'},
  { id: 'timetable',  icon: 'calendar_month',label: 'My Timetable' },
  { id: 'reports',    icon: 'bar_chart',    label: 'Reports'       },
];

/* ── LOGO MARK ───────────────────────────────────────────────── */
function LogoMark() {
  return (
    <div style={{
      width: '36px', height: '36px', borderRadius: '10px',
      background: 'var(--grad-primary)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {/* Graduation cap SVG — EduCall brand icon */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    </div>
  );
}

/* ── NAV ITEM ────────────────────────────────────────────────── */
function NavItem({ item, isActive, onClick, badgeValue }) {
  return (
    <button
      onClick={() => onClick(item.id)}
      title={item.label}
      style={{
        display:     'flex',
        alignItems:  'center',
        gap:         '12px',
        padding:     '0 16px',
        minHeight:   'var(--tap)',       // 44px — iOS HIG tap target
        borderRadius:'8px',
        margin:      '1px 8px',
        width:       'calc(100% - 16px)',
        textAlign:   'left',
        border:      'none',
        cursor:      'pointer',
        fontSize:    '13px',
        fontWeight:  isActive ? 600 : 500,
        fontFamily:  'var(--font-body)',
        position:    'relative',
        transition:  'all 0.15s',
        background:  isActive ? 'var(--surface-container-highest)' : 'transparent',
        color:       isActive ? 'var(--primary)'           : 'var(--on-surface-variant)',
      }}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div style={{
          position: 'absolute', left: '-8px', top: '50%', transform: 'translateY(-50%)',
          width: '4px', height: '24px', borderRadius: '0 2px 2px 0',
          background: 'var(--surface-tint)',
        }} />
      )}

      <Icon name={item.icon} size={18} />
      <span style={{ flex: 1 }}>{item.label}</span>

      {/* Badge counter */}
      {badgeValue > 0 && (
        <span style={{
          background: 'var(--primary)', color: 'white',
          fontSize: '10px', fontWeight: 700,
          padding: '1px 6px', borderRadius: '10px',
        }}>
          {badgeValue}
        </span>
      )}
    </button>
  );
}

/* ── SIDEBAR ─────────────────────────────────────────────────── */
export function Sidebar({ currentView, onNavigate, user, onLogout }) {
  const { students, teachers, alerts } = useApp();

  // Dynamic badge values
  const getBadge = (key) => ({
    students: students.length,
    teachers: teachers.length,
    alerts:   alerts.filter(a => a.status === 'pending').length || 0,
  }[key] || 0);

  const navItems = user?.role === 'admin' ? ADMIN_NAV : TEACHER_NAV;

  return (
    <aside style={{
      width:           'var(--sidebar-w)',   // 256px
      flexShrink:      0,
      background:      'var(--surface-container-low)',
      display:         'flex',
      flexDirection:   'column',
      overflowY:       'auto',
      borderRight:     '1px solid var(--surface-container-high)',
    }}>
      {/* Logo */}
      <div style={{ padding: '28px 20px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <LogoMark />
        <div>
          <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: '18px', color: 'var(--primary)', letterSpacing: '-0.02em' }}>
            EduCall
          </div>
          <div style={{ fontSize: '11px', color: 'var(--outline)', marginTop: '1px' }}>
            {/* Show school name, truncated */}
            {(user?.school || 'Your School').split(',')[0].slice(0, 24)}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '8px 0', flex: 1 }} aria-label="Main navigation">
        {/* Demo mode warning */}
        {user?.isDemo && (
          <div style={{
            margin: '0 8px 8px', padding: '8px 12px', borderRadius: '8px',
            background: 'rgba(239,159,39,0.12)', color: '#854F0B',
            fontSize: '11px', fontWeight: 600, textAlign: 'center',
          }}>
            ⚡ Demo mode — register to save data
          </div>
        )}

        {navItems.map(item => (
          <NavItem
            key={item.id}
            item={item}
            isActive={currentView === item.id}
            onClick={onNavigate}
            badgeValue={item.badge ? getBadge(item.badge) : 0}
          />
        ))}
      </nav>

      {/* User footer */}
      <div style={{ padding: '16px 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '10px',
          background: 'var(--surface-container)', minHeight: 'var(--tap)',
        }}>
          {/* Avatar */}
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'var(--grad-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700, color: 'white', flexShrink: 0,
            fontFamily: 'var(--font-headline)',
          }}>
            {user?.initials || '??'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '10px', color: 'var(--outline)', textTransform: 'capitalize' }}>
              {user?.role || 'admin'}
            </div>
          </div>
          {/* Logout */}
          <button
            onClick={onLogout}
            title="Sign out"
            aria-label="Sign out"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)', display: 'flex', padding: '4px', borderRadius: '6px', minHeight: '32px', alignItems: 'center' }}
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
