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

  // Save data
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

  // --- Focus Session Actions ---
  const addFocusSession = useCallback(
    async (session: FocusSession) => {
      const updatedSessions = [session, ...(data.focusSessions || [])];
      await save({ ...data, focusSessions: updatedSessions });
    },
    [data, save]
  );

  const deleteFocusSession = useCallback(
    async (id: string) => {
      const updatedSessions = (data.focusSessions || []).filter((s) => s.id !== id);
      await save({ ...data, focusSessions: updatedSessions });
    },
    [data, save]
  );

  // --- Task Actions ---
  const addTask = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      const newTask: Task = {
        id: Date.now().toString(),
        text: text.trim(),
        completed: false,
        order: (data.tasks || []).length,
        createdAt: new Date().toISOString(),
      };
      const updatedTasks = [...(data.tasks || []), newTask];
      await save({ ...data, tasks: updatedTasks });
    },
    [data, save]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const updatedTasks = (data.tasks || []).map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      await save({ ...data, tasks: updatedTasks });
    },
    [data, save]
  );

  const deleteTask = useCallback(
    async (id: string) => {
      const updatedTasks = (data.tasks || []).filter((t) => t.id !== id);
      await save({ ...data, tasks: updatedTasks });
    },
    [data, save]
  );

  const moveTask = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      const tasks = [...(data.tasks || [])];
      const index = tasks.findIndex((t) => t.id === id);
      if (index < 0) return;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= tasks.length) return;

      const temp = tasks[index];
      tasks[index] = tasks[targetIndex];
      tasks[targetIndex] = temp;

      const reindexed = tasks.map((t, i) => ({ ...t, order: i }));
      await save({ ...data, tasks: reindexed });
    },
    [data, save]
  );

  const clearCompletedTasks = useCallback(async () => {
    const updatedTasks = (data.tasks || []).filter((t) => !t.completed);
    await save({ ...data, tasks: updatedTasks });
  }, [data, save]);

  // --- Note Actions ---
  const addNote = useCallback(
    async (title: string, content: string, color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet' = 'indigo') => {
      const newNote: Note = {
        id: Date.now().toString(),
        title: title.trim() || 'Untitled Note',
        content: content.trim(),
        pinned: false,
        color,
        createdAt: new Date().toISOString(),
      };
      const updatedNotes = [newNote, ...(data.notes || [])];
      await save({ ...data, notes: updatedNotes });
    },
    [data, save]
  );

  const updateNote = useCallback(
    async (id: string, updates: Partial<Note>) => {
      const updatedNotes = (data.notes || []).map((n) =>
        n.id === id ? { ...n, ...updates } : n
      );
      await save({ ...data, notes: updatedNotes });
    },
    [data, save]
  );

  const togglePinNote = useCallback(
    async (id: string) => {
      const updatedNotes = (data.notes || []).map((n) =>
        n.id === id ? { ...n, pinned: !n.pinned } : n
      );
      await save({ ...data, notes: updatedNotes });
    },
    [data, save]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      const updatedNotes = (data.notes || []).filter((n) => n.id !== id);
      await save({ ...data, notes: updatedNotes });
    },
    [data, save]
  );

  // --- Reflection Journal Actions ---
  const saveReflection = useCallback(
    async (text: string, verseRef?: string) => {
      if (!text.trim()) return;
      const todayStr = new Date().toISOString().split('T')[0];
      const existingIndex = (data.reflections || []).findIndex((r) => r.date === todayStr);

      let updatedReflections: ReflectionEntry[];
      if (existingIndex >= 0) {
        updatedReflections = [...(data.reflections || [])];
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
        updatedReflections = [newEntry, ...(data.reflections || [])];
      }

      await save({ ...data, reflections: updatedReflections });
    },
    [data, save]
  );

  const deleteReflection = useCallback(
    async (id: string) => {
      const updatedReflections = (data.reflections || []).filter((r) => r.id !== id);
      await save({ ...data, reflections: updatedReflections });
    },
    [data, save]
  );

  const toggleFavoriteVerse = useCallback(
    async (verseId: string) => {
      const currentFavs = data.favoriteVerses || [];
      const updatedFavs = currentFavs.includes(verseId)
        ? currentFavs.filter((id) => id !== verseId)
        : [...currentFavs, verseId];

      await save({ ...data, favoriteVerses: updatedFavs });
    },
    [data, save]
  );

  return {
    data,
    loading,
    save,
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