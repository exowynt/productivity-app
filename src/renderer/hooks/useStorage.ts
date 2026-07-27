// src/renderer/hooks/useStorage.ts
import { useState, useEffect, useCallback } from 'react';
import { AppData, FocusSession, Task, Note } from '../../shared/types';

const LOCAL_STORAGE_KEY = 'solitude_app_data_v1';

const EMPTY_DATA: AppData = {
  focusSessions: [],
  tasks: [],
  notes: [],
  settings: {
    dailyGoalMinutes: 120, // default 2 hours daily study goal
  },
};

export function useStorage() {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  // Load data on mount (Electron IPC primary, LocalStorage fallback)
  useEffect(() => {
    async function fetchData() {
      try {
        if (window.electronAPI) {
          const loaded = await window.electronAPI.loadData();
          if (loaded && typeof loaded === 'object') {
            setData(loaded as AppData);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Electron IPC unavailable, falling back to LocalStorage:', err);
      }

      // Browser LocalStorage fallback
      try {
        const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localRaw) {
          setData(JSON.parse(localRaw) as AppData);
        }
      } catch (err) {
        console.error('Failed loading from LocalStorage:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Save function updating state and storage
  const save = useCallback(async (newData: AppData) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.saveData(newData);
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
      }
      setData(newData);
    } catch (err) {
      console.error('Failed to save data:', err);
    }
  }, []);

  // Helper to add a completed focus session
  const addFocusSession = useCallback(
    async (session: FocusSession) => {
      const updatedSessions = [session, ...(data.focusSessions || [])];
      await save({ ...data, focusSessions: updatedSessions });
    },
    [data, save]
  );

  // Helper to delete a focus session
  const deleteFocusSession = useCallback(
    async (id: string) => {
      const updatedSessions = (data.focusSessions || []).filter((s) => s.id !== id);
      await save({ ...data, focusSessions: updatedSessions });
    },
    [data, save]
  );

  return {
    data,
    loading,
    save,
    addFocusSession,
    deleteFocusSession,
  };
}