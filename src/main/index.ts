import { app, BrowserWindow, ipcMain, Notification, Tray, Menu, nativeImage, session } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { loadData, saveData } from './storage';
import { AppData } from '../shared/types';
import { enableSystemBlocker, disableSystemBlocker } from './hostsBlocker';
import { startFocusGuard, stopFocusGuard, setGuardMainWindow } from './focusGuard';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

let activeBlocklist: string[] = [];
let isBlockerActive = false;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 900,
    minHeight: 650,
    title: 'Solitude — Personal Productivity Dashboard',
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
    const icon = nativeImage.createEmpty();
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
          disableSystemBlocker();
          stopFocusGuard();
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

function setupWebsiteBlocker(): void {
  try {
    session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
      if (!isBlockerActive || activeBlocklist.length === 0) {
        callback({ cancel: false });
        return;
      }

      const url = details.url.toLowerCase();
      const shouldBlock = activeBlocklist.some((domain) => url.includes(domain.toLowerCase()));

      if (shouldBlock) {
        console.log(`[Website Shield] Blocked internal request: ${details.url}`);
        callback({ cancel: true });
      } else {
        callback({ cancel: false });
      }
    });
  } catch (err) {
    console.warn('WebRequest blocker error:', err);
  }

  ipcMain.handle('start-website-blocker', (_event, blocklist: string[]) => {
    activeBlocklist = blocklist || [];
    isBlockerActive = true;
    
    // Activate hosts file blocker
    const hostsRes = enableSystemBlocker(activeBlocklist);
    // Activate active browser monitor & local proxy guard
    const guardRes = startFocusGuard(activeBlocklist);

    return {
      success: true,
      active: true,
      count: activeBlocklist.length,
      hostsSuccess: hostsRes.success,
      error: hostsRes.error,
    };
  });

  ipcMain.handle('stop-website-blocker', () => {
    isBlockerActive = false;
    activeBlocklist = [];
    disableSystemBlocker();
    stopFocusGuard();
    return { success: true, active: false, count: 0 };
  });

  ipcMain.handle('get-website-blocker-status', () => {
    return { active: isBlockerActive, count: activeBlocklist.length, list: activeBlocklist };
  });
}

app.whenReady().then(() => {
  ipcMain.handle('load-data', () => loadData());
  ipcMain.handle('save-data', (_event, data: AppData) => saveData(data));
  ipcMain.handle('show-notification', (_event, title: string, body: string) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show();
    }
  });

  setupWebsiteBlocker();
  createWindow();
  setGuardMainWindow(() => mainWindow);
  createTray();
});

app.on('will-quit', () => {
  disableSystemBlocker();
  stopFocusGuard();
});

app.on('window-all-closed', () => {
  disableSystemBlocker();
  stopFocusGuard();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});