import { MantraDetailPage } from '@/features/mantras/pages/MantraDetailPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Mantra Details',
  'Your private DevSangam account.',
  '/library/:slug',
  true,
);
export default function Page() {
  return <MantraDetailPage />;
}
