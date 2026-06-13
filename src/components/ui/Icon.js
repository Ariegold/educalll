/**
 * Icon — Wrapper around Google Material Symbols Outlined.
 * Props:
 *   name — Material Symbol name, e.g. "fingerprint", "school", "dashboard"
 *   size — font-size in px (default 20)
 *   fill — 0 (outline) or 1 (filled)
 */
import React from 'react';

export function Icon({ name, size = 20, fill = 0, style }) {
  return (
    <span
      className="material-symbols-outlined"
      style={{
        fontSize:             `${size}px`,
        fontVariationSettings: `'FILL' ${fill}, 'wght' 400, 'GRAD' 0, 'opsz' 24`,
        lineHeight:           1,
        flexShrink:           0,
        ...style,
      }}
    >
      {name}
    </span>
  );
}
