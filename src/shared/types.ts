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
}

export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  createdAt: string;
}

export interface AppData {
  focusSessions: FocusSession[];
  tasks: Task[];
  notes: Note[];
  settings: Record<string, unknown>; // e.g. dailyGoalMinutes, counter, etc.
}