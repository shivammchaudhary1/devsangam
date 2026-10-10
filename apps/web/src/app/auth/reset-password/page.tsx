import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Reset Password',
  'Access your DevSangam account.',
  '/auth/reset-password',
  true,
);
export default function Page() {
  return <ResetPasswordPage />;
}
