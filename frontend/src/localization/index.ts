/**
 * Localization System
 * Simple i18n implementation with JSON files
 */

import he from './he.json';
import en from './en.json';
import ar from './ar.json';

export type Language = 'he' | 'en' | 'ar';

export const translations = {
  he,
  en,
  ar,
};

/**
 * Get translation by path
 * Example: t('auth.login') => 'התחבר'
 */
export const getTranslation = (
  language: Language,
  path: string,
  params?: Record<string, string>
): string => {
  const keys = path.split('.');
  let value: any = translations[language];

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      console.warn(`Translation not found: ${path} for language: ${language}`);
      return path;
    }
  }

  // Replace parameters if provided
  if (params && typeof value === 'string') {
    return value.replace(/\{(\w+)\}/g, (match, key) => params[key] || match);
  }

  return value;
};

/**
 * Get nested object by path
 * Example: getTranslationObject('menu') => { dashboard: '...', settings: '...' }
 */
export const getTranslationObject = (
  language: Language,
  path: string
): any => {
  const keys = path.split('.');
  let value: any = translations[language];

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      return {};
    }
  }

  return value;
};

