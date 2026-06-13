/**
 * Card — Surface container with shadow and border-radius.
 * Props: elevated (bool) — adds deeper shadow. style, children.
 */
import React from 'react';

export function Card({ elevated = false, style, children, ...rest }) {
  return (
    <div
      style={{
        background:   'var(--surface-container-lowest)',
        borderRadius: 'var(--radius-lg)',
        padding:      'var(--card-pad)',
        boxShadow:    elevated ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
