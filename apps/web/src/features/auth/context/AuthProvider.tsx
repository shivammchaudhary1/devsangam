import { getCurrentUser, logoutUser } from '../api/auth.api';
import {
  AUTH_EXPIRED_EVENT,
  AUTH_QUERY_KEY,
} from '../constants/auth.constants';
import {
  clearCachedAuthUser,
  readCachedAuthUser,
  writeCachedAuthUser,
} from '../storage/auth-session.storage';
import type { AuthUser } from '../types/auth.types';
import { AuthContext } from './AuthContext';
import { cleanupPushSubscriptionForLogout } from '@/features/push/services/push-notifications.service';
import { isApiError } from '@/services/api/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useCallback, useEffect, useMemo } from 'react';

interface AuthProviderProps {
  children: ReactNode;
}

async function resolveCurrentUser() {
  const cachedUser = readCachedAuthUser();

  /*
   * When the browser already knows that it is
   * offline, avoid an unnecessary API request.
   *
   * The locally cached user is only used to
   * bootstrap the offline application shell.
   */
  if (typeof navigator !== 'undefined' && !navigator.onLine && cachedUser) {
    return cachedUser;
  }

  try {
    const user = await getCurrentUser();

    /*
     * A successful server response becomes
     * the new last-known authenticated user.
     */
    writeCachedAuthUser(user);

    return user;
  } catch (error) {
    /*
     * apiRequest converts HTTP failures such
     * as 401/403/500 into ApiError instances.
     *
     * Never use stale cached authentication
     * to hide a real server rejection.
     *
     * Raw network failures, however, may use
     * the cached user so the PWA can continue
     * functioning offline.
     */
    if (cachedUser && !isApiError(error)) {
      return cachedUser;
    }

    throw error;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  const currentUserQuery = useQuery({
    queryKey: AUTH_QUERY_KEY,

    queryFn: resolveCurrentUser,

    retry: false,

    /*
     * TanStack Query normally pauses queries
     * when navigator.onLine is false.
     *
     * We need the query function to execute
     * offline so it can read our local user.
     */
    networkMode: 'always',

    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    function handleExpiredAuth() {
      clearCachedAuthUser();

      queryClient.setQueryData<AuthUser | null>(AUTH_QUERY_KEY, null);
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpiredAuth);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpiredAuth);
    };
  }, [queryClient]);

  useEffect(() => {
    function reconcileAuthentication() {
      /*
       * An offline bootstrap may have used the
       * last-known local user.
       *
       * As soon as connectivity returns, force
       * reconciliation with /users/me.
       */
      void queryClient.invalidateQueries({
        queryKey: AUTH_QUERY_KEY,
      });
    }

    window.addEventListener('online', reconcileAuthentication);

    return () => {
      window.removeEventListener('online', reconcileAuthentication);
    };
  }, [queryClient]);

  const setUser = useCallback(
    (user: AuthUser) => {
      writeCachedAuthUser(user);

      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
    [queryClient]
  );

  const logout = useCallback(async () => {
    try {
      await cleanupPushSubscriptionForLogout();
      await logoutUser();
    } finally {
      clearCachedAuthUser();

      queryClient.setQueryData(AUTH_QUERY_KEY, null);

      /*
       * Remove user-specific
       * application data.
       */
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== 'auth',
      });
    }
  }, [queryClient]);

  const user = currentUserQuery.data ?? null;

  const value = useMemo(
    () => ({
      user,

      isAuthenticated: Boolean(user),

      isLoading: currentUserQuery.isPending,

      setUser,

      logout,
    }),
    [user, currentUserQuery.isPending, setUser, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
