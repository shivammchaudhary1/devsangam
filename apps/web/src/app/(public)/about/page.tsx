import { AboutPage } from '@/features/public-site/pages/AboutPage';
import { publicPageJsonLd } from '@/lib/public-structured-data';
import { pageMetadata } from '@/lib/seo';

const description = 'Discover DevSangam: a thoughtful space for digital Japamala, mantra Sadhana, offline practice, personal insights and devotional resources.';
export const metadata = pageMetadata('Our Purpose & Mantra Practice', description, '/about');

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: publicPageJsonLd({ pathname: '/about', title: 'About DevSangam', description, type: 'AboutPage' }),
      }} />
      <AboutPage />
    </>
  );
}
