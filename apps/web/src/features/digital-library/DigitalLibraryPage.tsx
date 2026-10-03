import { Button } from '@/components/ui/button';
import { downloadPdf, priceLabel } from '@/features/store/commerce.utils';
import { apiRequest } from '@/services/api/client';
import type {
  ApiResult,
  CommerceOrder,
  DigitalProduct,
  OwnedItem,
  PagedItems,
} from '@devsangam/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  RefreshCw,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';

const LIBRARY_TABS = [
  { to: '/digital-library', label: 'Owned resources', icon: BookOpen },
  {
    to: '/digital-library/purchases',
    label: 'Purchases',
    icon: ShoppingBag,
  },
  { to: '/library', label: 'Mantra library', icon: Sparkles },
] as const;

function orderStatusClass(status: CommerceOrder['status']) {
  if (status === 'paid')
    return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400';
  if (status === 'refunded' || status === 'failed')
    return 'border-red-500/20 bg-red-500/10 text-red-400';
  return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
}

export function DigitalLibraryPage() {
  const purchases = useLocation().pathname.endsWith('/purchases');
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const query = useQueryClient();

  const owned = useQuery({
    queryKey: ['digital-library', page],
    queryFn: () =>
      apiRequest<ApiResult<PagedItems<OwnedItem>>>(
        `/library/items?page=${page}&limit=12`
      ),
    enabled: !purchases,
  });

  const orders = useQuery({
    queryKey: ['orders', page],
    queryFn: () =>
      apiRequest<ApiResult<{ orders: CommerceOrder[]; total: number }>>(
        `/library/orders?page=${page}&limit=12`
      ),
    enabled: purchases,
  });

  const free = useQuery({
    queryKey: ['free-resources', page],
    queryFn: () =>
      apiRequest<ApiResult<{ products: DigitalProduct[]; total: number }>>(
        `/store?page=${page}&limit=12&free=true`
      ),
    enabled: !purchases,
  });

  const active = purchases ? orders : owned;

  async function reconcile(id: string) {
    setMessage('Checking payment…');
    try {
      const result = await apiRequest<ApiResult<{ status: string }>>(
        `/payments/orders/${id}/reconcile`,
        { method: 'POST' }
      );
      setMessage(`Payment status: ${result.data.status}`);
      await query.invalidateQueries();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Could not check payment.'
      );
    }
  }

  return (
    <section className="ds-page px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="ds-eyebrow mb-3">
              {purchases ? 'Commerce history' : 'Owned devotional resources'}
            </p>
            <h1 className="text-3xl sm:text-4xl">
              {purchases ? 'Purchase history' : 'My digital library'}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ds-muted)]">
              {purchases
                ? 'Review the payment state of your digital-resource orders.'
                : 'Your purchased resources and available free PDFs are collected here.'}
            </p>
          </div>
          <Link
            to="/store"
            className="ds-gold-button inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-[11px] font-bold"
          >
            <Sparkles size={14} />
            Browse digital library
          </Link>
        </div>

        <nav
          aria-label="Digital library navigation"
          className="mb-6 flex max-w-full gap-1 overflow-x-auto rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-1"
        >
          {LIBRARY_TABS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/digital-library'}
              className={({ isActive }) =>
                [
                  'flex min-h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-[10px] font-semibold transition',
                  isActive
                    ? 'bg-[var(--ds-amber-10)] text-[var(--ds-soft-gold)]'
                    : 'text-[var(--ds-muted)] hover:text-[var(--ds-text)]',
                ].join(' ')
              }
            >
              <Icon size={13} />
              {label}
            </NavLink>
          ))}
        </nav>

        {active.isPending ? (
          <div className="ds-panel p-8">
            <p role="status" className="text-sm text-[var(--ds-muted)]">
              Loading…
            </p>
          </div>
        ) : active.isError ? (
          <div className="ds-panel p-8">
            <p role="alert" className="text-sm text-red-400">
              Your library could not load. Please retry later.
            </p>
          </div>
        ) : purchases ? (
          <div className="space-y-3">
            {orders.data?.data.orders.map((order) => (
              <article key={order._id} className="ds-panel p-5 sm:p-6">
                <div className="relative z-10">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-03)] text-[var(--ds-gold)]">
                        <FileText size={17} />
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate text-base">{order.title}</h2>
                        <p className="mt-1 text-[10px] text-[var(--ds-muted)]">
                          {new Date(order.createdAt).toLocaleDateString()} ·{' '}
                          {priceLabel(order.amountPaise)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`w-fit rounded-full border px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.1em] ${orderStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-5 flex flex-col gap-3 border-t border-[var(--ds-border-soft)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="break-all font-mono text-[9px] text-[var(--ds-muted-soft)]">
                      Order: {order._id}
                    </p>
                    {['created', 'payment_pending', 'failed'].includes(
                      order.status
                    ) ? (
                      <Button
                        variant="outline"
                        onClick={() => void reconcile(order._id)}
                      >
                        <RefreshCw size={13} />
                        Check payment
                      </Button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
            {!orders.data?.data.orders.length ? (
              <div className="ds-panel p-9 text-center">
                <ShoppingBag
                  size={26}
                  className="mx-auto text-[var(--ds-gold)]"
                />
                <h2 className="mt-4 text-lg">No purchases yet</h2>
                <p className="mt-2 text-sm text-[var(--ds-muted)]">
                  Your verified digital-resource orders will appear here.
                </p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <div className="mb-4">
                <p className="ds-eyebrow">Purchased</p>
                <h2 className="mt-2 text-xl">Owned resources</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {owned.data?.data.items.map((item) => (
                  <article
                    key={`${item.type}-${item.id}-${item.purchasedAt}`}
                    className="ds-panel p-5"
                  >
                    <div className="relative z-10 flex h-full flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <span className="flex size-10 items-center justify-center rounded-xl border border-[var(--ds-border-gold)] bg-[var(--ds-amber-08)] text-[var(--ds-gold)]">
                          {item.type === 'mantra' ? (
                            <Sparkles size={16} />
                          ) : (
                            <FileText size={16} />
                          )}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-emerald-400">
                          <CheckCircle2 size={10} />
                          Owned
                        </span>
                      </div>
                      <h3 className="mt-5 text-lg">{item.title}</h3>
                      <p className="mt-2 text-[10px] text-[var(--ds-muted)]">
                        Purchased{' '}
                        {new Date(item.purchasedAt).toLocaleDateString()}
                      </p>
                      <div className="mt-auto pt-5">
                        {!item.available ? (
                          <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] leading-5 text-amber-300">
                            Currently unavailable. Contact support about this
                            purchase.
                          </p>
                        ) : item.type === 'mantra' ? (
                          <Link
                            className="ds-secondary-button inline-flex min-h-10 w-full items-center justify-center rounded-xl px-4 text-[11px]"
                            to={`/library/${item.slug}`}
                          >
                            Open mantra
                          </Link>
                        ) : (
                          <Button
                            className="w-full"
                            onClick={() => {
                              setMessage('');
                              void downloadPdf(item.id).catch((error) =>
                                setMessage(error.message)
                              );
                            }}
                          >
                            <Download size={13} />
                            Download PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {!owned.data?.data.items.length ? (
                <div className="ds-panel p-8 text-center">
                  <BookOpen
                    size={25}
                    className="mx-auto text-[var(--ds-gold)]"
                  />
                  <p className="mt-4 text-sm text-[var(--ds-muted)]">
                    No purchased resources yet. You can explore free items in
                    the digital library.
                  </p>
                </div>
              ) : null}
            </div>

            <div>
              <p className="ds-eyebrow">Included access</p>
              <h2 className="mt-2 text-xl">Free reading resources</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {free.isError ? (
                  <p className="text-sm text-[var(--ds-muted)]">
                    Free resources could not load.
                  </p>
                ) : null}
                {free.data?.data.products.map((product) => (
                  <Link
                    key={product._id}
                    to={`/store/${product.slug}`}
                    className="ds-panel group flex items-center gap-4 p-4"
                  >
                    <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-xl border border-[var(--ds-border-soft)] text-[var(--ds-gold)]">
                      <FileText size={16} />
                    </span>
                    <span className="relative z-10 min-w-0">
                      <span className="block truncate text-[11px] font-semibold text-[var(--ds-text)]">
                        {product.title}
                      </span>
                      <span className="mt-1 block text-[9px] text-emerald-400">
                        Free PDF
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

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

        <div className="mt-8 flex flex-col gap-3 rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-3 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[10px] text-[var(--ds-muted)]">
            Page {page}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={
                page * 12 >=
                (purchases
                  ? (orders.data?.data.total ?? 0)
                  : Math.max(
                      owned.data?.data.total ?? 0,
                      free.data?.data.total ?? 0
                    ))
              }
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        </div>

        <p className="mt-6 text-[9px] leading-5 text-[var(--ds-muted-soft)]">
          Paid PDF delivery requires a connection. Downloaded files remain your
          responsibility and are not stored in the app&apos;s offline practice
          cache.
        </p>
      </div>
    </section>
  );
}
