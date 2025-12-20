/**
 * Dashboard Page
 * Main dashboard with statistics and overview
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import samAPI from '../../api/samApi';
import type { DependencyGraph } from '../../types/sam';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [graph, setGraph] = useState<DependencyGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load stats and graph in parallel
      const [statsData, graphData] = await Promise.all([
        samAPI.graph.getStats(),
        samAPI.graph.getGraph(),
      ]);

      setStats(statsData);
      setGraph(graphData);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError(err.message || t('sam.error_loading_dashboard'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !stats || !graph) {
    return (
      <div className="dashboard-page">
        <div className="error-container">
          <h2>⚠️ {t('common.error')}</h2>
          <p>{error || t('sam.error_loading_dashboard')}</p>
          <button onClick={loadDashboard} className="btn-primary">
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <h1>📊 {t('sam.dashboard')}</h1>
        <p className="dashboard-subtitle">{t('sam.dashboard_subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">📱</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_applications}</div>
            <div className="stat-label">{t('sam.total_applications')}</div>
          </div>
          <button onClick={() => navigate('/apps')} className="stat-action">
            {t('common.view_all')} →
          </button>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon">🔗</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_dependencies}</div>
            <div className="stat-label">{t('sam.total_dependencies')}</div>
          </div>
          <button onClick={() => navigate('/dependencies')} className="stat-action">
            {t('common.view_all')} →
          </button>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.by_status?.active || 0}</div>
            <div className="stat-label">{t('sam.active_apps')}</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon">🚧</div>
          <div className="stat-content">
            <div className="stat-value">{stats.by_status?.development || 0}</div>
            <div className="stat-label">{t('sam.in_development')}</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-row">
        {/* By Type */}
        <div className="chart-card">
          <h3>📦 {t('sam.by_type')}</h3>
          <div className="chart-content">
            {Object.entries(stats.by_type || {}).map(([type, count]) => (
              <div key={type} className="chart-bar-item">
                <div className="chart-bar-label">
                  {t(`sam.type_${type}`)}
                </div>
                <div className="chart-bar-container">
                  <div
                    className="chart-bar"
                    style={{
                      width: `${(count as number / stats.total_applications) * 100}%`,
                    }}
                  />
                  <span className="chart-bar-value">{count as number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Status */}
        <div className="chart-card">
          <h3>📈 {t('sam.by_status')}</h3>
          <div className="chart-content">
            {Object.entries(stats.by_status || {}).map(([status, count]) => (
              <div key={status} className="chart-bar-item">
                <div className="chart-bar-label">
                  {t(`status.${status}`)}
                </div>
                <div className="chart-bar-container">
                  <div
                    className={`chart-bar status-${status}`}
                    style={{
                      width: `${(count as number / stats.total_applications) * 100}%`,
                    }}
                  />
                  <span className="chart-bar-value">{count as number}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>{t('sam.quick_actions')}</h2>
        <div className="actions-grid">
          <button onClick={() => navigate('/map')} className="action-card">
            <span className="action-icon">🗺️</span>
            <span className="action-title">{t('sam.view_system_map')}</span>
            <span className="action-desc">{t('sam.view_system_map_desc')}</span>
          </button>

          <button onClick={() => navigate('/apps')} className="action-card">
            <span className="action-icon">📱</span>
            <span className="action-title">{t('sam.browse_apps')}</span>
            <span className="action-desc">{t('sam.browse_apps_desc')}</span>
          </button>

          <button onClick={() => navigate('/apps/new')} className="action-card">
            <span className="action-icon">➕</span>
            <span className="action-title">{t('sam.add_application')}</span>
            <span className="action-desc">{t('sam.add_application_desc')}</span>
          </button>

          <button onClick={() => navigate('/dependencies')} className="action-card">
            <span className="action-icon">🔗</span>
            <span className="action-title">{t('sam.manage_dependencies')}</span>
            <span className="action-desc">{t('sam.manage_dependencies_desc')}</span>
          </button>
        </div>
      </div>

      {/* Recent Apps */}
      {graph && graph.nodes.length > 0 && (
        <div className="recent-apps">
          <h2>{t('sam.recent_applications')}</h2>
          <div className="recent-apps-grid">
            {graph.nodes.slice(0, 6).map((node) => (
              <div
                key={node.id}
                className="recent-app-card"
                onClick={() => navigate(`/apps/${node.id}`)}
                style={{ borderColor: node.color || '#e5e7eb' }}
              >
                <div className="recent-app-icon" style={{ backgroundColor: node.color || '#f3f4f6' }}>
                  {node.icon || '📱'}
                </div>
                <div className="recent-app-info">
                  <div className="recent-app-name">{node.display_name}</div>
                  <div className="recent-app-code">{node.code}</div>
                </div>
                <div className="recent-app-stats">
                  <span title={t('sam.dependencies')}>⬇️ {node.dependencies_count}</span>
                  <span title={t('sam.dependents')}>⬆️ {node.dependents_count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

