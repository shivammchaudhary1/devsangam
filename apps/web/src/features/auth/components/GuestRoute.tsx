'use client';

import { useAuth } from '../hooks/useAuth';
import { AuthLoadingScreen } from './AuthLoadingScreen';
import { Navigate } from '@/lib/navigation';

export function GuestRoute({ children }: { children: import('react').ReactNode }) {
  const auth = useAuth();

  if (auth.isLoading) {
    return <AuthLoadingScreen />;
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
