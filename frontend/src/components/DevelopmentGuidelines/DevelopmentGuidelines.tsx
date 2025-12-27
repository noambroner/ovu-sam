import { useState } from 'react';
import './DevelopmentGuidelines.css';

interface Guideline {
  id: string;
  category: 'deployment' | 'architecture' | 'coding' | 'database' | 'security' | 'testing';
  title: string;
  content: string;
  importance: 'critical' | 'high' | 'medium';
  examples?: string[];
}

interface DevelopmentGuidelinesProps {
  language: 'he' | 'en' | 'ar';
  theme: 'light' | 'dark';
}

export const DevelopmentGuidelines = ({ language, theme }: DevelopmentGuidelinesProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedGuideline, setExpandedGuideline] = useState<string | null>(null);

  const t = {
    he: {
      title: 'הנחיות וכללי פיתוח',
      subtitle: 'מדריך מקיף לפיתוח, deployment ותחזוקה של מערכת SAM',
      allCategories: 'כל הקטגוריות',
      deployment: 'Deployment',
      architecture: 'ארכיטקטורה',
      coding: 'כללי קוד',
      database: 'מסד נתונים',
      security: 'אבטחה',
      testing: 'בדיקות',
      importance: 'חשיבות',
      critical: 'קריטי',
      high: 'גבוה',
      medium: 'בינוני',
      examples: 'דוגמאות',
      clickToExpand: 'לחץ להרחבה',
    },
    en: {
      title: 'Development Guidelines',
      subtitle: 'Comprehensive guide for development, deployment and maintenance of SAM system',
      allCategories: 'All Categories',
      deployment: 'Deployment',
      architecture: 'Architecture',
      coding: 'Coding Standards',
      database: 'Database',
      security: 'Security',
      testing: 'Testing',
      importance: 'Importance',
      critical: 'Critical',
      high: 'High',
      medium: 'Medium',
      examples: 'Examples',
      clickToExpand: 'Click to expand',
    },
    ar: {
      title: 'إرشادات التطوير',
      subtitle: 'دليل شامل للتطوير والنشر والصيانة لنظام SAM',
      allCategories: 'جميع الفئات',
      deployment: 'النشر',
      architecture: 'الهيكلة',
      coding: 'معايير الكود',
      database: 'قاعدة البيانات',
      security: 'الأمان',
      testing: 'الاختبار',
      importance: 'الأهمية',
      critical: 'حرج',
      high: 'عالي',
      medium: 'متوسط',
      examples: 'أمثلة',
      clickToExpand: 'انقر للتوسيع',
    }
  };

  const guidelines: Guideline[] = [
    {
      id: 'system-overview',
      category: 'architecture',
      title: '🗺️ סקירת מערכת SAM',
      importance: 'critical',
      content: `SAM (System Application Mapper) היא מערכת ניהול ותיעוד אפליקציות במערכת OVU.

**תפקיד המערכת:**
1. מיפוי כל האפליקציות במערכת
2. תיעוד טכני מפורט לכל אפליקציה
3. ניהול תלויות בין אפליקציות
4. מפת מערכת אינטראקטיבית

**ארכיטקטורה:**
- Frontend: React 18 + TypeScript + Vite
- Backend: FastAPI (Python 3.11)
- Database: PostgreSQL
- Authentication: JWT דרך ULM`,
      examples: [
        '# מבנה הפרויקט:',
        'sam-work/',
        '├── frontend/     # React + TypeScript',
        '├── backend/      # FastAPI + Python',
        '└── docs/         # תיעוד'
      ]
    },
    {
      id: 'deploy-frontend',
      category: 'deployment',
      title: 'Deployment של Frontend (React)',
      importance: 'critical',
      content: `⚠️ **חובה לבצע בדיוק 4 שלבים - בסדר הזה!**

**שרת Frontend:** ploi@64.176.173.105
**SSH Key:** ~/.ssh/ovu_key
**תיקיית Nginx:** /home/ploi/sam.ovu.co.il/public/

**⚠️ Nginx מגיש רק מ-public/ ⚠️**

**תהליך ה-Deployment - 4 שלבים חובה:**

**שלב 1:** Build local
**שלב 2:** העלאה לשרת (נתיב ביניים)
**שלב 3:** העתקה ל-public/ (שם Nginx מגיש)
**שלב 4:** וידוא שהקבצים במקום הנכון

⚠️ **אסור rsync! רק scp!**
⚠️ **אסור לדלג על שלב 3 - העתקה ל-public/**`,
      examples: [
        '# שלב 1: Build',
        'cd /home/noam/projects/ovu/worktrees/sam-work/frontend',
        'npm run build',
        '',
        '# שלב 2: העלאה לשרת (נתיב ביניים)',
        'scp -i ~/.ssh/ovu_key -r dist/* ploi@64.176.173.105:/home/ploi/sam.ovu.co.il/',
        '',
        '# שלב 3: העתקה ל-public/ (קריטי!)',
        'ssh -i ~/.ssh/ovu_key ploi@64.176.173.105 "cp -rf /home/ploi/sam.ovu.co.il/*.html /home/ploi/sam.ovu.co.il/public/ && cp -rf /home/ploi/sam.ovu.co.il/assets/* /home/ploi/sam.ovu.co.il/public/assets/"',
        '',
        '# שלב 4: וידוא',
        'ssh -i ~/.ssh/ovu_key ploi@64.176.173.105 "ls -lh /home/ploi/sam.ovu.co.il/public/index.html && ls -lh /home/ploi/sam.ovu.co.il/public/assets/ | head -5"'
      ]
    },
    {
      id: 'deploy-backend',
      category: 'deployment',
      title: 'Deployment של Backend (FastAPI)',
      importance: 'critical',
      content: `⚠️ **חובה לבצע בדיוק 4 שלבים - בסדר הזה!**

**שרת Backend:** ploi@64.176.171.223
**SSH Key:** ~/.ssh/ovu_key
**תיקיית העבודה:** /home/ploi/ovu-sam/backend/
**פורט:** 8003

**תהליך ה-Deployment - 4 שלבים חובה:**

**שלב 1:** העלאת קבצים לשרת
**שלב 2:** זיהוי תהליך uvicorn (lsof)
**שלב 3:** עצירה חזקה (kill -9)
**שלב 4:** הפעלה מחדש + וידוא

⚠️ **pkill רגיל לא מספיק! חובה kill -9 לPID ספציפי!**`,
      examples: [
        '# שלב 1: העלאת קבצים',
        'cd /home/noam/projects/ovu/worktrees/sam-work/backend',
        'scp -i ~/.ssh/ovu_key -r app/ ploi@64.176.171.223:/home/ploi/ovu-sam/backend/',
        '',
        '# שלב 2: זיהוי PID',
        'ssh -i ~/.ssh/ovu_key ploi@64.176.171.223 "lsof -i :8003 | grep -v COMMAND"',
        '# תקבל PID - לדוגמה: 1729602',
        '',
        '# שלב 3: עצירה חזקה (החלף [PID] במספר האמיתי)',
        'ssh -i ~/.ssh/ovu_key ploi@64.176.171.223 "kill -9 [PID]"',
        '',
        '# שלב 4: הפעלה מחדש',
        'ssh -i ~/.ssh/ovu_key ploi@64.176.171.223 "cd /home/ploi/ovu-sam/backend && nohup venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8003 > /dev/null 2>&1 &"',
        '',
        '# וידוא: בדיקה שהשרת רץ',
        'sleep 3',
        'curl -s http://64.176.171.223:8003/health | head -5'
      ]
    },
    {
      id: 'database-structure',
      category: 'database',
      title: 'מבנה מסד הנתונים',
      importance: 'high',
      content: `SAM משתמש ב-PostgreSQL עם הטבלאות הבאות:

**טבלאות עיקריות:**
1. **applications** - פרטי אפליקציות
2. **application_endpoints** - נקודות קצה API
3. **application_dependencies** - תלויות בין אפליקציות
4. **application_tech_stack** - טכנולוגיות בשימוש
5. **application_servers** - שרתים ופריסה

**חיבור לDB:**
- Host: 64.177.67.215
- Database: sam_db
- User: sam_user`,
      examples: [
        'psql -h 64.177.67.215 -U sam_user -d sam_db',
        '',
        '-- טבלאות עיקריות:',
        'SELECT * FROM applications;',
        'SELECT * FROM application_endpoints WHERE app_id = 1;',
        'SELECT * FROM application_dependencies;'
      ]
    },
    {
      id: 'api-structure',
      category: 'architecture',
      title: 'מבנה API',
      importance: 'high',
      content: `כל endpoint ב-SAM חייב לכלול:

1. **Type Hints מלאים**
2. **Authentication** (JWT מ-ULM)
3. **Error Handling**
4. **Documentation** (docstring)

**נקודות קצה עיקריות:**
- GET /api/v1/apps - רשימת אפליקציות
- GET /api/v1/apps/{id} - פרטי אפליקציה
- POST /api/v1/apps - יצירת אפליקציה
- PUT /api/v1/apps/{id} - עדכון אפליקציה`,
      examples: [
        '@router.get("/apps/{app_id}", response_model=AppDetail)',
        'async def get_app(',
        '    app_id: int,',
        '    current_user: dict = Depends(require_auth)',
        ') -> dict:',
        '    """Get application details"""',
        '    # Implementation...'
      ]
    },
    {
      id: 'multilingual',
      category: 'coding',
      title: 'תמיכה רב-לשונית (i18n)',
      importance: 'high',
      content: `המערכת תומכת ב-3 שפות: עברית, אנגלית, ערבית.

כל טקסט בממשק חייב להיות מתורגם!

**מיקום:** src/localization/

שימו לב:
1. עברית וערבית דורשות RTL
2. כל label/title/description צריך תרגום
3. הודעות שגיאה גם כן`,
      examples: [
        'const translations = {',
        '  he: {',
        '    title: "כותרת בעברית",',
        '    apps: "אפליקציות"',
        '  },',
        '  en: {',
        '    title: "Title in English",',
        '    apps: "Applications"',
        '  },',
        '  ar: {',
        '    title: "العنوان بالعربية",',
        '    apps: "التطبيقات"',
        '  }',
        '}'
      ]
    },
    {
      id: 'design-system',
      category: 'coding',
      title: 'שמירה על ערכת העיצוב (Design System)',
      importance: 'critical',
      content: `חובה לשמור על ערכת העיצוב האחידה של המערכת!

**CSS Variables (מוגדרות ב-index.css):**
- \`--bg-color\`: רקע עמוד
- \`--surface-color\`: רקע כרטיסים
- \`--text-color\`: צבע טקסט ראשי
- \`--text-secondary\`: צבע טקסט משני
- \`--border-color\`: צבע גבולות
- \`--primary-color\`: #3b82f6 (כחול)

**חוקים:**
1. ✅ השתמש ב-CSS Variables בלבד
2. ✅ כרטיסים: \`border: 2px solid var(--border-color)\`
3. ✅ רקע: \`background: var(--background-color)\`
4. ✅ כפתורים: כחול #2563eb בלבד
5. ❌ **אסור** צבעים קבועים
6. ❌ **אסור** white/black קבועים`,
      examples: [
        '/* ✅ CORRECT - שימוש ב-CSS Variables */',
        '.my-component {',
        '  background: var(--card-background);',
        '  color: var(--text-primary);',
        '  border: 2px solid var(--border-color);',
        '}',
        '',
        '/* ❌ WRONG - צבעים קבועים */',
        '.my-component {',
        '  background: #ffffff;',
        '  color: black;',
        '}'
      ]
    },
    {
      id: 'git-workflow',
      category: 'coding',
      title: 'Git Workflow',
      importance: 'high',
      content: `תרגול Git נכון:

1. **לפני כל שינוי:** git status, git diff
2. **Commit messages:** תיאור ברור בעברית או אנגלית
3. **אחרי deployment מוצלח:** git add, git commit, git push
4. **לא לעשות:** force push, hard reset

כל deployment מוצלח צריך להתועד ב-Git.`,
      examples: [
        'cd /home/noam/projects/ovu/worktrees/sam-work',
        'git status',
        'git add frontend/src/components/NewComponent/',
        'git add backend/app/api/routes/new_route.py',
        'git commit -m "הוספת קומפוננטה חדשה ל-SAM"',
        'git push origin dev'
      ]
    },
    {
      id: 'authentication',
      category: 'security',
      title: 'אימות והרשאות',
      importance: 'critical',
      content: `SAM משתמש באימות JWT דרך ULM.

**Access Token:** חי 15 דקות
**Refresh Token:** חי 7 ימים

**Dependencies:**
- require_auth: משתמש מחובר
- require_admin: ניהול בלבד
- require_superadmin: superadmin בלבד

**Middleware:**
- AuthContextMiddleware: מחלץ user מ-JWT`,
      examples: [
        '@router.get("/admin-only")',
        'async def admin_endpoint(',
        '    current_user: dict = Depends(require_admin)',
        '):',
        '    # Only admins can access',
        '    return {"message": "Admin access"}'
      ]
    },
    {
      id: 'error-handling',
      category: 'coding',
      title: 'Error Handling',
      importance: 'high',
      content: `כל קוד שמבצע פעולות I/O חייב error handling:

**Backend:**
- try-except סביב DB queries
- HTTPException עם status codes נכונים
- הודעות שגיאה מפורטות

**Frontend:**
- try-catch סביב axios calls
- הצגת הודעות שגיאה ידידותיות למשתמש
- טיפול ב-401 (token expired)`,
      examples: [
        '# Backend:',
        'try:',
        '    result = await db.execute(query)',
        'except Exception as e:',
        '    raise HTTPException(status_code=500, detail=str(e))',
        '',
        '# Frontend:',
        'try {',
        '  const response = await axios.get("/api/...");',
        '} catch (error: any) {',
        '  setError(error.response?.data?.detail || "Failed");',
        '}'
      ]
    }
  ];

  const filteredGuidelines = selectedCategory === 'all'
    ? guidelines
    : guidelines.filter(g => g.category === selectedCategory);

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#0d6efd';
      default: return '#6c757d';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'deployment': return '🚀';
      case 'architecture': return '🏗️';
      case 'coding': return '💻';
      case 'database': return '🗄️';
      case 'security': return '🔒';
      case 'testing': return '🧪';
      default: return '📋';
    }
  };

  return (
    <div className={`dev-guidelines ${theme}`} dir={language === 'ar' || language === 'he' ? 'rtl' : 'ltr'}>
      <div className="guidelines-header">
        <h1>📚 {t[language].title}</h1>
        <p className="subtitle">{t[language].subtitle}</p>
      </div>

      <div className="category-filter">
        <button
          className={selectedCategory === 'all' ? 'active' : ''}
          onClick={() => setSelectedCategory('all')}
        >
          {t[language].allCategories}
        </button>
        <button
          className={selectedCategory === 'deployment' ? 'active' : ''}
          onClick={() => setSelectedCategory('deployment')}
        >
          🚀 {t[language].deployment}
        </button>
        <button
          className={selectedCategory === 'architecture' ? 'active' : ''}
          onClick={() => setSelectedCategory('architecture')}
        >
          🏗️ {t[language].architecture}
        </button>
        <button
          className={selectedCategory === 'coding' ? 'active' : ''}
          onClick={() => setSelectedCategory('coding')}
        >
          💻 {t[language].coding}
        </button>
        <button
          className={selectedCategory === 'database' ? 'active' : ''}
          onClick={() => setSelectedCategory('database')}
        >
          🗄️ {t[language].database}
        </button>
        <button
          className={selectedCategory === 'security' ? 'active' : ''}
          onClick={() => setSelectedCategory('security')}
        >
          🔒 {t[language].security}
        </button>
      </div>

      <div className="guidelines-grid">
        {filteredGuidelines.map((guideline) => (
          <div
            key={guideline.id}
            className={`guideline-card ${expandedGuideline === guideline.id ? 'expanded' : ''}`}
            onClick={() => setExpandedGuideline(expandedGuideline === guideline.id ? null : guideline.id)}
          >
            <div className="card-header">
              <div className="header-title">
                <span className="category-icon">{getCategoryIcon(guideline.category)}</span>
                <h3>{guideline.title}</h3>
              </div>
              <span
                className="importance-badge"
                style={{ backgroundColor: getImportanceColor(guideline.importance) }}
              >
                {t[language][guideline.importance as keyof typeof t.he]}
              </span>
            </div>

            <div className="card-content">
              <pre className="guideline-text">{guideline.content}</pre>

              {guideline.examples && guideline.examples.length > 0 && (
                <div className="examples-section">
                  <h4>{t[language].examples}:</h4>
                  <div className="code-block">
                    {guideline.examples.map((example, idx) => (
                      <code key={idx}>{example}</code>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {expandedGuideline !== guideline.id && (
              <div className="expand-hint">{t[language].clickToExpand}</div>
            )}
          </div>
        ))}
      </div>

      <div className="guidelines-footer">
        <p>📊 סה"כ {filteredGuidelines.length} הנחיות</p>
        <p>🔄 עדכון אחרון: {new Date().toLocaleDateString('he-IL')}</p>
      </div>
    </div>
  );
};

