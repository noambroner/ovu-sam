import { useState } from 'react';
import './APIUIEndpoints.css';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  used: boolean;
}

interface PageEndpoints {
  page: string;
  route: string;
  icon: string;
  endpoints: Endpoint[];
}

interface APIUIEndpointsProps {
  language: 'he' | 'en' | 'ar';
  theme: 'light' | 'dark';
}

export const APIUIEndpoints = ({ language, theme }: APIUIEndpointsProps) => {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [expandedPages, setExpandedPages] = useState<string[]>([]);

  const t = {
    he: {
      title: 'UI Endpoints',
      subtitle: 'עץ היררכי של כל נקודות הקצה שה-UI משתמש בהן',
      selectPage: 'בחר דף לצפייה בנקודות הקצה',
      method: 'שיטה',
      endpoint: 'נקודת קצה',
      description: 'תיאור',
      inUse: 'בשימוש',
      notInUse: 'לא בשימוש',
      noEndpoints: 'אין נקודות קצה להצגה',
    },
    en: {
      title: 'UI Endpoints',
      subtitle: 'Hierarchical tree of all endpoints used by the UI',
      selectPage: 'Select a page to view endpoints',
      method: 'Method',
      endpoint: 'Endpoint',
      description: 'Description',
      inUse: 'In Use',
      notInUse: 'Not In Use',
      noEndpoints: 'No endpoints to display',
    },
    ar: {
      title: 'نقاط نهاية UI',
      subtitle: 'شجرة هرمية لجميع نقاط النهاية المستخدمة من قبل UI',
      selectPage: 'حدد صفحة لعرض نقاط النهاية',
      method: 'الطريقة',
      endpoint: 'نقطة النهاية',
      description: 'الوصف',
      inUse: 'قيد الاستخدام',
      notInUse: 'غير مستخدم',
      noEndpoints: 'لا توجد نقاط نهاية للعرض',
    }
  };

  const samPages: PageEndpoints[] = [
    {
      page: 'Dashboard',
      route: '/dashboard',
      icon: '📊',
      endpoints: [
        { method: 'GET', path: '/api/v1/applications', description: 'Get all applications', used: true },
        { method: 'GET', path: '/api/v1/applications/stats', description: 'Get statistics', used: true },
      ]
    },
    {
      page: 'Applications List',
      route: '/apps',
      icon: '📱',
      endpoints: [
        { method: 'GET', path: '/api/v1/applications', description: 'Get all applications', used: true },
        { method: 'GET', path: '/api/v1/applications/search', description: 'Search applications', used: true },
      ]
    },
    {
      page: 'Application Detail',
      route: '/apps/:id',
      icon: '🔍',
      endpoints: [
        { method: 'GET', path: '/api/v1/applications/{id}', description: 'Get application by ID', used: true },
        { method: 'GET', path: '/api/v1/applications/{id}/endpoints', description: 'Get app endpoints', used: true },
        { method: 'GET', path: '/api/v1/applications/{id}/dependencies', description: 'Get dependencies', used: true },
        { method: 'GET', path: '/api/v1/applications/{id}/tech-stack', description: 'Get tech stack', used: true },
      ]
    },
    {
      page: 'Add Application',
      route: '/apps/add',
      icon: '➕',
      endpoints: [
        { method: 'POST', path: '/api/v1/applications', description: 'Create new application', used: false },
      ]
    },
    {
      page: 'Edit Application',
      route: '/apps/:id/edit',
      icon: '✏️',
      endpoints: [
        { method: 'GET', path: '/api/v1/applications/{id}', description: 'Get application details', used: false },
        { method: 'PUT', path: '/api/v1/applications/{id}', description: 'Update application', used: false },
        { method: 'DELETE', path: '/api/v1/applications/{id}', description: 'Delete application', used: false },
      ]
    },
    {
      page: 'System Map',
      route: '/map',
      icon: '🗺️',
      endpoints: [
        { method: 'GET', path: '/api/v1/applications', description: 'Get all applications', used: true },
        { method: 'GET', path: '/api/v1/dependencies/graph', description: 'Get dependency graph', used: true },
      ]
    },
    {
      page: 'Dependencies',
      route: '/dependencies',
      icon: '🔗',
      endpoints: [
        { method: 'GET', path: '/api/v1/dependencies', description: 'Get all dependencies', used: false },
        { method: 'POST', path: '/api/v1/dependencies', description: 'Create dependency', used: false },
        { method: 'DELETE', path: '/api/v1/dependencies/{id}', description: 'Delete dependency', used: false },
      ]
    },
    {
      page: 'Login',
      route: '/login',
      icon: '🔐',
      endpoints: [
        { method: 'POST', path: '/api/v1/auth/login', description: 'User login', used: true },
        { method: 'POST', path: '/api/v1/auth/logout', description: 'User logout', used: true },
      ]
    }
  ];

  const togglePageExpand = (pageName: string) => {
    setExpandedPages(prev =>
      prev.includes(pageName)
        ? prev.filter(p => p !== pageName)
        : [...prev, pageName]
    );
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return '#61affe';
      case 'POST': return '#49cc90';
      case 'PUT': return '#fca130';
      case 'DELETE': return '#f93e3e';
      case 'PATCH': return '#50e3c2';
      default: return '#999';
    }
  };

  return (
    <div className={`api-ui-endpoints ${theme}`} dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="api-header">
        <h1 className="api-title">{t[language].title}</h1>
        <p className="api-subtitle">{t[language].subtitle}</p>
      </div>

      <div className="api-content">
        {/* Pages Tree */}
        <div className="pages-tree">
          <h3 className="tree-title">{language === 'he' ? 'דפים' : language === 'ar' ? 'الصفحات' : 'Pages'}</h3>
          {samPages.map((page) => (
            <div key={page.page} className="page-item">
              <div
                className={`page-header ${selectedPage === page.page ? 'active' : ''}`}
                onClick={() => {
                  setSelectedPage(page.page);
                  togglePageExpand(page.page);
                }}
              >
                <span className="page-icon">{page.icon}</span>
                <span className="page-name">{page.page}</span>
                <span className="page-route">{page.route}</span>
                <span className={`expand-icon ${expandedPages.includes(page.page) ? 'expanded' : ''}`}>
                  {language === 'he' ? '◀' : '▶'}
                </span>
              </div>

              {expandedPages.includes(page.page) && (
                <div className="endpoints-mini">
                  {page.endpoints.map((endpoint, idx) => (
                    <div key={idx} className="endpoint-mini">
                      <span
                        className="method-badge"
                        style={{ backgroundColor: getMethodColor(endpoint.method) }}
                      >
                        {endpoint.method}
                      </span>
                      <span className="endpoint-path">{endpoint.path}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Endpoints Details */}
        <div className="endpoints-details">
          {selectedPage ? (
            <>
              <div className="details-header">
                <h2>{selectedPage}</h2>
                <span className="route-badge">
                  {samPages.find(p => p.page === selectedPage)?.route}
                </span>
              </div>

              <div className="endpoints-list">
                {samPages.find(p => p.page === selectedPage)?.endpoints.map((endpoint, idx) => (
                  <div key={idx} className="endpoint-card">
                    <div className="endpoint-header">
                      <span
                        className="method-badge large"
                        style={{ backgroundColor: getMethodColor(endpoint.method) }}
                      >
                        {endpoint.method}
                      </span>
                      <code className="endpoint-path">{endpoint.path}</code>
                      <span className={`usage-badge ${endpoint.used ? 'used' : 'unused'}`}>
                        {endpoint.used ? t[language].inUse : t[language].notInUse}
                      </span>
                    </div>
                    <p className="endpoint-description">{endpoint.description}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-selection">
              <span className="no-selection-icon">📋</span>
              <p>{t[language].selectPage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

