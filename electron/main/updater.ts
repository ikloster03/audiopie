import { app, BrowserWindow } from 'electron';
import { autoUpdater, type UpdateInfo as ElectronUpdateInfo } from 'electron-updater';
import { getSettings, setSettings } from './settings';
import type { UpdateInfo, UpdateState } from './types';

let mainWindow: BrowserWindow | null = null;
let updateCheckInterval: NodeJS.Timeout | null = null;
let isCheckingForUpdates = false;
let isDownloading = false;
let currentUpdateInfo: UpdateInfo | null = null;

const UPDATE_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const UPDATE_CHECK_DEBOUNCE_MS = 24 * 60 * 60 * 1000; // 24 hours

export const initializeUpdater = (win: BrowserWindow): void => {
  mainWindow = win;

  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  if (!app.isPackaged) {
    console.log('[Updater] Auto-update disabled in development mode');
    return;
  }

  setupUpdateListeners();

  const settings = getSettings();
  if (settings.autoCheckForUpdates !== false) {
    checkForUpdatesOnStartup();
  }

  startPeriodicUpdateChecks();
};

const setupUpdateListeners = (): void => {
  autoUpdater.on('checking-for-update', () => {
    console.log('[Updater] Checking for updates...');
    sendUpdateState({ status: 'checking' });
  });

  autoUpdater.on('update-available', (info) => {
    console.log('[Updater] Update available:', info.version);
    isCheckingForUpdates = false;
    currentUpdateInfo = mapUpdateInfo(info);
    sendUpdateState({
      status: 'available',
      info: currentUpdateInfo,
    });
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('[Updater] No updates available. Current version:', info.version);
    isCheckingForUpdates = false;
    sendUpdateState({ status: 'not-available' });
  });

  autoUpdater.on('download-progress', (progressObj) => {
    console.log(`[Updater] Download progress: ${progressObj.percent.toFixed(2)}%`);
    sendUpdateState({
      status: 'downloading',
      info: currentUpdateInfo ?? undefined,
      progress: {
        bytesPerSecond: progressObj.bytesPerSecond,
        percent: progressObj.percent,
        transferred: progressObj.transferred,
        total: progressObj.total,
      },
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('[Updater] Update downloaded:', info.version);
    isDownloading = false;
    sendUpdateState({
      status: 'downloaded',
      info: mapUpdateInfo(info),
    });
  });

  autoUpdater.on('error', (error) => {
    console.error('[Updater] Error:', error);
    sendUpdateState({
      status: 'error',
      error: error.message,
    });
    isCheckingForUpdates = false;
    isDownloading = false;
  });
};

const mapUpdateInfo = (info: ElectronUpdateInfo): UpdateInfo => ({
  version: info.version,
  releaseDate: info.releaseDate,
  releaseNotes: info.releaseNotes as string | undefined,
  files: info.files?.map((f) => ({
    url: f.url,
    size: f.size ?? 0,
  })) || [],
});

const sendUpdateState = (state: UpdateState): void => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update:stateChanged', state);
  }
};

const checkForUpdatesOnStartup = async (): Promise<void> => {
  const settings = getSettings();
  const now = Date.now();
  const lastCheck = settings.lastUpdateCheck || 0;

  if (now - lastCheck < UPDATE_CHECK_DEBOUNCE_MS) {
    const hoursRemaining = Math.ceil((UPDATE_CHECK_DEBOUNCE_MS - (now - lastCheck)) / (60 * 60 * 1000));
    console.log(`[Updater] Skipping startup check (last checked ${hoursRemaining}h ago)`);
    return;
  }

  setTimeout(() => {
    checkForUpdatesNow();
  }, 10000); // 10 second delay
};

const startPeriodicUpdateChecks = (): void => {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
  }

  updateCheckInterval = setInterval(() => {
    const settings = getSettings();
    if (settings.autoCheckForUpdates !== false) {
      checkForUpdatesNow();
    }
  }, UPDATE_CHECK_INTERVAL_MS);
};

export const stopPeriodicUpdateChecks = (): void => {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
    updateCheckInterval = null;
  }
};

export const checkForUpdatesNow = async (): Promise<void> => {
  if (isCheckingForUpdates) {
    console.log('[Updater] Update check already in progress');
    return;
  }

  if (!app.isPackaged) {
    console.log('[Updater] Cannot check for updates in development mode');
    sendUpdateState({
      status: 'error',
      error: 'Auto-update is disabled in development mode',
    });
    return;
  }

  try {
    isCheckingForUpdates = true;
    setSettings({ lastUpdateCheck: Date.now() });
    await autoUpdater.checkForUpdates();
  } catch (error) {
    console.error('[Updater] Failed to check for updates:', error);
    isCheckingForUpdates = false;
    sendUpdateState({
      status: 'error',
      error: (error as Error).message,
    });
  }
};

export const downloadUpdate = async (): Promise<void> => {
  if (isDownloading) {
    console.log('[Updater] Download already in progress');
    return;
  }

  try {
    isDownloading = true;
    console.log('[Updater] Starting download...');
    
    // Сразу отправляем состояние downloading с сохранением info
    sendUpdateState({
      status: 'downloading',
      info: currentUpdateInfo ?? undefined,
      progress: {
        bytesPerSecond: 0,
        percent: 0,
        transferred: 0,
        total: 0,
      },
    });
    
    await autoUpdater.downloadUpdate();
  } catch (error) {
    console.error('[Updater] Failed to download update:', error);
    isDownloading = false;
    sendUpdateState({
      status: 'error',
      error: (error as Error).message,
    });
  }
};

export const installUpdateAndRestart = (): void => {
  console.log('[Updater] Installing update and restarting...');
  autoUpdater.quitAndInstall(false, true);
};

export const setAutoUpdateEnabled = (enabled: boolean): void => {
  setSettings({ autoCheckForUpdates: enabled });

  if (enabled) {
    startPeriodicUpdateChecks();
  } else {
    stopPeriodicUpdateChecks();
  }
};
