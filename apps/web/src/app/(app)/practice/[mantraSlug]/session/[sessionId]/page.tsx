import { PracticeSessionPage } from '@/features/practice/pages/PracticeSessionPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Sadhana Session',
  'Your private DevSangam account.',
  '/practice/:mantraSlug/session/:sessionId',
  true,
);
export default function Page() {
  return <PracticeSessionPage />;
}
