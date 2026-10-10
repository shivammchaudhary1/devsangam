import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}
