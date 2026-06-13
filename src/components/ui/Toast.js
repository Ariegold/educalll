/**
 * Toast — Fixed notification banner at bottom-right.
 * Controlled by useToast hook.
 * Props: message (string), type ('success'|'error'|'warning'), visible (bool)
 */
import React from 'react';
import { Icon } from './Icon';

const STYLES = {
  success: { background: 'var(--secondary-container)', color: 'var(--on-secondary-container)' },
  error:   { background: 'var(--tertiary-container)',  color: 'var(--on-tertiary-container)'  },
  warning: { background: '#fef3c7',                    color: '#78350f'                       },
  default: { background: 'var(--inverse-surface)',     color: '#edf1fa'                       },
};

const ICONS = { success: 'check_circle', error: 'error', warning: 'warning' };

export function Toast({ message, type = 'success', visible }) {
  if (!visible) return null;
  const s = STYLES[type] || STYLES.default;

  return (
    <div
      style={{
        position:     'fixed',
        bottom:       '24px',
        right:        '24px',
        zIndex:       9999,
        display:      'flex',
        alignItems:   'center',
        gap:          '10px',
        padding:      '14px 20px',
        borderRadius: '12px',
        fontSize:     '13px',
        fontWeight:   500,
        maxWidth:     '340px',
        boxShadow:    'var(--shadow-lg)',
        animation:    'slideUp 0.25s ease-out',
        ...s,
      }}
    >
      <Icon name={ICONS[type] || 'info'} size={16} />
      {message}
    </div>
  );
}
