/**
 * Theme Context
 * Manages theme (light/dark) and language (he/en/ar) across the application
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export type Language = 'he' | 'en' | 'ar';

interface ThemeContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [language, setLanguageState] = useState<Language>('he');

  // Load saved preferences on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('sam_theme') as Theme;
    const savedLanguage = localStorage.getItem('sam_language') as Language;

    if (savedTheme) {
      setThemeState(savedTheme);
    }
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Update document attributes when theme or language changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('dir', language === 'he' || language === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language);

    localStorage.setItem('sam_theme', theme);
    localStorage.setItem('sam_language', language);
  }, [theme, language]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const value = {
    theme,
    language,
    toggleTheme,
    setTheme,
    setLanguage,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

