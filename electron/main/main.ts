import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { app, BrowserWindow, nativeImage } from 'electron';
import { registerIpcHandlers } from './ipc';
import { initializeBinaries } from './settings';
import { initializeFFmpeg } from './ffmpeg';
import { initializeI18n } from './i18n';
import { initMenu, rebuildMenu } from './menu';
import { initializeUpdater, stopPeriodicUpdateChecks } from './updater';

const isDev = !app.isPackaged;

// Устанавливаем имя приложения (важно для macOS dock в dev режиме)
app.setName('AudioPie');

console.log('Electron version:', process.versions.electron);
console.log('Node version:', process.versions.node);
console.log('Chrome version:', process.versions.chrome);
console.log('V8 version:', process.versions.v8);
console.log('OS:', process.platform);
console.log('Arch:', process.arch);
console.log('App path:', app.getAppPath());
console.log('Is packaged:', app.isPackaged);
console.log('Is dev:', isDev);

const createWindow = async () => {
  const preloadPath = path.join(__dirname, '../preload/preload.js');
  
  // Проверяем наличие иконки (ICO для Windows, PNG для macOS/Linux)
  const iconName = process.platform === 'win32' ? 'audiopie.ico' : 'audiopie.png';
  const iconPath = isDev 
    ? path.join(__dirname, '../../assets', iconName)  // В dev: dist-electron/main -> корень проекта
    : path.join(process.resourcesPath, iconName);
  
  console.log('Icon path:', iconPath, 'exists:', fs.existsSync(iconPath));
  const icon = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : undefined;
  
  // На macOS устанавливаем иконку в dock
  if (process.platform === 'darwin' && icon && app.dock) {
    app.dock.setIcon(icon);
  }
  
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'AudioPie',
    ...(icon && { icon }),
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Инициализируем модуль меню
  initMenu(mainWindow, icon, isDev);

  registerIpcHandlers(mainWindow);

  // Initialize auto-updater
  initializeUpdater(mainWindow);

  // In dev mode, load from Vite dev server
  if (isDev) {
    const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
    await mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // В production index.html находится в dist/index.html относительно корня приложения
    const htmlPath = path.join(app.getAppPath(), 'dist', 'index.html');
    await mainWindow.loadFile(htmlPath);
  }

  if (isDev) {
    console.log('Opening dev tools');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  rebuildMenu();
};

app.whenReady().then(async () => {
  if (isDev) {
    process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';
  }
  
  // На Windows убедимся, что PATH содержит пользовательские переменные
  if (process.platform === 'win32') {
    try {
      const userPath = execSync('powershell -Command "[Environment]::GetEnvironmentVariable(\'Path\', \'User\')"', { 
        encoding: 'utf8',
        timeout: 5000 
      }).trim();
      
      if (userPath && !process.env.PATH?.includes(userPath)) {
        process.env.PATH = `${process.env.PATH};${userPath}`;
        console.log('[Main] Updated PATH with user environment variables');
      }
    } catch (error) {
      console.warn('[Main] Failed to update PATH from user environment:', error);
    }
  }
  
  // Инициализируем i18n для main process
  initializeI18n();
  
  // Автоматически инициализируем пути к FFmpeg и FFprobe (сохраняем в настройки)
  initializeBinaries();
  
  // Инициализируем FFmpeg (теперь с правильными путями из настроек)
  initializeFFmpeg();
  
  await createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopPeriodicUpdateChecks();
});
