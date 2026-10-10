import { publicApi, type PublicStoreResult } from '@/lib/public-api.server';
import { SITE_URL } from '@/lib/seo';
import type { MetadataRoute } from 'next';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    '/',
    '/about',
    '/how-it-works',
    '/contact',
    '/privacy',
    '/terms',
    '/store',
  ].map((p) => ({ url: SITE_URL + p }));
  // Only public published metadata; bounded pagination and timeout, no paid file keys/text.
  for (let page = 1; page <= 20; page++) {
    const result = await publicApi<PublicStoreResult>('/store?page=' + page + '&limit=50');
    if (!result.data) break;
    const { products, total } = result.data.data;
    for (const product of products) {
      if (/^[a-z0-9-]+$/.test(product.slug))
        entries.push({ url: SITE_URL + '/store/' + product.slug });
    }
    if (products.length < 50 || page * 50 >= total) break;
  }
  return entries;
}
