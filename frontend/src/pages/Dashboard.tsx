/**
 * Dashboard Page Component
 * Example homepage after login
 */

import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

export const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          {t('dashboard.welcome', { name: user?.username || 'User' })}
        </h1>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">{t('dashboard.stats')}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          {t('app.name')} is running! 🎉
        </p>
        <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>
          This is a template dashboard. Customize it to fit your needs.
        </p>
      </div>

      <div className="dashboard-section">
        <h2 className="section-title">{t('dashboard.recentActivity')}</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          No recent activity yet.
        </p>
      </div>
    </div>
  );
};

