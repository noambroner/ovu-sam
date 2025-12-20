/**
 * Main App Component
 * Handles routing and authentication flow
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { useTranslation } from './hooks/useTranslation';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import './styles/index.css';

/**
 * Protected content that requires authentication
 */
function ProtectedApp() {
  const { user, loading, logout } = useAuth();
  const { theme, language, toggleTheme, setLanguage } = useTheme();
  const { t } = useTranslation();

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

  return (
    <div className="app-layout" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="main-layout" style={{ width: '100%' }}>
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
            <Route path="/dashboard" element={<Dashboard />} />
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

