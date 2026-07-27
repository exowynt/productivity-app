import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  saveData: (data: unknown) => ipcRenderer.invoke('save-data', data),
  loadData: () => ipcRenderer.invoke('load-data'),
  showNotification: (title: string, body: string) => ipcRenderer.invoke('show-notification', title, body),
});