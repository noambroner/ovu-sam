import './APILogs.css';

interface APILogsProps {
  language: 'he' | 'en' | 'ar';
  theme: 'light' | 'dark';
}

export const APILogs = ({ language, theme }: APILogsProps) => {

  const t = {
    he: {
      title: 'לוג API',
      subtitle: 'כל בקשות API שהגיעו לשרת SAM',
      loading: 'טוען נתונים...',
      error: 'שגיאה',
      noLogs: 'אין לוגים להצגה',
      method: 'Method',
      endpoint: 'Endpoint',
      status: 'Status',
      duration: 'זמן (ms)',
      timestamp: 'זמן',
      ipAddress: 'כתובת IP',
      refresh: 'רענן',
      comingSoon: 'בקרוב - מערכת Logging מלאה תתווסף',
    },
    en: {
      title: 'API Logs',
      subtitle: 'All API requests received by SAM server',
      loading: 'Loading data...',
      error: 'Error',
      noLogs: 'No logs to display',
      method: 'Method',
      endpoint: 'Endpoint',
      status: 'Status',
      duration: 'Duration (ms)',
      timestamp: 'Timestamp',
      ipAddress: 'IP Address',
      refresh: 'Refresh',
      comingSoon: 'Coming Soon - Full logging system will be added',
    },
    ar: {
      title: 'سجلات API',
      subtitle: 'جميع طلبات API المستلمة من خادم SAM',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      noLogs: 'لا توجد سجلات لعرضها',
      method: 'Method',
      endpoint: 'Endpoint',
      status: 'الحالة',
      duration: 'المدة (ms)',
      timestamp: 'الوقت',
      ipAddress: 'عنوان IP',
      refresh: 'تحديث',
      comingSoon: 'قريبًا - سيتم إضافة نظام تسجيل كامل',
    }
  };

  return (
    <div className={`api-logs ${theme}`} dir={language === 'he' || language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="logs-header">
        <div className="header-content">
          <h1>{t[language].title}</h1>
          <p className="subtitle">{t[language].subtitle}</p>
        </div>
      </div>

      <div className="coming-soon-notice">
        <div className="notice-icon">🚧</div>
        <div className="notice-content">
          <h3>{t[language].comingSoon}</h3>
          <p>
            {language === 'he'
              ? 'מערכת Logging מלאה תתווסף בקרוב, כולל:'
              : language === 'ar'
              ? 'سيتم إضافة نظام تسجيل كامل قريبًا، بما في ذلك:'
              : 'Full logging system will be added soon, including:'
            }
          </p>
          <ul>
            <li>{language === 'he' ? 'תיעוד כל בקשות API' : language === 'ar' ? 'توثيق جميع طلبات API' : 'All API requests logging'}</li>
            <li>{language === 'he' ? 'סינון לפי זמן, status, endpoint' : language === 'ar' ? 'التصفية حسب الوقت والحالة ونقطة النهاية' : 'Filter by time, status, endpoint'}</li>
            <li>{language === 'he' ? 'צפייה בפרטי Request/Response' : language === 'ar' ? 'عرض تفاصيل الطلب/الاستجابة' : 'View Request/Response details'}</li>
            <li>{language === 'he' ? 'ניתוח ביצועים' : language === 'ar' ? 'تحليل الأداء' : 'Performance analysis'}</li>
          </ul>
        </div>
      </div>

      {/* Placeholder table */}
      <div className="logs-table-placeholder">
        <table className="logs-table">
          <thead>
            <tr>
              <th>{t[language].method}</th>
              <th>{t[language].endpoint}</th>
              <th>{t[language].status}</th>
              <th>{t[language].duration}</th>
              <th>{t[language].ipAddress}</th>
              <th>{t[language].timestamp}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="placeholder-row">
              <td colSpan={6}>
                <div className="placeholder-content">
                  📊 {t[language].noLogs}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

