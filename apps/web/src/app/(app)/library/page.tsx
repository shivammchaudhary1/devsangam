import { MantraLibraryPage } from '@/features/mantras/pages/MantraLibraryPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Mantra Library',
  'Your private DevSangam account.',
  '/library',
  true,
);
export default function Page() {
  return <MantraLibraryPage />;
}
