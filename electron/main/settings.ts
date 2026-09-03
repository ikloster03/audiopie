import Store from 'electron-store';
import path from 'path';
import os from 'os';
import { app } from 'electron';
import { AppSettings } from './types';
import fs from 'fs';

const store = new Store<AppSettings>({
  name: 'settings',
  defaults: {
    defaultBitrateKbps: 128,
    ffmpegThreads: 1,
    theme: 'light',
    language: 'en',
    sidebarMode: 'expanded',
    autoCheckForUpdates: true,
    lastUpdateCheck: 0,
  },
});

export const getSettings = (): AppSettings => {
  return {
    ffmpegPath: store.get('ffmpegPath'),
    ffprobePath: store.get('ffprobePath'),
    defaultBitrateKbps: store.get('defaultBitrateKbps'),
    defaultOutputDir: store.get('defaultOutputDir'),
    ffmpegThreads: store.get('ffmpegThreads'),
    theme: store.get('theme'),
    language: store.get('language'),
    sidebarMode: store.get('sidebarMode') || 'expanded',
    autoCheckForUpdates: store.get('autoCheckForUpdates'),
    lastUpdateCheck: store.get('lastUpdateCheck'),
  };
};

export const setSettings = (partial: Partial<AppSettings>): void => {
  for (const [key, value] of Object.entries(partial)) {
    const typedKey = key as keyof AppSettings;
    if (value === undefined) {
      store.delete(typedKey);
    } else {
      store.set(typedKey, value as AppSettings[typeof typedKey]);
    }
  }
};

const candidates = ['ffmpeg', 'ffprobe'];

type Tool = (typeof candidates)[number];

const resolveFromPath = (tool: Tool): string | undefined => {
  const envPath = process.env.PATH || '';
  const paths = envPath.split(path.delimiter);
  
  console.log(`[Settings] Searching for ${tool} in PATH (${paths.length} directories)`);
  
  for (const dir of paths) {
    if (!dir || dir.trim() === '') continue;
    
    const full = path.join(dir, tool);
    if (fs.existsSync(full)) {
      console.log(`[Settings] Found ${tool} at: ${full}`);
      return full;
    }
    
    if (process.platform === 'win32') {
      const exe = `${full}.exe`;
      if (fs.existsSync(exe)) {
        console.log(`[Settings] Found ${tool}.exe at: ${exe}`);
        return exe;
      }
    }
  }
  
  console.log(`[Settings] ${tool} not found in PATH`);
  return undefined;
};

export const resolveBinary = (tool: 'ffmpeg' | 'ffprobe'): string | undefined => {
  const settings = getSettings();
  const configured = tool === 'ffmpeg' ? settings.ffmpegPath : settings.ffprobePath;
  
  console.log(`[Settings] Resolving ${tool}...`);
  
  // 1. Check configured path
  if (configured) {
    console.log(`[Settings] Checking configured path: ${configured}`);
    if (fs.existsSync(configured)) {
      console.log(`[Settings] Using configured ${tool}: ${configured}`);
      return configured;
    } else {
      console.log(`[Settings] Configured path does not exist`);
    }
  }
  
  // 2. Check PATH
  const detected = resolveFromPath(tool);
  if (detected) {
    return detected;
  }
  
  // 3. Check packaged resources
  const packaged = path.join(process.resourcesPath, tool);
  console.log(`[Settings] Checking packaged path: ${packaged}`);
  if (fs.existsSync(packaged)) {
    console.log(`[Settings] Found ${tool} in packaged resources`);
    return packaged;
  }
  
  // 4. Check with .exe extension in packaged resources (Windows)
  if (process.platform === 'win32') {
    const packagedExe = `${packaged}.exe`;
    console.log(`[Settings] Checking packaged path with .exe: ${packagedExe}`);
    if (fs.existsSync(packagedExe)) {
      console.log(`[Settings] Found ${tool}.exe in packaged resources`);
      return packagedExe;
    }
  }
  
  console.log(`[Settings] ${tool} not found anywhere`);
  return undefined;
};

export const getDefaultTempDir = (): string => {
  const base = app.getPath('temp');
  return path.join(base, 'audiopie');
};

/**
 * Получить максимальное количество доступных ядер процессора
 */
export const getMaxCpuCores = (): number => {
  return os.cpus().length;
};

/**
 * Автоматически инициализирует пути к FFmpeg и FFprobe при старте приложения
 */
export const initializeBinaries = (): void => {
  const settings = getSettings();
  
  // Автоматически находим и сохраняем путь к FFmpeg
  if (!settings.ffmpegPath) {
    const resolved = resolveBinary('ffmpeg');
    if (resolved) {
      console.log('[Settings] FFmpeg found and configured:', resolved);
      setSettings({ ffmpegPath: resolved });
    } else {
      console.warn('[Settings] FFmpeg not found. Please install FFmpeg or configure the path in Settings.');
    }
  } else {
    console.log('[Settings] FFmpeg already configured:', settings.ffmpegPath);
  }
  
  // Автоматически находим и сохраняем путь к FFprobe
  if (!settings.ffprobePath) {
    const resolved = resolveBinary('ffprobe');
    if (resolved) {
      console.log('[Settings] FFprobe found and configured:', resolved);
      setSettings({ ffprobePath: resolved });
    } else {
      console.warn('[Settings] FFprobe not found. Please install FFmpeg or configure the path in Settings.');
    }
  } else {
    console.log('[Settings] FFprobe already configured:', settings.ffprobePath);
  }
};
