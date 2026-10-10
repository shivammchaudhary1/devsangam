import { HowItWorksPage } from '@/features/public-site/pages/HowItWorksPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'How It Works',
  'Learn how to practice mantras, count with a digital mala, continue offline and review your Sadhana.',
  '/how-it-works',
  false,
);
export default function Page() {
  return <HowItWorksPage />;
}
