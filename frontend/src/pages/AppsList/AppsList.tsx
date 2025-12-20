/**
 * AppsList Page
 * Displays list of all applications with filters
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import samAPI from '../../api/samApi';
import AppCard from '../../components/AppCard';
import type { ApplicationListItem, ApplicationFilters } from '../../types/sam';
import './AppsList.css';

const AppsList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [apps, setApps] = useState<ApplicationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ApplicationFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadApps();
  }, [filters]);

  const loadApps = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await samAPI.applications.getAll(filters);
      setApps(data);
    } catch (err: any) {
      console.error('Failed to load applications:', err);
      setError(err.message || t('sam.error_loading_apps'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadApps();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await samAPI.applications.search(searchQuery);
      setApps(data);
    } catch (err: any) {
      console.error('Failed to search applications:', err);
      setError(err.message || t('sam.error_searching_apps'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ApplicationFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  if (loading && apps.length === 0) {
    return (
      <div className="apps-list-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="apps-list-page">
      <div className="apps-list-header">
        <div className="header-top">
          <h1>{t('sam.applications')}</h1>
          <button className="btn-primary" onClick={() => navigate('/apps/new')}>
            ➕ {t('sam.add_application')}
          </button>
        </div>

        <div className="search-and-filters">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder={t('sam.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-search">
              🔍 {t('common.search')}
            </button>
          </form>

          <div className="filters">
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="filter-select"
            >
              <option value="">{t('sam.all_types')}</option>
              <option value="core">{t('sam.type_core')}</option>
              <option value="feature">{t('sam.type_feature')}</option>
              <option value="tool">{t('sam.type_tool')}</option>
              <option value="integration">{t('sam.type_integration')}</option>
              <option value="microservice">{t('sam.type_microservice')}</option>
            </select>

            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">{t('sam.all_statuses')}</option>
              <option value="active">{t('status.active')}</option>
              <option value="development">{t('status.development')}</option>
              <option value="deprecated">{t('status.deprecated')}</option>
              <option value="archived">{t('status.archived')}</option>
            </select>

            {(filters.type || filters.status || searchQuery) && (
              <button onClick={clearFilters} className="btn-clear">
                ✖️ {t('common.clear_filters')}
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={loadApps}>{t('common.retry')}</button>
        </div>
      )}

      <div className="apps-list-stats">
        <span>{t('sam.total_applications')}: <strong>{apps.length}</strong></span>
      </div>

      {apps.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>{t('sam.no_applications')}</h3>
          <p>{t('sam.no_applications_desc')}</p>
          <button className="btn-primary" onClick={() => navigate('/apps/new')}>
            ➕ {t('sam.add_first_application')}
          </button>
        </div>
      ) : (
        <div className="apps-grid">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AppsList;

