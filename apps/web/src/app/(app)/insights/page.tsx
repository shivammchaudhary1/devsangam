import { InsightsPage } from '@/features/insights/pages/InsightsPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Insights',
  'Your private DevSangam account.',
  '/insights',
  true,
);
export default function Page() {
  return <InsightsPage />;
}
