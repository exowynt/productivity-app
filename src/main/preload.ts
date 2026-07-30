import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // ── Data Persistence ────────────────────────────────────────────────────
  saveData: (data: unknown) => ipcRenderer.invoke('save-data', data),
  loadData: () => ipcRenderer.invoke('load-data'),

  // ── Desktop Notifications ──────────────────────────────────────────────
  showNotification: (title: string, body: string) => ipcRenderer.invoke('show-notification', title, body),

  // ── Website Blocker ────────────────────────────────────────────────────
  checkBlockerAdmin: () => ipcRenderer.invoke('blocker:check-admin'),
  enableBlocking: (sites?: string[]) => ipcRenderer.invoke('blocker:enable', sites),
  disableBlocking: () => ipcRenderer.invoke('blocker:disable'),
  getBlockerStatus: () => ipcRenderer.invoke('blocker:status'),
});