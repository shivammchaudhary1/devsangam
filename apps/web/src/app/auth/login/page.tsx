import { GuestRoute } from '@/features/auth/components/GuestRoute';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Login',
  'Access your DevSangam account.',
  '/auth/login',
  true,
);
export default function Page() {
  return (
    <GuestRoute>
      <LoginPage />
    </GuestRoute>
  );
}
