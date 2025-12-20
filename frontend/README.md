# sam - Frontend

React + TypeScript + Vite frontend application with OVU authentication and design system.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3005`

## 📁 Project Structure

```
src/
├── api/              # API client and auth
│   ├── apiClient.ts  # Axios instance with interceptors
│   └── auth.ts       # Auth API wrappers
│
├── contexts/         # React contexts
│   ├── AuthContext.tsx    # Authentication state
│   └── ThemeContext.tsx   # Theme & language state
│
├── hooks/            # Custom hooks
│   └── useTranslation.ts  # Translation hook
│
├── localization/     # Translations
│   ├── he.json       # Hebrew
│   ├── en.json       # English
│   └── ar.json       # Arabic
│
├── pages/            # Page components
│   ├── LoginPage.tsx
│   └── Dashboard.tsx
│
├── styles/           # CSS files
│   ├── base.css      # Resets, scrollbar
│   ├── theme.css     # CSS variables
│   ├── app.css       # App-specific styles
│   └── index.css     # Main import
│
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## 🎨 Customization

### Change App Color

Edit `src/styles/theme.css`:

```css
:root {
  --app-primary: #YOUR_COLOR;
  --app-primary-hover: #YOUR_HOVER_COLOR;
}
```

### Add New Route

1. Create component in `src/pages/`
2. Add route in `src/App.tsx`:

```tsx
<Route path="/mypage" element={<MyPage />} />
```

### Add Translation

Edit `src/localization/he.json`, `en.json`, `ar.json`:

```json
{
  "mySection": {
    "title": "כותרת שלי"
  }
}
```

Use in component:

```tsx
const { t } = useTranslation();
return <h1>{t('mySection.title')}</h1>;
```

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## 🔐 Authentication

Authentication is handled automatically:

- **Login:** Use `LoginPage` component
- **Protected Routes:** Wrap in `AuthProvider`
- **Check Auth:** Use `useAuth()` hook

```tsx
const { user, isAuthenticated, login, logout } = useAuth();
```

## 🌍 Internationalization

Supports 3 languages: Hebrew (he), English (en), Arabic (ar)

```tsx
const { t, language } = useTranslation();
const { setLanguage } = useTheme();

// Use translation
<h1>{t('app.name')}</h1>

// Change language
setLanguage('en');
```

## 🎭 Theming

Light/Dark theme support:

```tsx
const { theme, toggleTheme } = useTheme();

// Toggle theme
<button onClick={toggleTheme}>Toggle</button>
```

## 📡 API Calls

Use the configured API client:

```tsx
import api from './api/apiClient';

// GET request
const response = await api.get('/api/v1/users');

// POST request
const response = await api.post('/api/v1/users', { name: 'John' });

// Tokens and X-App-Source header are added automatically!
```

## 🚨 Troubleshooting

### npm install fails

```bash
# Clear cache and retry
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Port already in use

Change port in `.env`:

```bash
VITE_PORT=3001
```

### Can't connect to backend

1. Check backend is running
2. Verify `VITE_API_BASE_URL` in `.env`
3. Check CORS settings in backend

## 📝 Notes

- All environment variables must start with `VITE_`
- Changes to `.env` require server restart
- Don't put sensitive data in `.env` (it's embedded in build)

## 🔗 Related

- Backend: `../backend/README.md`
- Main README: `../README.md`

---

**Built with ❤️ using OVU Template**

