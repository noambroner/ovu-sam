/**
 * Main App Component
 * Handles routing and authentication flow
 * Uses OVU Sidebar NPM package for navigation
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { useTranslation } from './hooks/useTranslation';
import { OVUSidebar } from '@ovu/sidebar';
import '@ovu/sidebar/dist/style.css';
import { LoginPage } from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AppsList from './pages/AppsList';
import AppDetail from './pages/AppDetail';
import SystemMap from './pages/SystemMap';
import { DevelopmentGuidelines } from './components/DevelopmentGuidelines/DevelopmentGuidelines';
import { APIUIEndpoints } from './components/APIUIEndpoints/APIUIEndpoints';
import { APILogs } from './components/APILogs/APILogs';
import { DatabaseViewer } from './components/DatabaseViewer/DatabaseViewer';
import './styles/index.css';
import './components/Layout/Layout.css';

/**
 * Protected content that requires authentication
 */
function ProtectedApp() {
  const { user, loading, logout } = useAuth();
  const { theme, language, toggleTheme, setLanguage } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = React.useState<any[]>([]);

  // Fetch menu items from API
  React.useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('/api/v1/applications');
        const apps = await response.json();
        const samApp = apps.find((app: any) => app.code === 'SAM');
        if (samApp?.menu_items) {
          setMenuItems(samApp.menu_items);
        }
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
      }
    };
    fetchMenuItems();
  }, []);

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

  return (
    <div className="app-layout" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
      <OVUSidebar
        config={{
          currentApp: 'sam',
          samApiUrl: 'https://sam.ovu.co.il/api/v1',
          language,
          theme,
          currentUser: {
            name: user.username,
            role: user.role,
          },
          additionalMenuItems: menuItems,
          onAppSwitch: handleAppSwitch,
          onNavigate: (path) => navigate(path),
          onLogout: logout,
          onToggleTheme: toggleTheme,
          onToggleLanguage: toggleLanguage
        }}
      />

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

            {/* Technical Pages */}
            <Route path="/dev-guidelines" element={<DevelopmentGuidelines language={language} theme={theme} />} />
            <Route path="/api/ui" element={<APIUIEndpoints language={language} theme={theme} />} />
            <Route path="/database-viewer" element={<DatabaseViewer language={language} theme={theme} />} />
            <Route path="/logs/backend" element={<APILogs language={language} theme={theme} />} />

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
