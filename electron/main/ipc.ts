import { app, BrowserWindow, ipcMain, Notification, type IpcMainInvokeEvent } from 'electron';
import path from 'path';
import fs from 'fs';
import { selectTrackFiles, selectCoverFile, chooseOutputFile, selectProjectFile } from './fileDialog';
import {
  addBookToSeries,
  addTracksToActiveBook,
  applyTemplateToActiveBook,
  clearActiveBookCover,
  closeProject,
  createNewProjectAtPath,
  extractBook,
  getBookCount,
  getProjectPath,
  getSnapshot,
  importBookFromFile,
  openProjectFromFile,
  removeBookFromSeries,
  removeTracksFromActiveBook,
  reorderBooks,
  saveProjectToFile,
  setActiveBookCoverFromPath,
  setActiveBookId,
  setActiveBookMetadata,
  setActiveBookTracks,
  setActiveTrackTitle,
  setProjectType,
  showNewProjectSaveDialog,
  updateBookSeriesIndex,
  updateSeriesMetadata,
  type ProjectSnapshot,
} from './project';
import { buildAudiobook, cancelBuild, isBusy, type BuildResult } from './ffmpeg';
import { getSettings, setSettings, getMaxCpuCores } from './settings';
import { AppSettings, BookMetadata, BuildOptions, BuildProgress, Chapter, ChapterReorderResult, ProjectType, SeriesMetadata, TrackInfo } from './types';
import { changeLanguage, t } from './i18n';
import { renameChaptersByTemplate, reorderChaptersAndTracks } from '../../src/lib/chapters';
import { rebuildMenu } from './menu';
import { checkForUpdatesNow, downloadUpdate, installUpdateAndRestart, setAutoUpdateEnabled } from './updater';

const computeChaptersFromTracks = (tracks: TrackInfo[]): Chapter[] => {
  let cursor = 0;
  return tracks.map((track) => {
    const start = cursor;
    const end = cursor + (track.durationMs || 0);
    cursor = end;
    return {
      title: track.displayTitle,
      startMs: start,
      endMs: end,
    };
  });
};

