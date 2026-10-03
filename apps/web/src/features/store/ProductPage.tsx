import { downloadPdf, priceLabel } from './commerce.utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PurchaseButton } from '@/features/payments/PurchaseButton';
import { PublicPageShell } from '@/features/public-site/components/PublicPageShell';
import { apiRequest } from '@/services/api/client';
import type { ApiResult, DigitalProduct } from '@devsangam/types';
import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router';

export function ProductPage() {
  const { slug } = useParams();
  const auth = useAuth();
  const [message, setMessage] = useState('');
  const result = useQuery({
    queryKey: ['product', slug, auth.user?.id],
    queryFn: () =>
      apiRequest<
        ApiResult<{
          product: DigitalProduct;
          owned: boolean;
          paymentsEnabled: boolean;
        }>
      >(`/store/${encodeURIComponent(slug ?? '')}`),
  });
  if (result.isPending) return <p role="status">Loading resource…</p>;
  if (result.isError)
    return (
      <div>
        <h1 className="text-2xl">Resource unavailable</h1>
        <Link to="/store" className="mt-5 inline-block underline">
          Back to digital library
        </Link>
      </div>
    );
  const { product, owned, paymentsEnabled } = result.data.data;
  return (
    <PublicPageShell title={product.title} intro={product.shortDescription}>
      <Link to="/store" className="mb-6 inline-block underline">
        Back to digital library
      </Link>
      <div className="ds-panel max-w-3xl p-7">
        {product.coverImage ? (
          <img
            src={product.coverImage}
            alt={product.title}
            className="mb-6 aspect-[4/3] w-full rounded-xl object-cover"
          />
        ) : (
          <div className="mb-6 flex aspect-[4/3] items-center justify-center rounded-xl bg-muted">
            <BookOpen aria-hidden="true" className="size-16 text-primary" />
          </div>
        )}
        <p className="whitespace-pre-wrap leading-8">{product.description}</p>
        <p className="my-6 font-semibold">
          {owned
            ? 'Purchased'
            : product.accessType === 'free'
              ? 'Free PDF'
              : priceLabel(product.pricePaise)}
        </p>
        {owned || product.accessType === 'free' ? (
          auth.isAuthenticated ? (
            <Button
              onClick={() => {
                void downloadPdf(product._id).catch((error) =>
                  setMessage(error.message)
                );
              }}
            >
              Download PDF
            </Button>
          ) : (
            <Link to="/auth/login" className="underline">
              Sign in to download
            </Link>
          )
        ) : paymentsEnabled ? (
          <PurchaseButton
            itemType="digital_product"
            itemId={product._id}
            pricePaise={product.pricePaise}
          />
        ) : (
          <p>Purchases are not available yet.</p>
        )}
        <p role="status" className="mt-4">
          {message}
        </p>
      </div>
    </PublicPageShell>
  );
}
