/**
 * AppDetail Page
 * Displays detailed information about a specific application
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import samAPI from '../../api/samApi';
import type { ApplicationDetail } from '../../types/sam';
import './AppDetail.css';

const AppDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [app, setApp] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'api' | 'dependencies' | 'docs'>('overview');

  useEffect(() => {
    if (id) {
      loadApp(parseInt(id));
    }
  }, [id]);

  const loadApp = async (appId: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await samAPI.applications.getById(appId);
      setApp(data);
    } catch (err: any) {
      console.error('Failed to load application:', err);
      setError(err.message || t('sam.error_loading_app'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#10b981';
      case 'development': return '#3b82f6';
      case 'deprecated': return '#f59e0b';
      case 'archived': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getCriticalityColor = (criticality: string): string => {
    switch (criticality) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      case 'optional': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="app-detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !app) {
    return (
      <div className="app-detail-page">
        <div className="error-container">
          <h2>⚠️ {t('common.error')}</h2>
          <p>{error || t('sam.app_not_found')}</p>
          <button onClick={() => navigate('/apps')} className="btn-primary">
            ← {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-detail-page">
      {/* Header */}
      <div className="app-detail-header">
        <button onClick={() => navigate('/apps')} className="btn-back">
          ← {t('common.back_to_list')}
        </button>

        <div className="app-header-content">
          <div className="app-header-left">
            <div className="app-icon-large" style={{ backgroundColor: app.color || '#f3f4f6' }}>
              {app.icon || '📱'}
            </div>
            <div className="app-title-section">
              <h1>{app.display_name}</h1>
              <div className="app-meta">
                <span className="app-code">{app.code}</span>
                <span className="app-type">{t(`sam.type_${app.type}`)}</span>
                <span className="app-status" style={{ backgroundColor: getStatusColor(app.status) }}>
                  {t(`status.${app.status}`)}
                </span>
                {app.version && <span className="app-version">v{app.version}</span>}
              </div>
            </div>
          </div>

          <div className="app-header-actions">
            <button className="btn-secondary" onClick={() => navigate(`/apps/${app.id}/edit`)}>
              ✏️ {t('common.edit')}
            </button>
            <button className="btn-secondary" onClick={() => navigate(`/map?highlight=${app.id}`)}>
              🗺️ {t('sam.view_in_map')}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      {(app.frontend_url || app.backend_url || app.docs_url || app.github_url) && (
        <div className="quick-links">
          <h3>🔗 {t('sam.quick_links')}</h3>
          <div className="links-grid">
            {app.frontend_url && (
              <a href={app.frontend_url} target="_blank" rel="noopener noreferrer" className="link-card">
                <span className="link-icon">🌐</span>
                <span className="link-label">{t('sam.frontend')}</span>
                <span className="link-url">{app.frontend_url}</span>
              </a>
            )}
            {app.backend_url && (
              <a href={app.backend_url} target="_blank" rel="noopener noreferrer" className="link-card">
                <span className="link-icon">📡</span>
                <span className="link-label">{t('sam.backend_api')}</span>
                <span className="link-url">{app.backend_url}</span>
              </a>
            )}
            {app.docs_url && (
              <a href={app.docs_url} target="_blank" rel="noopener noreferrer" className="link-card">
                <span className="link-icon">📚</span>
                <span className="link-label">{t('sam.documentation')}</span>
                <span className="link-url">{app.docs_url}</span>
              </a>
            )}
            {app.github_url && (
              <a href={app.github_url} target="_blank" rel="noopener noreferrer" className="link-card">
                <span className="link-icon">💻</span>
                <span className="link-label">GitHub</span>
                <span className="link-url">{app.github_url}</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📋 {t('sam.overview')}
        </button>
        <button
          className={`tab ${activeTab === 'api' ? 'active' : ''}`}
          onClick={() => setActiveTab('api')}
        >
          📊 {t('sam.api_routes')}
        </button>
        <button
          className={`tab ${activeTab === 'dependencies' ? 'active' : ''}`}
          onClick={() => setActiveTab('dependencies')}
        >
          🔗 {t('sam.dependencies')}
        </button>
        <button
          className={`tab ${activeTab === 'docs' ? 'active' : ''}`}
          onClick={() => setActiveTab('docs')}
        >
          📚 {t('sam.documentation')}
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="info-section">
              <h2>📝 {t('sam.description')}</h2>
              <p>{app.description || t('sam.no_description')}</p>
            </div>

            {app.purpose && (
              <div className="info-section">
                <h2>🎯 {t('sam.purpose')}</h2>
                <p>{app.purpose}</p>
              </div>
            )}

            <div className="info-section">
              <h2>👥 {t('sam.ownership')}</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">{t('sam.owner_team')}</span>
                  <span className="info-value">{app.owner_team || t('common.not_specified')}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">{t('sam.owner_email')}</span>
                  <span className="info-value">{app.owner_email || t('common.not_specified')}</span>
                </div>
              </div>
            </div>

            {app.tech_stack && (
              <div className="info-section">
                <h2>🛠️ {t('sam.tech_stack')}</h2>
                <div className="tech-stack-grid">
                  {app.tech_stack.frontend && app.tech_stack.frontend.length > 0 && (
                    <div className="tech-category">
                      <h4>{t('sam.frontend')}</h4>
                      <div className="tech-tags">
                        {app.tech_stack.frontend.map((tech, i) => (
                          <span key={i} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {app.tech_stack.backend && app.tech_stack.backend.length > 0 && (
                    <div className="tech-category">
                      <h4>{t('sam.backend')}</h4>
                      <div className="tech-tags">
                        {app.tech_stack.backend.map((tech, i) => (
                          <span key={i} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {app.tech_stack.database && app.tech_stack.database.length > 0 && (
                    <div className="tech-category">
                      <h4>{t('sam.database')}</h4>
                      <div className="tech-tags">
                        {app.tech_stack.database.map((tech, i) => (
                          <span key={i} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {app.tech_stack.cache && app.tech_stack.cache.length > 0 && (
                    <div className="tech-category">
                      <h4>{t('sam.cache')}</h4>
                      <div className="tech-tags">
                        {app.tech_stack.cache.map((tech, i) => (
                          <span key={i} className="tech-tag">{tech}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {app.deployments && app.deployments.length > 0 && (
              <div className="info-section">
                <h2>🌍 {t('sam.deployments')}</h2>
                <div className="deployments-list">
                  {app.deployments.map((deploy) => (
                    <div key={deploy.id} className="deployment-card">
                      <div className="deployment-header">
                        <span className="deployment-env">{deploy.environment}</span>
                        <span className="deployment-component">{deploy.component}</span>
                        {deploy.is_active && <span className="deployment-active">✓ Active</span>}
                      </div>
                      {deploy.url && (
                        <a href={deploy.url} target="_blank" rel="noopener noreferrer" className="deployment-url">
                          {deploy.url}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* API Routes Tab */}
        {activeTab === 'api' && (
          <div className="api-tab">
            <h2>📊 {t('sam.api_routes')}</h2>
            {app.routes && app.routes.length > 0 ? (
              <div className="routes-list">
                {app.routes.map((route) => (
                  <div key={route.id} className="route-card">
                    <div className="route-header">
                      <span className={`route-method method-${route.method.toLowerCase()}`}>
                        {route.method}
                      </span>
                      <code className="route-path">{route.path}</code>
                      {route.requires_auth && <span className="route-auth">🔒 Auth</span>}
                    </div>
                    {route.summary && <p className="route-summary">{route.summary}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">{t('sam.no_routes')}</p>
            )}
          </div>
        )}

        {/* Dependencies Tab */}
        {activeTab === 'dependencies' && (
          <div className="dependencies-tab">
            <div className="dependencies-section">
              <h2>⬇️ {t('sam.requires')} ({app.dependencies_required?.length || 0})</h2>
              {app.dependencies_required && app.dependencies_required.length > 0 ? (
                <div className="dependencies-list">
                  {app.dependencies_required.map((dep) => (
                    <div key={dep.id} className="dependency-card">
                      <div className="dependency-header">
                        <span className="dependency-name">{dep.name}</span>
                        <span
                          className="dependency-criticality"
                          style={{ backgroundColor: getCriticalityColor(dep.criticality) }}
                        >
                          {dep.criticality}
                        </span>
                      </div>
                      <span className="dependency-type">{dep.type}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">{t('sam.no_dependencies_required')}</p>
              )}
            </div>

            <div className="dependencies-section">
              <h2>⬆️ {t('sam.used_by')} ({app.dependencies_provided?.length || 0})</h2>
              {app.dependencies_provided && app.dependencies_provided.length > 0 ? (
                <div className="dependencies-list">
                  {app.dependencies_provided.map((dep) => (
                    <div key={dep.id} className="dependency-card">
                      <div className="dependency-header">
                        <span className="dependency-name">{dep.name}</span>
                        <span
                          className="dependency-criticality"
                          style={{ backgroundColor: getCriticalityColor(dep.criticality) }}
                        >
                          {dep.criticality}
                        </span>
                      </div>
                      <span className="dependency-type">{dep.type}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">{t('sam.no_dependents')}</p>
              )}
            </div>
          </div>
        )}

        {/* Documentation Tab */}
        {activeTab === 'docs' && (
          <div className="docs-tab">
            {app.getting_started && (
              <div className="doc-section">
                <h2>🚀 {t('sam.getting_started')}</h2>
                <div className="doc-content" dangerouslySetInnerHTML={{ __html: app.getting_started }} />
              </div>
            )}

            {app.api_reference && (
              <div className="doc-section">
                <h2>📖 {t('sam.api_reference')}</h2>
                <div className="doc-content" dangerouslySetInnerHTML={{ __html: app.api_reference }} />
              </div>
            )}

            {app.integration_guide && (
              <div className="doc-section">
                <h2>🔌 {t('sam.integration_guide')}</h2>
                <div className="doc-content" dangerouslySetInnerHTML={{ __html: app.integration_guide }} />
              </div>
            )}

            {app.troubleshooting && (
              <div className="doc-section">
                <h2>🔧 {t('sam.troubleshooting')}</h2>
                <div className="doc-content" dangerouslySetInnerHTML={{ __html: app.troubleshooting }} />
              </div>
            )}

            {app.faq && (
              <div className="doc-section">
                <h2>❓ {t('sam.faq')}</h2>
                <div className="doc-content" dangerouslySetInnerHTML={{ __html: app.faq }} />
              </div>
            )}

            {!app.getting_started && !app.api_reference && !app.integration_guide && !app.troubleshooting && !app.faq && (
              <p className="empty-message">{t('sam.no_documentation')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppDetail;

