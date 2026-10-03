import { downloadPdf, priceLabel } from './commerce.utils';
import { Button } from '@/components/ui/button';
import { buttonVariants } from '@/components/ui/button-variants';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { PurchaseButton } from '@/features/payments/PurchaseButton';
import { PublicPageShell } from '@/features/public-site/components/PublicPageShell';
import { apiRequest } from '@/services/api/client';
import type { ApiResult, DigitalProduct } from '@devsangam/types';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  Lock,
  ShieldCheck,
} from 'lucide-react';
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

  if (result.isPending)
    return (
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="ds-panel p-8">
          <p role="status" className="text-sm text-[var(--ds-muted)]">
            Loading resource…
          </p>
        </div>
      </div>
    );

  if (result.isError)
    return (
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="ds-panel p-8">
          <h1 className="text-2xl">Resource unavailable</h1>
          <Link
            to="/store"
            className="mt-5 inline-flex items-center gap-2 text-sm text-[var(--ds-soft-gold)]"
          >
            <ArrowLeft size={14} />
            Back to digital library
          </Link>
        </div>
      </div>
    );

  const { product, owned, paymentsEnabled } = result.data.data;

  return (
    <PublicPageShell title={product.title} intro={product.shortDescription}>
      <Link
        to="/store"
        className="mb-6 inline-flex items-center gap-2 text-[11px] font-semibold text-[var(--ds-muted)] transition hover:text-[var(--ds-text)]"
      >
        <ArrowLeft size={14} />
        Back to digital library
      </Link>

      <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="ds-panel p-4 sm:p-5">
          <div className="relative z-10 overflow-hidden rounded-[18px] border border-[var(--ds-border-soft)] bg-[var(--ds-night)]">
            {product.coverImage ? (
              <img
                src={product.coverImage}
                alt={product.title}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-[var(--ds-gradient-panel-soft)]">
                <div className="flex size-28 items-center justify-center rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)]">
                  <span className="font-devanagari text-6xl text-[var(--ds-soft-gold)]">
                    ॐ
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="relative z-10 mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-3">
              <FileText size={14} className="text-[var(--ds-gold)]" />
              <p className="mt-2 text-[9px] font-semibold text-[var(--ds-text)]">
                PDF resource
              </p>
            </div>
            <div className="rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-3">
              <ShieldCheck size={14} className="text-[var(--ds-gold)]" />
              <p className="mt-2 text-[9px] font-semibold text-[var(--ds-text)]">
                Account access
              </p>
            </div>
          </div>
        </div>

        <article className="ds-panel p-6 sm:p-8">
          <div className="relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[var(--ds-border-soft)] px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--ds-muted)]">
                Digital PDF
              </span>
              {owned ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-emerald-400">
                  <CheckCircle2 size={10} />
                  Purchased
                </span>
              ) : (
                <span
                  className={`rounded-full border px-3 py-1.5 text-[8px] font-semibold uppercase tracking-[0.1em] ${
                    product.accessType === 'free'
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                      : 'border-[var(--ds-border-gold)] bg-[var(--ds-amber-08)] text-[var(--ds-soft-gold)]'
                  }`}
                >
                  {product.accessType === 'free' ? 'Free' : 'Premium'}
                </span>
              )}
            </div>

            <p className="mt-6 whitespace-pre-wrap text-sm leading-8 text-[var(--ds-text)]">
              {product.description}
            </p>

            <div className="mt-7 rounded-2xl border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--ds-gold)]">
                    Access
                  </p>
                  <p className="ds-stat-value mt-2 text-2xl">
                    {owned
                      ? 'Owned'
                      : product.accessType === 'free'
                        ? 'Free PDF'
                        : priceLabel(product.pricePaise)}
                  </p>
                </div>
                <span className="flex size-10 items-center justify-center rounded-xl border border-[var(--ds-border-gold)] text-[var(--ds-gold)]">
                  {owned || product.accessType === 'free' ? (
                    <BookOpen size={18} />
                  ) : (
                    <Lock size={18} />
                  )}
                </span>
              </div>

              <div className="mt-5">
                {owned || product.accessType === 'free' ? (
                  auth.isAuthenticated ? (
                    <Button
                      className="min-h-11 w-full"
                      onClick={() => {
                        setMessage('');
                        void downloadPdf(product._id).catch((error) =>
                          setMessage(error.message)
                        );
                      }}
                    >
                      Download PDF
                    </Button>
                  ) : (
                    <Link
                      to="/auth/login"
                      className={`${buttonVariants()} min-h-11 w-full rounded-xl`}
                    >
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
                  <p className="text-[11px] leading-6 text-[var(--ds-muted)]">
                    Purchases are not available yet.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-4">
                <Lock size={14} className="text-[var(--ds-gold)]" />
                <p className="mt-2 text-[10px] font-semibold text-[var(--ds-text)]">
                  Private delivery
                </p>
                <p className="mt-1 text-[9px] leading-5 text-[var(--ds-muted)]">
                  Paid PDF access is checked by the server before delivery.
                </p>
              </div>
              <div className="rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-4">
                <ShieldCheck size={14} className="text-[var(--ds-gold)]" />
                <p className="mt-2 text-[10px] font-semibold text-[var(--ds-text)]">
                  Verified payment
                </p>
                <p className="mt-1 text-[9px] leading-5 text-[var(--ds-muted)]">
                  Premium access appears only after successful verification.
                </p>
              </div>
            </div>

            {message ? (
              <p
                role="status"
                className="mt-5 rounded-xl border border-[var(--ds-border-soft)] p-3 text-[10px] text-[var(--ds-muted)]"
              >
                {message}
              </p>
            ) : (
              <p role="status" className="sr-only">
                {message}
              </p>
            )}
          </div>
        </article>
      </div>
    </PublicPageShell>
  );
}
