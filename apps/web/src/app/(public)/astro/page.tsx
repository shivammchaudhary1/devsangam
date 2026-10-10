import { AstroPage } from '@/features/public-site/pages/AstroPage';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata('Astro', 'Astro section on DevSangam.', '/astro', true);
export default function Page() {
  return <AstroPage />;
}
