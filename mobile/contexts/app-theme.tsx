import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = '@mobile_theme_mode';

export type ThemeMode = 'light' | 'dark';

type AppThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (m: ThemeMode) => void;
  toggleMode: () => void;
  colors: {
    bg: string;
    bgElevated: string;
    card: string;
    border: string;
    text: string;
    textMuted: string;
    textSubtle: string;
    tint: string;
    accent: string;
    success: string;
    danger: string;
    warning: string;
  };
};

const darkColors: AppThemeContextValue['colors'] = {
  bg: '#0b0f19',
  bgElevated: '#0f141f',
  card: '#141b2d',
  border: '#1e293b',
  text: '#ffffff',
  textMuted: '#cbd5e1',
  textSubtle: '#64748b',
  tint: '#3b82f6',
  accent: '#6366f1',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
};

const lightColors: AppThemeContextValue['colors'] = {
  bg: '#f1f5f9',
  bgElevated: '#e2e8f0',
  card: '#ffffff',
  border: '#cbd5e1',
  text: '#0f172a',
  textMuted: '#334155',
  textSubtle: '#64748b',
  tint: '#2563eb',
  accent: '#4f46e5',
  success: '#059669',
  danger: '#dc2626',
  warning: '#d97706',
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark') {
        setModeState(stored);
      }
    });
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<AppThemeContextValue>(() => {
    const isDark = mode === 'dark';
    return {
      mode,
      isDark,
      setMode,
      toggleMode,
      colors: isDark ? darkColors : lightColors,
    };
  }, [mode, setMode, toggleMode]);

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(AppThemeContext);
  if (!ctx) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return ctx;
}
