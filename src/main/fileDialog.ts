import { dialog, BrowserWindow } from 'electron';

export const selectTrackFiles = async (win: BrowserWindow): Promise<string[]> => {
  const result = await dialog.showOpenDialog(win, {
    title: 'Select MP3 Tracks',
    filters: [{ name: 'MP3 Audio', extensions: ['mp3'] }],
    properties: ['openFile', 'multiSelections'],
  });
  if (result.canceled) {
    return [];
  }
  return result.filePaths;
};

export const selectCoverFile = async (win: BrowserWindow): Promise<string | undefined> => {
  const result = await dialog.showOpenDialog(win, {
    title: 'Select Cover Image',
    filters: [{ name: 'Cover', extensions: ['jpg', 'jpeg', 'png'] }],
    properties: ['openFile'],
  });
  if (result.canceled || !result.filePaths[0]) {
    return undefined;
  }
  return result.filePaths[0];
};

export const chooseOutputFile = async (win: BrowserWindow, defaultPath?: string): Promise<string | undefined> => {
  const result = await dialog.showSaveDialog(win, {
    title: 'Save Audiobook As',
    defaultPath,
    filters: [{ name: 'M4B Audiobook', extensions: ['m4b'] }],
  });
  if (result.canceled || !result.filePath) {
    return undefined;
  }
  return result.filePath;
};
