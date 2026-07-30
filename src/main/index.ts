import { app, BrowserWindow, ipcMain, Notification, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { loadData, saveData } from './storage';
import { WebsiteBlocker } from './websiteBlocker';
import { AppData } from '../shared/types';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// Singleton WebsiteBlocker service — instantiated at app ready
let blocker: WebsiteBlocker | null = null;

function getIconPath(): string {
  const appPath = app.getAppPath();
  const candidates = [
    path.join(appPath, 'build/icon.png'),
    path.join(__dirname, '../../build/icon.png'),
    path.join(__dirname, '../build/icon.png'),
  ];
  return candidates.find((p) => fs.existsSync(p)) || '';
}

function createWindow(): void {
  const iconPath = getIconPath();

  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 900,
    minHeight: 650,
    title: 'Solitude — Personal Productivity Dashboard',
    icon: iconPath || undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    const appPath = app.getAppPath();
    const possiblePaths = [
      path.join(appPath, 'dist/renderer/index.html'),
      path.join(__dirname, '../renderer/index.html'),
      path.join(__dirname, '../../renderer/index.html'),
    ];

    const targetPath = possiblePaths.find((p) => fs.existsSync(p)) || possiblePaths[0];
    mainWindow.loadFile(targetPath);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createTray(): void {
  try {
    const iconPath = getIconPath();
    const icon = iconPath ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty();
    tray = new Tray(icon);
    tray.setToolTip('Solitude — Personal Productivity Hub');

    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Dashboard',
        click: () => {
          if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
          } else {
            createWindow();
          }
        },
      },
      { type: 'separator' },
      {
        label: 'Quit Solitude',
        click: () => {
          app.quit();
        },
      },
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => {
      mainWindow?.show();
    });
  } catch (err) {
    console.warn('Tray creation skipped:', err);
  }
}

app.whenReady().then(() => {
  // ── Initialize WebsiteBlocker & run crash recovery ──────────────────────
  blocker = new WebsiteBlocker();
  blocker.recoverIfNeeded();

  // ── Data Persistence IPC ────────────────────────────────────────────────
  ipcMain.handle('load-data', () => loadData());
  ipcMain.handle('save-data', (_event, data: AppData) => saveData(data));

  // ── Desktop Notification IPC ────────────────────────────────────────────
  ipcMain.handle('show-notification', (_event, title: string, body: string) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show();
    }
  });

  // ── Website Blocker IPC ─────────────────────────────────────────────────
  ipcMain.handle('blocker:check-admin', () => {
    return blocker!.verifyAdminPrivileges();
  });

  ipcMain.handle('blocker:enable', (_event, sites?: string[]) => {
    return blocker!.enableBlocking(sites);
  });

  ipcMain.handle('blocker:disable', () => {
    return blocker!.disableBlocking();
  });

  ipcMain.handle('blocker:status', () => {
    return blocker!.isBlockingActive();
  });

  createWindow();
  createTray();
});

// ── Graceful Quit: disable blocking before exit ─────────────────────────────
app.on('before-quit', () => {
  if (blocker && blocker.isBlockingActive()) {
    console.log('[WebsiteBlocker] App quitting — disabling website blocking...');
    blocker.disableBlocking();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});