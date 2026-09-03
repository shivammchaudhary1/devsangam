import {
  formatInsightsDuration,
  formatInsightsNumber,
} from '../utils/insights-format.utils';
import type { DailyPracticeActivity, InsightsRange } from '@devsangam/types';
import type { LucideIcon } from 'lucide-react';
import { Activity, CalendarDays, Sparkles } from 'lucide-react';
import { memo, useMemo } from 'react';

type PracticeActivityChartProps = {
  activity: DailyPracticeActivity[];
  range: InsightsRange;
};

type ActivityBucket = {
  key: string;
  label: string;
  tooltipLabel: string;
  chants: number;
  completedSessions: number;
  activeDurationSeconds: number;
  completedMalas: number;
};

export const PracticeActivityChart = memo(function PracticeActivityChart({
  activity,
  range,
}: PracticeActivityChartProps) {
  const hasActivity = useMemo(
    () =>
      activity.some((item) => item.chants > 0 || item.completedSessions > 0),
    [activity]
  );

  const buckets = useMemo(
    () => buildActivityBuckets(activity, range),
    [activity, range]
  );

  const chartSummary = useMemo(() => {
    const activeDays = activity.filter((item) => item.chants > 0).length;

    const peakDay = activity.reduce<DailyPracticeActivity | null>(
      (currentPeak, item) => {
        if (!currentPeak || item.chants > currentPeak.chants) {
          return item;
        }

        return currentPeak;
      },
      null
    );

    const maxChants = buckets.reduce(
      (maximum, bucket) => Math.max(maximum, bucket.chants),
      0
    );

    return {
      activeDays,
      peakDay,
      maxChants,
    };
  }, [activity, buckets]);

  if (!hasActivity) {
    return <PracticeActivityEmptyState />;
  }

  const chartMinWidth = getChartMinWidth(buckets.length, range);

  return (
    <section
      className={
        'rounded-2xl border border-[var(--ds-border-soft)] ' +
        'bg-[var(--ds-gradient-panel-soft)] p-4 ' +
        'shadow-[var(--ds-shadow-card)] sm:p-5'
      }
    >
      <div
        className={
          'flex flex-col gap-4 sm:flex-row ' +
          'sm:items-start sm:justify-between'
        }
      >
        <div>
          <div className={'flex items-center gap-2'}>
            <Activity
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
              Practice Activity
            </p>
          </div>

          <h2 className={'mt-1 font-serif text-lg text-[var(--ds-cream)]'}>
            Chanting consistency
          </h2>

          <p className={'mt-1 text-[11px] leading-5 text-[var(--ds-muted)]'}>
            Your completed chanting activity across the selected period.
          </p>
        </div>

        <div className={'flex gap-2'}>
          <ActivitySummaryItem
            label="Active days"
            value={formatInsightsNumber(chartSummary.activeDays)}
            icon={CalendarDays}
          />

          <ActivitySummaryItem
            label="Peak"
            value={
              chartSummary.peakDay
                ? formatInsightsNumber(chartSummary.peakDay.chants)
                : '0'
            }
            icon={Sparkles}
          />
        </div>
      </div>

      <div className={'mt-6 overflow-x-auto pb-2'}>
        <div
          className={'flex h-[220px] items-end gap-1.5 sm:gap-2'}
          style={{
            minWidth: chartMinWidth,
          }}
        >
          {buckets.map((bucket) => {
            const height = getBarHeight(bucket.chants, chartSummary.maxChants);

            return (
              <div
                key={bucket.key}
                className={
                  'group flex h-full min-w-0 flex-1 ' + 'flex-col justify-end'
                }
              >
                <div
                  className={
                    'relative flex min-h-0 flex-1 ' + 'items-end justify-center'
                  }
                >
                  <div
                    title={buildBucketTooltip(bucket)}
                    className={[
                      'relative w-full max-w-8 rounded-t-md',
                      'border transition-all duration-300',

                      bucket.chants > 0
                        ? [
                            'border-[var(--ds-border-gold)]',
                            'bg-gradient-to-t',
                            'from-[#9c651b]',
                            'via-[#c88b2d]',
                            'to-[#e5bd58]',
                            'shadow-[var(--ds-shadow-gold)]',
                            'group-hover:brightness-110',
                          ].join(' ')
                        : [
                            'border-[var(--ds-border-soft)]',
                            'bg-[var(--ds-white-03)]',
                          ].join(' '),
                    ].join(' ')}
                    style={{
                      height,
                    }}
                  >
                    {bucket.chants > 0 ? (
                      <div
                        className={
                          'pointer-events-none absolute bottom-full ' +
                          'left-1/2 z-20 mb-2 hidden -translate-x-1/2 ' +
                          'whitespace-nowrap rounded-lg border ' +
                          'border-[var(--ds-border-soft)] ' +
                          'bg-[var(--ds-elevated)] px-2.5 py-2 ' +
                          'text-[9px] shadow-[var(--ds-shadow-card)] ' +
                          'group-hover:block'
                        }
                      >
                        <p className={'font-medium text-[var(--ds-soft-gold)]'}>
                          {bucket.tooltipLabel}
                        </p>

                        <p className={'mt-1 text-[var(--ds-text)]'}>
                          {formatInsightsNumber(bucket.chants)} chants
                        </p>

                        <p className={'text-[var(--ds-muted)]'}>
                          {bucket.completedSessions} sessions ·{' '}
                          {formatInsightsDuration(bucket.activeDurationSeconds)}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className={'mt-2 h-8 text-center'}>
                  <span
                    className={
                      'text-[8px] text-[var(--ds-muted)] sm:text-[9px]'
                    }
                  >
                    {bucket.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={
          'mt-2 flex flex-wrap items-center justify-between ' +
          'gap-3 border-t border-[var(--ds-border-soft)] pt-4'
        }
      >
        <div
          className={
            'flex items-center gap-2 text-[10px] ' + 'text-[var(--ds-muted)]'
          }
        >
          <span className={'size-2 rounded-sm bg-[var(--ds-gold)]'} />

          <span>Completed chants</span>
        </div>

        {chartSummary.peakDay && chartSummary.peakDay.chants > 0 ? (
          <p className={'text-[10px] text-[var(--ds-muted)]'}>
            Best day:{' '}
            <span className={'text-[var(--ds-text)]'}>
              {formatFullDateKey(chartSummary.peakDay.date)} ·{' '}
              {formatInsightsNumber(chartSummary.peakDay.chants)} chants
            </span>
          </p>
        ) : null}
      </div>
    </section>
  );
});

type ActivitySummaryItemProps = {
  label: string;
  value: string;
  icon: LucideIcon;
};

const ActivitySummaryItem = memo(function ActivitySummaryItem({
  label,
  value,
  icon: Icon,
}: ActivitySummaryItemProps) {
  return (
    <div
      className={
        'min-w-[90px] rounded-xl border ' +
        'border-[var(--ds-border-soft)] ' +
        'bg-[var(--ds-white-03)] px-3 py-2.5'
      }
    >
      <div className={'flex items-center gap-1.5'}>
        <Icon
          size={11}
          strokeWidth={1.7}
          className={'text-[var(--ds-gold)] opacity-70'}
        />

        <p
          className={
            'text-[8px] uppercase tracking-[0.1em] ' + 'text-[var(--ds-muted)]'
          }
        >
          {label}
        </p>
      </div>

      <p className={'mt-1 font-serif text-base text-[var(--ds-cream)]'}>
        {value}
      </p>
    </div>
  );
});

function PracticeActivityEmptyState() {
  return (
    <section
      className={
        'rounded-2xl border border-[var(--ds-border-soft)] ' +
        'bg-[var(--ds-gradient-panel-soft)] p-5 ' +
        'shadow-[var(--ds-shadow-card)]'
      }
    >
      <div className={'flex items-center gap-2'}>
        <Activity size={14} className={'text-[var(--ds-gold)]'} />

        <p
          className={
            'text-[10px] font-semibold uppercase ' +
            'tracking-[0.16em] text-[var(--ds-gold)]'
          }
        >
          Practice Activity
        </p>
      </div>

      <h2 className={'mt-1 font-serif text-lg text-[var(--ds-cream)]'}>
        Chanting consistency
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
            className={'mx-auto text-[var(--ds-gold)] opacity-60'}
          />

          <p className={'mt-3 font-serif text-base text-[var(--ds-text)]'}>
            Your journey begins here
          </p>

          <p
            className={
              'mx-auto mt-2 max-w-sm text-[11px] leading-5 ' +
              'text-[var(--ds-muted)]'
            }
          >
            Complete a Sadhana session and your chanting activity will appear
            here.
          </p>
        </div>
      </div>
    </section>
  );
}

function buildActivityBuckets(
  activity: DailyPracticeActivity[],
  range: InsightsRange
): ActivityBucket[] {
  if (range === '7d' || range === '30d') {
    return activity.map((item) => createDailyBucket(item, range));
  }

  if (range === '90d') {
    return buildWeeklyBuckets(activity);
  }

  return buildMonthlyBuckets(activity);
}

function createDailyBucket(
  item: DailyPracticeActivity,
  range: '7d' | '30d'
): ActivityBucket {
  return {
    key: item.date,

    label:
      range === '7d' ? formatWeekday(item.date) : formatDayOfMonth(item.date),

    tooltipLabel: formatFullDateKey(item.date),

    chants: item.chants,

    completedSessions: item.completedSessions,

    activeDurationSeconds: item.activeDurationSeconds,

    completedMalas: item.completedMalas,
  };
}

function buildWeeklyBuckets(
  activity: DailyPracticeActivity[]
): ActivityBucket[] {
  const buckets: ActivityBucket[] = [];

  for (let index = 0; index < activity.length; index += 7) {
    const chunk = activity.slice(index, index + 7);

    if (chunk.length === 0) {
      continue;
    }

    const first = chunk[0];

    const last = chunk[chunk.length - 1];

    if (!first || !last) {
      continue;
    }

    buckets.push({
      key: `${first.date}-${last.date}`,

      label: formatMonthDay(first.date),

      tooltipLabel: `${formatMonthDay(first.date)} – ${formatMonthDay(
        last.date
      )}`,

      chants: sumBucketValue(chunk, 'chants'),

      completedSessions: sumBucketValue(chunk, 'completedSessions'),

      activeDurationSeconds: sumBucketValue(chunk, 'activeDurationSeconds'),

      completedMalas: sumBucketValue(chunk, 'completedMalas'),
    });
  }

  return buckets;
}

function buildMonthlyBuckets(
  activity: DailyPracticeActivity[]
): ActivityBucket[] {
  if (activity.length === 0) {
    return [];
  }

  const grouped = new Map<string, ActivityBucket>();

  for (const item of activity) {
    const monthKey = item.date.slice(0, 7);

    const existing = grouped.get(monthKey);

    if (existing) {
      existing.chants += item.chants;

      existing.completedSessions += item.completedSessions;

      existing.activeDurationSeconds += item.activeDurationSeconds;

      existing.completedMalas += item.completedMalas;

      continue;
    }

    grouped.set(monthKey, {
      key: monthKey,

      label: formatMonthKey(monthKey, false),

      tooltipLabel: formatMonthKey(monthKey, true),

      chants: item.chants,

      completedSessions: item.completedSessions,

      activeDurationSeconds: item.activeDurationSeconds,

      completedMalas: item.completedMalas,
    });
  }

  const monthKeys = [...grouped.keys()].sort();

  if (monthKeys.length === 0) {
    return [];
  }

  const firstMonth = monthKeys[0];

  const lastMonth = monthKeys[monthKeys.length - 1];

  if (!firstMonth || !lastMonth) {
    return [];
  }

  const result: ActivityBucket[] = [];

  let currentMonth = firstMonth;

  while (currentMonth <= lastMonth) {
    result.push(
      grouped.get(currentMonth) ?? {
        key: currentMonth,

        label: formatMonthKey(currentMonth, false),

        tooltipLabel: formatMonthKey(currentMonth, true),

        chants: 0,

        completedSessions: 0,

        activeDurationSeconds: 0,

        completedMalas: 0,
      }
    );

    currentMonth = addMonth(currentMonth);
  }

  return result;
}

function sumBucketValue(
  items: DailyPracticeActivity[],
  key:
    | 'chants'
    | 'completedSessions'
    | 'activeDurationSeconds'
    | 'completedMalas'
) {
  return items.reduce((total, item) => total + item[key], 0);
}

function getBarHeight(chants: number, maxChants: number) {
  if (chants <= 0 || maxChants <= 0) {
    return '4px';
  }

  const percentage = (chants / maxChants) * 100;

  return `${Math.max(percentage, 10)}%`;
}

function getChartMinWidth(bucketCount: number, range: InsightsRange) {
  if (range === '7d') {
    return '100%';
  }

  if (range === '30d') {
    return '620px';
  }

  if (range === '90d') {
    return '540px';
  }

  return `${Math.max(500, bucketCount * 52)}px`;
}

function buildBucketTooltip(bucket: ActivityBucket) {
  return [
    bucket.tooltipLabel,
    `${bucket.chants} chants`,
    `${bucket.completedSessions} sessions`,
    `${bucket.completedMalas} malas`,
  ].join(' · ');
}

function parseDateKey(dateKey: string) {
  const year = Number(dateKey.slice(0, 4));

  const month = Number(dateKey.slice(5, 7));

  const day = Number(dateKey.slice(8, 10));

  return new Date(Date.UTC(year, month - 1, day));
}

function formatWeekday(dateKey: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(parseDateKey(dateKey));
}

function formatDayOfMonth(dateKey: string) {
  return String(Number(dateKey.slice(8, 10)));
}

function formatMonthDay(dateKey: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(parseDateKey(dateKey));
}

function formatFullDateKey(dateKey: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parseDateKey(dateKey));
}

function formatMonthKey(monthKey: string, includeYear: boolean) {
  const year = Number(monthKey.slice(0, 4));

  const month = Number(monthKey.slice(5, 7));

  return new Intl.DateTimeFormat('en-US', {
    month: includeYear ? 'long' : 'short',

    year: includeYear ? 'numeric' : undefined,

    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function addMonth(monthKey: string) {
  const year = Number(monthKey.slice(0, 4));

  const month = Number(monthKey.slice(5, 7));

  const next = new Date(Date.UTC(year, month - 1, 1));

  next.setUTCMonth(next.getUTCMonth() + 1);

  const nextYear = next.getUTCFullYear();

  const nextMonth = String(next.getUTCMonth() + 1).padStart(2, '0');

  return `${nextYear}-${nextMonth}`;
}
