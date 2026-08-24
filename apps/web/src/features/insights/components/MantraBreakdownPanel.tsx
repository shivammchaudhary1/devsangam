import {
  formatInsightsDuration,
  formatInsightsNumber,
} from '../utils/insights-format.utils';
import { useMantras } from '@/features/mantras/hooks/useMantras';
import type { Mantra, MantraPracticeBreakdown } from '@devsangam/types';
import type { LucideIcon } from 'lucide-react';
import { Clock3, Layers3, Sparkles } from 'lucide-react';
import { memo, useMemo } from 'react';

type MantraBreakdownPanelProps = {
  breakdown: MantraPracticeBreakdown[];
  totalChants: number;
};

export const MantraBreakdownPanel = memo(function MantraBreakdownPanel({
  breakdown,
  totalChants,
}: MantraBreakdownPanelProps) {
  const { data: mantras = [] } = useMantras();

  const mantraBySlug = useMemo(
    () => new Map(mantras.map((mantra) => [mantra.slug, mantra])),
    [mantras]
  );

  if (breakdown.length === 0) {
    return <MantraBreakdownEmptyState />;
  }

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#09121e] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={14} strokeWidth={1.7} className="text-amber-400" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Mantras
            </p>
          </div>

          <h2 className="mt-1 font-serif text-lg text-slate-200">
            Practice breakdown
          </h2>

          <p className="mt-1 text-[11px] leading-5 text-slate-600">
            See where your chanting practice has been focused.
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-right">
          <p className="text-[8px] uppercase tracking-[0.1em] text-slate-600">
            Practiced
          </p>

          <p className="mt-1 font-serif text-base text-slate-300">
            {formatInsightsNumber(breakdown.length)}
          </p>
        </div>
      </div>

      <div className="mt-5 max-h-[390px] space-y-3 overflow-y-auto pr-1">
        {breakdown.map((item, index) => (
          <MantraBreakdownItem
            key={item.mantraSlug}
            item={item}
            mantra={mantraBySlug.get(item.mantraSlug) ?? null}
            totalChants={totalChants}
            rank={index + 1}
          />
        ))}
      </div>
    </section>
  );
});

type MantraBreakdownItemProps = {
  item: MantraPracticeBreakdown;
  mantra: Mantra | null;
  totalChants: number;
  rank: number;
};

const MantraBreakdownItem = memo(function MantraBreakdownItem({
  item,
  mantra,
  totalChants,
  rank,
}: MantraBreakdownItemProps) {
  const contribution =
    totalChants > 0
      ? Math.min(100, Math.round((item.totalChants / totalChants) * 100))
      : 0;

  const title = mantra?.title ?? formatMantraSlug(item.mantraSlug);

  return (
    <article className="rounded-xl border border-white/[0.06] bg-white/[0.018] p-3.5 transition hover:border-amber-400/[0.12] hover:bg-white/[0.025]">
      <div className="flex items-start gap-3">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-white/[0.07] bg-[#070f19]">
          {mantra?.image ? (
            <img
              src={mantra.image}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Sparkles
                size={15}
                strokeWidth={1.6}
                className="text-amber-400/45"
              />
            </div>
          )}

          <div className="absolute bottom-0 right-0 flex size-4 items-center justify-center rounded-tl-md bg-[#07111f]/90 text-[7px] font-semibold text-amber-300">
            {rank}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate font-serif text-sm text-slate-200">
                {title}
              </h3>

              <p className="mt-0.5 truncate text-[9px] text-slate-600">
                {mantra?.deity ?? 'Mantra practice'}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="font-serif text-base text-amber-200">
                {formatInsightsNumber(item.totalChants)}
              </p>

              <p className="text-[8px] uppercase tracking-[0.08em] text-slate-600">
                chants
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between gap-3 text-[8px] text-slate-600">
              <span>Share of practice</span>

              <span className="text-slate-500">{contribution}%</span>
            </div>

            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#9b631a] via-[#c68a2e] to-[#e4bc58] transition-[width] duration-500"
                style={{
                  width: `${contribution}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <MantraStat
              label="Sessions"
              value={formatInsightsNumber(item.totalCompletedSessions)}
              icon={Layers3}
            />

            <MantraStat
              label="Malas"
              value={formatInsightsNumber(item.totalMalas)}
              icon={Sparkles}
            />

            <MantraStat
              label="Time"
              value={formatInsightsDuration(item.totalPracticeSeconds)}
              icon={Clock3}
            />
          </div>
        </div>
      </div>
    </article>
  );
});

type MantraStatProps = {
  label: string;
  value: string;
  icon: LucideIcon;
};

const MantraStat = memo(function MantraStat({
  label,
  value,
  icon: Icon,
}: MantraStatProps) {
  return (
    <div className="rounded-lg border border-white/[0.045] bg-[#07101a]/60 px-2 py-2">
      <div className="flex items-center gap-1">
        <Icon size={9} strokeWidth={1.6} className="text-amber-400/55" />

        <span className="text-[7px] uppercase tracking-[0.07em] text-slate-600">
          {label}
        </span>
      </div>

      <p className="mt-1 truncate text-[10px] font-medium text-slate-400">
        {value}
      </p>
    </div>
  );
});

function MantraBreakdownEmptyState() {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#09121e] p-5">
      <div className="flex items-center gap-2">
        <Sparkles size={14} className="text-amber-400" />

        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Mantras
        </p>
      </div>

      <h2 className="mt-1 font-serif text-lg text-slate-200">
        Practice breakdown
      </h2>

      <div className="mt-5 flex min-h-40 items-center justify-center rounded-xl border border-dashed border-white/[0.07] bg-white/[0.015] px-6 text-center">
        <div>
          <Sparkles size={20} className="mx-auto text-amber-400/45" />

          <p className="mt-3 font-serif text-base text-slate-300">
            No mantra activity yet
          </p>

          <p className="mx-auto mt-2 max-w-xs text-[11px] leading-5 text-slate-600">
            Complete a Sadhana during this period to see your mantra-wise
            practice here.
          </p>
        </div>
      </div>
    </section>
  );
}

function formatMantraSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
