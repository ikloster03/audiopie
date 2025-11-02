import fs from 'fs';
import path from 'path';
import { dialog, BrowserWindow } from 'electron';
import { BookMetadata, Chapter, TrackInfo } from './types';

export type ProjectData = {
  tracks: TrackInfo[];
  chapters: Chapter[];
  metadata: BookMetadata;
};

const defaultProject = (): ProjectData => ({
  tracks: [],
  chapters: [],
  metadata: {
    title: 'Untitled Audiobook',
  },
});

let projectData: ProjectData = defaultProject();
let projectPath: string | undefined;

export const getProjectData = (): ProjectData => projectData;

export const setProjectData = (data: ProjectData) => {
  projectData = data;
};

export const getProjectPath = (): string | undefined => projectPath;

export const setProjectPath = (filePath: string | undefined) => {
  projectPath = filePath;
};

export const resetProject = () => {
  projectData = defaultProject();
  projectPath = undefined;
};

export const createNewProject = (): ProjectData => {
  resetProject();
  return projectData;
};

type SerializedProject = ProjectData & {
  version: number;
};

export const saveProjectToFile = async (win: BrowserWindow, targetPath?: string): Promise<void> => {
  let filePath = targetPath || projectPath;
  if (!filePath) {
    const result = await dialog.showSaveDialog(win, {
      title: 'Save AudioPie Project',
      filters: [{ name: 'AudioPie Project', extensions: ['audiopie.json'] }],
    });
    if (result.canceled || !result.filePath) {
      return;
    }
    filePath = result.filePath;
  }
  const payload: SerializedProject = {
    version: 1,
    ...projectData,
  };
  await fs.promises.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf-8');
  projectPath = filePath;
};

export const openProjectFromFile = async (win: BrowserWindow): Promise<void> => {
  const result = await dialog.showOpenDialog(win, {
    title: 'Open AudioPie Project',
    filters: [{ name: 'AudioPie Project', extensions: ['audiopie.json'] }],
    properties: ['openFile'],
  });
  if (result.canceled || !result.filePaths[0]) {
    return;
  }
  const filePath = result.filePaths[0];
  const raw = await fs.promises.readFile(filePath, 'utf-8');
  const parsed = JSON.parse(raw) as SerializedProject;
  projectData = {
    tracks: parsed.tracks || [],
    chapters: parsed.chapters || [],
    metadata: parsed.metadata || { title: 'Untitled Audiobook' },
  };
  projectPath = filePath;
};

export const ensureAbsolutePath = (referencePath: string, filePath: string): string => {
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  return path.resolve(path.dirname(referencePath), filePath);
};
