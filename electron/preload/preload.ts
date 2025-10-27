import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import { AppSettings, BookMetadata, BuildOptions, BuildProgress, Chapter, TrackInfo } from '../main/types';

type ProgressListener = (progress: BuildProgress) => void;

const progressListeners = new Set<ProgressListener>();

ipcRenderer.on('build/onProgress', (_event: IpcRendererEvent, progress: BuildProgress) => {
  progressListeners.forEach((listener) => listener(progress));
});

const audioPieAPI = {
  tracks: {
    selectFiles: (): Promise<string[]> => ipcRenderer.invoke('tracks/selectFiles'),
    addFromPaths: (paths: string[]): Promise<TrackInfo[]> => ipcRenderer.invoke('tracks/addFromPaths', paths),
    reorder: (newOrder: number[]): Promise<void> => ipcRenderer.invoke('tracks/reorder', newOrder),
    remove: (indexes: number[]): Promise<void> => ipcRenderer.invoke('tracks/remove', indexes),
    updateTitle: (index: number, title: string): Promise<TrackInfo | undefined> => ipcRenderer.invoke('tracks/updateTitle', index, title),
  },
  metadata: {
    get: (): Promise<BookMetadata> => ipcRenderer.invoke('metadata/get'),
    set: (partial: Partial<BookMetadata>): Promise<void> => ipcRenderer.invoke('metadata/set', partial),
    selectCover: (): Promise<string | undefined> => ipcRenderer.invoke('metadata/selectCover'),
    getCoverDataUrl: (coverPath: string): Promise<string | null> => ipcRenderer.invoke('metadata/getCoverDataUrl', coverPath),
  },
  chapters: {
    autoFromTracks: (): Promise<Chapter[]> => ipcRenderer.invoke('chapters/autoFromTracks'),
    update: (chapters: Chapter[]): Promise<void> => ipcRenderer.invoke('chapters/update', chapters),
  },
  build: {
    start: (options: BuildOptions): Promise<void> => ipcRenderer.invoke('build/start', options),
    cancel: (): Promise<void> => ipcRenderer.invoke('build/cancel'),
    selectOutput: (directory?: string, fileName?: string): Promise<string | undefined> =>
      ipcRenderer.invoke('build/selectOutput', { directory, fileName }),
    onProgress: (listener: ProgressListener) => {
      progressListeners.add(listener);
      return () => {
        progressListeners.delete(listener);
      };
    },
  },
  project: {
    save: (path?: string): Promise<void> => ipcRenderer.invoke('project/save', path),
    open: (): Promise<{ tracks: TrackInfo[]; chapters: Chapter[]; metadata: BookMetadata }> => ipcRenderer.invoke('project/open'),
  },
  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings/get'),
    set: (partial: Partial<AppSettings>): Promise<AppSettings> => ipcRenderer.invoke('settings/set', partial),
    getMaxCpuCores: (): Promise<number> => ipcRenderer.invoke('settings/getMaxCpuCores'),
  },
};

contextBridge.exposeInMainWorld('audioPie', audioPieAPI);

declare global {
  interface Window {
    audioPie: typeof audioPieAPI;
  }
}
