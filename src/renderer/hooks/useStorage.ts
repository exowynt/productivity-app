// src/renderer/hooks/useStorage.ts
import { useState, useEffect, useCallback } from 'react';
import { AppData } from '../../shared/types';

// Default empty data to fall back to
const EMPTY_DATA: AppData = {
  focusSessions: [],
  tasks: [],
  notes: [],
  settings: {},
};

export function useStorage() {
  const [data, setData] = useState<AppData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        if (window.electronAPI) {
          const loaded = await window.electronAPI.loadData();
          setData(loaded as AppData);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Save function that updates both state and disk
  const save = useCallback(async (newData: AppData) => {
    try {
      if (window.electronAPI) {
        await window.electronAPI.saveData(newData);
      }
      setData(newData);
    } catch (err) {
      console.error('Failed to save data:', err);
    }
  }, []);

  // Update partial data (merges with current)
  const update = useCallback(
    async (partial: Partial<AppData>) => {
      const updated = { ...data, ...partial };
      await save(updated);
    },
    [data, save]
  );

  return { data, loading, save, update };
}