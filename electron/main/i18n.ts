import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { getSettings } from './settings';

type TranslationObject = Record<string, any>;

let translations: Record<string, TranslationObject> = {};
let currentLanguage: string = 'en';

/**
 * Инициализация i18n для main process
 */
export const initializeI18n = (): void => {
  // Загружаем переводы из JSON файлов
  const localesPath = getLocalesPath();
  
  try {
    const ruPath = path.join(localesPath, 'ru.json');
    const enPath = path.join(localesPath, 'en.json');
    
    if (fs.existsSync(ruPath)) {
      translations['ru'] = JSON.parse(fs.readFileSync(ruPath, 'utf-8'));
    }
    if (fs.existsSync(enPath)) {
      translations['en'] = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
    }
    
    // Получаем язык из настроек
    const settings = getSettings();
    currentLanguage = settings.language || 'en';
    
    console.log('[i18n] Initialized with language:', currentLanguage);
  } catch (error) {
    console.error('[i18n] Failed to load translations:', error);
  }
};

/**
 * Получить путь к папке с переводами
 */
const getLocalesPath = (): string => {
  if (app.isPackaged) {
    // В production режиме, файлы находятся в asar
    return path.join(process.resourcesPath, 'app.asar', 'src', 'i18n', 'locales');
  } else {
    // В dev режиме
    return path.join(__dirname, '../../src/i18n/locales');
  }
};

/**
 * Получить перевод по ключу с поддержкой интерполяции
 */
export const t = (key: string, params?: Record<string, any>): string => {
  const keys = key.split('.');
  let value: any = translations[currentLanguage];
  
  // Пытаемся найти значение по ключу
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Если не найдено, пробуем fallback на английский
      value = translations['en'];
      for (const k2 of keys) {
        if (value && typeof value === 'object' && k2 in value) {
          value = value[k2];
        } else {
          // Если и в английском нет, возвращаем ключ
          return key;
        }
      }
      break;
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // Интерполяция параметров
  if (params) {
    return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      return params[paramKey] !== undefined ? String(params[paramKey]) : match;
    });
  }
  
  return value;
};

/**
 * Изменить текущий язык
 */
export const changeLanguage = (lang: 'en' | 'ru'): void => {
  if (translations[lang]) {
    currentLanguage = lang;
    console.log('[i18n] Language changed to:', lang);
  } else {
    console.warn('[i18n] Language not found:', lang);
  }
};

/**
 * Получить текущий язык
 */
export const getCurrentLanguage = (): string => {
  return currentLanguage;
};

