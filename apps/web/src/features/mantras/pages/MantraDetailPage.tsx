import { FavoriteButton } from '../components/FavoriteButton';
import { MANTRA_IMAGES } from '../constants/mantra-images';
import { useFavorites } from '../hooks/useFavorites';
import { useMantra } from '../hooks/useMantra';
import { getEstimatedChantMinutes } from '../utils/mantra.utils';
import { APP_ROUTES, getPracticeRoute } from '@/app/constants/routes.constants';
import { ArrowLeft, Clock3, Play, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';

export function MantraDetailPage() {
  const { slug } = useParams<{
    slug: string;
  }>();

  const navigate = useNavigate();

  const { data: mantra, isLoading, isError, error } = useMantra(slug);

  const { data: favoriteMantras = [] } = useFavorites();

  if (isLoading) {
    return <MantraDetailSkeleton />;
  }

  if (isError || !mantra) {
    return (
      <main className="min-h-screen bg-[#07111f] px-4 py-8 text-white md:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            to={APP_ROUTES.library}
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-amber-300"
          >
            <ArrowLeft size={16} />
            Back to Library
          </Link>

          <section className="mt-8 rounded-2xl border border-red-400/20 bg-red-400/[0.05] p-6">
            <h1 className="font-serif text-xl text-red-200">
              Unable to load this mantra
            </h1>

            <p className="mt-2 text-sm leading-6 text-red-200/70">
              {error instanceof Error
                ? error.message
                : 'The mantra may not exist or could not be loaded.'}
            </p>

            <Link
              to={APP_ROUTES.library}
              className="mt-5 inline-flex rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-slate-200 transition hover:border-amber-400/30 hover:text-amber-300"
            >
              Return to Library
            </Link>
          </section>
        </div>
      </main>
    );
  }

  const isFavorite = favoriteMantras.some(
    (favorite) => favorite._id === mantra._id
  );

  const image = MANTRA_IMAGES[mantra.slug];

  const primaryTarget = mantra.defaultTargets[0] ?? 108;

  const estimatedMinutes = getEstimatedChantMinutes(
    primaryTarget,
    mantra.estimatedSecondsPerChant
  );

  return (
    <main className="min-h-screen bg-[#07111f] px-4 pb-24 pt-6 text-white md:px-6 md:pb-12 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Back */}
        <Link
          to={APP_ROUTES.library}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-amber-300"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          Back to Library
        </Link>

        {/* Hero */}
        <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0b1523]">
          <div className="grid lg:grid-cols-[380px_1fr]">
            {/* Image */}
            <div className="relative min-h-[330px] overflow-hidden bg-white/[0.03] sm:min-h-[400px] lg:min-h-[520px]">
              {image ? (
                <img
                  src={image}
                  alt={mantra.title}
                  width={760}
                  height={1040}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
              ) : (
                <div className="absolute inset-0 bg-white/[0.03]" />
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0b1523]/70 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#0b1523]/60" />
            </div>

            {/* Hero content */}
            <div className="flex flex-col px-5 py-6 sm:px-7 sm:py-8 lg:px-9 lg:py-10">
              {mantra.deity ? (
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-400">
                  {mantra.deity}
                </p>
              ) : null}

              <div className="mt-2 flex items-start justify-between gap-4">
                <h1 className="font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[42px] lg:leading-[1.15]">
                  {mantra.title}
                </h1>

                <div className="shrink-0">
                  <FavoriteButton
                    mantra={mantra}
                    isFavorite={isFavorite}
                    variant="detail"
                  />
                </div>
              </div>

              <div className="mt-6 border-l-2 border-amber-400/50 pl-5">
                <p className="font-serif text-xl leading-9 text-amber-50 sm:text-2xl sm:leading-10">
                  {mantra.sanskrit}
                </p>

                <p className="mt-3 text-sm italic leading-7 text-slate-400">
                  {mantra.transliteration}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {mantra.categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-3 py-1.5 text-xs text-amber-200"
                  >
                    {category}
                  </span>
                ))}
              </div>

              <p className="mt-6 text-sm leading-7 text-slate-300 sm:text-[15px]">
                {mantra.meaning}
              </p>

              {/* Practice summary */}
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Sparkles size={16} className="text-amber-400" />

                    <span className="text-xs">Suggested practice</span>
                  </div>

                  <p className="mt-2 font-serif text-xl text-white">
                    {primaryTarget} chants
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock3 size={16} className="text-amber-400" />

                    <span className="text-xs">Estimated time</span>
                  </div>

                  <p className="mt-2 font-serif text-xl text-white">
                    {estimatedMinutes ? `~${estimatedMinutes} min` : 'Varies'}
                  </p>
                </div>
              </div>

              {/* Start practice */}
              <button
                type="button"
                onClick={() => navigate(getPracticeRoute(mantra.slug))}
                className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-amber-300/70 bg-gradient-to-b from-[#f3c45d] to-[#d89627] px-6 text-sm font-semibold text-[#241704] shadow-[0_0_24px_rgba(245,158,11,0.14)] transition hover:brightness-105"
              >
                <Play size={17} fill="currentColor" />
                Start Practice
              </button>
            </div>
          </div>
        </section>

        {/* Detail content */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            {/* About */}
            {mantra.description ? (
              <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                  About this mantra
                </p>

                <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-[15px]">
                  {mantra.description}
                </p>
              </section>
            ) : null}

            {/* Meaning */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                Meaning
              </p>

              <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-[15px]">
                {mantra.meaning}
              </p>
            </section>

            {/* Benefits */}
            {mantra.benefits.length > 0 ? (
              <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                  Benefits
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {mantra.benefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
                    >
                      <Sparkles
                        size={16}
                        className="mt-0.5 shrink-0 text-amber-400"
                      />

                      <p className="text-sm leading-6 text-slate-300">
                        {benefit}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          {/* Right column */}
          <aside className="space-y-6">
            {/* Chant targets */}
            <section className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.035] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                Chant targets
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Choose a repetition count that matches your practice.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {mantra.defaultTargets.map((target) => {
                  const minutes = getEstimatedChantMinutes(
                    target,
                    mantra.estimatedSecondsPerChant
                  );

                  return (
                    <div
                      key={target}
                      className="min-w-[88px] rounded-xl border border-white/[0.08] bg-[#07111f]/70 px-3 py-3 text-center"
                    >
                      <p className="font-serif text-lg text-white">{target}</p>

                      <p className="mt-1 text-[10px] text-slate-500">
                        {minutes ? `~${minutes} min` : 'chants'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Mantra details */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
                Mantra details
              </p>

              <dl className="mt-4 space-y-4">
                {mantra.deity ? (
                  <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-3">
                    <dt className="text-xs text-slate-500">Deity</dt>

                    <dd className="text-right text-sm text-slate-200">
                      {mantra.deity}
                    </dd>
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-3">
                  <dt className="text-xs text-slate-500">Primary target</dt>

                  <dd className="text-right text-sm text-slate-200">
                    {primaryTarget}
                  </dd>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <dt className="text-xs text-slate-500">Practice</dt>

                  <dd className="text-right text-sm text-slate-200">Japa</dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function MantraDetailSkeleton() {
  return (
    <main className="min-h-screen bg-[#07111f] px-4 pb-24 pt-6 md:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="h-5 w-32 animate-pulse rounded bg-white/[0.06]" />

        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
          <div className="grid lg:grid-cols-[380px_1fr]">
            <div className="h-[360px] animate-pulse bg-white/[0.05] lg:h-[520px]" />

            <div className="space-y-5 p-7 lg:p-10">
              <div className="h-3 w-24 animate-pulse rounded bg-white/[0.06]" />

              <div className="h-10 w-3/4 animate-pulse rounded bg-white/[0.06]" />

              <div className="h-24 animate-pulse rounded bg-white/[0.05]" />

              <div className="h-16 animate-pulse rounded bg-white/[0.05]" />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="h-20 animate-pulse rounded-2xl bg-white/[0.05]" />

                <div className="h-20 animate-pulse rounded-2xl bg-white/[0.05]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
