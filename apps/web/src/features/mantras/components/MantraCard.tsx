import { MANTRA_IMAGES } from '../constants/mantra-images';
import { FavoriteButton } from './FavoriteButton';
import { getMantraDetailRoute } from '@/app/constants/routes.constants';
import type { Mantra } from '@devsangam/types';
import { Link } from 'react-router';

type MantraCardProps = {
  mantra: Mantra;
  isFavorite: boolean;
};

export function MantraCard({ mantra, isFavorite }: MantraCardProps) {
  const image = MANTRA_IMAGES[mantra.slug];

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1726] transition hover:-translate-y-0.5 hover:border-amber-400/30">
      {/* Favorite */}
      <div className="absolute right-3 top-3 z-20">
        <FavoriteButton mantra={mantra} isFavorite={isFavorite} />
      </div>

      <div className="grid min-h-[250px] grid-cols-[175px_1fr]">
        {/* Image */}
        <div className="relative min-h-[250px] overflow-hidden bg-white/[0.03]">
          {image ? (
            <img
              src={image}
              alt={mantra.title}
              width={175}
              height={250}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 bg-white/[0.03]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0d1726]/20" />
        </div>

        {/* Content */}
        <div className="flex min-w-0 flex-col px-5 py-4 pr-14">
          <div>
            {mantra.deity ? (
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">
                {mantra.deity}
              </p>
            ) : null}

            <h2 className="mt-1 line-clamp-1 font-serif text-lg font-semibold leading-6 text-white">
              {mantra.title}
            </h2>

            <p className="mt-2 line-clamp-2 font-serif text-sm leading-6 text-amber-50">
              {mantra.sanskrit}
            </p>

            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
              {mantra.transliteration}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {mantra.categories.slice(0, 3).map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] leading-none text-slate-400"
                >
                  {item}
                </span>
              ))}
            </div>

            <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-400">
              {mantra.meaning}
            </p>
          </div>

          <div className="mt-auto pt-3">
            <Link
              to={getMantraDetailRoute(mantra.slug)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 transition group-hover:text-amber-200"
              aria-label={`View ${mantra.title}`}
            >
              View mantra
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
