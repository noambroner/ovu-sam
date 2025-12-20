/**
 * SystemMap Page
 * Displays the complete dependency graph of all applications
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import samAPI from '../../api/samApi';
import type { DependencyGraph, GraphNode, GraphEdge } from '../../types/sam';
import './SystemMap.css';

type ViewMode = 'graph' | 'tree' | 'matrix';

const SystemMap: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [graph, setGraph] = useState<DependencyGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('graph');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  useEffect(() => {
    loadGraph();

    // Check if we need to highlight a specific app
    const highlight = searchParams.get('highlight');
    if (highlight) {
      setHighlightedId(parseInt(highlight));
    }
  }, [searchParams]);

  const loadGraph = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await samAPI.graph.getGraph();
      setGraph(data);
    } catch (err: any) {
      console.error('Failed to load graph:', err);
      setError(err.message || t('sam.error_loading_graph'));
    } finally {
      setLoading(false);
    }
  };

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node);
    setHighlightedId(node.id);
  };

  const handleViewDetails = (nodeId: number) => {
    navigate(`/apps/${nodeId}`);
  };

  const getNodeConnections = (nodeId: number): { incoming: GraphEdge[]; outgoing: GraphEdge[] } => {
    if (!graph) return { incoming: [], outgoing: [] };

    return {
      incoming: graph.edges.filter(e => e.target === nodeId),
      outgoing: graph.edges.filter(e => e.source === nodeId),
    };
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
          <h2>⚠️ {t('common.error')}</h2>
          <p>{error || t('sam.error_loading_graph')}</p>
          <button onClick={loadGraph} className="btn-primary">
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="system-map-page">
      {/* Header */}
      <div className="map-header">
        <div className="header-left">
          <h1>🗺️ {t('sam.system_map')}</h1>
          <div className="map-stats">
            <span className="stat">
              <strong>{graph.total_apps}</strong> {t('sam.applications')}
            </span>
            <span className="stat-divider">•</span>
            <span className="stat">
              <strong>{graph.total_dependencies}</strong> {t('sam.dependencies')}
            </span>
          </div>
        </div>

        <div className="view-mode-selector">
          <button
            className={`view-btn ${viewMode === 'graph' ? 'active' : ''}`}
            onClick={() => setViewMode('graph')}
          >
            🔵 {t('sam.graph_view')}
          </button>
          <button
            className={`view-btn ${viewMode === 'tree' ? 'active' : ''}`}
            onClick={() => setViewMode('tree')}
          >
            🌳 {t('sam.tree_view')}
          </button>
          <button
            className={`view-btn ${viewMode === 'matrix' ? 'active' : ''}`}
            onClick={() => setViewMode('matrix')}
          >
            📊 {t('sam.matrix_view')}
          </button>
        </div>
      </div>

      <div className="map-content">
        {/* Graph View */}
        {viewMode === 'graph' && (
          <div className="graph-view">
            <div className="nodes-container">
              {graph.nodes.map((node) => {
                const connections = getNodeConnections(node.id);
                const isHighlighted = highlightedId === node.id;
                const isConnected = highlightedId && (
                  connections.incoming.some(e => e.source === highlightedId) ||
                  connections.outgoing.some(e => e.target === highlightedId)
                );

                return (
                  <div
                    key={node.id}
                    className={`graph-node ${isHighlighted ? 'highlighted' : ''} ${isConnected ? 'connected' : ''}`}
                    style={{
                      borderColor: node.color || '#e5e7eb',
                      backgroundColor: isHighlighted ? (node.color || '#3b82f6') + '20' : undefined,
                    }}
                    onClick={() => handleNodeClick(node)}
                  >
                    <div className="node-icon" style={{ backgroundColor: node.color || '#f3f4f6' }}>
                      {node.icon || '📱'}
                    </div>
                    <div className="node-info">
                      <div className="node-name">{node.display_name}</div>
                      <div className="node-code">{node.code}</div>
                      <div className="node-stats">
                        <span title={t('sam.dependencies')}>⬇️ {node.dependencies_count}</span>
                        <span title={t('sam.dependents')}>⬆️ {node.dependents_count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Node Details Sidebar */}
            {selectedNode && (
              <div className="node-details-sidebar">
                <div className="sidebar-header">
                  <h3>{selectedNode.display_name}</h3>
                  <button onClick={() => setSelectedNode(null)} className="btn-close">✖️</button>
                </div>

                <div className="sidebar-content">
                  <div className="detail-item">
                    <span className="detail-label">{t('sam.code')}</span>
                    <span className="detail-value">{selectedNode.code}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">{t('sam.type')}</span>
                    <span className="detail-value">{t(`sam.type_${selectedNode.type}`)}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">{t('sam.status')}</span>
                    <span className="detail-value">{t(`status.${selectedNode.status}`)}</span>
                  </div>

                  {selectedNode.description && (
                    <div className="detail-item">
                      <span className="detail-label">{t('sam.description')}</span>
                      <p className="detail-description">{selectedNode.description}</p>
                    </div>
                  )}

                  <div className="detail-stats">
                    <div className="stat-box">
                      <div className="stat-value">{selectedNode.routes_count}</div>
                      <div className="stat-label">{t('sam.routes')}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-value">{selectedNode.dependencies_count}</div>
                      <div className="stat-label">{t('sam.dependencies')}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-value">{selectedNode.dependents_count}</div>
                      <div className="stat-label">{t('sam.dependents')}</div>
                    </div>
                  </div>

                  <div className="sidebar-actions">
                    <button
                      onClick={() => handleViewDetails(selectedNode.id)}
                      className="btn-primary"
                    >
                      📄 {t('sam.view_details')}
                    </button>
                    {selectedNode.frontend_url && (
                      <a
                        href={selectedNode.frontend_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary"
                      >
                        🌐 {t('sam.open_app')}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tree View */}
        {viewMode === 'tree' && (
          <div className="tree-view">
            <div className="tree-container">
              {graph.nodes
                .filter(node => node.type === 'core')
                .map(node => (
                  <div key={node.id} className="tree-node">
                    <div className="tree-node-content" onClick={() => handleNodeClick(node)}>
                      <span className="tree-icon">{node.icon || '📱'}</span>
                      <span className="tree-name">{node.display_name}</span>
                      <span className="tree-code">{node.code}</span>
                    </div>

                    {/* Show dependencies */}
                    {graph.edges.filter(e => e.source === node.id).length > 0 && (
                      <div className="tree-children">
                        {graph.edges
                          .filter(e => e.source === node.id)
                          .map(edge => {
                            const childNode = graph.nodes.find(n => n.id === edge.target);
                            if (!childNode) return null;

                            return (
                              <div key={edge.id} className="tree-child">
                                <div className="tree-node-content" onClick={() => handleNodeClick(childNode)}>
                                  <span className="tree-icon">{childNode.icon || '📱'}</span>
                                  <span className="tree-name">{childNode.display_name}</span>
                                  <span className="tree-code">{childNode.code}</span>
                                  <span className="tree-edge-type">{edge.type}</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Matrix View */}
        {viewMode === 'matrix' && (
          <div className="matrix-view">
            <div className="matrix-container">
              <table className="dependency-matrix">
                <thead>
                  <tr>
                    <th className="matrix-corner">{t('sam.consumer')} → {t('sam.provider')}</th>
                    {graph.nodes.map(node => (
                      <th key={node.id} className="matrix-header">
                        <div className="matrix-header-content">
                          <span>{node.code}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {graph.nodes.map(consumer => (
                    <tr key={consumer.id}>
                      <td className="matrix-row-header">
                        <div className="matrix-row-content">
                          <span className="row-icon">{consumer.icon || '📱'}</span>
                          <span className="row-name">{consumer.code}</span>
                        </div>
                      </td>
                      {graph.nodes.map(provider => {
                        const edge = graph.edges.find(
                          e => e.source === consumer.id && e.target === provider.id
                        );

                        return (
                          <td
                            key={provider.id}
                            className={`matrix-cell ${edge ? 'has-dependency' : ''}`}
                            title={edge ? `${edge.name} (${edge.criticality})` : ''}
                          >
                            {edge && (
                              <div
                                className={`dependency-indicator criticality-${edge.criticality}`}
                              >
                                ●
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="matrix-legend">
              <h4>{t('sam.legend')}</h4>
              <div className="legend-items">
                <div className="legend-item">
                  <span className="legend-dot criticality-critical">●</span>
                  <span>{t('sam.critical')}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot criticality-high">●</span>
                  <span>{t('sam.high')}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot criticality-medium">●</span>
                  <span>{t('sam.medium')}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot criticality-low">●</span>
                  <span>{t('sam.low')}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemMap;

