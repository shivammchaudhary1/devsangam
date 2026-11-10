import { PrivacyPolicyPage } from '@/features/public-site/pages/PrivacyPolicyPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Privacy Policy',
  'Read the DevSangam draft privacy policy covering accounts, practice, storage and payments.',
  '/privacy',
  false,
);
export default function Page() {
  return <PrivacyPolicyPage />;
}
