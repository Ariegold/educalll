/**
 * Badge — Coloured status chip.
 * Props:
 *   color — 'green' | 'red' | 'blue' | 'amber' | 'purple' | 'outline'
 *   icon  — optional Material Symbol name
 */
import React from 'react';
import { Icon } from './Icon';

const COLORS = {
  green:   { background: 'var(--secondary-container)',    color: 'var(--on-secondary-container)' },
  red:     { background: 'var(--tertiary-container)',     color: 'var(--on-tertiary-container)' },
  blue:    { background: '#d3e4ff',                       color: '#001c38' },
  amber:   { background: '#fef3c7',                       color: '#78350f' },
  purple:  { background: '#ede9fe',                       color: '#5b21b6' },
  outline: { background: 'var(--surface-container-high)', color: 'var(--on-surface-variant)' },
};

export function Badge({ color = 'outline', icon, style, children }) {
  return (
    <span
      style={{
        display:     'inline-flex',
        alignItems:  'center',
        gap:         '4px',
        padding:     '3px 10px',
        borderRadius:'20px',
        fontSize:    '11px',
        fontWeight:  700,
        whiteSpace:  'nowrap',
        ...COLORS[color],
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}
