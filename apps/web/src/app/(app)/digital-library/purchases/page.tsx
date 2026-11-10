import { DigitalLibraryPage } from '@/features/digital-library/DigitalLibraryPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Purchase History',
  'Your private DevSangam account.',
  '/digital-library/purchases',
  true,
);
export default function Page() {
  return <DigitalLibraryPage />;
}
