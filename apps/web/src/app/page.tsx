import { HomeExperience } from '@/features/public-site/components/HomeExperience';
import { LandingPage } from '@/features/public-site/pages/LandingPage';
import { pageMetadata, SITE_DESCRIPTION, SITE_URL } from '@/lib/seo';
export const dynamic = 'force-dynamic';
export const metadata = pageMetadata('Daily Sadhana and Digital Japamala', SITE_DESCRIPTION, '/');
export default function HomePage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'DevSangam',
    url: SITE_URL,
    description: SITE_DESCRIPTION,
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replaceAll('<', '\u003c'),
        }}
      />
      <HomeExperience>
        <LandingPage />
      </HomeExperience>
    </>
  );
}
