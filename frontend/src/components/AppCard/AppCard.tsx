/**
 * AppCard Component
 * Displays an application card in the list view
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ApplicationListItem } from '../../types/sam';
import './AppCard.css';

interface AppCardProps {
  app: ApplicationListItem;
}

const AppCard: React.FC<AppCardProps> = ({ app }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClick = () => {
    navigate(`/apps/${app.id}`);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return '#10b981'; // green
      case 'development':
        return '#3b82f6'; // blue
      case 'deprecated':
        return '#f59e0b'; // orange
      case 'archived':
        return '#6b7280'; // gray
      default:
        return '#6b7280';
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'core':
        return '🔐';
      case 'feature':
        return '⭐';
      case 'tool':
        return '🔧';
      case 'integration':
        return '🔗';
      case 'microservice':
        return '📦';
      default:
        return '📱';
    }
  };

  return (
    <div className="app-card" onClick={handleClick} style={{ borderColor: app.color || '#e5e7eb' }}>
      <div className="app-card-header">
        <div className="app-card-icon" style={{ backgroundColor: app.color || '#f3f4f6' }}>
          {app.icon || getTypeIcon(app.type)}
        </div>
        <div className="app-card-title">
          <h3>{app.display_name}</h3>
          <span className="app-card-code">{app.code}</span>
        </div>
        <div className="app-card-status" style={{ backgroundColor: getStatusColor(app.status) }}>
          {t(`status.${app.status}`)}
        </div>
      </div>

      <div className="app-card-body">
        <p className="app-card-description">
          {app.description || t('sam.no_description')}
        </p>

        {app.category && (
          <div className="app-card-category">
            <span className="category-badge">{app.category}</span>
          </div>
        )}

        {app.tags && app.tags.length > 0 && (
          <div className="app-card-tags">
            {app.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="tag-badge">
                {tag}
              </span>
            ))}
            {app.tags.length > 3 && (
              <span className="tag-badge more">+{app.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      <div className="app-card-footer">
        <div className="app-card-stat">
          <span className="stat-icon">📊</span>
          <span className="stat-label">{t('sam.routes')}</span>
          <span className="stat-value">{app.routes_count || 0}</span>
        </div>
        <div className="app-card-stat">
          <span className="stat-icon">⬇️</span>
          <span className="stat-label">{t('sam.dependencies')}</span>
          <span className="stat-value">{app.dependencies_count || 0}</span>
        </div>
        <div className="app-card-stat">
          <span className="stat-icon">⬆️</span>
          <span className="stat-label">{t('sam.dependents')}</span>
          <span className="stat-value">{app.dependents_count || 0}</span>
        </div>
      </div>

      {app.version && (
        <div className="app-card-version">v{app.version}</div>
      )}
    </div>
  );
};

export default AppCard;

