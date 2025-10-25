import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { app, BrowserWindow, Menu, nativeImage } from 'electron';
import { registerIpcHandlers } from './ipc';
import { initializeBinaries } from './settings';

const isDev = !app.isPackaged;

const createWindow = async () => {
  const preloadPath = path.join(__dirname, '..', 'preload', 'preload.js');
  
  // Проверяем наличие иконки
  const iconPath = path.join(app.getAppPath(), 'assets', 'icon.png');
  const icon = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : undefined;
  
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

  registerIpcHandlers(mainWindow);

  // In dev mode, load from Vite dev server
  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    await mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    const htmlPath = path.join(__dirname, '..', 'renderer', 'index.html');
    await mainWindow.loadFile(htmlPath);
  }

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  const template = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { role: 'quit' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: () => {
            mainWindow.webContents.send('app/openHelp');
          },
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(template);
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
  
  // Автоматически инициализируем пути к FFmpeg и FFprobe
  initializeBinaries();
  
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
