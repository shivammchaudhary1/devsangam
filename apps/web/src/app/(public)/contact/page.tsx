import { ContactPage } from '@/features/public-site/pages/ContactPage';
import { publicPageJsonLd } from '@/lib/public-structured-data';
import { pageMetadata } from '@/lib/seo';

const description = 'Contact DevSangam about your mantra practice, digital PDF downloads, account access or feedback. Reach our team through the contact form.';
export const metadata = pageMetadata('Contact & Support', description, '/contact');

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: publicPageJsonLd({ pathname: '/contact', title: 'Contact DevSangam', description, type: 'ContactPage' }),
      }} />
      <ContactPage />
    </>
  );
}
