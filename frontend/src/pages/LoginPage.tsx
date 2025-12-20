/**
 * Login Page Component
 * Full-page login with theme/language controls
 */

import { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

export const LoginPage = () => {
  const { login, loading } = useAuth();
  const { theme, language, toggleTheme, setLanguage } = useTheme();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('auth.invalidCredentials'));
      return;
    }

    try {
      await login(email, password);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || t('auth.loginError');
      setError(typeof errorMessage === 'string' ? errorMessage : errorMessage.detail || t('auth.loginError'));
    }
  };

  const toggleLanguage = () => {
    const languages: ('he' | 'en' | 'ar')[] = ['he', 'en', 'ar'];
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };

  return (
    <div className="login-page" dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
      <header className="login-header">
        <h1 className="login-header-title">{t('app.name')}</h1>
        <div className="login-header-controls">
          <button onClick={toggleLanguage} className="control-btn lang-btn">
            <span>{t('controls.language')}</span>
          </button>
          <button onClick={toggleTheme} className="control-btn theme-btn">
            <span>{theme === 'light' ? t('controls.theme.light') : t('controls.theme.dark')}</span>
          </button>
        </div>
      </header>

      <main className="login-main">
        <div className="login-card">
          <div className="logo-container">
            <div className="logo-icon">🔐</div>
          </div>

          <h1 className="login-title">{t('auth.loginTitle')}</h1>

          {error && <div className="error-message">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">{t('auth.email')}</label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('auth.password')}</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  tabIndex={-1}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? t('common.loading') : t('auth.login')}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

