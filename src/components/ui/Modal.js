/**
 * Modal — Accessible dialog overlay.
 * Props: isOpen, onClose, title, subtitle, children, footer
 *
 * Accessibility:
 *   - Clicking the backdrop closes the modal.
 *   - Escape key closes the modal (via useEffect).
 *   - Focus is not yet trapped — Taiwo: add focus-trap-react if needed.
 */
import React, { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, subtitle, children, footer, maxWidth = 500 }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      // Backdrop — clicking outside closes modal
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position:       'fixed',
        inset:          0,
        background:     'rgba(23,28,34,0.5)',
        zIndex:         100,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '20px',
        backdropFilter: 'blur(8px)',
        animation:      'fadeIn 0.2s ease-out',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          background:   'var(--surface-container-lowest)',
          borderRadius: 'var(--radius-xl)',
          padding:      '32px',
          width:        '100%',
          maxWidth,
          boxShadow:    '0 32px 64px rgba(23,28,34,0.15)',
          animation:    'slideUp 0.25s ease-out',
          maxHeight:    '90vh',
          overflowY:    'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: subtitle ? '4px' : '24px' }}>
          <div style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, color: 'var(--on-surface)' }}>
            {title}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--outline)', padding: '4px', borderRadius: '6px',
              display: 'flex', flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {subtitle && (
          <div style={{ fontSize: '13px', color: 'var(--outline)', marginBottom: '24px' }}>{subtitle}</div>
        )}

        {/* Body */}
        {children}

        {/* Footer */}
        {footer && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '24px' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
