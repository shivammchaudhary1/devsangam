import {
  formatInsightsDuration,
  formatInsightsNumber,
} from '../utils/insights-format.utils';
import { MantraBreakdownPanel } from './MantraBreakdownPanel';
import { PracticeHistoryPanel } from './PracticeHistoryPanel';
import { StreakCalendar } from './StreakCalendar';
import type { DailyPracticeActivity, InsightsOverview } from '@devsangam/types';
import type {
  LucideIcon,
} from 'lucide-react';
import {
  BarChart3,
  Clock3,
  Flame,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { memo, useMemo } from 'react';

type MobileInsightsOverviewProps = {
  insights: InsightsOverview;

  weeklyActivity: DailyPracticeActivity[];
};

export const MobileInsightsOverview = memo(function MobileInsightsOverview({
  insights,
  weeklyActivity,
}: MobileInsightsOverviewProps) {
  return (
    <div className="mt-4 space-y-3 md:hidden">
      <MobileStreakHero
        currentStreakDays={insights.summary.currentStreakDays}
        longestStreakDays={insights.summary.longestStreakDays}
      />

      <MobileWeeklyActivity activity={weeklyActivity} />

      <StreakCalendar
        currentStreakDays={insights.summary.currentStreakDays}
        longestStreakDays={insights.summary.longestStreakDays}
      />

      <MantraBreakdownPanel
        breakdown={insights.mantraBreakdown}
        totalChants={insights.summary.totalChants}
      />

      <MobilePracticeSummary insights={insights} />

      <PracticeHistoryPanel />
    </div>
  );
});

type MobileStreakHeroProps = {
  currentStreakDays: number;

  longestStreakDays: number;
};

const MobileStreakHero = memo(function MobileStreakHero({
  currentStreakDays,
  longestStreakDays,
}: MobileStreakHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[12px] border border-[#d89a35]/20 bg-[var(--ds-gradient-panel)] p-4 shadow-[0_16px_34px_rgba(0,0,0,0.24)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-14 -top-16 size-40 rounded-full bg-[#d89a35]/[0.08] blur-3xl"
      />

      <div className="relative flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame size={13} strokeWidth={1.7} className="text-[var(--ds-gold)]" />

            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#b88232]">
              Current Streak
            </p>
          </div>

          <div className="mt-3 flex items-end gap-2">
            <p className="font-serif text-[42px] font-medium leading-none tracking-[-0.04em] text-[var(--ds-soft-gold)]">
              {formatInsightsNumber(currentStreakDays)}
            </p>

            <p className="pb-1 text-[11px] font-medium text-[#b8863d]">
              {currentStreakDays === 1 ? 'day' : 'days'}
            </p>
          </div>

          <p className="mt-2 text-[9px] text-[var(--ds-muted)]">
            Best:{' '}
            <span className="font-medium text-[#a69b8b]">
              {formatInsightsNumber(longestStreakDays)}{' '}
              {longestStreakDays === 1 ? 'day' : 'days'}
            </span>
          </p>
        </div>

        <div className="relative flex size-[92px] shrink-0 items-center justify-center rounded-full border border-[#d89a35]/18 bg-[radial-gradient(circle,rgba(216,154,53,0.09),rgba(9,15,23,0.96)_58%)] shadow-[0_0_30px_rgba(216,154,53,0.08)]">
          <div
            aria-hidden="true"
            className="absolute inset-[9px] rounded-full border border-[#d89a35]/10"
          />

          <div className="relative text-center">
            <Flame
              size={25}
              strokeWidth={1.5}
              className="mx-auto text-[var(--ds-gold)]"
            />

            <p className="mt-1 text-[7px] font-semibold uppercase tracking-[0.1em] text-[var(--ds-bronze)]">
              Sadhana
            </p>
          </div>
        </div>
      </div>
    </section>
  );
});

type MobileWeeklyActivityProps = {
  activity: DailyPracticeActivity[];
};

const MobileWeeklyActivity = memo(function MobileWeeklyActivity({
  activity,
}: MobileWeeklyActivityProps) {
  const maxChants = useMemo(
    () => activity.reduce((maximum, item) => Math.max(maximum, item.chants), 0),
    [activity]
  );

  const totalChants = useMemo(
    () => activity.reduce((total, item) => total + item.chants, 0),
    [activity]
  );

  return (
    <section className="rounded-[12px] border border-[var(--ds-border-soft)] bg-[var(--ds-charcoal)] p-4 shadow-[0_13px_30px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={13} strokeWidth={1.7} className="text-[var(--ds-gold)]" />

            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--ds-muted)]">
              This Week
            </p>
          </div>

          <p className="mt-1 text-[9px] text-[var(--ds-muted)]">Completed chants</p>
        </div>

        <p className="font-serif text-[15px] text-[var(--ds-soft-gold)]">
          {formatInsightsNumber(totalChants)}
        </p>
      </div>

      <div className="mt-5 flex h-[126px] items-end gap-2">
        {activity.map((item) => {
          const height = getWeeklyBarHeight(item.chants, maxChants);

          return (
            <div
              key={item.date}
              className="flex min-w-0 flex-1 flex-col items-center justify-end"
            >
              <span className="mb-1.5 text-[7px] font-medium text-[var(--ds-muted)]">
                {item.chants > 0 ? formatInsightsNumber(item.chants) : ''}
              </span>

              <div className="flex h-[88px] w-full items-end justify-center">
                <div
                  title={`${item.chants} chants`}
                  className={[
                    'w-full max-w-[24px] rounded-t-[3px] border',
                    item.chants > 0
                      ? [
                          'border-[#dda13e]/25',
                          'bg-[linear-gradient(180deg,#dfa342,#9c611f)]',
                          'shadow-[0_0_12px_rgba(216,154,53,0.07)]',
                        ].join(' ')
                      : 'border-[var(--ds-border-soft)] bg-[var(--ds-white-03)]',
                  ].join(' ')}
                  style={{
                    height,
                  }}
                />
              </div>

              <span className="mt-2 text-[7px] font-medium text-[var(--ds-muted)]">
                {formatWeekday(item.date)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
});

type MobilePracticeSummaryProps = {
  insights: InsightsOverview;
};

const MobilePracticeSummary = memo(function MobilePracticeSummary({
  insights,
}: MobilePracticeSummaryProps) {
  return (
    <section className="rounded-[12px] border border-[var(--ds-border-soft)] bg-[var(--ds-charcoal)] p-4 shadow-[0_13px_30px_rgba(0,0,0,0.2)]">
      <div className="flex items-center gap-2">
        <Sparkles size={13} strokeWidth={1.7} className="text-[var(--ds-gold)]" />

        <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[var(--ds-muted)]">
          Practice Summary
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-white/[0.055]">
        <MobileSummaryStat
          label="Malas"
          value={formatInsightsNumber(insights.summary.totalMalas)}
          icon={Trophy}
        />

        <MobileSummaryStat
          label="Time"
          value={formatInsightsDuration(insights.summary.totalPracticeSeconds)}
          icon={Clock3}
        />

        <MobileSummaryStat
          label="Sessions"
          value={formatInsightsNumber(insights.summary.totalCompletedSessions)}
          icon={BarChart3}
        />
      </div>

      <div className="mt-4 border-t border-[var(--ds-border-soft)] pt-3 text-center">
        <p className="text-[8px] text-[var(--ds-muted)]">Total chants</p>

        <p className="mt-1 font-serif text-[18px] text-[var(--ds-soft-gold)]">
          {formatInsightsNumber(insights.summary.totalChants)}
        </p>
      </div>
    </section>
  );
});

type MobileSummaryStatProps = {
  label: string;

  value: string;

  icon: LucideIcon;
};

const MobileSummaryStat = memo(function MobileSummaryStat({
  label,
  value,
  icon: Icon,
}: MobileSummaryStatProps) {
  return (
    <div className="px-2 text-center">
      <Icon size={12} strokeWidth={1.6} className="mx-auto text-[var(--ds-bronze)]" />

      <p className="mt-2 font-serif text-[13px] text-[var(--ds-soft-gold)]">{value}</p>

      <p className="mt-1 text-[7px] uppercase tracking-[0.08em] text-[var(--ds-muted)]">
        {label}
      </p>
    </div>
  );
});

function getWeeklyBarHeight(chants: number, maxChants: number) {
  if (chants <= 0 || maxChants <= 0) {
    return '4px';
  }

  const percentage = (chants / maxChants) * 100;

  return `${Math.max(12, percentage)}%`;
}

function formatWeekday(dateKey: string) {
  const year = Number(dateKey.slice(0, 4));

  const month = Number(dateKey.slice(5, 7));

  const day = Number(dateKey.slice(8, 10));

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}
