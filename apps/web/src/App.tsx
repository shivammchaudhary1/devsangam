import { APP_ROUTES } from '@/app/constants/routes.constants';
import { PwaUpdateManager } from '@/components/pwa/PwaUpdateManager';
import { RouteLoadingFallback } from '@/components/shared/RouteLoadingFallback';
import { AuthLoadingScreen } from '@/features/auth/components/AuthLoadingScreen';
import { GuestRoute } from '@/features/auth/components/GuestRoute';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PushSubscriptionManager } from '@/features/push/components/PushSubscriptionManager';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const AppShell = lazy(() =>
  import('@/components/layout/AppShell').then((module) => ({
    default: module.AppShell,
  }))
);

const PublicLayout = lazy(() =>
  import('@/features/public-site/components/PublicLayout').then((module) => ({
    default: module.PublicLayout,
  }))
);
const AstroPage = lazy(() =>
  import('@/features/public-site/pages/AstroPage').then((module) => ({
    default: module.AstroPage,
  }))
);
const AdminShell = lazy(() =>
  import('@/features/admin/AdminShell').then((module) => ({
    default: module.AdminShell,
  }))
);

const AdminPage = lazy(() =>
  import('@/features/admin/AdminPage').then((module) => ({
    default: module.AdminPage,
  }))
);
const StorePage = lazy(() =>
  import('@/features/store/StorePage').then((module) => ({
    default: module.StorePage,
  }))
);
const ProductPage = lazy(() =>
  import('@/features/store/ProductPage').then((module) => ({
    default: module.ProductPage,
  }))
);
const DigitalLibraryPage = lazy(() =>
  import('@/features/digital-library/DigitalLibraryPage').then((module) => ({
    default: module.DigitalLibraryPage,
  }))
);

// The existing auth context includes V1 offline bootstrap/session reconciliation.
// Keep both experiences at / without changing any protected deep-link paths.
function HomeLayout() {
  const auth = useAuth();
  if (auth.isLoading) return <AuthLoadingScreen />;
  return auth.isAuthenticated ? <AppShell /> : <PublicLayout />;
}

function HomePage() {
  return useAuth().isAuthenticated ? <DashboardPage /> : <LandingPage />;
}

const LandingPage = lazy(() =>
  import('@/features/public-site/pages/LandingPage').then((module) => ({
    default: module.LandingPage,
  }))
);
const AboutPage = lazy(() =>
  import('@/features/public-site/pages/AboutPage').then((module) => ({
    default: module.AboutPage,
  }))
);
const ContactPage = lazy(() =>
  import('@/features/public-site/pages/ContactPage').then((module) => ({
    default: module.ContactPage,
  }))
);
const PrivacyPolicyPage = lazy(() =>
  import('@/features/public-site/pages/PrivacyPolicyPage').then((module) => ({
    default: module.PrivacyPolicyPage,
  }))
);
const TermsPage = lazy(() =>
  import('@/features/public-site/pages/TermsPage').then((module) => ({
    default: module.TermsPage,
  }))
);
const HowItWorksPage = lazy(() =>
  import('@/features/public-site/pages/HowItWorksPage').then((module) => ({
    default: module.HowItWorksPage,
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
          <Route element={<PublicLayout />}>
            <Route path="/store" element={<StorePage />} />
            <Route path="/store/:slug" element={<ProductPage />} />
            <Route path="/astro" element={<AstroPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
          </Route>
          <Route path="/" element={<HomeLayout />}>
            <Route index element={<HomePage />} />
          </Route>
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
            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<AdminPage />} />
              <Route path=":section" element={<AdminPage />} />
            </Route>
            <Route element={<AppShell />}>
              <Route path="/digital-library" element={<DigitalLibraryPage />} />
              <Route
                path="/digital-library/purchases"
                element={<DigitalLibraryPage />}
              />
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
