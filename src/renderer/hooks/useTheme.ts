import { useState, useEffect, useCallback } from 'react';
import { THEME_PRESETS, getThemePreset, ThemePreset } from '../../shared/themes';

const STORAGE_KEY = 'solitude_active_theme';

export function useTheme() {
  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || 'midnight-slate';
  });

  const activePreset: ThemePreset = getThemePreset(activeThemeId);

  // Apply CSS variables to root element whenever theme changes
  const applyThemeVariables = useCallback((preset: ThemePreset) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', preset.mode);
    root.setAttribute('data-theme-preset', preset.id);

    Object.entries(preset.variables).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }, []);

  useEffect(() => {
    applyThemeVariables(activePreset);
  }, [activePreset, applyThemeVariables]);

  const setTheme = useCallback(
    (themeId: string) => {
      const preset = getThemePreset(themeId);
      setActiveThemeId(preset.id);
      localStorage.setItem(STORAGE_KEY, preset.id);
      applyThemeVariables(preset);
    },
    [applyThemeVariables]
  );

  return {
    activeThemeId,
    activePreset,
    setTheme,
    presets: THEME_PRESETS,
  };
}
