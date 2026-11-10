'use client';

import { apiRequest, isApiError } from '@/services/api/client';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, Compass, Layers3, Loader2, Orbit, RefreshCw, Sparkles } from 'lucide-react';
import { useState } from 'react';

type Placement = { sign: string; house: number | null; retrograde: boolean | null };
type AstroReading = {
  _id: string;
  planets: Record<string, Placement>;
  summary: { moon: Placement & { nakshatra: string | null; pada: number | null } };
};
type NavamsaPlacement = {
  name: string;
  sign: string;
  house: number | null;
  retrograde: boolean | null;
};
type DashaPeriod = { lord: string; startsAt: string; endsAt: string };
type ApiResult<T> = { success: true; data: { items: T[]; cached: boolean } };
type Panel = 'houses' | 'navamsa' | 'dasha';
const VEDIC_BODIES = [
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus',
  'Saturn', 'Rahu', 'Ketu',
] as const;
const HOUSE_TOPICS = [
  'Self & identity', 'Resources', 'Communication', 'Home & roots',
  'Creativity', 'Daily routines', 'Relationships', 'Transformation',
  'Learning', 'Public work', 'Community', 'Rest & reflection',
] as const;
const TABS: { id: Panel; label: string; sub: string; icon: typeof Compass }[] = [
  { id: 'houses', label: '12 Houses', sub: 'Included', icon: Compass },
  { id: 'navamsa', label: 'Navamsa D9', sub: 'On demand', icon: Layers3 },
  { id: 'dasha', label: 'Mahadasha', sub: 'On demand', icon: Orbit },
];
function getErrorMessage(error: unknown) {
  return isApiError(error) ? error.message : 'Could not load this detail. Please try again.';
}
function displayProviderDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}
function SmallLabel({ children }: { children: import('react').ReactNode }) {
  return <span className="text-[9px] uppercase tracking-[0.12em] text-[var(--ds-muted)]">{children}</span>;
}
function HouseOverview({ reading }: { reading: AstroReading }) {
  const planets = VEDIC_BODIES.map((name) => ({ name, placement: reading.planets[name] }))
    .filter((row) => row.placement && row.placement.house !== null);
  const retrograde = planets.filter(({ placement }) => placement?.retrograde).length;
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-4">
          <SmallLabel>Moon Nakshatra</SmallLabel>
          <p className="mt-2 font-serif text-lg text-[var(--ds-soft-gold)]">
            {reading.summary.moon.nakshatra ?? 'Not available'}
          </p>
          <p className="mt-1 text-[10px] text-[var(--ds-muted)]">
            {reading.summary.moon.pada ? `Pada ${reading.summary.moon.pada} of 4` : 'Lunar mansion'}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-4">
          <SmallLabel>Visible placements</SmallLabel>
          <p className="mt-2 font-serif text-2xl text-[var(--ds-soft-gold)]">{planets.length}</p>
          <p className="mt-1 text-[10px] text-[var(--ds-muted)]">Traditional nine grahas</p>
        </div>
        <div className="rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-4">
          <SmallLabel>Retrograde indicators</SmallLabel>
          <p className="mt-2 font-serif text-2xl text-[var(--ds-soft-gold)]">{retrograde}</p>
          <p className="mt-1 text-[10px] text-[var(--ds-muted)]">As returned by the provider</p>
        </div>
      </div>
      <div>
        <p className="mb-3 text-[11px] leading-6 text-[var(--ds-muted)]">
          Houses are grouped from your saved Rashi chart. Each card shows the bodies the
          provider placed there; the short topics are traditional study labels, not predictions.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {HOUSE_TOPICS.map((topic, index) => {
            const house = index + 1;
            const occupants = planets.filter((item) => item.placement.house === house);
            return (
              <div
                key={house}
                className={`min-h-32 rounded-xl border p-3.5 transition-colors ${
                  occupants.length
                    ? 'border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)]'
                    : 'border-[var(--ds-border-soft)] bg-[var(--ds-white-02)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <SmallLabel>House {house}</SmallLabel>
                  <span className="text-[12px] text-[var(--ds-gold)]">{String(house).padStart(2, '0')}</span>
                </div>
                <p className="mt-1.5 text-[11px] font-semibold text-[var(--ds-text)]">{topic}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {occupants.length ? occupants.map(({ name, placement }) => (
                    <span
                      key={name}
                      title={`${name} in ${placement.sign}${placement.retrograde ? ', retrograde' : ''}`}
                      className={
                        'rounded-full border border-[var(--ds-border-gold)] ' +
                        'bg-[var(--ds-amber-08)] px-2 py-1 text-[9px] text-[var(--ds-soft-gold)]'
                      }
                    >
                      {name}{placement.retrograde ? ' R' : ''}
                    </span>
                  )) : <span className="text-[10px] text-[var(--ds-muted-soft)]">No listed grahas</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
function ExtraStatus({
  loading, error, onRetry,
}: { loading: boolean; error: unknown; onRetry: () => void }) {
  if (loading) {
    return (
      <div
        role="status"
        className={
          'flex items-center gap-3 rounded-xl border border-[var(--ds-border-soft)] ' +
          'p-5 text-[11px] text-[var(--ds-muted)]'
        }
      >
        <Loader2 size={17} className="animate-spin text-[var(--ds-gold)]" />
        Calculating and saving this additional detail…
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-red-500/20 p-5 text-[11px] text-red-300" role="alert">
      <p>{getErrorMessage(error)}</p>
      <button
        type="button" onClick={onRetry}
        className={
          'mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border ' +
          'border-[var(--ds-border-soft)] px-4 text-[var(--ds-text)]'
        }
      >
        <RefreshCw size={14} /> Try again
      </button>
    </div>
  );
}

export function AstroInsights({ reading }: { reading: AstroReading }) {
  const [active, setActive] = useState<Panel>('houses');
  const navamsa = useQuery({
    queryKey: ['astro', 'extra', reading._id, 'navamsa'],
    queryFn: () => apiRequest<ApiResult<NavamsaPlacement>>(
      `/astro/history/${encodeURIComponent(reading._id)}/extras/navamsa`, { method: 'POST' },
    ),
    enabled: active === 'navamsa',
    staleTime: Infinity,
    retry: false,
  });
  const dasha = useQuery({
    queryKey: ['astro', 'extra', reading._id, 'dasha'],
    queryFn: () => apiRequest<ApiResult<DashaPeriod>>(
      `/astro/history/${encodeURIComponent(reading._id)}/extras/dasha`, { method: 'POST' },
    ),
    enabled: active === 'dasha',
    staleTime: Infinity,
    retry: false,
  });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section
      aria-label="Explore your birth chart"
      className={
        'mt-7 overflow-hidden rounded-2xl border border-[var(--ds-border-gold)] ' +
        'bg-[var(--ds-white-02)] p-4 sm:p-6'
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="ds-eyebrow flex items-center gap-2"><Sparkles size={13} /> Explore more</p>
          <h3 className="mt-2 font-serif text-[22px] text-[var(--ds-cream)]">Your Vedic chart, in depth</h3>
          <p className="mt-2 max-w-2xl text-[11px] leading-6 text-[var(--ds-muted)]">
            Explore houses from your saved chart, or request additional D9 and planetary-period
            calculations. Extra requests are made only when you select those tabs, then saved.
          </p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2" aria-label="Astrology detail sections">
        {TABS.map(({ id, label, sub, icon: Icon }) => (
          <button
            key={id} type="button" aria-pressed={active === id} onClick={() => setActive(id)}
            className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-xl border p-2 ${
              'text-center transition-colors sm:flex-row sm:gap-3 sm:text-left'
            } ${
              active === id
                ? 'border-[var(--ds-border-gold)] bg-[var(--ds-amber-10)] text-[var(--ds-soft-gold)]'
                : 'border-[var(--ds-border-soft)] text-[var(--ds-muted)] hover:bg-[var(--ds-white-03)]'
            }`}
          >
            <Icon size={19} className="shrink-0" />
            <span><span className="block text-[11px] font-semibold">{label}</span>
              <span className="mt-1 block text-[9px] opacity-70">{sub}</span></span>
          </button>
        ))}
      </div>
      <div className="mt-5" aria-live="polite">
        {active === 'houses' && <HouseOverview reading={reading} />}
        {active === 'navamsa' && (
          navamsa.data ? (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-[11px] leading-6 text-[var(--ds-muted)]">
                  Navamsa (D9) is a separate divisional chart in Jyotish tradition. These
                  signs and houses come from FreeAstrologyAPI, not from a guessed calculation.
                </p>
                {navamsa.data.data.cached && <SmallLabel>Previously saved</SmallLabel>}
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {navamsa.data.data.items.map((item) => (
                  <div
                    key={item.name}
                    className={
                      'flex items-center justify-between gap-3 rounded-xl border ' +
                      'border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] p-3.5'
                    }
                  >
                    <div><p className="text-[11px] font-semibold text-[var(--ds-text)]">{item.name}</p>
                      <p className="mt-1 text-[10px] text-[var(--ds-muted)]">
                        {item.house ? `D9 house ${item.house}` : 'House unavailable'}
                        {item.retrograde ? ' · Retrograde' : ''}
                      </p>
                    </div>
                    <span className="text-right font-serif text-[16px] text-[var(--ds-soft-gold)]">
                      {item.sign}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ExtraStatus
              loading={navamsa.isPending || navamsa.isFetching}
              error={navamsa.error}
              onRetry={() => { void navamsa.refetch(); }}
            />
          )
        )}
        {active === 'dasha' && (
          dasha.data ? (
            <div>
              <p className="mb-4 text-[11px] leading-6 text-[var(--ds-muted)]">
                Vimshottari Mahadasha: the provider's nine traditional planetary periods.
                Dates are shown as returned, without making predictions about events or outcomes.
              </p>
              <ol className="space-y-2">
                {dasha.data.data.items.map((period, index) => {
                  const current = period.startsAt.slice(0, 10) <= today &&
                    period.endsAt.slice(0, 10) >= today;
                  return (
                    <li
                      key={`${period.lord}-${index}`}
                      className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3.5 ${
                      current
                        ? 'border-[var(--ds-border-gold)] bg-[var(--ds-amber-08)]'
                        : 'border-[var(--ds-border-soft)] bg-[var(--ds-white-02)]'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span
                          className={
                            'flex size-8 items-center justify-center rounded-full border ' +
                            'border-[var(--ds-border-gold)] text-[10px] text-[var(--ds-gold)]'
                          }
                        >{index + 1}</span>
                        <span className="text-[12px] font-semibold text-[var(--ds-text)]">{period.lord}</span>
                        {current && (
                          <span className={
                            'rounded-full bg-[var(--ds-amber-10)] ' +
                            'px-2 py-1 text-[9px] text-[var(--ds-soft-gold)]'
                          }>Current period</span>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-2 text-[10px] text-[var(--ds-muted)]">
                        {displayProviderDate(period.startsAt)}
                        <ArrowRight size={12} />
                        {displayProviderDate(period.endsAt)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : (
            <ExtraStatus
              loading={dasha.isPending || dasha.isFetching}
              error={dasha.error}
              onRetry={() => { void dasha.refetch(); }}
            />
          )
        )}
      </div>
      <p className={
        'mt-5 border-t border-[var(--ds-border-soft)] ' +
        'pt-4 text-[10px] leading-6 text-[var(--ds-muted)]'
      }>
        Additional charts are private to your account. On first use, each extra section
        makes one provider request; re-opening a saved section uses the stored result.
        Astrology is a cultural tradition, not a scientifically validated prediction method.
      </p>
    </section>
  );
}
