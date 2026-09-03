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
    <section
      className={
        'rounded-2xl border border-[var(--ds-border-soft)] ' +
        'bg-[var(--ds-gradient-panel-soft)] p-4 ' +
        'shadow-[var(--ds-shadow-card)] sm:p-5'
      }
    >
      <div className={'flex items-start justify-between gap-3'}>
        <div>
          <div className={'flex items-center gap-2'}>
            <Sparkles
              size={14}
              strokeWidth={1.7}
              className={'text-[var(--ds-gold)]'}
            />

            <p
              className={
                'text-[10px] font-semibold uppercase ' +
                'tracking-[0.16em] text-[var(--ds-gold)]'
              }
            >
              Mantras
            </p>
          </div>

          <h2 className={'mt-1 font-serif text-lg text-[var(--ds-cream)]'}>
            Practice breakdown
          </h2>

          <p className={'mt-1 text-[11px] leading-5 text-[var(--ds-muted)]'}>
            See where your chanting practice has been focused.
          </p>
        </div>

        <div
          className={
            'rounded-xl border border-[var(--ds-border-soft)] ' +
            'bg-[var(--ds-white-03)] px-3 py-2 text-right'
          }
        >
          <p
            className={
              'text-[8px] uppercase tracking-[0.1em] ' +
              'text-[var(--ds-muted)]'
            }
          >
            Practiced
          </p>

          <p className={'mt-1 font-serif text-base text-[var(--ds-cream)]'}>
            {formatInsightsNumber(breakdown.length)}
          </p>
        </div>
      </div>

      <div className={'mt-5 max-h-[390px] space-y-3 overflow-y-auto pr-1'}>
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
    <article
      className={
        'rounded-xl border border-[var(--ds-border-soft)] ' +
        'bg-[var(--ds-white-03)] p-3.5 transition ' +
        'hover:border-[var(--ds-border-gold)] ' +
        'hover:bg-[var(--ds-amber-03)]'
      }
    >
      <div className={'flex items-start gap-3'}>
        <div
          className={
            'relative size-11 shrink-0 overflow-hidden ' +
            'rounded-xl border border-[var(--ds-border-soft)] ' +
            'bg-[var(--ds-night)]'
          }
        >
          {mantra?.image ? (
            <img
              src={mantra.image}
              alt=""
              loading="lazy"
              decoding="async"
              className={'h-full w-full object-cover'}
            />
          ) : (
            <div className={'flex h-full w-full items-center justify-center'}>
              <Sparkles
                size={15}
                strokeWidth={1.6}
                className={'text-[var(--ds-gold)] opacity-50'}
              />
            </div>
          )}

          <div
            className={
              'absolute bottom-0 right-0 flex size-4 ' +
              'items-center justify-center rounded-tl-md ' +
              'bg-black/65 text-[7px] font-semibold ' +
              'text-[#f4d995]'
            }
          >
            {rank}
          </div>
        </div>

        <div className={'min-w-0 flex-1'}>
          <div className={'flex items-start justify-between gap-3'}>
            <div className="min-w-0">
              <h3
                className={'truncate font-serif text-sm text-[var(--ds-cream)]'}
              >
                {title}
              </h3>

              <p
                className={'mt-0.5 truncate text-[9px] text-[var(--ds-muted)]'}
              >
                {mantra?.deity ?? 'Mantra practice'}
              </p>
            </div>

            <div className={'shrink-0 text-right'}>
              <p className={'font-serif text-base text-[var(--ds-soft-gold)]'}>
                {formatInsightsNumber(item.totalChants)}
              </p>

              <p
                className={
                  'text-[8px] uppercase tracking-[0.08em] ' +
                  'text-[var(--ds-muted)]'
                }
              >
                chants
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div
              className={
                'flex items-center justify-between gap-3 ' +
                'text-[8px] text-[var(--ds-muted)]'
              }
            >
              <span>Share of practice</span>

              <span className={'text-[var(--ds-text)]'}>{contribution}%</span>
            </div>

            <div
              className={
                'mt-1.5 h-1.5 overflow-hidden rounded-full ' +
                'bg-[var(--ds-white-06)]'
              }
            >
              <div
                className={
                  'h-full rounded-full bg-gradient-to-r ' +
                  'from-[#9b631a] via-[#c68a2e] to-[#e4bc58] ' +
                  'transition-[width] duration-500'
                }
                style={{
                  width: `${contribution}%`,
                }}
              />
            </div>
          </div>

          <div className={'mt-3 grid grid-cols-3 gap-2'}>
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
    <div
      className={
        'rounded-lg border border-[var(--ds-border-soft)] ' +
        'bg-[var(--ds-night)] px-2 py-2'
      }
    >
      <div className={'flex items-center gap-1'}>
        <Icon
          size={9}
          strokeWidth={1.6}
          className={'text-[var(--ds-gold)] opacity-60'}
        />

        <span
          className={
            'text-[7px] uppercase tracking-[0.07em] ' + 'text-[var(--ds-muted)]'
          }
        >
          {label}
        </span>
      </div>

      <p
        className={
          'mt-1 truncate text-[10px] font-medium ' + 'text-[var(--ds-text)]'
        }
      >
        {value}
      </p>
    </div>
  );
});

function MantraBreakdownEmptyState() {
  return (
    <section
      className={
        'rounded-2xl border border-[var(--ds-border-soft)] ' +
        'bg-[var(--ds-gradient-panel-soft)] p-5 ' +
        'shadow-[var(--ds-shadow-card)]'
      }
    >
      <div className={'flex items-center gap-2'}>
        <Sparkles size={14} className={'text-[var(--ds-gold)]'} />

        <p
          className={
            'text-[10px] font-semibold uppercase ' +
            'tracking-[0.16em] text-[var(--ds-gold)]'
          }
        >
          Mantras
        </p>
      </div>

      <h2 className={'mt-1 font-serif text-lg text-[var(--ds-cream)]'}>
        Practice breakdown
      </h2>

      <div
        className={
          'mt-5 flex min-h-40 items-center justify-center ' +
          'rounded-xl border border-dashed ' +
          'border-[var(--ds-border-soft)] ' +
          'bg-[var(--ds-white-03)] px-6 text-center'
        }
      >
        <div>
          <Sparkles
            size={20}
            className={'mx-auto text-[var(--ds-gold)] opacity-55'}
          />

          <p className={'mt-3 font-serif text-base text-[var(--ds-text)]'}>
            No mantra activity yet
          </p>

          <p
            className={
              'mx-auto mt-2 max-w-xs text-[11px] leading-5 ' +
              'text-[var(--ds-muted)]'
            }
          >
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
