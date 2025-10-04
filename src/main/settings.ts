import Store from 'electron-store';
import path from 'path';
import { app } from 'electron';
import { AppSettings } from './types';
import fs from 'fs';

const store = new Store<AppSettings>({
  name: 'settings',
  defaults: {
    defaultBitrateKbps: 128,
  },
});

const rawStore = store as unknown as {
  get<K extends keyof AppSettings>(key: K): AppSettings[K];
  set<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void;
  delete<K extends keyof AppSettings>(key: K): void;
};

export const getSettings = (): AppSettings => {
  return {
    ffmpegPath: rawStore.get('ffmpegPath'),
    ffprobePath: rawStore.get('ffprobePath'),
    defaultBitrateKbps: rawStore.get('defaultBitrateKbps'),
    defaultOutputDir: rawStore.get('defaultOutputDir'),
  };
};

export const setSettings = (partial: Partial<AppSettings>): void => {
  for (const [key, value] of Object.entries(partial)) {
    const typedKey = key as keyof AppSettings;
    if (value === undefined) {
      rawStore.delete(typedKey);
    } else {
      rawStore.set(typedKey, value as AppSettings[typeof typedKey]);
    }
  }
};

const candidates = ['ffmpeg', 'ffprobe'];

type Tool = (typeof candidates)[number];

const resolveFromPath = (tool: Tool): string | undefined => {
  const envPath = process.env.PATH || '';
  const paths = envPath.split(path.delimiter);
  for (const dir of paths) {
    const full = path.join(dir, tool);
    if (fs.existsSync(full)) {
      return full;
    }
    if (process.platform === 'win32') {
      const exe = `${full}.exe`;
      if (fs.existsSync(exe)) {
        return exe;
      }
    }
  }
  return undefined;
};

export const resolveBinary = (tool: 'ffmpeg' | 'ffprobe'): string | undefined => {
  const settings = getSettings();
  const configured = tool === 'ffmpeg' ? settings.ffmpegPath : settings.ffprobePath;
  if (configured && fs.existsSync(configured)) {
    return configured;
  }
  const detected = resolveFromPath(tool);
  if (detected) {
    return detected;
  }
  const packaged = path.join(process.resourcesPath, tool);
  if (fs.existsSync(packaged)) {
    return packaged;
  }
  return undefined;
};

export const getDefaultTempDir = (): string => {
  const base = app.getPath('temp');
  return path.join(base, 'audiopie');
};
