import {
  buildDistributionEntries,
  createDistributionGradient,
  getDistributionColor,
} from '../utils/dashboard-analytics';
import { formatCompactNumber } from '../utils/dashboard-formatters';
import { DashboardMessage } from './DashboardMessage';
import { Skeleton } from '@/components/loading/Skeleton';
import type { Mantra, MantraPracticeBreakdown } from '@devsangam/types';

type MantraDistributionCardProps = {
  breakdown: MantraPracticeBreakdown[];
  mantras: Mantra[];
  isLoading: boolean;
  isError: boolean;
};

export function MantraDistributionCard({
  breakdown,
  mantras,
  isLoading,
  isError,
}: MantraDistributionCardProps) {
  const entries = buildDistributionEntries(breakdown, mantras);

  const totalChants = breakdown.reduce(
    (total, item) => total + item.totalChants,
    0
  );

  return (
    <article className="overflow-hidden rounded-[10px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] shadow-[var(--ds-shadow-card)]">
      <div className="border-b border-[var(--ds-border-soft)] px-4 py-3">
        <h2 className="font-serif text-[14px] text-[var(--ds-cream)]">
          Mantra Distribution
        </h2>
      </div>

      <div className="p-4">
        {isLoading ? (
          <Skeleton className="h-[135px]" />
        ) : isError ? (
          <DashboardMessage>
            Mantra distribution could not be refreshed.
          </DashboardMessage>
        ) : entries.length === 0 ? (
          <DashboardMessage>
            Your mantra distribution will appear after you practice.
          </DashboardMessage>
        ) : (
          <div className="flex min-h-[135px] items-center gap-5">
            <DistributionRing entries={entries} totalChants={totalChants} />

            <div className="min-w-0 flex-1 space-y-3">
              {entries.map((entry, index) => (
                <div key={entry.label} className="flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{
                      background: getDistributionColor(index),
                    }}
                  />

                  <span className="min-w-0 flex-1 truncate text-[10px] text-[var(--ds-muted)]">
                    {entry.label}
                  </span>

                  <span className="shrink-0 text-[10px] text-[var(--ds-text)]">
                    {entry.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

type DistributionRingProps = {
  entries: ReturnType<typeof buildDistributionEntries>;
  totalChants: number;
};

function DistributionRing({ entries, totalChants }: DistributionRingProps) {
  return (
    <div
      className="relative flex size-[104px] shrink-0 items-center justify-center rounded-full"
      style={{
        background: createDistributionGradient(entries),
      }}
    >
      <div className="flex size-[69px] items-center justify-center rounded-full border border-[var(--ds-border-soft)] bg-[var(--ds-charcoal)] shadow-[inset_0_0_22px_rgba(0,0,0,0.48)]">
        <div className="text-center">
          <p className="font-serif text-[17px] leading-none text-[var(--ds-soft-gold)]">
            {formatCompactNumber(totalChants)}
          </p>

          <p className="mt-1.5 text-[9px] text-[var(--ds-muted)]">
            Total Chants
          </p>
        </div>
      </div>
    </div>
  );
}
