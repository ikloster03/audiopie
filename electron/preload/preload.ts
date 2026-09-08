import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';
import {
  AppSettings,
  BookMetadata,
  BuildOptions,
  BuildProgress,
  Chapter,
  ChapterReorderResult,
  ProjectType,
  SeriesMetadata,
  TrackInfo,
  UpdateState,
} from '../main/types';

export type ProjectSnapshot = {
  type: ProjectType;
  series: SeriesMetadata | null;
  bookOrder: string[];
  activeBookId: string | undefined;
  books: Array<{ id: string; metadata: BookMetadata }>;
  tracks: TrackInfo[];
  chapters: Chapter[];
  metadata: BookMetadata;
};

type ProgressListener = (progress: BuildProgress) => void;
type UpdateListener = (state: UpdateState) => void;

const progressListeners = new Set<ProgressListener>();
const updateListeners = new Set<UpdateListener>();

ipcRenderer.on('build/onProgress', (_event: IpcRendererEvent, progress: BuildProgress) => {
  progressListeners.forEach((listener) => listener(progress));
});

ipcRenderer.on('update:stateChanged', (_event: IpcRendererEvent, state: UpdateState) => {
  updateListeners.forEach((listener) => listener(state));
});

contextBridge.exposeInMainWorld('electronAPI', {
  // Функция для отправки данных файла в главный процесс
  sendFileToMain: (fileData: any) => ipcRenderer.invoke('send-file-to-main', fileData),
  // Получение данных из главного процесса (если нужно)
  onFileFromMain: (callback: (event: IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.on('file-from-main', callback),
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
    setCoverFromPath: (filePath: string): Promise<string | undefined> => ipcRenderer.invoke('metadata/setCoverFromPath', filePath),
    clearCover: (): Promise<void> => ipcRenderer.invoke('metadata/clearCover'),
  },
  chapters: {
    autoFromTracks: (): Promise<Chapter[]> => ipcRenderer.invoke('chapters/autoFromTracks'),
    update: (chapters: Chapter[]): Promise<void> => ipcRenderer.invoke('chapters/update', chapters),
    reorder: (newOrder: number[]): Promise<ChapterReorderResult> => ipcRenderer.invoke('chapters/reorder', newOrder),
    renameByTemplate: (template: string): Promise<Chapter[]> => ipcRenderer.invoke('chapters/renameByTemplate', template),
  },
  build: {
    start: (options: BuildOptions): Promise<void> => ipcRenderer.invoke('build/start', options),
    cancel: (): Promise<void> => ipcRenderer.invoke('build/cancel'),
    selectOutput: (fileName?: string): Promise<string | undefined> =>
      ipcRenderer.invoke('build/selectOutput', { fileName }),
    onProgress: (listener: ProgressListener) => {
      progressListeners.add(listener);
      return () => {
        progressListeners.delete(listener);
      };
    },
  },
  project: {
    save: (path?: string): Promise<void> => ipcRenderer.invoke('project/save', path),
    open: (): Promise<ProjectSnapshot | undefined> => ipcRenderer.invoke('project/open'),
    new: (type: ProjectType): Promise<ProjectSnapshot | undefined> => ipcRenderer.invoke('project/new', type),
    newFromTemplate: (): Promise<BookMetadata | undefined> => ipcRenderer.invoke('project/newFromTemplate'),
    close: (): Promise<void> => ipcRenderer.invoke('project/close'),
    setActiveBook: (bookId: string): Promise<ProjectSnapshot> => ipcRenderer.invoke('project/setActiveBook', bookId),
    addBookToSeries: (): Promise<ProjectSnapshot> => ipcRenderer.invoke('project/addBookToSeries'),
    removeBookFromSeries: (bookId: string): Promise<ProjectSnapshot> => ipcRenderer.invoke('project/removeBookFromSeries', bookId),
    reorderBooks: (order: string[]): Promise<ProjectSnapshot> => ipcRenderer.invoke('project/reorderBooks', order),
    updateBookSeriesIndex: (bookId: string, seriesIndex: number | undefined): Promise<ProjectSnapshot> =>
      ipcRenderer.invoke('project/updateBookSeriesIndex', bookId, seriesIndex),
    updateSeriesMetadata: (partial: Partial<SeriesMetadata>): Promise<ProjectSnapshot> =>
      ipcRenderer.invoke('project/updateSeriesMetadata', partial),
    importBookFromFile: (): Promise<ProjectSnapshot | undefined> => ipcRenderer.invoke('project/importBookFromFile'),
    extractBook: (bookId: string): Promise<boolean> => ipcRenderer.invoke('project/extractBook', bookId),
    setType: (newType: ProjectType): Promise<ProjectSnapshot> => ipcRenderer.invoke('project/setType', newType),
    getBookCount: (): Promise<number> => ipcRenderer.invoke('project/getBookCount'),
  },
  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings/get'),
    set: (partial: Partial<AppSettings>): Promise<AppSettings> => ipcRenderer.invoke('settings/set', partial),
    getMaxCpuCores: (): Promise<number> => ipcRenderer.invoke('settings/getMaxCpuCores'),
  },
  update: {
    checkNow: (): Promise<void> => ipcRenderer.invoke('update/checkNow'),
    download: (): Promise<void> => ipcRenderer.invoke('update/download'),
    installAndRestart: (): Promise<void> => ipcRenderer.invoke('update/installAndRestart'),
    setAutoUpdateEnabled: (enabled: boolean): Promise<void> =>
      ipcRenderer.invoke('update/setAutoUpdateEnabled', enabled),
    onStateChanged: (listener: UpdateListener) => {
      updateListeners.add(listener);
      return () => {
        updateListeners.delete(listener);
      };
    },
  },
};

contextBridge.exposeInMainWorld('audioPie', audioPieAPI);

declare global {
  interface Window {
    audioPie: typeof audioPieAPI;
  }
}
