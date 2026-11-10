import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata(
  'Dashboard',
  'Your private DevSangam dashboard.',
  '/dashboard',
  true,
);

export default function Page() {
  return <DashboardPage />;
}
