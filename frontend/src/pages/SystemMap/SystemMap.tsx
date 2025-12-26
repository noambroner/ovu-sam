/**
 * SystemMap Page - Redesigned
 * Displays OVU ecosystem with hierarchical tree view
 * Full RTL support, clear hierarchy, and comprehensive app details
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import samAPI from '../../api/samApi';
import type { DependencyGraph, GraphNode, ApplicationDetail, RouteInfo } from '../../types/sam';
import './SystemMap.css';

type ViewMode = 'tree' | 'grid' | 'list';

interface TreeNode extends GraphNode {
  children: TreeNode[];
  level: number;
  isExpanded: boolean;
}

const SystemMap: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [graph, setGraph] = useState<DependencyGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [selectedApp, setSelectedApp] = useState<ApplicationDetail | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isRTL = i18n.language === 'he' || i18n.language === 'ar';

  useEffect(() => {
    loadGraph();
    const highlight = searchParams.get('highlight');
    if (highlight) {
      const id = parseInt(highlight);
      setSelectedNodeId(id);
      loadAppDetails(id);
    }
  }, [searchParams]);

  const loadGraph = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await samAPI.graph.getGraph();
      setGraph(data);
      // Auto-expand root nodes (core apps)
      const coreIds = data.nodes
        .filter(n => n.type === 'core')
        .map(n => n.id);
      setExpandedNodes(new Set(coreIds));
    } catch (err: any) {
      console.error('Failed to load graph:', err);
      setError(err.message || t('sam.error_loading_graph'));
    } finally {
      setLoading(false);
    }
  };

  const loadAppDetails = async (appId: number) => {
    try {
      setLoadingDetails(true);
      const app = await samAPI.applications.getById(appId);
      setSelectedApp(app);
    } catch (err: any) {
      console.error('Failed to load app details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNodeId(node.id);
    loadAppDetails(node.id);
  };

  // Toggle expand function for future use with nested trees
  const _toggleExpand = (nodeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };
  // Mark as intentionally unused for now
  void _toggleExpand;

  // Build hierarchical tree structure
  const treeData = useMemo(() => {
    if (!graph) return [];

    const nodeMap = new Map<number, TreeNode>();
    
    // Initialize all nodes
    graph.nodes.forEach(node => {
      nodeMap.set(node.id, {
        ...node,
        children: [],
        level: 0,
        isExpanded: expandedNodes.has(node.id),
      });
    });

    // Build parent-child relationships based on dependencies
    // An app that has dependencies is a "child" of those dependencies
    graph.edges.forEach(edge => {
      const consumer = nodeMap.get(edge.source);
      const provider = nodeMap.get(edge.target);
      if (consumer && provider) {
        // Provider (target) is the "parent", consumer (source) is the "child"
        // But we want to show it the other way for better visualization
        // So core services are at the top, and their consumers are below
      }
    });

    // For the tree view, organize by type hierarchy
    // Core -> Feature -> Tool -> Integration -> Microservice
    const typeOrder = ['core', 'feature', 'tool', 'integration', 'microservice'];
    
    const sortedNodes = Array.from(nodeMap.values()).sort((a, b) => {
      const aOrder = typeOrder.indexOf(a.type) ?? 99;
      const bOrder = typeOrder.indexOf(b.type) ?? 99;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.display_name.localeCompare(b.display_name, i18n.language);
    });

    return sortedNodes;
  }, [graph, expandedNodes, i18n.language]);

  // Filter nodes by search
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return treeData;
    const query = searchQuery.toLowerCase();
    return treeData.filter(node => 
      node.display_name.toLowerCase().includes(query) ||
      node.code.toLowerCase().includes(query) ||
      (node.description?.toLowerCase().includes(query))
    );
  }, [treeData, searchQuery]);

  // Group nodes by type for tree view
  const groupedNodes = useMemo(() => {
    const groups: Record<string, GraphNode[]> = {};
    filteredNodes.forEach(node => {
      const type = node.type || 'other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(node);
    });
    return groups;
  }, [filteredNodes]);

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'core': return '🏛️';
      case 'feature': return '⚡';
      case 'tool': return '🔧';
      case 'integration': return '🔌';
      case 'microservice': return '📦';
      default: return '📱';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; bg: string }> = {
      active: { color: '#059669', bg: '#d1fae5' },
      development: { color: '#2563eb', bg: '#dbeafe' },
      deprecated: { color: '#d97706', bg: '#fef3c7' },
      archived: { color: '#6b7280', bg: '#f3f4f6' },
    };
    const config = statusConfig[status] || statusConfig.archived;
    return (
      <span 
        className="status-badge" 
        style={{ color: config.color, backgroundColor: config.bg }}
      >
        {t(`status.${status}`)}
      </span>
    );
  };

  const getMethodColor = (method: string): string => {
    const colors: Record<string, string> = {
      GET: '#10b981',
      POST: '#3b82f6',
      PUT: '#f59e0b',
      PATCH: '#8b5cf6',
      DELETE: '#ef4444',
    };
    return colors[method] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="system-map-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !graph) {
    return (
      <div className="system-map-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>{t('common.error')}</h2>
          <p>{error || t('sam.error_loading_graph')}</p>
          <button onClick={loadGraph} className="btn-primary">
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`system-map-page ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="map-header">
        <div className="header-main">
          <div className="header-title">
            <h1>🗺️ {t('sam.system_map')}</h1>
            <p className="header-subtitle">{t('sam.system_map_subtitle', 'מפת כל האפליקציות והשירותים במערכת OVU')}</p>
          </div>
          
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-value">{graph.total_apps}</span>
              <span className="stat-label">{t('sam.applications')}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">{graph.total_dependencies}</span>
              <span className="stat-label">{t('sam.dependencies')}</span>
            </div>
          </div>
        </div>

        <div className="header-controls">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={t('sam.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'tree' ? 'active' : ''}`}
              onClick={() => setViewMode('tree')}
              title={t('sam.tree_view')}
            >
              🌳
            </button>
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title={t('sam.grid_view', 'תצוגת רשת')}
            >
              ⊞
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title={t('sam.list_view', 'תצוגת רשימה')}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="map-content">
        {/* Apps Panel */}
        <div className="apps-panel">
          {/* Tree View */}
          {viewMode === 'tree' && (
            <div className="tree-view">
              {Object.entries(groupedNodes).map(([type, nodes]) => (
                <div key={type} className="tree-group">
                  <div className="tree-group-header">
                    <span className="group-icon">{getTypeIcon(type)}</span>
                    <span className="group-title">{t(`sam.type_${type}`)}</span>
                    <span className="group-count">{nodes.length}</span>
                  </div>
                  
                  <div className="tree-group-items">
                    {nodes.map(node => (
                      <div
                        key={node.id}
                        className={`tree-item ${selectedNodeId === node.id ? 'selected' : ''}`}
                        onClick={() => handleNodeClick(node)}
                      >
                        <div className="tree-item-main">
                          <div 
                            className="tree-item-icon" 
                            style={{ backgroundColor: node.color || '#e5e7eb' }}
                          >
                            {node.icon || '📱'}
                          </div>
                          <div className="tree-item-info">
                            <div className="tree-item-name">{node.display_name}</div>
                            <div className="tree-item-code">{node.code}</div>
                          </div>
                          {getStatusBadge(node.status)}
                        </div>
                        
                        <div className="tree-item-stats">
                          <span className="mini-stat" title={t('sam.routes')}>
                            📊 {node.routes_count}
                          </span>
                          <span className="mini-stat" title={t('sam.dependencies')}>
                            ⬇️ {node.dependencies_count}
                          </span>
                          <span className="mini-stat" title={t('sam.dependents')}>
                            ⬆️ {node.dependents_count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid-view">
              {filteredNodes.map(node => (
                <div
                  key={node.id}
                  className={`grid-card ${selectedNodeId === node.id ? 'selected' : ''}`}
                  onClick={() => handleNodeClick(node)}
                >
                  <div className="grid-card-header">
                    <div 
                      className="grid-card-icon" 
                      style={{ backgroundColor: node.color || '#e5e7eb' }}
                    >
                      {node.icon || '📱'}
                    </div>
                    {getStatusBadge(node.status)}
                  </div>
                  <h3 className="grid-card-title">{node.display_name}</h3>
                  <code className="grid-card-code">{node.code}</code>
                  <p className="grid-card-desc">{node.description || t('sam.no_description')}</p>
                  <div className="grid-card-stats">
                    <span>📊 {node.routes_count}</span>
                    <span>⬇️ {node.dependencies_count}</span>
                    <span>⬆️ {node.dependents_count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="list-view">
              <table className="list-table">
                <thead>
                  <tr>
                    <th>{t('sam.code')}</th>
                    <th>{t('common.name', 'שם')}</th>
                    <th>{t('sam.type')}</th>
                    <th>{t('sam.status')}</th>
                    <th>{t('sam.routes')}</th>
                    <th>{t('sam.dependencies')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNodes.map(node => (
                    <tr 
                      key={node.id}
                      className={selectedNodeId === node.id ? 'selected' : ''}
                      onClick={() => handleNodeClick(node)}
                    >
                      <td>
                        <div className="list-cell-icon">
                          <span 
                            className="list-icon" 
                            style={{ backgroundColor: node.color || '#e5e7eb' }}
                          >
                            {node.icon || '📱'}
                          </span>
                          <code>{node.code}</code>
                        </div>
                      </td>
                      <td>{node.display_name}</td>
                      <td>
                        <span className="type-badge">{getTypeIcon(node.type)} {t(`sam.type_${node.type}`)}</span>
                      </td>
                      <td>{getStatusBadge(node.status)}</td>
                      <td>{node.routes_count}</td>
                      <td>{node.dependencies_count} / {node.dependents_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Details Panel */}
        <div className={`details-panel ${selectedApp ? 'open' : ''}`}>
          {loadingDetails ? (
            <div className="details-loading">
              <div className="spinner small"></div>
              <p>{t('common.loading')}</p>
            </div>
          ) : selectedApp ? (
            <div className="details-content">
              {/* Close button */}
              <button 
                className="details-close" 
                onClick={() => { setSelectedApp(null); setSelectedNodeId(null); }}
              >
                ✕
              </button>

              {/* App Header */}
              <div className="details-header">
                <div 
                  className="details-icon" 
                  style={{ backgroundColor: selectedApp.color || '#e5e7eb' }}
                >
                  {selectedApp.icon || '📱'}
                </div>
                <div className="details-title-section">
                  <h2>{selectedApp.display_name}</h2>
                  <code className="details-code">{selectedApp.code}</code>
                  <div className="details-badges">
                    <span className="type-badge">
                      {getTypeIcon(selectedApp.type)} {t(`sam.type_${selectedApp.type}`)}
                    </span>
                    {getStatusBadge(selectedApp.status)}
                    {selectedApp.version && (
                      <span className="version-badge">v{selectedApp.version}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedApp.description && (
                <div className="details-section">
                  <p className="details-description">{selectedApp.description}</p>
                </div>
              )}

              {/* Quick Links */}
              {(selectedApp.frontend_url || selectedApp.backend_url || selectedApp.docs_url) && (
                <div className="details-section">
                  <h3>🔗 {t('sam.quick_links')}</h3>
                  <div className="quick-links-list">
                    {selectedApp.frontend_url && (
                      <a 
                        href={selectedApp.frontend_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="quick-link"
                      >
                        <span className="quick-link-icon">🌐</span>
                        <span className="quick-link-text">{t('sam.frontend')}</span>
                      </a>
                    )}
                    {selectedApp.backend_url && (
                      <a 
                        href={selectedApp.backend_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="quick-link"
                      >
                        <span className="quick-link-icon">📡</span>
                        <span className="quick-link-text">{t('sam.backend_api')}</span>
                      </a>
                    )}
                    {selectedApp.docs_url && (
                      <a 
                        href={selectedApp.docs_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="quick-link"
                      >
                        <span className="quick-link-icon">📚</span>
                        <span className="quick-link-text">{t('sam.documentation')}</span>
                      </a>
                    )}
                    {selectedApp.github_url && (
                      <a 
                        href={selectedApp.github_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="quick-link"
                      >
                        <span className="quick-link-icon">💻</span>
                        <span className="quick-link-text">GitHub</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* API Routes - Collapsible */}
              {selectedApp.routes && selectedApp.routes.length > 0 && (
                <div className="details-section">
                  <h3>
                    📊 {t('sam.api_routes')} 
                    <span className="section-count">{selectedApp.routes.length}</span>
                  </h3>
                  <div className="api-routes-list">
                    {selectedApp.routes.slice(0, 10).map((route: RouteInfo) => (
                      <div key={route.id} className="api-route">
                        <span 
                          className="route-method"
                          style={{ backgroundColor: getMethodColor(route.method) }}
                        >
                          {route.method}
                        </span>
                        <code className="route-path">{route.path}</code>
                        {route.requires_auth && <span className="route-auth">🔒</span>}
                      </div>
                    ))}
                    {selectedApp.routes.length > 10 && (
                      <button 
                        className="show-more-btn"
                        onClick={() => navigate(`/apps/${selectedApp.id}`)}
                      >
                        {t('common.view_all')} ({selectedApp.routes.length - 10} {t('common.more', 'עוד')})
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Dependencies */}
              <div className="details-section">
                <h3>🔗 {t('sam.dependencies')}</h3>
                <div className="dependencies-mini">
                  {selectedApp.dependencies_required && selectedApp.dependencies_required.length > 0 ? (
                    <div className="deps-group">
                      <span className="deps-label">⬇️ {t('sam.requires')}:</span>
                      <div className="deps-tags">
                        {selectedApp.dependencies_required.map(dep => (
                          <span key={dep.id} className="dep-tag">{dep.name}</span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="no-deps">{t('sam.no_dependencies_required')}</p>
                  )}
                  
                  {selectedApp.dependencies_provided && selectedApp.dependencies_provided.length > 0 && (
                    <div className="deps-group">
                      <span className="deps-label">⬆️ {t('sam.used_by')}:</span>
                      <div className="deps-tags">
                        {selectedApp.dependencies_provided.map(dep => (
                          <span key={dep.id} className="dep-tag">{dep.name}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tech Stack */}
              {selectedApp.tech_stack && (
                <div className="details-section">
                  <h3>🛠️ {t('sam.tech_stack')}</h3>
                  <div className="tech-stack-mini">
                    {selectedApp.tech_stack.frontend && (
                      <div className="tech-group">
                        <span className="tech-label">{t('sam.frontend')}:</span>
                        <span className="tech-value">{selectedApp.tech_stack.frontend.join(', ')}</span>
                      </div>
                    )}
                    {selectedApp.tech_stack.backend && (
                      <div className="tech-group">
                        <span className="tech-label">{t('sam.backend')}:</span>
                        <span className="tech-value">{selectedApp.tech_stack.backend.join(', ')}</span>
                      </div>
                    )}
                    {selectedApp.tech_stack.database && (
                      <div className="tech-group">
                        <span className="tech-label">{t('sam.database')}:</span>
                        <span className="tech-value">{selectedApp.tech_stack.database.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="details-actions">
                <button 
                  className="btn-primary"
                  onClick={() => navigate(`/apps/${selectedApp.id}`)}
                >
                  📄 {t('sam.view_full_details', 'צפה בפרטים מלאים')}
                </button>
                {selectedApp.frontend_url && (
                  <a 
                    href={selectedApp.frontend_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    🚀 {t('sam.open_app')}
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="details-placeholder">
              <div className="placeholder-icon">👆</div>
              <h3>{t('sam.select_app', 'בחר אפליקציה')}</h3>
              <p>{t('sam.select_app_desc', 'לחץ על אפליקציה מהרשימה כדי לראות פרטים מלאים')}</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Context Info Banner */}
      <div className="ai-banner">
        <div className="ai-banner-content">
          <span className="ai-banner-icon">🤖</span>
          <span className="ai-banner-text">
            {t('sam.ai_banner_text', 'סוכני AI יכולים לגשת למידע זה דרך')}
          </span>
          <code className="ai-banner-endpoint">/api/v1/applications</code>
          <a 
            href="/api/v1/graph" 
            target="_blank" 
            className="ai-banner-link"
          >
            {t('sam.view_api', 'צפה ב-API')} →
          </a>
        </div>
      </div>
    </div>
  );
};

export default SystemMap;
