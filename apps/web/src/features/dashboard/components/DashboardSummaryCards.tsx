import {
  formatMinutesMetric,
  formatNumber,
} from '../utils/dashboard-formatters';
import { ProgressRing } from './ProgressRing';
import type { DailyPracticeActivity } from '@devsangam/types';
import { Clock3, Flame, Sparkles, Target } from 'lucide-react';
import type { ReactNode } from 'react';

type DailyStreakCardProps = {
  currentStreak: number;
  unavailable: boolean;
};

export function DailyStreakCard({
  currentStreak,
  unavailable,
}: DailyStreakCardProps) {
  return (
    <article className="relative h-[142px] overflow-hidden rounded-[10px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] px-4 py-4 shadow-[var(--ds-shadow-card)]">
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-[46px] size-20 -translate-x-1/2 rounded-full bg-[var(--ds-amber-08)] blur-3xl"
      />

      <p className="relative text-center text-[11px] font-medium text-[var(--ds-muted)]">
        Daily Streak
      </p>

      <div className="relative mt-3 flex items-center justify-center gap-2.5">
        <Flame
          size={25}
          strokeWidth={1.7}
          className="text-[var(--ds-amber-bright)] drop-shadow-[0_0_8px_rgba(216,154,53,0.34)]"
        />

        <span className="font-serif text-[32px] leading-none text-[var(--ds-soft-gold)]">
          {unavailable ? '—' : currentStreak}
        </span>
      </div>

      <p className="relative mt-1.5 text-center text-[10px] text-[var(--ds-muted)]">
        days
      </p>

      <p className="relative mt-2 text-center text-[10px] font-medium text-[var(--ds-gold)]">
        Keep it going!
      </p>
    </article>
  );
}

type TodaysPracticeCardProps = {
  activity: DailyPracticeActivity | null;
  unavailable: boolean;
};

export function TodaysPracticeCard({
  activity,
  unavailable,
}: TodaysPracticeCardProps) {
  const hasPractice = Boolean(
    activity && (activity.chants > 0 || activity.activeDurationSeconds > 0)
  );

  return (
    <article className="h-[142px] rounded-[10px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] px-4 py-4 shadow-[var(--ds-shadow-card)]">
      <p className="text-center text-[11px] font-medium text-[var(--ds-muted)]">
        Today&apos;s Practice
      </p>

      <div className="mt-4 grid grid-cols-3 divide-x divide-white/[0.055]">
        <PracticeMetric
          icon={<Clock3 size={16} strokeWidth={1.6} />}
          value={
            unavailable
              ? '—'
              : formatMinutesMetric(activity?.activeDurationSeconds ?? 0)
          }
          label="Minutes"
        />

        <PracticeMetric
          icon={<Sparkles size={16} strokeWidth={1.6} />}
          value={unavailable ? '—' : formatNumber(activity?.chants ?? 0)}
          label="Chants"
        />

        <PracticeMetric
          icon={<Target size={16} strokeWidth={1.6} />}
          value={
            unavailable ? '—' : formatNumber(activity?.completedMalas ?? 0)
          }
          label="Malas"
        />
      </div>

      <p className="mt-4 text-center text-[10px] font-medium text-[var(--ds-gold)]">
        {unavailable
          ? 'Practice data unavailable.'
          : hasPractice
            ? 'Great start to your day!'
            : 'Your next Sadhana begins here.'}
      </p>
    </article>
  );
}

type OverallProgressCardProps = {
  progress: number;
  unavailable: boolean;
};

export function OverallProgressCard({
  progress,
  unavailable,
}: OverallProgressCardProps) {
  return (
    <article className="h-[142px] rounded-[10px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] px-4 py-4 shadow-[var(--ds-shadow-card)]">
      <p className="text-center text-[11px] font-medium text-[var(--ds-muted)]">
        Overall Progress
      </p>

      <div className="mt-2.5 flex justify-center">
        <ProgressRing
          progress={unavailable ? 0 : progress}
          size={78}
          value={unavailable ? '—' : `${progress}%`}
        />
      </div>

      <p className="mt-2 text-center text-[9px] text-[var(--ds-muted-soft)]">
        Weekly consistency
      </p>
    </article>
  );
}

type MobileTodaySummaryProps = {
  activity: DailyPracticeActivity | null;
  unavailable: boolean;
};

export function MobileTodaySummary({
  activity,
  unavailable,
}: MobileTodaySummaryProps) {
  return (
    <article className="rounded-[10px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] shadow-[var(--ds-shadow-card)]">
      <div className="border-b border-[var(--ds-border-soft)] px-4 py-3">
        <h2 className="font-serif text-[14px] text-[var(--ds-cream)]">
          Today&apos;s Summary
        </h2>
      </div>

      <div className="grid grid-cols-3 divide-x divide-white/[0.055] px-3 py-4">
        <PracticeMetric
          icon={<Clock3 size={15} strokeWidth={1.6} />}
          value={
            unavailable
              ? '—'
              : formatMinutesMetric(activity?.activeDurationSeconds ?? 0)
          }
          label="Minutes"
        />

        <PracticeMetric
          icon={<Sparkles size={15} strokeWidth={1.6} />}
          value={unavailable ? '—' : formatNumber(activity?.chants ?? 0)}
          label="Chants"
        />

        <PracticeMetric
          icon={<Target size={15} strokeWidth={1.6} />}
          value={
            unavailable ? '—' : formatNumber(activity?.completedMalas ?? 0)
          }
          label="Malas"
        />
      </div>
    </article>
  );
}

type PracticeMetricProps = {
  icon: ReactNode;
  value: string;
  label: string;
};

function PracticeMetric({ icon, value, label }: PracticeMetricProps) {
  return (
    <div className="flex flex-col items-center px-2">
      <div className="text-[var(--ds-gold)]">{icon}</div>

      <p className="mt-1.5 font-serif text-[17px] leading-none text-[var(--ds-soft-gold)]">
        {value}
      </p>

      <p className="mt-1.5 text-[9px] text-[var(--ds-muted-soft)]">{label}</p>
    </div>
  );
}