export const registerIpcHandlers = (win: BrowserWindow) => {
  ipcMain.handle('tracks/selectFiles', async () => {
    return selectTrackFiles(win);
  });

  ipcMain.handle('tracks/addFromPaths', async (_event: IpcMainInvokeEvent, paths: string[]): Promise<TrackInfo[]> => {
    const { added, errors } = await addTracksToActiveBook(paths);

    if (errors.length > 0) {
      win.webContents.send('build/onProgress', {
        phase: 'probe',
        message: `Failed to analyze some files:\n${errors.join('\n')}`,
      } satisfies BuildProgress);
    }

    return added;
  });

  ipcMain.handle('tracks/reorder', (_event: IpcMainInvokeEvent, newOrder: number[]) => {
    const { tracks } = getSnapshot();
    const reordered = newOrder.map((index) => tracks[index]).filter(Boolean);
    setActiveBookTracks(reordered);
    return undefined;
  });

  ipcMain.handle('tracks/remove', async (_event: IpcMainInvokeEvent, indexes: number[]) => {
    await removeTracksFromActiveBook(indexes);
    return undefined;
  });

  ipcMain.handle('tracks/updateTitle', (_event: IpcMainInvokeEvent, index: number, title: string) => {
    return setActiveTrackTitle(index, title);
  });

  ipcMain.handle('metadata/get', () => {
    return getSnapshot().metadata;
  });

  ipcMain.handle('metadata/set', (_event: IpcMainInvokeEvent, partial: Partial<BookMetadata>) => {
    const { metadata } = getSnapshot();
    setActiveBookMetadata({ ...metadata, ...partial });
    return undefined;
  });

  ipcMain.handle('metadata/selectCover', async () => {
    const coverSourcePath = await selectCoverFile(win);
    if (!coverSourcePath) {
      return undefined;
    }
    return setActiveBookCoverFromPath(coverSourcePath);
  });

  ipcMain.handle('metadata/getCoverDataUrl', async (_event: IpcMainInvokeEvent, coverPath: string): Promise<string | null> => {
    try {
      if (!coverPath || !fs.existsSync(coverPath)) {
        return null;
      }
      const buffer = await fs.promises.readFile(coverPath);
      const ext = path.extname(coverPath).toLowerCase();
      let mimeType = 'image/jpeg';
      if (ext === '.png') {
        mimeType = 'image/png';
      } else if (ext === '.jpg' || ext === '.jpeg') {
        mimeType = 'image/jpeg';
      }
      return `data:${mimeType};base64,${buffer.toString('base64')}`;
    } catch (error) {
      console.error('Failed to read cover file:', error);
      return null;
    }
  });

  ipcMain.handle('metadata/setCoverFromPath', async (_event: IpcMainInvokeEvent, filePath: string): Promise<string | undefined> => {
    try {
      if (!filePath || !fs.existsSync(filePath)) {
        return undefined;
      }
      const ext = path.extname(filePath).toLowerCase();
      if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
        return undefined;
      }
      return setActiveBookCoverFromPath(filePath);
    } catch (error) {
      console.error('Failed to set cover from path:', error);
      return undefined;
    }
  });

  ipcMain.handle('chapters/autoFromTracks', () => {
    const { tracks } = getSnapshot();
    return computeChaptersFromTracks(tracks);
  });

  ipcMain.handle('chapters/update', (_event: IpcMainInvokeEvent, chapters: Chapter[]) => {
    // Chapters are derived from track order/displayTitle and are never
    // persisted separately — sync any edited chapter titles back onto the
    // corresponding tracks so the derivation stays consistent.
    const { tracks } = getSnapshot();
    const updatedTracks = tracks.map((track, index) =>
      chapters[index] ? { ...track, displayTitle: chapters[index].title } : track,
    );
    setActiveBookTracks(updatedTracks);
    return undefined;
  });

  ipcMain.handle('chapters/reorder', (_event: IpcMainInvokeEvent, newOrder: number[]): ChapterReorderResult => {
    const { tracks } = getSnapshot();
    const chapters = computeChaptersFromTracks(tracks);
    const result = reorderChaptersAndTracks(tracks, chapters, newOrder);
    setActiveBookTracks(result.tracks);
    return result;
  });

  ipcMain.handle('chapters/renameByTemplate', (_event: IpcMainInvokeEvent, template: string): Chapter[] => {
    const { tracks } = getSnapshot();
    const chapters = computeChaptersFromTracks(tracks);
    const renamed = renameChaptersByTemplate(chapters, template ?? '');
    const updatedTracks = tracks.map((track, index) => ({ ...track, displayTitle: renamed[index]?.title ?? track.displayTitle }));
    setActiveBookTracks(updatedTracks);
    return renamed;
  });

  ipcMain.handle('build/start', async (_event: IpcMainInvokeEvent, options: BuildOptions) => {
    if (isBusy()) {
      throw new Error('Another build is already running.');
    }
    const { tracks, metadata } = getSnapshot();
    if (tracks.length === 0) {
      throw new Error('No tracks available to build.');
    }
    if (!options.outputPath) {
      throw new Error('Output path is required.');
    }
    const chapters = computeChaptersFromTracks(tracks);
    const result: BuildResult = await buildAudiobook(tracks, chapters, metadata, options, (progress) => {
      win.webContents.send('build/onProgress', progress satisfies BuildProgress);
    });

    // Показываем системное уведомление о завершении сборки
    const formatDuration = (ms: number): string => {
      const totalSec = Math.round(ms / 1000);
      const minutes = Math.floor(totalSec / 60);
      const seconds = totalSec % 60;
      return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    };

    const formatSize = (bytes: number): string => {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    if (Notification.isSupported()) {
      const notification = new Notification({
        title: t('notification.buildComplete'),
        body: t('notification.buildCompleteBody', {
          title: metadata.title,
          duration: formatDuration(result.durationMs),
          size: formatSize(result.outputSizeBytes),
        }),
        silent: false,
      });
      notification.show();
    }

    return undefined;
  });

  ipcMain.handle('build/cancel', (_event: IpcMainInvokeEvent) => {
    cancelBuild();
    return undefined;
  });

  ipcMain.handle('build/selectOutput', async (_event: IpcMainInvokeEvent, suggestion?: { fileName?: string }) => {
    // Default to the currently open project's own directory (every project has
    // a known path from creation onward), falling back to Documents only in
    // the unlikely case no project path is available yet.
    const projectPath = getProjectPath();
    const directory = projectPath ? path.dirname(projectPath) : app.getPath('documents');
    const defaultPath = suggestion?.fileName ? path.join(directory, suggestion.fileName) : undefined;
    const selected = await chooseOutputFile(win, defaultPath);
    return selected;
  });

  // --- Project lifecycle -----------------------------------------------------------

  ipcMain.handle('project/save', async (_event: IpcMainInvokeEvent, targetPath?: string) => {
    await saveProjectToFile(win, targetPath);
    return undefined;
  });

  ipcMain.handle('project/open', async (): Promise<ProjectSnapshot | undefined> => {
    return openProjectFromFile(win);
  });

  ipcMain.handle('project/new', async (_event: IpcMainInvokeEvent, type: ProjectType): Promise<ProjectSnapshot | undefined> => {
    const savePath = await showNewProjectSaveDialog(win, type);
    if (!savePath) {
      return undefined;
    }
    return createNewProjectAtPath(type, savePath);
  });

  ipcMain.handle('project/newFromTemplate', async (): Promise<BookMetadata | undefined> => {
    const result = await selectProjectFile(win, 'Select Template Project');
    if (!result) {
      return undefined;
    }
    return applyTemplateToActiveBook(result);
  });

  ipcMain.handle('project/close', async () => {
    await closeProject();
    return undefined;
  });

  // --- Series & book management -----------------------------------------------------

  ipcMain.handle('project/setActiveBook', (_event: IpcMainInvokeEvent, bookId: string): ProjectSnapshot => {
    return setActiveBookId(bookId);
  });

  ipcMain.handle('project/addBookToSeries', (): ProjectSnapshot => {
    return addBookToSeries();
  });

  ipcMain.handle('project/removeBookFromSeries', (_event: IpcMainInvokeEvent, bookId: string): ProjectSnapshot => {
    return removeBookFromSeries(bookId);
  });

  ipcMain.handle('project/reorderBooks', (_event: IpcMainInvokeEvent, order: string[]): ProjectSnapshot => {
    return reorderBooks(order);
  });

  ipcMain.handle('project/updateBookSeriesIndex', (_event: IpcMainInvokeEvent, bookId: string, seriesIndex: number | undefined): ProjectSnapshot => {
    return updateBookSeriesIndex(bookId, seriesIndex);
  });

  ipcMain.handle('project/updateSeriesMetadata', (_event: IpcMainInvokeEvent, partial: Partial<SeriesMetadata>): ProjectSnapshot => {
    return updateSeriesMetadata(partial);
  });

  ipcMain.handle('project/importBookFromFile', async (): Promise<ProjectSnapshot | undefined> => {
    const result = await selectProjectFile(win, 'Import Audiobook Into Series');
    if (!result) {
      return undefined;
    }
    return importBookFromFile(result);
  });

  ipcMain.handle('project/extractBook', async (_event: IpcMainInvokeEvent, bookId: string): Promise<boolean> => {
    const savePath = await showNewProjectSaveDialog(win, 'audiobook');
    if (!savePath) {
      return false;
    }
    await extractBook(bookId, savePath);
    return true;
  });

  ipcMain.handle('project/setType', async (_event: IpcMainInvokeEvent, newType: ProjectType): Promise<ProjectSnapshot> => {
    return setProjectType(newType);
  });

  ipcMain.handle('project/getBookCount', (): number => {
    return getBookCount();
  });

  ipcMain.handle('metadata/clearCover', () => {
    clearActiveBookCover();
    return undefined;
  });

  ipcMain.handle('settings/get', (): AppSettings => {
    return getSettings();
  });

  ipcMain.handle('settings/set', async (_event: IpcMainInvokeEvent, partial: Partial<AppSettings>) => {
    setSettings(partial);

    // Если изменился язык, обновляем его в main process и пересоздаём меню
    if (partial.language) {
      changeLanguage(partial.language);
      rebuildMenu();
    }

    return getSettings();
  });

  ipcMain.handle('settings/getMaxCpuCores', (): number => {
    return getMaxCpuCores();
  });

  // Update handlers
  ipcMain.handle('update/checkNow', async (): Promise<void> => {
    await checkForUpdatesNow();
  });

  ipcMain.handle('update/download', async (): Promise<void> => {
    await downloadUpdate();
  });

  ipcMain.handle('update/installAndRestart', (): void => {
    installUpdateAndRestart();
  });

  ipcMain.handle('update/setAutoUpdateEnabled', (_event: IpcMainInvokeEvent, enabled: boolean): void => {
    setAutoUpdateEnabled(enabled);
  });
};
