import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuth } from '../hooks/useAuth';

import { AuthLoadingScreen } from './AuthLoadingScreen';

export function ProtectedRoute() {
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

  return <Outlet />;
}
