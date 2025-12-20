/**
 * i18n Configuration for SAM
 * Multi-language support: Hebrew, English, Arabic
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import heTranslations from './localization/he.json';
import enTranslations from './localization/en.json';
import arTranslations from './localization/ar.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      he: { translation: heTranslations },
      en: { translation: enTranslations },
      ar: { translation: arTranslations },
    },
    lng: 'he', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes
    },
  });

export default i18n;

