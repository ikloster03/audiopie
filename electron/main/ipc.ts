import { app, BrowserWindow, ipcMain, type IpcMainInvokeEvent } from 'electron';
import path from 'path';
import { selectTrackFiles, selectCoverFile, chooseOutputFile } from './fileDialog';
import { getProjectData, setProjectData, saveProjectToFile, openProjectFromFile } from './project';
import { probeDuration, buildAudiobook, cancelBuild, isBusy } from './ffmpeg';
import { getSettings, setSettings, getMaxCpuCores } from './settings';
import { AppSettings, BookMetadata, BuildOptions, BuildProgress, Chapter, TrackInfo } from './types';

const sanitizeTitle = (filePath: string): string => {
  return path.basename(filePath).replace(/\.[^/.]+$/, '');
};

const updateTracks = (tracks: TrackInfo[]) => {
  const project = getProjectData();
  setProjectData({ ...project, tracks });
};

const updateMetadata = (metadata: BookMetadata) => {
  const project = getProjectData();
  setProjectData({ ...project, metadata });
};

const updateChapters = (chapters: Chapter[]) => {
  const project = getProjectData();
  setProjectData({ ...project, chapters });
};

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
    const added: TrackInfo[] = [];
    const errors: string[] = [];
    
    for (const filePath of paths) {
      try {
        const durationMs = await probeDuration(filePath);
        added.push({
          path: filePath,
          displayTitle: sanitizeTitle(filePath),
          durationMs,
        });
      } catch (error) {
        errors.push(`${path.basename(filePath)}: ${(error as Error).message}`);
      }
    }
    
    // Report errors if any
    if (errors.length > 0) {
      win.webContents.send('build/onProgress', {
        phase: 'probe',
        message: `Failed to analyze some files:\n${errors.join('\n')}`,
      } satisfies BuildProgress);
    }
    
    if (added.length > 0) {
      const project = getProjectData();
      updateTracks([...project.tracks, ...added]);
    }
    return added;
  });

  ipcMain.handle('tracks/reorder', (_event: IpcMainInvokeEvent, newOrder: number[]) => {
    const project = getProjectData();
    const reordered = newOrder.map((index) => project.tracks[index]).filter(Boolean);
    updateTracks(reordered);
    return undefined;
  });

  ipcMain.handle('tracks/remove', (_event: IpcMainInvokeEvent, indexes: number[]) => {
    const project = getProjectData();
    const remaining = project.tracks.filter((_, index) => !indexes.includes(index));
    updateTracks(remaining);
    return undefined;
  });

  ipcMain.handle('tracks/updateTitle', (_event: IpcMainInvokeEvent, index: number, title: string) => {
    const project = getProjectData();
    if (!project.tracks[index]) {
      return undefined;
    }
    const updated = project.tracks.map((track, idx) => (idx === index ? { ...track, displayTitle: title } : track));
    updateTracks(updated);
    return updated[index];
  });

  ipcMain.handle('metadata/get', () => {
    return getProjectData().metadata;
  });

  ipcMain.handle('metadata/set', (_event: IpcMainInvokeEvent, partial: Partial<BookMetadata>) => {
    const project = getProjectData();
    updateMetadata({ ...project.metadata, ...partial });
    return undefined;
  });

  ipcMain.handle('metadata/selectCover', async () => {
    const coverPath = await selectCoverFile(win);
    if (coverPath) {
      const project = getProjectData();
      updateMetadata({ ...project.metadata, coverPath });
    }
    return coverPath;
  });

  ipcMain.handle('chapters/autoFromTracks', () => {
    const project = getProjectData();
    const chapters = computeChaptersFromTracks(project.tracks);
    updateChapters(chapters);
    return chapters;
  });

  ipcMain.handle('chapters/update', (_event: IpcMainInvokeEvent, chapters: Chapter[]) => {
    updateChapters(chapters);
    return undefined;
  });

  ipcMain.handle('build/start', async (_event: IpcMainInvokeEvent, options: BuildOptions) => {
    if (isBusy()) {
      throw new Error('Another build is already running.');
    }
    const project = getProjectData();
    const { tracks, chapters, metadata } = project;
    if (tracks.length === 0) {
      throw new Error('No tracks available to build.');
    }
    if (!options.outputPath) {
      throw new Error('Output path is required.');
    }
    await buildAudiobook(tracks, chapters.length > 0 ? chapters : computeChaptersFromTracks(tracks), metadata, options, (progress) => {
      win.webContents.send('build/onProgress', progress satisfies BuildProgress);
    });
    return undefined;
  });

  ipcMain.handle('build/cancel', (_event: IpcMainInvokeEvent) => {
    cancelBuild();
    return undefined;
  });

  ipcMain.handle('build/selectOutput', async (_event: IpcMainInvokeEvent, suggestion?: { directory?: string; fileName?: string }) => {
    const defaultPath = suggestion?.directory && suggestion?.fileName
      ? path.join(suggestion.directory, suggestion.fileName)
      : suggestion?.fileName
        ? path.join(app.getPath('documents'), suggestion.fileName)
        : undefined;
    const selected = await chooseOutputFile(win, defaultPath);
    return selected;
  });

  ipcMain.handle('project/save', async (_event: IpcMainInvokeEvent, targetPath?: string) => {
    await saveProjectToFile(win, targetPath);
    return undefined;
  });

  ipcMain.handle('project/open', async () => {
    await openProjectFromFile(win);
    return getProjectData();
  });

  ipcMain.handle('settings/get', (): AppSettings => {
    return getSettings();
  });

  ipcMain.handle('settings/set', async (_event: IpcMainInvokeEvent, partial: Partial<AppSettings>) => {
    setSettings(partial);
    return getSettings();
  });

  ipcMain.handle('settings/getMaxCpuCores', (): number => {
    return getMaxCpuCores();
  });
};
