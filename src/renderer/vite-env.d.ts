/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    // Data persistence
    saveData: (data: unknown) => Promise<void>;
    loadData: () => Promise<unknown>;

    // Desktop notifications
    showNotification: (title: string, body: string) => Promise<void>;

    // Website blocker
    checkBlockerAdmin: () => Promise<{ isAdmin: boolean; error?: string }>;
    enableBlocking: (sites?: string[]) => Promise<{ success: boolean; error?: string; log: string[] }>;
    disableBlocking: () => Promise<{ success: boolean; error?: string; log: string[] }>;
    getBlockerStatus: () => Promise<boolean>;
  };
}