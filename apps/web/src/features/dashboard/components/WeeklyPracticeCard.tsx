import {
  formatPracticeDuration,
  formatWeekday,
} from '../utils/dashboard-formatters';
import { DashboardMessage } from './DashboardMessage';
import { Skeleton } from '@/components/loading/Skeleton';
import type { DailyPracticeActivity } from '@devsangam/types';

type WeeklyPracticeCardProps = {
  activity: DailyPracticeActivity[];
  isLoading: boolean;
  isError: boolean;
};

export function WeeklyPracticeCard({
  activity,
  isLoading,
  isError,
}: WeeklyPracticeCardProps) {
  const maxSeconds = Math.max(
    ...activity.map((entry) => Math.max(0, entry.activeDurationSeconds)),
    1
  );

  return (
    <article className="overflow-hidden rounded-[10px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] shadow-[var(--ds-shadow-card)]">
      <div className="flex items-center justify-between border-b border-white/[0.055] px-4 py-3">
        <h2 className="font-serif text-[14px] text-[var(--ds-cream)]">
          Weekly Practice
        </h2>

        <span className="text-[9px] text-[var(--ds-muted-soft)]">Minutes</span>
      </div>

      <div className="px-4 pb-4 pt-4">
        {isLoading ? (
          <Skeleton className="h-[135px]" />
        ) : isError ? (
          <DashboardMessage>
            Weekly activity could not be refreshed.
          </DashboardMessage>
        ) : (
          <div className="relative h-[135px]">
            <div className="pointer-events-none absolute inset-x-0 bottom-[24px] top-0 flex flex-col justify-between">
              {[0, 1, 2, 3].map((line) => (
                <div key={line} className="border-t border-white/[0.035]" />
              ))}
            </div>

            <div className="relative flex h-full items-end justify-between gap-2">
              {activity.map((entry) => {
                const seconds = entry.activeDurationSeconds;

                const barHeight =
                  seconds === 0
                    ? 2
                    : Math.max(8, Math.round((seconds / maxSeconds) * 98));

                return (
                  <div
                    key={entry.date}
                    className="flex min-w-0 flex-1 flex-col items-center justify-end"
                  >
                    <div
                      className="w-full max-w-[22px] rounded-t-[3px] bg-[linear-gradient(180deg,var(--ds-soft-gold)_0%,var(--ds-amber)_48%,var(--ds-bronze)_100%)] shadow-[0_0_10px_rgba(216,154,53,0.08)]"
                      style={{
                        height: `${barHeight}px`,
                        opacity: seconds > 0 ? 0.9 : 0.22,
                      }}
                      title={formatPracticeDuration(seconds)}
                    />

                    <span className="mt-2 text-[9px] text-[var(--ds-muted)]">
                      {formatWeekday(entry.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
