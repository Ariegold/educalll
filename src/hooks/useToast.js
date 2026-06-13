/**
 * useToast — Lightweight toast notification hook.
 * Returns { toast, showToast } where:
 *   toast = { message, type, visible }
 *   showToast(message, type?) — type: 'success' | 'error' | 'warning'
 *
 * Usage in a component:
 *   const { toast, showToast } = useToast();
 *   showToast('Student saved');
 *   showToast('Could not reach server', 'error');
 */
import { useState, useCallback, useRef } from 'react';

export function useToast() {
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });
  const timerRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    // Clear any existing timer so rapid calls don't overlap
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, type, visible: true });
    timerRef.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  }, []);

  return { toast, showToast };
}
