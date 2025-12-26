/**
 * Main App Component
 * Handles routing and authentication flow
 * Uses federated OVU Sidebar for navigation
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { useTranslation } from './hooks/useTranslation';
import { LoginPage } from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AppsList from './pages/AppsList';
import AppDetail from './pages/AppDetail';
import SystemMap from './pages/SystemMap';
import './styles/index.css';
import './components/Layout/Layout.css';

// Federated OVU Sidebar - loaded from remote
const OVUSidebar = lazy(() => import('sidebar/Sidebar').then(m => ({ default: m.OVUSidebar || m.default })));

// Fallback sidebar skeleton
const SidebarSkeleton = () => (
  <aside className="sidebar-skeleton" style={{
    width: '280px',
    height: '100vh',
    background: 'var(--color-surface, #1e293b)',
    position: 'fixed',
    right: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
  }}>
    <div style={{
      width: '32px',
      height: '32px',
      border: '3px solid var(--color-border, #334155)',
      borderTopColor: 'var(--color-primary, #6366f1)',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
    <span style={{ color: 'var(--color-text-muted, #94a3b8)', fontSize: '14px' }}>טוען סרגל...</span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </aside>
);

/**
 * Protected content that requires authentication
 */
function ProtectedApp() {
  const { user, loading, logout } = useAuth();
  const { theme, language, toggleTheme, setLanguage } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  // location used for potential future navigation state
  useLocation();

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  const toggleLanguage = () => {
    const languages: ('he' | 'en' | 'ar')[] = ['he', 'en', 'ar'];
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };

  // Handle app switching from sidebar
  const handleAppSwitch = (app: any) => {
    if (app.frontendUrl && app.code !== 'sam') {
      window.location.href = app.frontendUrl;
    }
  };

  // Handle menu item clicks
  const handleMenuItemClick = (item: any, app: any) => {
    if (app.code === 'sam') {
      // Internal navigation for SAM
      navigate(item.path);
    } else if (app.frontendUrl) {
      // External navigation for other apps
      window.location.href = `${app.frontendUrl}${item.path}`;
    }
  };

  return (
    <div className="app-layout" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Federated OVU Sidebar */}
      <Suspense fallback={<SidebarSkeleton />}>
        <OVUSidebar
          currentApp="sam"
          samApiUrl="https://sam.ovu.co.il/api/v1"
          language={language}
          theme={theme}
          showSearch={true}
          showUser={true}
          user={{
            id: user.id || 0,
            username: user.username,
            email: user.email,
            role: user.role,
          }}
          onAppSwitch={handleAppSwitch}
          onMenuItemClick={handleMenuItemClick}
          onLogout={logout}
          onSettings={() => navigate('/settings')}
        />
      </Suspense>

      <div className="main-layout">
        <header className="app-header">
          <h1 className="header-title">{t('app.name')}</h1>
          <div className="header-controls">
            <span className="user-info">
              {user.username}
              {user.role && user.role !== 'user' && ` (${user.role})`}
            </span>
            <button onClick={toggleLanguage} className="control-btn lang-btn">
              <span>{t('controls.language')}</span>
            </button>
            <button onClick={toggleTheme} className="control-btn theme-btn">
              <span>{theme === 'light' ? t('controls.theme.light') : t('controls.theme.dark')}</span>
            </button>
            <button onClick={logout} className="control-btn logout-btn">
              <span>{t('auth.logout')}</span>
            </button>
          </div>
        </header>

        <main className="main-container">
          <Routes>
            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Applications */}
            <Route path="/apps" element={<AppsList />} />
            <Route path="/apps/all" element={<AppsList />} />
            <Route path="/apps/:id" element={<AppDetail />} />
            <Route path="/apps/add" element={
              <div className="page-placeholder">
                ➕ הוספת אפליקציה (Coming Soon)
              </div>
            } />
            <Route path="/apps/:id/edit" element={
              <div className="page-placeholder">
                ✏️ עריכת אפליקציה (Coming Soon)
              </div>
            } />

            {/* System Map */}
            <Route path="/map" element={<SystemMap />} />

            {/* Dependencies */}
            <Route path="/dependencies" element={
              <div className="page-placeholder">
                🔗 תלויות (Coming Soon)
              </div>
            } />

            {/* Settings */}
            <Route path="/settings" element={
              <div className="page-placeholder">
                ⚙️ {t('menu.settings')}
              </div>
            } />

            {/* Default & 404 */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={
              <div className="page-placeholder">
                404 - Page Not Found
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

/**
 * Root App Component with Providers
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <ProtectedApp />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
