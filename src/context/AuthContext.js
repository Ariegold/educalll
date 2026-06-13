/**
 * AuthContext — Authentication & Session State
 * ─────────────────────────────────────────────
 * Provides login/logout functionality and persists the current user
 * to localStorage so the session survives a page refresh.
 *
 * Security notes for Taiwo (backend integration):
 *   - Replace the demo login with a real POST /api/auth/login call.
 *   - Store a JWT access token (short-lived) in memory (not localStorage).
 *   - Store a refresh token in an httpOnly cookie (set by the server).
 *   - Never store passwords in state or localStorage — this demo does NOT.
 *   - The `user` object in state should come from the decoded JWT payload.
 *
 * Usage:
 *   const { user, login, logout, isAuthenticated } = useAuth();
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

/* ── CONTEXT CREATION ──────────────────────────────────────── */
const AuthContext = createContext(null);

/* ── STORAGE KEY ────────────────────────────────────────────── */
// Using a namespaced key to avoid collisions with other apps on the same domain.
const SESSION_KEY = 'educall_session';

/* ── PROVIDER ───────────────────────────────────────────────── */
export function AuthProvider({ children }) {
  /**
   * user — shape:
   * {
   *   name:      string   — display name
   *   email:     string   — login email
   *   role:      'admin' | 'teacher' | 'kiosk'
   *   school:    string   — school display name
   *   schoolId:  string   — unique school slug (used for data isolation)
   *   initials:  string   — 2-char avatar fallback
   *   isDemo:    boolean  — true if logged in without a real school record
   * }
   */
  const [user, setUser] = useState(() => {
    // Re-hydrate session from localStorage on app load.
    // NOTE for backend: replace this with a JWT validation call.
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * login — authenticates a user.
   * Demo mode: any email/password pair works. In production,
   * this should call POST /api/auth/login and receive a JWT.
   *
   * @param {string} email
   * @param {string} password
   * @param {'admin'|'teacher'|'kiosk'} role
   * @returns {Promise<{ success: boolean, user?: object, error?: string }>}
   */
  const login = useCallback(async (email, password, role) => {
    setIsLoading(true);
    setError('');

    try {
      // ── STEP 1: Check localStorage for a registered school record ──
      // In production: replace with fetch('/api/auth/login', { method:'POST', body: JSON.stringify({email,password}) })
      let matchedSchool = null;
      try {
        const schools = JSON.parse(localStorage.getItem('educall_schools') || '[]');
        matchedSchool = schools.find(s => s.email === email && s.password === password);
      } catch {}

      // ── STEP 2: Fall back to demo mode if no real record found ──
      if (!matchedSchool) {
        // Demo: synthesise a user object so the app is fully usable without a backend.
        const displayName = email.split('@')[0]
          .replace(/[._]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());

        matchedSchool = {
          name:        displayName,
          email,
          schoolName:  'Sunshine Secondary School',
          schoolId:    'demo-sunshine-lagos',
          country:     'Nigeria',
          city:        'Lagos',
          classes:     ['SS1A', 'SS1B', 'SS2A', 'SS2B', 'SS3A', 'SS3B'],
          academicYear:'2025/2026',
          role,
          isDemo:      true,
        };
      }

      // ── STEP 3: Build the session user object ──
      const sessionUser = {
        name:     matchedSchool.name,
        email:    matchedSchool.email,
        role:     matchedSchool.role || role,
        school:   `${matchedSchool.schoolName}${matchedSchool.city ? ', ' + matchedSchool.city : ''}`,
        schoolId: matchedSchool.schoolId,
        country:  matchedSchool.country || 'Nigeria',
        initials: matchedSchool.name
          .split(' ')
          .map(n => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
        classes:  matchedSchool.classes || [],
        isDemo:   matchedSchool.isDemo || false,
      };

      // Persist session (NOTE: in production, persist only a token reference, not user data)
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      setUser(sessionUser);
      setIsLoading(false);
      return { success: true, user: sessionUser };

    } catch (err) {
      const message = 'Login failed. Please try again.';
      setError(message);
      setIsLoading(false);
      return { success: false, error: message };
    }
  }, []);

  /**
   * logout — clears session and redirects to login.
   * In production: also call POST /api/auth/logout to invalidate the server-side token.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setError('');
  }, []);

  /** isAuthenticated — convenience boolean for route guards. */
  const isAuthenticated = Boolean(user);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ── HOOK ────────────────────────────────────────────────────── */
/**
 * useAuth — access auth state from any component.
 * Must be used inside <AuthProvider>.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
