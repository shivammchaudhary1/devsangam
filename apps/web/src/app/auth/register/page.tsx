import { GuestRoute } from '@/features/auth/components/GuestRoute';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Register',
  'Access your DevSangam account.',
  '/auth/register',
  true,
);
export default function Page() {
  return (
    <GuestRoute>
      <RegisterPage />
    </GuestRoute>
  );
}
