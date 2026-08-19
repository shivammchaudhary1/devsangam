import { Navigate, Outlet } from 'react-router';

import { useAuth } from '../hooks/useAuth';

import { AuthLoadingScreen } from './AuthLoadingScreen';

export function GuestRoute() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <AuthLoadingScreen />;
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
