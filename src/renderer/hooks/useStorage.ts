// src/renderer/hooks/useStorage.ts
import { useState, useEffect, useCallback } from 'react';
import { AppData, FocusSession, Task, Note, ReflectionEntry } from '../../shared/types';

const LOCAL_STORAGE_KEY = 'solitude_app_data_v1';

const EMPTY_DATA: AppData = {
  focusSessions: [],
  tasks: [],
  notes: [],
  reflections: [],
  favoriteVerses: [],
  settings: {
    dailyGoalMinutes: 120,
  },
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
          if (loaded && typeof loaded === 'object') {
            const merged: AppData = {
              ...EMPTY_DATA,
              ...(loaded as Partial<AppData>),
            };
            setData(merged);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Electron IPC unavailable, falling back to LocalStorage:', err);
      }

      // LocalStorage fallback
      try {
        const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localRaw) {
          const parsed = JSON.parse(localRaw);
          setData({
            ...EMPTY_DATA,
            ...parsed,
          });
        }
      } catch (err) {
        console.error('Failed loading from LocalStorage:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Save helper using functional state update to prevent stale closures
  const save = useCallback(async (updater: (prev: AppData) => AppData) => {
    try {
      setData((prevData) => {
        const nextData = updater(prevData);
        if (window.electronAPI) {
          window.electronAPI.saveData(nextData);
        } else {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextData));
        }
        return nextData;
      });
    } catch (err) {
      console.error('Failed to save data:', err);
    }
  }, []);

  // --- Focus Session Actions ---
  const addFocusSession = useCallback(
    async (session: FocusSession) => {
      await save((prev) => ({
        ...prev,
        focusSessions: [session, ...(prev.focusSessions || [])],
      }));
    },
    [save]
  );

  const deleteFocusSession = useCallback(
    async (id: string) => {
      await save((prev) => ({
        ...prev,
        focusSessions: (prev.focusSessions || []).filter((s) => s.id !== id),
      }));
    },
    [save]
  );

  // --- Task Actions ---
  const addTask = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      await save((prev) => {
        const newTask: Task = {
          id: Date.now().toString(),
          text: text.trim(),
          completed: false,
          order: (prev.tasks || []).length,
          createdAt: new Date().toISOString(),
        };
        return { ...prev, tasks: [...(prev.tasks || []), newTask] };
      });
    },
    [save]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      await save((prev) => ({
        ...prev,
        tasks: (prev.tasks || []).map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      }));
    },
    [save]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      await save((prev) => ({
        ...prev,
        tasks: (prev.tasks || []).filter((t) => t.id !== id),
      }));
    },
    [save]
  );

  const moveTask = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      await save((prev) => {
        const tasks = [...(prev.tasks || [])];
        const index = tasks.findIndex((t) => t.id === id);
        if (index < 0) return prev;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= tasks.length) return prev;

        const temp = tasks[index];
        tasks[index] = tasks[targetIndex];
        tasks[targetIndex] = temp;

        const reindexed = tasks.map((t, i) => ({ ...t, order: i }));
        return { ...prev, tasks: reindexed };
      });
    },
    [save]
  );

  const clearCompletedTasks = useCallback(async () => {
    await save((prev) => ({
      ...prev,
      tasks: (prev.tasks || []).filter((t) => !t.completed),
    }));
  }, [save]);

  // --- Note Actions ---
  const addNote = useCallback(
    async (title: string, content: string, color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet' = 'indigo') => {
      await save((prev) => {
        const newNote: Note = {
          id: Date.now().toString(),
          title: title.trim() || 'Untitled Note',
          content: content.trim(),
          pinned: false,
          color,
          createdAt: new Date().toISOString(),
        };
        return { ...prev, notes: [newNote, ...(prev.notes || [])] };
      });
    },
    [save]
  );

  const updateNote = useCallback(
    async (id: string, updates: Partial<Note>) => {
      await save((prev) => ({
        ...prev,
        notes: (prev.notes || []).map((n) => (n.id === id ? { ...n, ...updates } : n)),
      }));
    },
    [save]
  );

  const togglePinNote = useCallback(
    async (id: string) => {
      await save((prev) => ({
        ...prev,
        notes: (prev.notes || []).map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
      }));
    },
    [save]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      await save((prev) => ({
        ...prev,
        notes: (prev.notes || []).filter((n) => n.id !== id),
      }));
    },
    [save]
  );

  // --- Reflection Journal Actions ---
  const saveReflection = useCallback(
    async (text: string, verseRef?: string) => {
      if (!text.trim()) return;
      await save((prev) => {
        const todayStr = new Date().toISOString().split('T')[0];
        const existingIndex = (prev.reflections || []).findIndex((r) => r.date === todayStr);

        let updatedReflections: ReflectionEntry[];
        if (existingIndex >= 0) {
          updatedReflections = [...(prev.reflections || [])];
          updatedReflections[existingIndex] = {
            ...updatedReflections[existingIndex],
            text: text.trim(),
            verseRef: verseRef || updatedReflections[existingIndex].verseRef,
          };
        } else {
          const newEntry: ReflectionEntry = {
            id: Date.now().toString(),
            date: todayStr,
            text: text.trim(),
            verseRef,
            createdAt: new Date().toISOString(),
          };
          updatedReflections = [newEntry, ...(prev.reflections || [])];
        }
        return { ...prev, reflections: updatedReflections };
      });
    },
    [save]
  );

  const deleteReflection = useCallback(
    async (id: string) => {
      await save((prev) => ({
        ...prev,
        reflections: (prev.reflections || []).filter((r) => r.id !== id),
      }));
    },
    [save]
  );

  const toggleFavoriteVerse = useCallback(
    async (verseId: string) => {
      await save((prev) => {
        const currentFavs = prev.favoriteVerses || [];
        const updatedFavs = currentFavs.includes(verseId)
          ? currentFavs.filter((id) => id !== verseId)
          : [...currentFavs, verseId];
        return { ...prev, favoriteVerses: updatedFavs };
      });
    },
    [save]
  );

  return {
    data,
    loading,
    addFocusSession,
    deleteFocusSession,
    addTask,
    toggleTask,
    deleteTask,
    moveTask,
    clearCompletedTasks,
    addNote,
    updateNote,
    togglePinNote,
    deleteNote,
    saveReflection,
    deleteReflection,
    toggleFavoriteVerse,
  };
}