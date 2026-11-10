import type { Metadata } from 'next';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://devsangam.me').replace(/\/$/, '');
export const SITE_DESCRIPTION =
  'DevSangam brings together digital Japamala, mantra Sadhana, Vedic astrology exploration, ' +
  'private practice insights and devotional digital products.';

export function pageMetadata(
  title: string,
  description: string,
  pathname: string,
  privatePage = false,
): Metadata {
  return {
    title,
    description,
    alternates: privatePage ? undefined : { canonical: pathname },
    robots: privatePage
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true },
    openGraph: {
      title: `${title} | DevSangam`,
      description,
      url: pathname,
      type: 'website',
      siteName: 'DevSangam',
      locale: 'en_IN',
      images: [{
        url: '/devsangam-og.png',
        width: 1200,
        height: 630,
        alt: 'DevSangam — Chant. Connect. Transform.',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | DevSangam`,
      description,
      images: ['/devsangam-og.png'],
    },
  };
}
