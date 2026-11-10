import { ProductPage } from '@/features/store/ProductPage';
import { publicApi, type PublicProductResult } from '@/lib/public-api.server';
import { pageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await publicApi<PublicProductResult>('/store/' + encodeURIComponent(slug));
  const product = result.data?.data.product;
  return pageMetadata(
    product?.title || 'Devotional resource',
    product?.shortDescription || 'Devotional reading resource on DevSangam.',
    '/store/' + encodeURIComponent(slug),
    !product,
  );
}
export default async function Page({ params }: Props) {
  const { slug } = await params;
  const result = await publicApi<PublicProductResult>('/store/' + encodeURIComponent(slug));
  if (result.status === 404 || result.status === 400) notFound();
  return <ProductPage initialData={result.data} />;
}
