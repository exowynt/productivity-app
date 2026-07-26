/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    saveData: (data: unknown) => Promise<void>;
    loadData: () => Promise<unknown>;
    // Add more as you expand
  };
}