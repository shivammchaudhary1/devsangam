import { AstroPage } from '@/features/public-site/pages/AstroPage';
import { publicPageJsonLd } from '@/lib/public-structured-data';
import { pageMetadata } from '@/lib/seo';

const description = 'Explore basic Vedic astrology on DevSangam: Rashi, Nakshatra, Lagna, Navamsa and Mahadasha. Sign in to calculate and privately save your birth chart.';
// This route has public educational content. Personal readings remain behind API session checks.
export const metadata = pageMetadata('Vedic Astrology, Rashi & Birth Chart', description, '/astro');

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: publicPageJsonLd({ pathname: '/astro', title: 'Vedic Astrology', description }),
      }} />
      <AstroPage />
    </>
  );
}
