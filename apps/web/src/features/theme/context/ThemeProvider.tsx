import {
  readThemePreference,
  resolveThemePreference,
  writeThemePreference,
} from '../storage/theme.storage';
import type { ResolvedTheme, ThemePreference } from '../types/theme.types';
import { ThemeContext } from './ThemeContext';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

type ThemeProviderProps = {
  children: ReactNode;
};

const DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

const THEME_COLORS: Record<ResolvedTheme, string> = {
  dark: '#070b11',
  light: '#f7f3eb',
};

function getSystemPrefersDark() {
  if (typeof window === 'undefined') {
    return true;
  }

  return window.matchMedia(DARK_MODE_QUERY).matches;
}

function applyResolvedTheme(theme: ResolvedTheme) {
  const root = document.documentElement;

  root.classList.remove('dark', 'light');
  root.classList.add(theme);

  root.style.colorScheme = theme;

  const themeColor = document.querySelector('meta[name="theme-color"]');

  themeColor?.setAttribute('content', THEME_COLORS[theme]);
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const auth = useAuth();

  const [localPreference, setLocalPreference] =
    useState<ThemePreference>(readThemePreference);

  const [systemPrefersDark, setSystemPrefersDark] =
    useState(getSystemPrefersDark);

  const accountPreference = auth.user?.preferences.theme;

  /*
   * Once authentication is resolved, the
   * account preference is authoritative.
   *
   * Before that, the locally stored value
   * prevents a startup theme flash.
   */
  const preference = accountPreference ?? localPreference;

  const resolvedTheme =
    preference === 'system'
      ? systemPrefersDark
        ? 'dark'
        : 'light'
      : resolveThemePreference(preference);

  /*
   * Mirror the authenticated preference
   * into localStorage without introducing
   * another React state update.
   *
   * This lets index.html use the last-known
   * theme before React starts next time.
   */
  useEffect(() => {
    if (!accountPreference) {
      return;
    }

    writeThemePreference(accountPreference);
  }, [accountPreference]);

  /*
   * Keep the operating-system preference
   * synchronized continuously.
   *
   * State is changed only from the external
   * media-query event callback, which is the
   * intended effect subscription pattern.
   */
  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_MODE_QUERY);

    function handleSystemThemeChange(event: MediaQueryListEvent) {
      setSystemPrefersDark(event.matches);
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, []);

  /*
   * Applying the resolved theme is an
   * external DOM synchronization effect.
   */
  useEffect(() => {
    applyResolvedTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setThemePreference = useCallback((nextPreference: ThemePreference) => {
    writeThemePreference(nextPreference);

    setLocalPreference(nextPreference);
  }, []);

  const value = useMemo(
    () => ({
      preference,
      resolvedTheme,
      setThemePreference,
    }),
    [preference, resolvedTheme, setThemePreference]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
