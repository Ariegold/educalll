/**
 * TopBar — Page-level header showing title, subtitle, and action buttons.
 * Sits at the top of the main content area (not the sidebar).
 *
 * Props:
 *   title    (string)     — page heading
 *   subtitle (string)     — context line under heading
 *   actions  (ReactNode)  — buttons or controls aligned to the right
 */
import React from 'react';

export function TopBar({ title, subtitle, actions }) {
  return (
    <header style={{
      padding:         '20px 32px 0',
      display:         'flex',
      alignItems:      'flex-start',
      justifyContent:  'space-between',
      gap:             '16px',
      flexWrap:        'wrap',
      flexShrink:      0,
    }}>
      <div>
        <h1 style={{
          fontFamily:    'var(--font-headline)',
          fontSize:      '26px',
          fontWeight:    800,
          color:         'var(--on-surface)',
          letterSpacing: '-0.02em',
          lineHeight:    1.2,
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '13px', color: 'var(--outline)', marginTop: '2px' }}>
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
          {actions}
        </div>
      )}
    </header>
  );
}
