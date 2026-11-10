import { StorePage } from '@/features/store/StorePage';
import { publicApi, type PublicStoreResult } from '@/lib/public-api.server';
import { publicPageJsonLd } from '@/lib/public-structured-data';
import { pageMetadata } from '@/lib/seo';

const description = 'Explore DevSangam products: downloadable mantra PDFs and devotional resources, with e-pooja booking and more experiences planned for the future.';
export const metadata = pageMetadata('Devotional Products & Mantra PDFs', description, '/store');

export default async function Page() {
  const result = await publicApi<PublicStoreResult>('/store?page=1&limit=12');
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: publicPageJsonLd({ pathname: '/store', title: 'Devotional Products', description, type: 'CollectionPage' }),
      }} />
      <StorePage initialData={result.data} />
    </>
  );
}
