import { APP_ROUTES } from '@/app/constants/routes.constants';
import { PwaUpdateManager } from '@/components/pwa/PwaUpdateManager';
import { RouteLoadingFallback } from '@/components/shared/RouteLoadingFallback';
import { GuestRoute } from '@/features/auth/components/GuestRoute';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { PushSubscriptionManager } from '@/features/push/components/PushSubscriptionManager';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const AppShell = lazy(() =>
  import('@/components/layout/AppShell').then((module) => ({
    default: module.AppShell,
  }))
);

const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((module) => ({
    default: module.DashboardPage,
  }))
);

const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((module) => ({
    default: module.LoginPage,
  }))
);

const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((module) => ({
    default: module.RegisterPage,
  }))
);

const ForgotPasswordPage = lazy(() =>
  import('@/features/auth/pages/ForgotPasswordPage').then((module) => ({
    default: module.ForgotPasswordPage,
  }))
);

const ResetPasswordPage = lazy(() =>
  import('@/features/auth/pages/ResetPasswordPage').then((module) => ({
    default: module.ResetPasswordPage,
  }))
);

const MantraLibraryPage = lazy(() =>
  import('@/features/mantras/pages/MantraLibraryPage').then((module) => ({
    default: module.MantraLibraryPage,
  }))
);

const MantraDetailPage = lazy(() =>
  import('@/features/mantras/pages/MantraDetailPage').then((module) => ({
    default: module.MantraDetailPage,
  }))
);

const PracticeSetupPage = lazy(() =>
  import('@/features/practice/pages/PracticeSetupPage').then((module) => ({
    default: module.PracticeSetupPage,
  }))
);

const PracticeSessionPage = lazy(() =>
  import('@/features/practice/pages/PracticeSessionPage').then((module) => ({
    default: module.PracticeSessionPage,
  }))
);

const ProfilePage = lazy(() =>
  import('@/features/profile/pages/ProfilePage').then((module) => ({
    default: module.ProfilePage,
  }))
);

const SettingsPage = lazy(() =>
  import('@/features/settings/pages/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  }))
);

const InsightsPage = lazy(() =>
  import('@/features/insights/pages/InsightsPage').then((module) => ({
    default: module.InsightsPage,
  }))
);

function App() {
  return (
    <>
      <PwaUpdateManager />

      <PushSubscriptionManager />

      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path={APP_ROUTES.auth.login} element={<LoginPage />} />

            <Route path={APP_ROUTES.auth.register} element={<RegisterPage />} />

            <Route
              path={APP_ROUTES.auth.forgotPassword}
              element={<ForgotPasswordPage />}
            />
          </Route>

          <Route
            path={APP_ROUTES.auth.resetPassword}
            element={<ResetPasswordPage />}
          />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path={APP_ROUTES.home} element={<DashboardPage />} />

              <Route
                path={APP_ROUTES.practice}
                element={<PracticeSetupPage />}
              />

              <Route
                path={APP_ROUTES.practiceSession}
                element={<PracticeSessionPage />}
              />

              <Route path={APP_ROUTES.insights} element={<InsightsPage />} />

              <Route
                path={APP_ROUTES.library}
                element={<MantraLibraryPage />}
              />

              <Route
                path={APP_ROUTES.libraryDetail}
                element={<MantraDetailPage />}
              />

              <Route path={APP_ROUTES.profile} element={<ProfilePage />} />

              <Route path={APP_ROUTES.settings} element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
