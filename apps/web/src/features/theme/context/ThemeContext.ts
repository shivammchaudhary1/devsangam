import type { ResolvedTheme, ThemePreference } from '../types/theme.types';
import { createContext } from 'react';

export type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setThemePreference: (preference: ThemePreference) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
