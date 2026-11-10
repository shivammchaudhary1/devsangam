import { SITE_URL } from './seo';

type PublicSchemaType = 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage';

function secureJson(value: Record<string, unknown>) {
  return JSON.stringify(value).replaceAll('<', '\\u003c');
}

export function publicPageJsonLd({
  pathname,
  title,
  description,
  type = 'WebPage',
}: {
  pathname: string;
  title: string;
  description: string;
  type?: PublicSchemaType;
}) {
  const url = SITE_URL + pathname;
  return secureJson({
    '@context': 'https://schema.org',
    '@type': type,
    '@id': url + '#webpage',
    url,
    name: title,
    description,
    inLanguage: 'en-IN',
    isPartOf: { '@id': SITE_URL + '/#website' },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL + '/' },
        { '@type': 'ListItem', position: 2, name: title, item: url },
      ],
    },
  });
}

export function homeJsonLd() {
  return secureJson({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': SITE_URL + '/#organization',
        name: 'DevSangam',
        url: SITE_URL,
        logo: SITE_URL + '/pwa-512x512.png',
        email: 'contact@devsangam.me',
      },
      {
        '@type': 'WebSite',
        '@id': SITE_URL + '/#website',
        name: 'DevSangam',
        url: SITE_URL,
        description: 'Daily mantra practice, Vedic astrology exploration and devotional products.',
        publisher: { '@id': SITE_URL + '/#organization' },
        inLanguage: 'en-IN',
      },
    ],
  });
}
