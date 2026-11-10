import { TermsPage } from '@/features/public-site/pages/TermsPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Terms & Conditions',
  'Read the DevSangam draft terms for accounts, devotional practice and digital purchases.',
  '/terms',
  false,
);
export default function Page() {
  return <TermsPage />;
}
