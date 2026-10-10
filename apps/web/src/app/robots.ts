import { SITE_URL } from '@/lib/seo';
import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/about', '/how-it-works', '/contact', '/privacy', '/terms', '/store'],
        disallow: [
          '/admin',
          '/auth',
          '/practice',
          '/library',
          '/digital-library',
          '/insights',
          '/profile',
          '/settings',
          '/api',
          '/astro',
          '/offline',
        ],
      },
    ],
    sitemap: SITE_URL + '/sitemap.xml',
    host: SITE_URL,
  };
}
