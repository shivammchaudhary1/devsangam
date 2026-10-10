import type { Metadata } from 'next';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://devsangam.me';
export const SITE_DESCRIPTION =
  'A devotional space for mantra practice, digital Japamala, offline Sadhana, personal insights and devotional reading.';

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
    robots: privatePage ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: `${title} | DevSangam`,
      description,
      url: pathname,
      type: 'website',
      siteName: 'DevSangam',
      images: [{ url: '/pwa-512x512.png', width: 512, height: 512, alt: 'DevSangam' }],
    },
    twitter: {
      card: 'summary',
      title: `${title} | DevSangam`,
      description,
      images: ['/pwa-512x512.png'],
    },
  };
}
