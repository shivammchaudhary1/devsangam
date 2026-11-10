'use client';

import { useAuth } from '../hooks/useAuth';
import { AuthLoadingScreen } from './AuthLoadingScreen';
import { Navigate, useLocation } from '@/lib/navigation';

export function ProtectedRoute({ children }: { children: import('react').ReactNode }) {
  const auth = useAuth();

  const location = useLocation();

  if (auth.isLoading) {
    return <AuthLoadingScreen />;
  }

  if (!auth.isAuthenticated) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return children;
}
