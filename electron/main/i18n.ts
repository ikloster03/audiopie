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
  
  console.log('[i18n] Initializing with locales path:', localesPath);
  
  try {
    const ruPath = path.join(localesPath, 'ru.json');
    const enPath = path.join(localesPath, 'en.json');
    
    console.log('[i18n] Looking for ru.json at:', ruPath);
    console.log('[i18n] ru.json exists:', fs.existsSync(ruPath));
    console.log('[i18n] Looking for en.json at:', enPath);
    console.log('[i18n] en.json exists:', fs.existsSync(enPath));
    
    if (fs.existsSync(ruPath)) {
      translations['ru'] = JSON.parse(fs.readFileSync(ruPath, 'utf-8'));
      console.log('[i18n] Loaded Russian translations, keys:', Object.keys(translations['ru']));
    } else {
      console.error('[i18n] Russian translations not found at:', ruPath);
    }
    
    if (fs.existsSync(enPath)) {
      translations['en'] = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
      console.log('[i18n] Loaded English translations, keys:', Object.keys(translations['en']));
    } else {
      console.error('[i18n] English translations not found at:', enPath);
    }
    
    // Получаем язык из настроек
    const settings = getSettings();
    currentLanguage = settings.language || 'en';
    
    console.log('[i18n] Initialized with language:', currentLanguage);
    console.log('[i18n] Available languages:', Object.keys(translations));
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
    // Пробуем несколько возможных путей
    const paths = [
      path.join(process.resourcesPath, 'app.asar', 'dist', 'renderer', 'i18n', 'locales'),
      path.join(process.resourcesPath, 'app.asar', 'src', 'i18n', 'locales'),
      path.join(__dirname, '../../src/i18n/locales'),
    ];
    
    for (const testPath of paths) {
      const ruPath = path.join(testPath, 'ru.json');
      if (fs.existsSync(ruPath)) {
        console.log('[i18n] Found locales at:', testPath);
        return testPath;
      }
    }
    
    console.error('[i18n] Could not find locales directory in production');
    return paths[0]; // Fallback
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
          console.warn(`[i18n] Translation key not found: ${key}`);
          return key;
        }
      }
      break;
    }
  }
  
  if (typeof value !== 'string') {
    console.warn(`[i18n] Translation value is not a string for key: ${key}, value:`, value);
    return key;
  }
  
  // Интерполяция параметров
  if (params) {
    const result = value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
      const paramValue = params[paramKey];
      if (paramValue !== undefined && paramValue !== null) {
        return String(paramValue);
      }
      console.warn(`[i18n] Missing parameter "${paramKey}" for key "${key}"`);
      return match;
    });
    return result;
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

