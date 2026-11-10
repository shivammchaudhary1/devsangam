import { GuestRoute } from '@/features/auth/components/GuestRoute';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Forgot Password',
  'Access your DevSangam account.',
  '/auth/forgot-password',
  true,
);
export default function Page() {
  return (
    <GuestRoute>
      <ForgotPasswordPage />
    </GuestRoute>
  );
}
