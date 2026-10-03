import { priceLabel } from './commerce.utils';
import { buttonVariants } from '@/components/ui/button-variants';
import { PublicPageShell } from '@/features/public-site/components/PublicPageShell';
import { apiRequest } from '@/services/api/client';
import type { ApiResult, DigitalProduct } from '@devsangam/types';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

const STORE_TRUST_POINTS = [
  {
    title: 'Private delivery',
    text: 'Paid PDFs are delivered through authorized API access.',
    icon: Lock,
  },
  {
    title: 'Verified entitlement',
    text: 'Successful verified payment creates your server-side access grant.',
    icon: CheckCircle2,
  },
  {
    title: 'Your library',
    text: 'Owned resources remain listed in your personal digital library.',
    icon: BookOpen,
  },
] as const;

export function StorePage() {
  const [page, setPage] = useState(1);
  const result = useQuery({
    queryKey: ['store', page],
    queryFn: () =>
      apiRequest<ApiResult<{ products: DigitalProduct[]; total: number }>>(
        `/store?page=${page}&limit=12`
      ),
  });

  return (
    <PublicPageShell
      title="Digital Library"
      intro="Explore free and premium devotional reading resources. Purchased items are tied to your account after verified access."
    >
      <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--ds-border-soft)] px-3 py-2 text-[9px] text-[var(--ds-muted)]">
            <FileText size={12} className="text-[var(--ds-gold)]" />
            PDF resources
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--ds-border-soft)] px-3 py-2 text-[9px] text-[var(--ds-muted)]">
            <Lock size={12} className="text-[var(--ds-gold)]" />
            Account-based premium access
          </span>
        </div>
        <Link
          to="/digital-library"
          className={`${buttonVariants({
            variant: 'outline',
          })} min-h-11 rounded-xl`}
        >
          My digital library
        </Link>
      </div>

      {result.isPending ? (
        <div className="ds-panel p-8">
          <p role="status" className="text-sm text-[var(--ds-muted)]">
            Loading resources…
          </p>
        </div>
      ) : result.isError ? (
        <div className="ds-panel p-8">
          <p role="alert" className="text-sm text-red-400">
            Resources could not load. Please try again later.
          </p>
        </div>
      ) : (
        <>
          {!result.data.data.products.length ? (
            <div className="ds-panel p-9 text-center sm:p-12">
              <BookOpen size={28} className="mx-auto text-[var(--ds-gold)]" />
              <h2 className="mt-4 text-xl">The library is being prepared</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-[var(--ds-muted)]">
                No resources are published yet. When the first PDF is ready, it
                will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {result.data.data.products.map((product) => (
                <article
                  key={product._id}
                  className="ds-panel group flex min-w-0 flex-col p-4"
                >
                  <div className="relative z-10 flex h-full flex-col">
                    <Link
                      to={`/store/${product.slug}`}
                      className="relative block overflow-hidden rounded-[16px] border border-[var(--ds-border-soft)] bg-[var(--ds-night)]"
                    >
                      <div className="aspect-[4/3]">
                        {product.coverImage ? (
                          <img
                            src={product.coverImage}
                            alt={product.title}
                            loading="lazy"
                            className="size-full object-cover transition duration-300 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center bg-[var(--ds-gradient-panel-soft)]">
                            <div className="flex size-24 items-center justify-center rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)]">
                              <span className="font-devanagari text-5xl text-[var(--ds-soft-gold)]">
                                ॐ
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      {product.featured ? (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-sidebar)]/90 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.08em] text-[var(--ds-soft-gold)] backdrop-blur">
                          <Sparkles size={10} />
                          Featured
                        </span>
                      ) : null}
                    </Link>

                    <div className="flex flex-1 flex-col px-1 pb-1 pt-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="mb-2 text-[8px] font-bold uppercase tracking-[0.14em] text-[var(--ds-gold)]">
                            Digital PDF
                          </p>
                          <Link to={`/store/${product.slug}`}>
                            <h2 className="text-lg leading-7">
                              {product.title}
                            </h2>
                          </Link>
                        </div>
                        <span
                          className={`shrink-0 rounded-full border px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em] ${
                            product.accessType === 'free'
                              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                              : 'border-[var(--ds-border-gold)] bg-[var(--ds-amber-08)] text-[var(--ds-soft-gold)]'
                          }`}
                        >
                          {product.accessType === 'free'
                            ? 'Free'
                            : priceLabel(product.pricePaise)}
                        </span>
                      </div>
                      <p className="mt-3 text-[11px] leading-6 text-[var(--ds-muted)]">
                        {product.shortDescription}
                      </p>
                      <div className="mt-auto pt-5">
                        <Link
                          to={`/store/${product.slug}`}
                          className="flex min-h-11 items-center justify-between rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] px-4 text-[11px] font-semibold text-[var(--ds-text)] transition hover:border-[var(--ds-border-gold)] hover:text-[var(--ds-soft-gold)]"
                        >
                          View resource
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-col gap-3 rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] text-[var(--ds-muted)]">
              Page {page} · {result.data.data.total} published resource
              {result.data.data.total === 1 ? '' : 's'}
            </p>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                className="ds-secondary-button min-h-10 rounded-xl px-4 text-[11px] disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page * 12 >= result.data.data.total}
                onClick={() => setPage((value) => value + 1)}
                className="ds-secondary-button min-h-10 rounded-xl px-4 text-[11px] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <div className="mt-10 grid gap-3 md:grid-cols-3">
        {STORE_TRUST_POINTS.map(({ title, text, icon: Icon }) => (
          <div
            key={title}
            className="rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-4"
          >
            <Icon size={15} className="text-[var(--ds-gold)]" />
            <p className="mt-3 text-[10px] font-semibold text-[var(--ds-text)]">
              {title}
            </p>
            <p className="mt-2 text-[9px] leading-5 text-[var(--ds-muted)]">
              {text}
            </p>
          </div>
        ))}
      </div>
    </PublicPageShell>
  );
}
