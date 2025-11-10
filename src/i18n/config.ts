import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';

// Get initial language from settings or browser
const getInitialLanguage = (): string => {
  // Try to get from localStorage (will be set by settings)
  const saved = localStorage.getItem('audiopie-language');
  if (saved) return saved;
  
  // Fallback to browser language
  const browserLang = navigator.language.split('-')[0];
  return ['en', 'ru'].includes(browserLang) ? browserLang : 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru }
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

