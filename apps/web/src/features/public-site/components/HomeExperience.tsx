'use client';

import { PublicLayout } from './PublicLayout';
import { AppShell } from '@/components/layout/AppShell';
import { AuthLoadingScreen } from '@/features/auth/components/AuthLoadingScreen';
import { useAuth } from '@/features/auth/hooks/useAuth';
import dynamic from 'next/dynamic';
import { type ReactNode, useSyncExternalStore } from 'react';

const DashboardPage = dynamic(() => import('@/features/dashboard/pages/DashboardPage').then((module) => module.DashboardPage));
const subscribe = () => () => undefined;
export function HomeExperience({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  if (hydrated && auth.isLoading) return <AuthLoadingScreen />;
  if (auth.isAuthenticated) return <AppShell><DashboardPage /></AppShell>;
  return <PublicLayout>{children}</PublicLayout>;
}
