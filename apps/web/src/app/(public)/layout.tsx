import { PublicLayout } from '@/features/public-site/components/PublicLayout';
import type { ReactNode } from 'react';
export const dynamic = 'force-dynamic';
export default function Layout({ children }: { children: ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
