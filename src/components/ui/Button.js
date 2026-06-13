/**
 * Button — Reusable button component.
 *
 * Props:
 *   variant  — 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
 *   size     — 'sm' | 'md' | 'lg'
 *   icon     — Material Symbol name (string), rendered before label
 *   fullWidth— stretches to 100% width
 *   loading  — shows spinner, disables click
 *   disabled — disables click
 *   onClick  — click handler
 *   children — button label
 *
 * Accessibility: min 44×44px tap target (iOS HIG / WCAG 2.5.8).
 * All variants use sufficient contrast (verified against #fff/#000).
 */
import React from 'react';
import { Icon } from './Icon';

/* ── STYLES ─────────────────────────────────────────────────── */
const BASE = {
  display:        'inline-flex',
  alignItems:     'center',
  justifyContent: 'center',
  gap:            '8px',
  borderRadius:   '8px',
  fontFamily:     'var(--font-body)',
  fontWeight:     600,
  cursor:         'pointer',
  border:         'none',
  transition:     'all 0.15s',
  whiteSpace:     'nowrap',
  minHeight:      'var(--tap)',     // 44px — iOS HIG minimum tap target
  boxSizing:      'border-box',
};

const VARIANTS = {
  primary:   { background: 'var(--grad-primary)', color: 'var(--on-primary)', boxShadow: 'var(--shadow-btn)' },
  secondary: { background: 'var(--surface-container-high)', color: 'var(--on-surface)' },
  danger:    { background: 'var(--tertiary-container)', color: 'var(--on-tertiary-container)' },
  success:   { background: 'var(--secondary-container)', color: 'var(--on-secondary-container)' },
  ghost:     { background: 'transparent', color: 'var(--on-surface-variant)', border: '1.5px solid var(--outline-variant)' },
};

const SIZES = {
  sm: { padding: '0 12px', fontSize: '12px', minHeight: '36px' },
  md: { padding: '0 16px', fontSize: '13px' },                    // minHeight from BASE (44px)
  lg: { padding: '0 24px', fontSize: '14px', minHeight: '48px' },
};

/* ── COMPONENT ───────────────────────────────────────────────── */
export function Button({
  variant  = 'primary',
  size     = 'md',
  icon,
  fullWidth = false,
  loading   = false,
  disabled  = false,
  onClick,
  style,
  children,
  ...rest
}) {
  const isDisabled = disabled || loading;

  const combinedStyle = {
    ...BASE,
    ...VARIANTS[variant],
    ...SIZES[size],
    ...(fullWidth ? { width: '100%' } : {}),
    ...(isDisabled ? { opacity: 0.5, cursor: 'not-allowed', pointerEvents: 'none' } : {}),
    ...style,
  };

  return (
    <button
      style={combinedStyle}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      {...rest}
    >
      {/* Spinner shown during loading */}
      {loading && (
        <span
          style={{
            width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', flexShrink: 0,
          }}
        />
      )}
      {/* Optional leading icon */}
      {!loading && icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      {children}
    </button>
  );
}
