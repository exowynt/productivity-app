import { useState, useEffect, useCallback } from 'react';

export type AppDensity = 'calm' | 'compact';

const STORAGE_KEY = 'solitude_app_density';

export function useDensity() {
  const [density, setDensityState] = useState<AppDensity>(() => {
    return (localStorage.getItem(STORAGE_KEY) as AppDensity) || 'calm';
  });

  const applyDensity = useCallback((newDensity: AppDensity) => {
    document.documentElement.setAttribute('data-density', newDensity);
  }, []);

  useEffect(() => {
    applyDensity(density);
  }, [density, applyDensity]);

  const setDensity = useCallback((newDensity: AppDensity) => {
    setDensityState(newDensity);
    localStorage.setItem(STORAGE_KEY, newDensity);
    document.documentElement.setAttribute('data-density', newDensity);
  }, []);

  return { density, setDensity };
}
