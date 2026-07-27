import { useGlobalStorage } from '../context/StorageContext';

export function useStorage() {
  return useGlobalStorage();
}