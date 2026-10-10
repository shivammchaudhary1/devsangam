import { StorePage } from '@/features/store/StorePage';
import { publicApi, type PublicStoreResult } from '@/lib/public-api.server';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata(
  'Digital Library',
  'Explore free and premium devotional PDF reading resources on DevSangam.',
  '/store',
  false,
);
export default async function Page() {
  const result = await publicApi<PublicStoreResult>('/store?page=1&limit=12');
  return <StorePage initialData={result.data} />;
}
