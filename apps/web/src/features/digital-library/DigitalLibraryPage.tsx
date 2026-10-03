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
import { useState } from 'react';
import { Link, useLocation } from 'react-router';

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
    <section className="ds-page p-5 sm:p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl">
          {purchases ? 'Purchase history' : 'My digital library'}
        </h1>
        <nav
          aria-label="Digital library navigation"
          className="my-7 flex flex-wrap gap-5"
        >
          <Link to="/digital-library">Owned resources</Link>
          <Link to="/digital-library/purchases">Purchases</Link>
          <Link to="/store">Browse digital library</Link>
          <Link to="/library">Mantra library</Link>
        </nav>
        {active.isPending ? (
          <p role="status">Loading…</p>
        ) : active.isError ? (
          <p role="alert">Your library could not load. Please retry later.</p>
        ) : purchases ? (
          <div className="space-y-5">
            {orders.data?.data.orders.map((order) => (
              <article key={order._id} className="ds-panel p-6">
                <h2 className="text-xl">{order.title}</h2>
                <p className="my-3">
                  {priceLabel(order.amountPaise)} ·{' '}
                  {order.status.replace('_', ' ')} ·{' '}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="mb-3 text-sm text-muted-foreground">
                  Order: {order._id}
                </p>
                {['created', 'payment_pending', 'failed'].includes(
                  order.status
                ) && (
                  <Button onClick={() => void reconcile(order._id)}>
                    Check payment
                  </Button>
                )}
              </article>
            ))}
            {!orders.data?.data.orders.length && <p>No purchases yet.</p>}
          </div>
        ) : (
          <div className="space-y-5">
            {owned.data?.data.items.map((item) => (
              <article
                key={`${item.type}-${item.id}-${item.purchasedAt}`}
                className="ds-panel p-6"
              >
                <h2 className="text-xl">{item.title}</h2>
                <p className="my-4">
                  Purchased {new Date(item.purchasedAt).toLocaleDateString()}
                </p>
                {!item.available ? (
                  <p>
                    Currently unavailable. Contact support about this purchase.
                  </p>
                ) : item.type === 'mantra' ? (
                  <Link className="underline" to={`/library/${item.slug}`}>
                    Open mantra
                  </Link>
                ) : (
                  <Button
                    onClick={() => {
                      void downloadPdf(item.id).catch((error) =>
                        setMessage(error.message)
                      );
                    }}
                  >
                    Download PDF
                  </Button>
                )}
              </article>
            ))}
            {!owned.data?.data.items.length && (
              <p>
                No purchased resources yet. You can explore free items in the
                digital library.
              </p>
            )}
            <h2 className="pt-5 text-2xl">Free reading resources</h2>
            {free.isError && <p>Free resources could not load.</p>}
            {free.data?.data.products.map((product) => (
              <Link
                key={product._id}
                to={`/store/${product.slug}`}
                className="ds-panel block p-5"
              >
                {product.title} · Free PDF
              </Link>
            ))}
          </div>
        )}
        <p role="status" className="mt-5">
          {message}
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </Button>
          <span>Page {page}</span>
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
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Paid PDF delivery requires a connection. Downloaded files remain your
          responsibility and are not stored in the app’s offline cache.
        </p>
      </div>
    </section>
  );
}
