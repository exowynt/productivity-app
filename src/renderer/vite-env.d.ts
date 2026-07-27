/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    saveData: (data: unknown) => Promise<void>;
    loadData: () => Promise<unknown>;
    showNotification: (title: string, body: string) => Promise<void>;
  };
}