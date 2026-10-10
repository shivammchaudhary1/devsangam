import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Settings',
  'Your private DevSangam account.',
  '/settings',
  true,
);
export default function Page() {
  return <SettingsPage />;
}
