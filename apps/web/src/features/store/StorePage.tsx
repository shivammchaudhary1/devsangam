import { priceLabel } from './commerce.utils';
import { PublicPageShell } from '@/features/public-site/components/PublicPageShell';
import { apiRequest } from '@/services/api/client';
import type { ApiResult, DigitalProduct } from '@devsangam/types';
import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';

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
      intro="Explore free and premium devotional reading resources. Your purchased items stay in your account library."
    >
      <Link to="/digital-library" className="mb-7 inline-block underline">
        My digital library and purchases
      </Link>
      {result.isPending ? (
        <p role="status">Loading resources…</p>
      ) : result.isError ? (
        <p role="alert">Resources could not load. Please try again later.</p>
      ) : (
        <>
          {!result.data.data.products.length && (
            <p className="ds-panel p-8">
              No resources are published yet. Please check back later.
            </p>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {result.data.data.products.map((product) => (
              <article key={product._id} className="ds-panel p-5">
                <Link to={`/store/${product.slug}`}>
                  <div className="mb-5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-muted">
                    {product.coverImage ? (
                      <img
                        src={product.coverImage}
                        alt={product.title}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : (
                      <BookOpen
                        aria-hidden="true"
                        className="size-16 text-primary"
                      />
                    )}
                  </div>
                  <h2 className="text-xl">{product.title}</h2>
                </Link>
                <p className="my-4 leading-7 text-muted-foreground">
                  {product.shortDescription}
                </p>
                <p>
                  {product.accessType === 'free'
                    ? 'Free'
                    : priceLabel(product.pricePaise)}
                </p>
                <Link
                  className="mt-4 inline-block underline"
                  to={`/store/${product.slug}`}
                >
                  View resource
                </Link>
              </article>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-lg border border-border p-3 disabled:opacity-50"
            >
              Previous
            </button>
            <span>Page {page}</span>
            <button
              disabled={page * 12 >= result.data.data.total}
              onClick={() => setPage(page + 1)}
              className="rounded-lg border border-border p-3 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </PublicPageShell>
  );
}
