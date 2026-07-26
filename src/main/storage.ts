// src/main/storage.ts
import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { AppData } from '../shared/types';

const STORAGE_FILENAME = 'data.json';

function getStoragePath(): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, STORAGE_FILENAME);
}

export function loadData(): AppData {
  const filePath = getStoragePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as AppData;
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  // Return default empty state
  return {
    focusSessions: [],
    tasks: [],
    notes: [],
    settings: {},
  };
}

export function saveData(data: AppData): void {
  const filePath = getStoragePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving data:', error);
  }
}