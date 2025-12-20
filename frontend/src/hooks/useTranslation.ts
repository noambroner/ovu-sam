/**
 * useTranslation Hook
 * Provides easy access to translations with current language
 */

import { useTheme } from '../contexts/ThemeContext';
import { getTranslation, getTranslationObject, type Language } from '../localization';

export const useTranslation = () => {
  const { language } = useTheme();

  /**
   * Get translation by path
   * @param path - Dot-separated path (e.g., 'auth.login')
   * @param params - Optional parameters for interpolation
   * @returns Translated string
   */
  const t = (path: string, params?: Record<string, string>): string => {
    return getTranslation(language, path, params);
  };

  /**
   * Get translation object by path
   * @param path - Dot-separated path (e.g., 'menu')
   * @returns Translated object
   */
  const tObj = (path: string): any => {
    return getTranslationObject(language, path);
  };

  return {
    t,
    tObj,
    language,
  };
};

