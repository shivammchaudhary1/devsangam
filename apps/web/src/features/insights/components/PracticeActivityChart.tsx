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
    <section className="rounded-2xl border border-white/[0.07] bg-[#09121e] p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity size={14} strokeWidth={1.7} className="text-amber-400" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Practice Activity
            </p>
          </div>

          <h2 className="mt-1 font-serif text-lg text-slate-200">
            Chanting consistency
          </h2>

          <p className="mt-1 text-[11px] leading-5 text-slate-600">
            Your completed chanting activity across the selected period.
          </p>
        </div>

        <div className="flex gap-2">
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

      <div className="mt-6 overflow-x-auto pb-2">
        <div
          className="flex h-[220px] items-end gap-1.5 sm:gap-2"
          style={{
            minWidth: chartMinWidth,
          }}
        >
          {buckets.map((bucket) => {
            const height = getBarHeight(bucket.chants, chartSummary.maxChants);

            return (
              <div
                key={bucket.key}
                className="group flex h-full min-w-0 flex-1 flex-col justify-end"
              >
                <div className="relative flex min-h-0 flex-1 items-end justify-center">
                  <div
                    title={buildBucketTooltip(bucket)}
                    className={[
                      'relative w-full max-w-8 rounded-t-md border transition-all duration-300',
                      bucket.chants > 0
                        ? [
                            'border-amber-300/20',
                            'bg-gradient-to-t',
                            'from-[#9c651b]',
                            'via-[#c88b2d]',
                            'to-[#e5bd58]',
                            'shadow-[0_-5px_20px_rgba(245,158,11,0.05)]',
                            'group-hover:brightness-110',
                          ].join(' ')
                        : ['border-white/[0.04]', 'bg-white/[0.035]'].join(' '),
                    ].join(' ')}
                    style={{
                      height,
                    }}
                  >
                    {bucket.chants > 0 ? (
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/[0.08] bg-[#060d17] px-2.5 py-2 text-[9px] shadow-xl group-hover:block">
                        <p className="font-medium text-amber-200">
                          {bucket.tooltipLabel}
                        </p>

                        <p className="mt-1 text-slate-400">
                          {formatInsightsNumber(bucket.chants)} chants
                        </p>

                        <p className="text-slate-500">
                          {bucket.completedSessions} sessions ·{' '}
                          {formatInsightsDuration(bucket.activeDurationSeconds)}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-2 h-8 text-center">
                  <span className="text-[8px] text-slate-600 sm:text-[9px]">
                    {bucket.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
        <div className="flex items-center gap-2 text-[10px] text-slate-600">
          <span className="size-2 rounded-sm bg-[#d29a38]" />

          <span>Completed chants</span>
        </div>

        {chartSummary.peakDay && chartSummary.peakDay.chants > 0 ? (
          <p className="text-[10px] text-slate-600">
            Best day:{' '}
            <span className="text-slate-400">
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
    <div className="min-w-[90px] rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <Icon size={11} strokeWidth={1.7} className="text-amber-400/70" />

        <p className="text-[8px] uppercase tracking-[0.1em] text-slate-600">
          {label}
        </p>
      </div>

      <p className="mt-1 font-serif text-base text-slate-300">{value}</p>
    </div>
  );
});

function PracticeActivityEmptyState() {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#09121e] p-5">
      <div className="flex items-center gap-2">
        <Activity size={14} className="text-amber-400" />

        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Practice Activity
        </p>
      </div>

      <h2 className="mt-1 font-serif text-lg text-slate-200">
        Chanting consistency
      </h2>

      <div className="mt-5 flex min-h-40 items-center justify-center rounded-xl border border-dashed border-white/[0.07] bg-white/[0.015] px-6 text-center">
        <div>
          <Sparkles size={20} className="mx-auto text-amber-400/50" />

          <p className="mt-3 font-serif text-base text-slate-300">
            Your journey begins here
          </p>

          <p className="mx-auto mt-2 max-w-sm text-[11px] leading-5 text-slate-600">
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
