import { PracticeSetupPage } from '@/features/practice/pages/PracticeSetupPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Practice',
  'Your private DevSangam account.',
  '/practice',
  true,
);
export default function Page() {
  return <PracticeSetupPage />;
}
