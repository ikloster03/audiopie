import fs from 'fs';
import path from 'path';
import { app, BrowserWindow, Menu, nativeImage } from 'electron';
import { registerIpcHandlers } from './ipc';

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

const createWindow = async () => {
  const preloadPath = path.join(__dirname, '..', 'preload', 'preload.js');
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'AudioPie',
    icon: nativeImage.createFromPath(path.join(app.getAppPath(), 'assets', 'icon.png')),
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  registerIpcHandlers(mainWindow);

  const distHtml = path.join(__dirname, '..', 'renderer', 'index.html');
  const srcHtml = path.join(app.getAppPath(), 'src', 'renderer', 'index.html');
  const htmlPath = fs.existsSync(distHtml) ? distHtml : srcHtml;
  await mainWindow.loadFile(htmlPath);

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
