import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import { AppSettings, BookMetadata, BuildOptions, BuildProgress, Chapter, TrackInfo } from '../main/types';

type ProgressListener = (progress: BuildProgress) => void;

const progressListeners = new Set<ProgressListener>();

ipcRenderer.on('build/onProgress', (_event: IpcRendererEvent, progress: BuildProgress) => {
  progressListeners.forEach((listener) => listener(progress));
});

contextBridge.exposeInMainWorld('audioPie', {
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
      return () => progressListeners.delete(listener);
    },
  },
  project: {
    save: (path?: string): Promise<void> => ipcRenderer.invoke('project/save', path),
    open: (): Promise<{ tracks: TrackInfo[]; chapters: Chapter[]; metadata: BookMetadata }> => ipcRenderer.invoke('project/open'),
  },
  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings/get'),
    set: (partial: Partial<AppSettings>): Promise<AppSettings> => ipcRenderer.invoke('settings/set', partial),
  },
});

declare global {
  interface Window {
    audioPie: {
      tracks: {
        selectFiles(): Promise<string[]>;
        addFromPaths(paths: string[]): Promise<TrackInfo[]>;
        reorder(newOrder: number[]): Promise<void>;
        remove(indexes: number[]): Promise<void>;
        updateTitle(index: number, title: string): Promise<TrackInfo | undefined>;
      };
      metadata: {
        get(): Promise<BookMetadata>;
        set(partial: Partial<BookMetadata>): Promise<void>;
        selectCover(): Promise<string | undefined>;
      };
      chapters: {
        autoFromTracks(): Promise<Chapter[]>;
        update(chapters: Chapter[]): Promise<void>;
      };
      build: {
        start(options: BuildOptions): Promise<void>;
        cancel(): Promise<void>;
        selectOutput(directory?: string, fileName?: string): Promise<string | undefined>;
        onProgress(listener: ProgressListener): () => void;
      };
      project: {
        save(path?: string): Promise<void>;
        open(): Promise<{ tracks: TrackInfo[]; chapters: Chapter[]; metadata: BookMetadata }>;
      };
      settings: {
        get(): Promise<AppSettings>;
        set(partial: Partial<AppSettings>): Promise<AppSettings>;
      };
    };
  }
}
