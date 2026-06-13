/**
 * App.js — Root Component
 * ──────────────────────────────────────────────────────────────
 * Provides global context (Auth + App state) and manages routing
 * between Login, Kiosk, and the main authenticated dashboard.
 *
 * View state is managed here rather than using React Router URLs
 * because EduCall deploys as a static GitHub Pages SPA — no server
 * to handle URL rewriting. If Taiwo deploys on a real server,
 * switch to <BrowserRouter> and add route components.
 */
import React, { useState, useCallback } from 'react';
import { AuthProvider, useAuth }  from './context/AuthContext';
import { AppProvider }            from './context/AppContext';
import { useToast }               from './hooks/useToast';
import { Toast }                  from './components/ui/Toast';
import { AppShell }               from './components/layout/AppShell';

// Pages
import { LoginPage }      from './pages/LoginPage';
import { RegisterPage }   from './pages/RegisterPage';
import { KioskPage }      from './pages/KioskPage';
import { DashboardPage }  from './pages/DashboardPage';
import { TimetablePage }  from './pages/TimetablePage';
import { BiometricPage }  from './pages/BiometricPage';
import { StudentsPage }   from './pages/StudentsPage';
import { TeachersPage }   from './pages/TeachersPage';
import { EnrolmentPage }  from './pages/EnrolmentPage';
import { ReportsPage }    from './pages/ReportsPage';
import { AlertsPage }     from './pages/AlertsPage';
import { SettingsPage }   from './pages/SettingsPage';

/* ── PAGE MAP ────────────────────────────────────────────────── */
// Mapping view IDs to page components keeps routing declarative.
const PAGES = {
  dashboard:  DashboardPage,
  timetable:  TimetablePage,
  biometric:  BiometricPage,
  students:   StudentsPage,
  teachers:   TeachersPage,
  enrolment:  EnrolmentPage,
  reports:    ReportsPage,
  alerts:     AlertsPage,
  settings:   SettingsPage,
};

/* ── INNER APP (needs AuthContext) ───────────────────────────── */
function InnerApp() {
  const { user, isAuthenticated, logout } = useAuth();
  const { toast, showToast } = useToast();

  // Which "page" is showing — 'login' | 'register' | 'kiosk' | page id
  const [view, setView] = useState('login');

  // After login, go to dashboard (or kiosk if kiosk role)
  const handleLoginSuccess = useCallback((role) => {
    setView(role === 'kiosk' ? 'kiosk' : 'dashboard');
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setView('login');
  }, [logout]);

  // ── Not authenticated → Login or Register ──
  if (!isAuthenticated) {
    if (view === 'register') {
      return (
        <>
          <RegisterPage
            onRegistered={() => setView('dashboard')}
            onBackToLogin={() => setView('login')}
            showToast={showToast}
          />
          <Toast {...toast} />
        </>
      );
    }
    return (
      <>
        <LoginPage
          onSuccess={handleLoginSuccess}
          onRegister={() => setView('register')}
          showToast={showToast}
        />
        <Toast {...toast} />
      </>
    );
  }

  // ── Kiosk mode — full-screen, no sidebar ──
  if (view === 'kiosk') {
    return (
      <>
        <KioskPage onBack={() => setView('dashboard')} showToast={showToast} />
        <Toast {...toast} />
      </>
    );
  }

  // ── Main authenticated app ──
  const PageComponent = PAGES[view] || DashboardPage;

  return (
    <>
      <AppShell
        currentView={view}
        onNavigate={setView}
        user={user}
        onLogout={handleLogout}
      >
        <PageComponent
          showToast={showToast}
          onOpenKiosk={() => setView('kiosk')}
        />
      </AppShell>
      <Toast {...toast} />
    </>
  );
}

/* ── ROOT APP ────────────────────────────────────────────────── */
export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <InnerApp />
      </AppProvider>
    </AuthProvider>
  );
}
