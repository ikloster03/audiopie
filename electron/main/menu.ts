import { app, BrowserWindow, clipboard, dialog, Menu } from 'electron';
import { t } from './i18n';

// Глобальные ссылки для пересоздания меню при смене языка
let mainWindowRef: BrowserWindow | null = null;
let appIcon: Electron.NativeImage | undefined = undefined;
let isDev = false;

/**
 * Инициализировать модуль меню
 */
export const initMenu = (mainWindow: BrowserWindow, icon: Electron.NativeImage | undefined, devMode: boolean) => {
  mainWindowRef = mainWindow;
  appIcon = icon;
  isDev = devMode;
};

/**
 * Показать диалог "О программе"
 */
const showAboutDialog = () => {
  if (!mainWindowRef) return;
  
  const info = [
    `${t('about.version')}: ${app.getVersion()}`,
    `Electron: ${process.versions.electron}`,
    `Node.js: ${process.versions.node}`,
    `Chrome: ${process.versions.chrome}`,
    `V8: ${process.versions.v8}`,
    `${t('about.os')}: ${process.platform} ${process.arch}`,
  ].join('\n');

  const result = dialog.showMessageBoxSync(mainWindowRef, {
    type: 'info',
    title: t('about.title'),
    message: 'AudioPie',
    detail: info,
    buttons: ['OK', t('about.copy')],
    defaultId: 0,
    cancelId: 0,
    ...(appIcon && { icon: appIcon }),
  });

  if (result === 1) {
    clipboard.writeText(info);
  }
};

/**
 * Пересоздать меню приложения (вызывается при смене языка)
 */
export const rebuildMenu = () => {
  if (!mainWindowRef) return;
  
  const isMac = process.platform === 'darwin';
  
  const template = Menu.buildFromTemplate([
    // На macOS первое меню — это меню приложения
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' as const },
        { type: 'separator' as const },
        { role: 'services' as const },
        { type: 'separator' as const },
        { role: 'hide' as const },
        { role: 'hideOthers' as const },
        { role: 'unhide' as const },
        { type: 'separator' as const },
        { role: 'quit' as const },
      ],
    }] : []),
    {
      label: t('menu.file'),
      submenu: [
        { role: isMac ? 'close' as const : 'quit' as const },
      ],
    },
    {
      label: t('menu.edit'),
      submenu: [
        { role: 'undo' as const },
        { role: 'redo' as const },
        { type: 'separator' as const },
        { role: 'cut' as const },
        { role: 'copy' as const },
        { role: 'paste' as const },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' as const },
          { role: 'delete' as const },
          { role: 'selectAll' as const },
        ] : [
          { role: 'delete' as const },
          { type: 'separator' as const },
          { role: 'selectAll' as const },
        ]),
      ],
    },
    {
      label: t('menu.view'),
      submenu: [
        { role: 'reload' },
        ...(isDev ? [{ role: 'toggleDevTools' as const }] : []),
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: t('menu.help'),
      submenu: [
        {
          label: t('menu.learnMore'),
          click: () => {
            mainWindowRef?.webContents.send('app/openHelp');
          },
        },
        { type: 'separator' },
        {
          label: t('about.menuItem'),
          click: showAboutDialog,
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(template);
};

