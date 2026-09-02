import { MantraCard } from '../components/MantraCard';
import {
  DEFAULT_MANTRA_CATEGORY,
  MANTRA_CATEGORIES,
  MANTRA_SEARCH_DEBOUNCE_MS,
  type MantraCategory,
} from '../constants/mantra.constants';
import { useFavorites } from '../hooks/useFavorites';
import { useMantras } from '../hooks/useMantras';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

const MANTRAS_PER_PAGE = 6;

export function MantraLibraryPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [category, setCategory] = useState<MantraCategory>(
    DEFAULT_MANTRA_CATEGORY
  );

  const debouncedSearch = useDebouncedValue(search, MANTRA_SEARCH_DEBOUNCE_MS);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,

      category: category === DEFAULT_MANTRA_CATEGORY ? undefined : category,
    }),
    [debouncedSearch, category]
  );

  const {
    data: mantras = [],
    isLoading,
    isError,
    isFetching,
  } = useMantras(queryParams);

  const { data: favoriteMantras = [] } = useFavorites();

  const favoriteMantraIds = useMemo(
    () => new Set(favoriteMantras.map((mantra) => mantra._id)),
    [favoriteMantras]
  );

  const totalPages = Math.max(1, Math.ceil(mantras.length / MANTRAS_PER_PAGE));

  const currentPage = Math.min(page, totalPages);

  const visibleMantras = useMemo(() => {
    const start = (currentPage - 1) * MANTRAS_PER_PAGE;
    const end = start + MANTRAS_PER_PAGE;

    return mantras.slice(start, end);
  }, [currentPage, mantras]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleCategoryChange(nextCategory: MantraCategory) {
    setCategory(nextCategory);
    setPage(1);
  }

  function handlePreviousPage() {
    setPage((current) => Math.max(1, current - 1));

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function handleNextPage() {
    setPage((current) => Math.min(totalPages, current + 1));

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  return (
    <main className="min-h-screen bg-[#07111f] px-4 pb-16 pt-6 text-white md:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <section className="mb-6">
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">
            Sadhana Library
          </p>

          <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            Choose your mantra
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Explore sacred mantras for devotion, peace, focus, healing, and
            disciplined daily practice.
          </p>
        </section>

        <section className="mb-7">
          <div className="relative max-w-2xl">
            <Search
              aria-hidden="true"
              className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search mantras, deity, purpose..."
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/50 focus:bg-white/[0.06]"
            />
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {MANTRA_CATEGORIES.map((item) => {
              const active = category === item;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleCategoryChange(item)}
                  className={[
                    'shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition',

                    active
                      ? 'border-amber-400/60 bg-amber-400/10 text-amber-300'
                      : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:text-white',
                  ].join(' ')}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </section>

        {isLoading ? (
          <section className="grid gap-4 xl:grid-cols-2">
            {Array.from({
              length: MANTRAS_PER_PAGE,
            }).map((_, index) => (
              <div
                key={index}
                className="h-[250px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]"
              />
            ))}
          </section>
        ) : null}

        {isError ? (
          <section className="rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
            <h2 className="font-medium text-red-200">
              Unable to load the mantra library
            </h2>

            <p className="mt-2 text-sm text-red-200/70">
              Please try again in a moment.
            </p>
          </section>
        ) : null}

        {!isLoading && !isError && mantras.length === 0 ? (
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <h2 className="font-serif text-xl text-white">No mantras found</h2>

            <p className="mt-2 text-sm text-slate-400">
              Try another search term or category.
            </p>
          </section>
        ) : null}

        {!isLoading && !isError && mantras.length > 0 ? (
          <>
            <div
              className={[
                'grid gap-4 transition-opacity xl:grid-cols-2',
                isFetching ? 'opacity-70' : 'opacity-100',
              ].join(' ')}
              aria-busy={isFetching}
            >
              {visibleMantras.map((mantra) => (
                <MantraCard
                  key={mantra._id}
                  mantra={mantra}
                  isFavorite={favoriteMantraIds.has(mantra._id)}
                />
              ))}
            </div>

            {totalPages > 1 ? (
              <nav
                aria-label="Mantra library pagination"
                className="mt-8 flex items-center justify-center gap-3"
              >
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-xs font-medium text-slate-300 transition hover:border-amber-400/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>

                <div className="min-w-[96px] text-center">
                  <p className="text-xs font-medium text-slate-300">
                    Page {currentPage} of {totalPages}
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {mantras.length} mantras
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-xs font-medium text-slate-300 transition hover:border-amber-400/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </nav>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}
