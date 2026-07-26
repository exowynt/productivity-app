import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { loadData, saveData } from './storage';
import { AppData } from '../shared/types';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,   // security: separate renderer from Node
      nodeIntegration: false,   // keep renderer sandboxed
    },
    show: false,                // prevent white flash
  });

  // Determine the correct URL to load
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    // In production, load the built index.html
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show window once content is ready to avoid visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Start the app when Electron is ready
app.whenReady().then(() => {
  // IPC handlers
  ipcMain.handle('load-data', () => loadData());
  ipcMain.handle('save-data', (_event, data: AppData) => saveData(data));
  
  createWindow();
});
app.whenReady().then(createWindow);

// IPC Handlers for data persistence
ipcMain.handle('load-data', () => {
  return loadData();
});

ipcMain.handle('save-data', (_event, data: AppData) => {
  saveData(data);
});

// Quit when all windows are closed (Windows/Linux)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});