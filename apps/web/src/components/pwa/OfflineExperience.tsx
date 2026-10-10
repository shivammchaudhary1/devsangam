'use client';

import { AppShell } from '@/components/layout/AppShell';
import { AdminShell } from '@/features/admin/AdminShell';
import { AuthLoadingScreen } from '@/features/auth/components/AuthLoadingScreen';
import { GuestRoute } from '@/features/auth/components/GuestRoute';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PublicLayout } from '@/features/public-site/components/PublicLayout';
import { OfflineNavigationContext } from '@/lib/navigation';
import dynamic from 'next/dynamic';
import { type ReactNode, useSyncExternalStore } from 'react';

// Generic cached shell has no account/purchased content. These are the same pages
// used by App Router, resolved only when an unvisited URL cannot reach the server.
const pages = {
  dashboard: dynamic(() =>
    import('@/features/dashboard/pages/DashboardPage').then((m) => m.DashboardPage),
  ),
  library: dynamic(() =>
    import('@/features/mantras/pages/MantraLibraryPage').then((m) => m.MantraLibraryPage),
  ),
  mantra: dynamic(() =>
    import('@/features/mantras/pages/MantraDetailPage').then((m) => m.MantraDetailPage),
  ),
  practice: dynamic(() =>
    import('@/features/practice/pages/PracticeSetupPage').then((m) => m.PracticeSetupPage),
  ),
  session: dynamic(() =>
    import('@/features/practice/pages/PracticeSessionPage').then((m) => m.PracticeSessionPage),
  ),
  insights: dynamic(() =>
    import('@/features/insights/pages/InsightsPage').then((m) => m.InsightsPage),
  ),
  profile: dynamic(() => import('@/features/profile/pages/ProfilePage').then((m) => m.ProfilePage)),
  settings: dynamic(() =>
    import('@/features/settings/pages/SettingsPage').then((m) => m.SettingsPage),
  ),
  digital: dynamic(() =>
    import('@/features/digital-library/DigitalLibraryPage').then((m) => m.DigitalLibraryPage),
  ),
  admin: dynamic(() => import('@/features/admin/AdminPage').then((m) => m.AdminPage)),
  landing: dynamic(() =>
    import('@/features/public-site/pages/LandingPage').then((m) => m.LandingPage),
  ),
  about: dynamic(() => import('@/features/public-site/pages/AboutPage').then((m) => m.AboutPage)),
  how: dynamic(() =>
    import('@/features/public-site/pages/HowItWorksPage').then((m) => m.HowItWorksPage),
  ),
  contact: dynamic(() =>
    import('@/features/public-site/pages/ContactPage').then((m) => m.ContactPage),
  ),
  privacy: dynamic(() =>
    import('@/features/public-site/pages/PrivacyPolicyPage').then((m) => m.PrivacyPolicyPage),
  ),
  terms: dynamic(() => import('@/features/public-site/pages/TermsPage').then((m) => m.TermsPage)),
  astro: dynamic(() => import('@/features/public-site/pages/AstroPage').then((m) => m.AstroPage)),
  store: dynamic(() => import('@/features/store/StorePage').then((m) => m.StorePage)),
  product: dynamic(() => import('@/features/store/ProductPage').then((m) => m.ProductPage)),
  login: dynamic(() => import('@/features/auth/pages/LoginPage').then((m) => m.LoginPage)),
  register: dynamic(() => import('@/features/auth/pages/RegisterPage').then((m) => m.RegisterPage)),
  forgot: dynamic(() =>
    import('@/features/auth/pages/ForgotPasswordPage').then((m) => m.ForgotPasswordPage),
  ),
  reset: dynamic(() =>
    import('@/features/auth/pages/ResetPasswordPage').then((m) => m.ResetPasswordPage),
  ),
};
const subscribe = (notify: () => void) => {
  window.addEventListener('popstate', notify);
  return () => window.removeEventListener('popstate', notify);
};
export function OfflineExperience() {
  const pathname = useSyncExternalStore(
    subscribe,
    () => window.location.pathname,
    () => '',
  );
  const auth = useAuth();
  if (!pathname || auth.isLoading) return <AuthLoadingScreen />;
  const params: Record<string, string> = {};
  let content: ReactNode;
  let area: 'public' | 'app' | 'admin' | 'guest' | 'reset' = 'app';
  const segments = pathname.split('/').filter(Boolean).map(decodeURIComponent);
  if (pathname === '/') {
    area = auth.isAuthenticated ? 'app' : 'public';
    content = auth.isAuthenticated ? <pages.dashboard /> : <pages.landing />;
  } else if (segments[0] === 'practice' && segments.length === 4 && segments[2] === 'session') {
    params.mantraSlug = segments[1];
    params.sessionId = segments[3];
    content = <pages.session />;
  } else if (segments[0] === 'library' && segments[1]) {
    params.slug = segments[1];
    content = <pages.mantra />;
  } else if (segments[0] === 'digital-library') content = <pages.digital />;
  else if (segments[0] === 'admin') {
    area = 'admin';
    params.section = segments[1] || 'analytics';
    content = <pages.admin />;
  } else if (segments[0] === 'auth') {
    area = segments[1] === 'reset-password' ? 'reset' : 'guest';
    content =
      segments[1] === 'register' ? (
        <pages.register />
      ) : segments[1] === 'forgot-password' ? (
        <pages.forgot />
      ) : segments[1] === 'reset-password' ? (
        <pages.reset />
      ) : (
        <pages.login />
      );
  } else if (segments[0] === 'store') {
    area = 'public';
    params.slug = segments[1] || '';
    content = segments[1] ? <pages.product /> : <pages.store />;
  } else {
    const key = ({ 'how-it-works': 'how' } as Record<string, string>)[segments[0]] || segments[0];
    const Page = pages[key as keyof typeof pages];
    if (!Page) return null;
    if (['about', 'how', 'contact', 'privacy', 'terms', 'astro'].includes(key)) area = 'public';
    content = <Page />;
  }
  return (
    <OfflineNavigationContext.Provider value={{ pathname, params }}>
      {area === 'public' ? (
        <PublicLayout>{content}</PublicLayout>
      ) : area === 'admin' ? (
        <ProtectedRoute>
          <AdminShell>{content}</AdminShell>
        </ProtectedRoute>
      ) : area === 'guest' ? (
        <GuestRoute>{content}</GuestRoute>
      ) : area === 'reset' ? (
        content
      ) : (
        <ProtectedRoute>
          <AppShell>{content}</AppShell>
        </ProtectedRoute>
      )}
    </OfflineNavigationContext.Provider>
  );
}
