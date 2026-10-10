import { ContactPage } from '@/features/public-site/pages/ContactPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Contact',
  'Contact DevSangam with account, practice, digital library or general questions.',
  '/contact',
  false,
);
export default function Page() {
  return <ContactPage />;
}
