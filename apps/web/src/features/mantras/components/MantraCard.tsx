import type { Mantra } from '@devsangam/types';

import { mantraImages } from '../constants/mantra-images';

type MantraCardProps = {
  mantra: Mantra;
};

export function MantraCard({ mantra }: MantraCardProps) {
  const image = mantraImages[mantra.slug];

  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0d1726] transition hover:-translate-y-0.5 hover:border-amber-400/30">
      <div className="grid h-[250px] grid-cols-[165px_1fr]">
        <div className="relative h-full w-full overflow-hidden bg-white/[0.03]">
          {image ? (
            <img
              src={image}
              alt={mantra.title}
              className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="h-full w-full bg-white/[0.03]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0d1726]/20" />
        </div>

        <div className="flex min-w-0 flex-col px-5 py-4">
          {mantra.deity ? (
            <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400">
              {mantra.deity}
            </p>
          ) : null}

          <h2 className="mt-1 line-clamp-2 font-serif text-lg font-semibold leading-6 text-white">
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

          <button
            type="button"
            className="mt-auto pt-3 text-left text-xs font-medium text-amber-300 transition group-hover:text-amber-200"
          >
            View mantra
            <span className="ml-1.5" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
