import { AstroPage } from '@/features/public-site/pages/AstroPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata('Astro', 'Explore basic Vedic birth placements and private astrology history.', '/astro', true);
export default function Page() {
  return <AstroPage />;
}
