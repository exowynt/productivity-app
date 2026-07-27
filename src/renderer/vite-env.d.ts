/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    saveData: (data: unknown) => Promise<void>;
    loadData: () => Promise<unknown>;
    showNotification: (title: string, body: string) => Promise<void>;
    startWebsiteBlocker: (blocklist: string[]) => Promise<{ success: boolean; active: boolean; count: number }>;
    stopWebsiteBlocker: () => Promise<{ success: boolean; active: boolean; count: number }>;
    getWebsiteBlockerStatus: () => Promise<{ active: boolean; count: number; list?: string[] }>;
  };
}