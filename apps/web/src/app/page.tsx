import { HomeExperience } from '@/features/public-site/components/HomeExperience';
import { LandingPage } from '@/features/public-site/pages/LandingPage';
import { homeJsonLd } from '@/lib/public-structured-data';
import { pageMetadata, SITE_DESCRIPTION } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export const metadata = pageMetadata('Daily Sadhana, Digital Japamala & Devotional Products', SITE_DESCRIPTION, '/');

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: homeJsonLd() }} />
      <HomeExperience>
        <LandingPage />
      </HomeExperience>
    </>
  );
}
