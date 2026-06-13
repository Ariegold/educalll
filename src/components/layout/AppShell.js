/**
 * AppShell — Authenticated app layout.
 * Renders: Sidebar (left) + Main content area (right).
 * All authenticated pages are rendered inside the Main area.
 *
 * Props:
 *   currentView (string)  — passed to Sidebar for active state
 *   onNavigate  (fn)      — navigate to a view
 *   user        (object)  — current user from AuthContext
 *   onLogout    (fn)
 *   children    (node)    — the active page content
 */
import React from 'react';
import { Sidebar } from './Sidebar';

export function AppShell({ currentView, onNavigate, user, onLogout, children }) {
  return (
    <div style={{
      display:  'flex',
      height:   '100vh',
      overflow: 'hidden',
    }}>
      {/* ── LEFT: Navigation sidebar ── */}
      <Sidebar
        currentView={currentView}
        onNavigate={onNavigate}
        user={user}
        onLogout={onLogout}
      />

      {/* ── RIGHT: Scrollable content area ── */}
      <main
        style={{
          flex:      1,
          overflowY: 'auto',
          background:'var(--surface)',
          display:   'flex',
          flexDirection: 'column',
        }}
        id="main-content"
      >
        {children}
      </main>
    </div>
  );
}
