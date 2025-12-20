/**
 * Main App Component
 * Handles routing and authentication flow
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { useTranslation } from './hooks/useTranslation';
import { Sidebar } from './components/Sidebar';
import { LoginPage } from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AppsList from './pages/AppsList';
import AppDetail from './pages/AppDetail';
import SystemMap from './pages/SystemMap';
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
  const location = useLocation();

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

  // SAM Menu Items - System Mapping Manager
  const menuItems = [
    {
      id: 'dashboard',
      label: t('menu.dashboard'),
      labelEn: t('menu.dashboard'),
      labelAr: t('menu.dashboard'),
      icon: '🗺️',
      path: '/dashboard'
    },
    {
      id: 'apps',
      label: 'אפליקציות',
      labelEn: 'Applications',
      labelAr: 'التطبيقات',
      icon: '📦',
      path: '/apps',
      subItems: [
        {
          id: 'all-apps',
          label: 'כל האפליקציות',
          labelEn: 'All Applications',
          labelAr: 'جميع التطبيقات',
          icon: '📋',
          path: '/apps/all'
        },
        {
          id: 'add-app',
          label: 'הוספת אפליקציה',
          labelEn: 'Add Application',
          labelAr: 'إضافة تطبيق',
          icon: '➕',
          path: '/apps/add'
        }
      ]
    },
    {
      id: 'map',
      label: 'מפת מערכת',
      labelEn: 'System Map',
      labelAr: 'خريطة النظام',
      icon: '🌐',
      path: '/map'
    },
    {
      id: 'dependencies',
      label: 'תלויות',
      labelEn: 'Dependencies',
      labelAr: 'التبعيات',
      icon: '🔗',
      path: '/dependencies'
    },
    {
      id: 'settings',
      label: t('menu.settings'),
      labelEn: t('menu.settings'),
      labelAr: t('menu.settings'),
      icon: '⚙️',
      path: '/settings'
    }
  ];

  return (
    <div className="app-layout" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
      <Sidebar
        menuItems={menuItems}
        currentPath={location.pathname}
        language={language}
        theme={theme}
        onNavigate={(path) => navigate(path)}
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

