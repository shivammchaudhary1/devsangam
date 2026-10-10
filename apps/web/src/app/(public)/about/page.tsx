import { AboutPage } from '@/features/public-site/pages/AboutPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'About DevSangam',
  'Learn about DevSangam, its devotional purpose, practice tools and privacy-conscious approach.',
  '/about',
  false,
);
export default function Page() {
  return <AboutPage />;
}
