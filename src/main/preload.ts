import { contextBridge, ipcRenderer } from 'electron';

// Expose a safe, limited API to the renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Example: a method to save data (we'll implement IPC later)
  saveData: (data: unknown) => ipcRenderer.invoke('save-data', data),
  loadData: () => ipcRenderer.invoke('load-data'),
  // You can add more methods here as needed
});