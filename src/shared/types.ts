// src/shared/types.ts

export interface FocusSession {
  id: string;
  startTime: string; // ISO 8601
  endTime?: string;
  duration: number;  // total elapsed seconds
  type: 'pomodoro' | 'custom' | 'break';
  label?: string;    // e.g., "Coding", "Deep Reading", "Math Study"
  completed?: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  order: number;
  createdAt?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet';
  createdAt: string;
}

export interface ReflectionEntry {
  id: string;
  date: string;       // YYYY-MM-DD
  text: string;
  verseRef?: string;  // e.g. "Joshua 1:9"
  createdAt: string;
}

export interface AppData {
  focusSessions: FocusSession[];
  tasks: Task[];
  notes: Note[];
  reflections?: ReflectionEntry[];
  favoriteVerses?: string[]; // verse IDs
  settings: Record<string, unknown>;
}