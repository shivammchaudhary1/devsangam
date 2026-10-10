import { ProfilePage } from '@/features/profile/pages/ProfilePage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Profile',
  'Your private DevSangam account.',
  '/profile',
  true,
);
export default function Page() {
  return <ProfilePage />;
}
