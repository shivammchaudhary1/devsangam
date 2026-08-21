import { useCallback, useEffect, useMemo, type ReactNode } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getCurrentUser, logoutUser } from '../api/auth.api';

import {
  AUTH_EXPIRED_EVENT,
  AUTH_QUERY_KEY,
} from '../constants/auth.constants';

import type { AuthUser } from '../types/auth.types';

import { AuthContext } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  const currentUserQuery = useQuery({
    queryKey: AUTH_QUERY_KEY,

    queryFn: getCurrentUser,

    retry: false,

    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    function handleExpiredAuth() {
      queryClient.setQueryData<AuthUser | null>(AUTH_QUERY_KEY, null);
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpiredAuth);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpiredAuth);
    };
  }, [queryClient]);

  const setUser = useCallback(
    (user: AuthUser) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
    [queryClient]
  );

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
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
