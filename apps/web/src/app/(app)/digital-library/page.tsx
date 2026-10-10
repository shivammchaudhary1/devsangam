import { DigitalLibraryPage } from '@/features/digital-library/DigitalLibraryPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'My Digital Library',
  'Your private DevSangam account.',
  '/digital-library',
  true,
);
export default function Page() {
  return <DigitalLibraryPage />;
}
