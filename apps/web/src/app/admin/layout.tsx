import { AdminShell } from '@/features/admin/AdminShell';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Administration',
  robots: { index: false, follow: false },
};
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}
