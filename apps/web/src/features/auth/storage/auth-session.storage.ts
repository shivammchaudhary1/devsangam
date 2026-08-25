import type { AuthUser } from '../types/auth.types';

const AUTH_USER_STORAGE_KEY = 'devsangam.auth.cached-user';

export function readCachedAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const value = window.localStorage.getItem(AUTH_USER_STORAGE_KEY);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as AuthUser;
  } catch {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);

    return null;
  }
}

export function writeCachedAuthUser(user: AuthUser) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    /*
     * Local storage may be unavailable,
     * full, or restricted by the browser.
     *
     * Authentication should still continue
     * using the normal server-backed flow.
     */
  }
}

export function clearCachedAuthUser() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  } catch {
    // Nothing else is required.
  }
}
