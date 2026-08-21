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
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

export function MantraLibraryPage() {
  const [search, setSearch] = useState('');

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

  const { data: mantras = [], isLoading, isError } = useMantras(queryParams);

  const { data: favoriteMantras = [] } = useFavorites();

  const favoriteMantraIds = useMemo(
    () => new Set(favoriteMantras.map((mantra) => mantra._id)),
    [favoriteMantras]
  );

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
              onChange={(event) => setSearch(event.target.value)}
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
                  onClick={() => setCategory(item)}
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
              length: 4,
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
          <section className="grid gap-4 xl:grid-cols-2">
            {mantras.map((mantra) => (
              <MantraCard
                key={mantra._id}
                mantra={mantra}
                isFavorite={favoriteMantraIds.has(mantra._id)}
              />
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
