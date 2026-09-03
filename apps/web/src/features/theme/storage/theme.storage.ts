import type { ResolvedTheme, ThemePreference } from '../types/theme.types';

export const THEME_STORAGE_KEY = 'devsangam.theme';

const THEME_VALUES = new Set<ThemePreference>(['dark', 'light', 'system']);

export function readThemePreference(): ThemePreference {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (value && THEME_VALUES.has(value as ThemePreference)) {
      return value as ThemePreference;
    }
  } catch {
    // Local storage can be unavailable.
  }

  return 'dark';
}

export function writeThemePreference(theme: ThemePreference) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Theme still works for the current session.
  }
}

export function resolveThemePreference(
  preference: ThemePreference
): ResolvedTheme {
  if (preference !== 'system') {
    return preference;
  }

  if (typeof window === 'undefined') {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}
