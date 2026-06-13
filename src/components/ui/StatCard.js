/**
 * StatCard — Dashboard metric card.
 * Props: label, value, chip (text), chipColor, icon
 */
import React from 'react';
import { Badge } from './Badge';
import { Icon }  from './Icon';

export function StatCard({ label, value, chip, chipColor = 'blue', icon, onClick, style }) {
  return (
    <div
      style={{
        background:   'var(--surface-container-lowest)',
        borderRadius: 'var(--radius-lg)',
        padding:      'var(--sp-16)',
        boxShadow:    'var(--shadow-sm)',
        cursor:       onClick ? 'pointer' : 'default',
        transition:   'box-shadow 0.15s',
        ...style,
      }}
      onClick={onClick}
    >
      {chip && <Badge color={chipColor} icon={icon} style={{ marginBottom: '8px' }}>{chip}</Badge>}
      <div style={{
        fontFamily:    'var(--font-headline)',
        fontSize:      '2.25rem',
        fontWeight:    800,
        letterSpacing: '-0.03em',
        lineHeight:    1,
        margin:        '8px 0 4px',
        color:         'var(--on-surface)',
      }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--outline)', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}
