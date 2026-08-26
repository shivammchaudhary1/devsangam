import {
  APP_ROUTES,
  getPracticeRoute,
  getPracticeSessionRoute,
} from '@/app/constants/routes.constants';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInsightsOverview } from '@/features/insights/hooks/useInsightsOverview';
import { usePracticeHistory } from '@/features/insights/hooks/usePracticeHistory';
import { MANTRA_IMAGES } from '@/features/mantras/constants/mantra-images';
import { useMantras } from '@/features/mantras/hooks/useMantras';
import type {
  DailyPracticeActivity,
  Mantra,
  MantraPracticeBreakdown,
  PracticeSession,
} from '@devsangam/types';
import {
  CalendarDays,
  Clock3,
  Flame,
  Play,
  Sparkles,
  Target,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';

const DEFAULT_PRACTICE_TARGET = 108;
const WEEK_LENGTH = 7;

export function DashboardPage() {
  const { user } = useAuth();

  const timezone =
    user?.preferences.timezone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone;

  const {
    data: overview,
    isLoading: isOverviewLoading,
    isError: isOverviewError,
  } = useInsightsOverview({
    range: '7d',
    timezone,
  });

  const {
    data: history,
    isLoading: isHistoryLoading,
    isError: isHistoryError,
  } = usePracticeHistory({
    page: 1,
    limit: 4,
    timezone,
  });

  const { data: mantras = [], isLoading: isMantrasLoading } = useMantras();

  const recentSessions = [...(history?.sessions ?? [])].sort(
    (left, right) =>
      new Date(right.startedAt).getTime() - new Date(left.startedAt).getTime()
  );

  const resumableSession =
    recentSessions.find(
      (session) =>
        session.status === 'in_progress' || session.status === 'paused'
    ) ?? null;

  const latestSession = recentSessions[0] ?? null;

  const quickStartMantraSlug =
    resumableSession?.mantraSlug ??
    latestSession?.mantraSlug ??
    mantras[0]?.slug ??
    null;

  const quickStartMantra =
    mantras.find((mantra) => mantra.slug === quickStartMantraSlug) ?? null;

  const quickStartTarget =
    resumableSession?.targetCount ??
    user?.preferences.defaultTarget ??
    quickStartMantra?.defaultTargets[0] ??
    DEFAULT_PRACTICE_TARGET;

  const quickStartCount = resumableSession?.completedCount ?? 0;

  const quickStartRemaining = Math.max(quickStartTarget - quickStartCount, 0);

  const quickStartProgress = getPercentage(quickStartCount, quickStartTarget);

  const quickStartHref = resumableSession
    ? getPracticeSessionRoute(resumableSession.mantraSlug, resumableSession._id)
    : getPracticeRoute(quickStartMantra?.slug ?? undefined);

  const todayKey = getDateKey(new Date(), timezone);

  const todayActivity =
    overview?.dailyActivity.find((activity) => activity.date === todayKey) ??
    null;

  const weeklyActivity = overview?.dailyActivity ?? [];

  /*
   * Insights is the authoritative
   * source for practice streaks.
   *
   * The authenticated user object
   * contains legacy cached streak
   * fields that are not updated by
   * practice completion.
   */
  const currentStreak = overview?.summary.currentStreakDays ?? 0;

  const overallProgress = getWeeklyConsistency(weeklyActivity);

  const overviewUnavailable = isOverviewLoading || isOverviewError;

  return (
    <main className="relative min-h-full overflow-hidden bg-[var(--ds-obsidian)] px-4 pb-28 pt-5 text-[var(--ds-cream)] md:px-6 md:pb-8 md:pt-6 lg:px-8">
      <DashboardBackground />

      <div className="relative z-10 mx-auto w-full max-w-[1080px]">
        <DesktopDashboardHeader
          firstName={getFirstName(user?.name)}
          timezone={timezone}
        />

        <MobileStreakBar
          currentStreak={currentStreak}
          unavailable={overviewUnavailable}
        />

        <section className="mt-5 hidden grid-cols-3 gap-3 md:grid">
          <DailyStreakCard
            currentStreak={currentStreak}
            unavailable={overviewUnavailable}
          />

          <TodaysPracticeCard
            activity={todayActivity}
            unavailable={overviewUnavailable}
          />

          <OverallProgressCard
            progress={overallProgress}
            unavailable={overviewUnavailable}
          />
        </section>

        <section className="mt-3 grid items-start gap-3 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <QuickStartCard
            mantra={quickStartMantra}
            completedCount={quickStartCount}
            targetCount={quickStartTarget}
            remainingCount={quickStartRemaining}
            progress={quickStartProgress}
            href={quickStartHref}
            isResuming={Boolean(resumableSession)}
            isLoading={isMantrasLoading}
          />

          <div className="space-y-3">
            <div className="md:hidden">
              <MobileTodaySummary
                activity={todayActivity}
                unavailable={overviewUnavailable}
              />
            </div>

            <RecentSessionsCard
              sessions={recentSessions.slice(0, 3)}
              mantras={mantras}
              isLoading={isHistoryLoading || isMantrasLoading}
              isError={isHistoryError}
            />
          </div>
        </section>

        <section className="mt-3 hidden items-start gap-3 md:grid xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <WeeklyPracticeCard
            activity={weeklyActivity}
            isLoading={isOverviewLoading}
            isError={isOverviewError}
          />

          <MantraDistributionCard
            breakdown={overview?.mantraBreakdown ?? []}
            mantras={mantras}
            isLoading={isOverviewLoading || isMantrasLoading}
            isError={isOverviewError}
          />
        </section>
      </div>
    </main>
  );
}

type DesktopDashboardHeaderProps = {
  firstName: string;
  timezone: string;
};

function DesktopDashboardHeader({
  firstName,
  timezone,
}: DesktopDashboardHeaderProps) {
  return (
    <header className="hidden items-start justify-between border-b border-white/[0.055] pb-5 md:flex">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles
            size={14}
            strokeWidth={1.7}
            className="text-[var(--ds-amber)]"
          />

          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-gold)]">
            Your Sacred Space
          </p>
        </div>

        <h1 className="mt-2 font-serif text-[25px] font-medium tracking-[0.01em] text-[var(--ds-cream)] lg:text-[28px]">
          Namaste, {firstName}
        </h1>

        <p className="mt-2 text-[12px] text-[var(--ds-muted)]">
          Let&apos;s continue your sacred practice.
        </p>
      </div>

      <div className="flex h-9 items-center gap-2 rounded-[8px] border border-[var(--ds-border-soft)] bg-[var(--ds-white-02)] px-3.5 shadow-[var(--ds-shadow-card)]">
        <CalendarDays
          size={13}
          strokeWidth={1.6}
          className="text-[var(--ds-muted)]"
        />

        <span className="text-[10px] font-medium text-[var(--ds-text)]">
          {formatDashboardDate(new Date(), timezone)}
        </span>
      </div>
    </header>
  );
}

type MobileStreakBarProps = {
  currentStreak: number;
  unavailable: boolean;
};

function MobileStreakBar({ currentStreak, unavailable }: MobileStreakBarProps) {
  return (
    <section className="flex min-h-[48px] items-center justify-between rounded-[9px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] px-4 shadow-[var(--ds-shadow-card)] md:hidden">
      <div className="flex items-center gap-2.5">
        <Flame
          size={17}
          strokeWidth={1.7}
          className="text-[var(--ds-amber-bright)]"
        />

        <span className="font-serif text-[19px] text-[var(--ds-soft-gold)]">
          {unavailable ? '—' : currentStreak}
        </span>

        <span className="text-[11px] text-[var(--ds-muted)]">Day Streak</span>
      </div>

      <span className="text-[10px] font-medium text-[var(--ds-gold)]">
        Keep it going!
      </span>
    </section>
  );
}

type DailyStreakCardProps = {
  currentStreak: number;
  unavailable: boolean;
};

function DailyStreakCard({ currentStreak, unavailable }: DailyStreakCardProps) {
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

function TodaysPracticeCard({
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

type OverallProgressCardProps = {
  progress: number;
  unavailable: boolean;
};

function OverallProgressCard({
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

function MobileTodaySummary({
  activity,
  unavailable,
}: MobileTodaySummaryProps) {
  return (
    <article className="rounded-[10px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] shadow-[var(--ds-shadow-card)]">
      <div className="border-b border-white/[0.055] px-4 py-3">
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

type QuickStartCardProps = {
  mantra: Mantra | null;
  completedCount: number;
  targetCount: number;
  remainingCount: number;
  progress: number;
  href: string;
  isResuming: boolean;
  isLoading: boolean;
};

function QuickStartCard({
  mantra,
  completedCount,
  targetCount,
  remainingCount,
  progress,
  href,
  isResuming,
  isLoading,
}: QuickStartCardProps) {
  return (
    <article className="overflow-hidden rounded-[10px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] shadow-[var(--ds-shadow-card)]">
      <div className="border-b border-white/[0.055] px-4 py-3">
        <h2 className="font-serif text-[14px] text-[var(--ds-cream)]">
          Quick Start
        </h2>
      </div>

      <div className="px-5 pb-5 pt-4">
        <div className="min-h-[46px] text-center">
          {isLoading ? (
            <div className="mx-auto h-9 w-48 animate-pulse rounded bg-white/[0.025]" />
          ) : (
            <>
              <p className="truncate text-[11px] font-semibold tracking-[0.03em] text-[var(--ds-text)]">
                {mantra?.title ?? 'Choose Your Mantra'}
              </p>

              <p className="font-devanagari mx-auto mt-1.5 max-w-[360px] truncate text-[13px] text-[#bba16e]">
                {mantra?.sanskrit ?? 'Begin your Sadhana with intention.'}
              </p>
            </>
          )}
        </div>

        <div className="mt-3 flex justify-center">
          <ProgressRing
            progress={progress}
            size={112}
            value={String(completedCount).padStart(3, '0')}
            subValue={`/${formatNumber(targetCount)}`}
          />
        </div>

        <div className="mx-auto mt-3 flex max-w-[330px] items-center justify-between text-[10px] text-[var(--ds-muted)]">
          <span>
            Target:{' '}
            <strong className="font-medium text-[var(--ds-text)]">
              {formatNumber(targetCount)}
            </strong>
          </span>

          <span>
            Remaining:{' '}
            <strong className="font-medium text-[var(--ds-text)]">
              {formatNumber(remainingCount)}
            </strong>
          </span>
        </div>

        <Link
          to={href}
          className="mx-auto mt-3 flex h-10 w-full max-w-[330px] items-center justify-center gap-2 rounded-[7px] border border-[#efbd61]/45 bg-[linear-gradient(180deg,#efb84f_0%,#d6902d_52%,#b96f20_100%)] text-[11px] font-semibold text-[#171007] shadow-[0_0_20px_rgba(216,154,53,0.14),inset_0_1px_0_rgba(255,245,210,0.35)] transition hover:brightness-110"
        >
          {isResuming ? 'Resume Session' : 'Start Session'}

          <Play size={12} strokeWidth={1.9} />
        </Link>

        <div className="mt-2.5 text-center">
          <Link
            to={getPracticeRoute(mantra?.slug ?? undefined)}
            className="text-[10px] text-[var(--ds-muted)] transition hover:text-[var(--ds-soft-gold)]"
          >
            Custom Target
          </Link>
        </div>
      </div>
    </article>
  );
}

type RecentSessionsCardProps = {
  sessions: PracticeSession[];
  mantras: Mantra[];
  isLoading: boolean;
  isError: boolean;
};

function RecentSessionsCard({
  sessions,
  mantras,
  isLoading,
  isError,
}: RecentSessionsCardProps) {
  return (
    <article className="overflow-hidden rounded-[10px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] shadow-[var(--ds-shadow-card)]">
      <div className="flex items-center justify-between border-b border-white/[0.055] px-4 py-3">
        <h2 className="font-serif text-[14px] text-[var(--ds-cream)]">
          Recent Sessions
        </h2>

        <Link
          to={APP_ROUTES.insights}
          className="text-[10px] font-medium text-[var(--ds-gold)] transition hover:text-[var(--ds-soft-gold)]"
        >
          View All
        </Link>
      </div>

      <div className="p-3">
        {isLoading ? (
          <RecentSessionsLoading />
        ) : isError ? (
          <DashboardMessage>
            Recent practice could not be refreshed.
          </DashboardMessage>
        ) : sessions.length === 0 ? (
          <DashboardMessage>
            Complete your first Sadhana and it will appear here.
          </DashboardMessage>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => {
              const mantra =
                mantras.find((item) => item.slug === session.mantraSlug) ??
                null;

              return (
                <RecentSessionRow
                  key={session._id}
                  session={session}
                  mantra={mantra}
                />
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}

type RecentSessionRowProps = {
  session: PracticeSession;
  mantra: Mantra | null;
};

function RecentSessionRow({ session, mantra }: RecentSessionRowProps) {
  const artwork = MANTRA_IMAGES[session.mantraSlug];

  return (
    <div className="flex min-h-[64px] items-center gap-3 rounded-[8px] border border-white/[0.045] bg-[var(--ds-white-02)] px-3 py-2">
      <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)]">
        {artwork ? (
          <img
            src={artwork}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Sparkles
              size={14}
              strokeWidth={1.6}
              className="text-[var(--ds-gold)]"
            />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold tracking-[0.02em] text-[var(--ds-text)]">
          {mantra?.title ?? formatMantraSlug(session.mantraSlug)}
        </p>

        <p className="mt-1 text-[10px] text-[var(--ds-muted)]">
          {formatNumber(session.completedCount)}
          {' / '}
          {formatNumber(session.targetCount)}
          {' chants'}
        </p>

        <p className="mt-0.5 text-[9px] text-[var(--ds-muted-soft)]">
          {formatPracticeDate(session.startedAt)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Flame size={11} strokeWidth={1.7} className="text-[var(--ds-amber)]" />

        <span className="text-[10px] text-[var(--ds-muted)]">
          {formatDurationCompact(session.activeDurationSeconds)}
        </span>
      </div>
    </div>
  );
}

type WeeklyPracticeCardProps = {
  activity: DailyPracticeActivity[];
  isLoading: boolean;
  isError: boolean;
};

function WeeklyPracticeCard({
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
          <div className="h-[135px] animate-pulse rounded-[8px] bg-white/[0.02]" />
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

type MantraDistributionCardProps = {
  breakdown: MantraPracticeBreakdown[];
  mantras: Mantra[];
  isLoading: boolean;
  isError: boolean;
};

function MantraDistributionCard({
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
      <div className="border-b border-white/[0.055] px-4 py-3">
        <h2 className="font-serif text-[14px] text-[var(--ds-cream)]">
          Mantra Distribution
        </h2>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="h-[135px] animate-pulse rounded-[8px] bg-white/[0.02]" />
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

type DistributionEntry = {
  label: string;
  chants: number;
  percentage: number;
};

type DistributionRingProps = {
  entries: DistributionEntry[];
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
      <div className="flex size-[69px] items-center justify-center rounded-full border border-white/[0.045] bg-[var(--ds-charcoal)] shadow-[inset_0_0_22px_rgba(0,0,0,0.48)]">
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

type ProgressRingProps = {
  progress: number;
  size: number;
  value: string;
  subValue?: string;
};

function ProgressRing({ progress, size, value, subValue }: ProgressRingProps) {
  const normalizedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div
      className="relative flex items-center justify-center rounded-full shadow-[0_0_18px_rgba(216,154,53,0.08)]"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(
          var(--ds-amber-bright) 0%,
          var(--ds-soft-gold) ${normalizedProgress}%,
          rgba(255,255,255,0.055) ${normalizedProgress}%,
          rgba(255,255,255,0.055) 100%
        )`,
      }}
    >
      <div
        className="flex items-center justify-center rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-charcoal)] shadow-[inset_0_0_24px_rgba(0,0,0,0.5)]"
        style={{
          width: size - 11,
          height: size - 11,
        }}
      >
        <div className="text-center">
          <p
            className={[
              'font-serif leading-none text-[var(--ds-soft-gold)]',
              size >= 100 ? 'text-[20px]' : 'text-[17px]',
            ].join(' ')}
          >
            {value}
          </p>

          {subValue ? (
            <p className="mt-1.5 text-[10px] text-[var(--ds-muted)]">
              {subValue}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function RecentSessionsLoading() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-[64px] animate-pulse rounded-[8px] border border-white/[0.04] bg-white/[0.015]"
        />
      ))}
    </div>
  );
}

type DashboardMessageProps = {
  children: ReactNode;
};

function DashboardMessage({ children }: DashboardMessageProps) {
  return (
    <div className="rounded-[8px] border border-white/[0.05] bg-white/[0.015] px-4 py-6 text-center">
      <p className="text-[11px] leading-5 text-[var(--ds-muted)]">{children}</p>
    </div>
  );
}

function DashboardBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute right-[10%] top-[-150px] size-[330px] rounded-full bg-[var(--ds-amber-03)] blur-[120px]" />

      <div className="absolute bottom-[-220px] left-[8%] size-[400px] rounded-full bg-[var(--ds-amber-03)] blur-[130px]" />

      <div className="absolute right-[-180px] top-[32%] size-[360px] rounded-full border border-[var(--ds-amber-03)]" />
    </div>
  );
}

function getFirstName(name?: string) {
  const normalized = name?.trim();

  if (!normalized) {
    return 'Practitioner';
  }

  return normalized.split(/\s+/)[0] ?? 'Practitioner';
}

function getPercentage(value: number, target: number) {
  if (target <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round((value / target) * 100)));
}

function getWeeklyConsistency(activity: DailyPracticeActivity[]) {
  const activeDays = activity.filter(
    (entry) => entry.chants > 0 || entry.activeDurationSeconds > 0
  ).length;

  return Math.min(100, Math.round((activeDays / WEEK_LENGTH) * 100));
}

function formatMinutesMetric(totalSeconds: number) {
  if (totalSeconds <= 0) {
    return '0';
  }

  if (totalSeconds < 60) {
    return '<1';
  }

  return String(Math.floor(totalSeconds / 60));
}

function formatPracticeDuration(totalSeconds: number) {
  if (totalSeconds <= 0) {
    return 'No practice';
  }

  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  if (minutes < 60) {
    if (seconds === 0) {
      return `${minutes}m`;
    }

    return `${minutes}m ${seconds}s`;
  }

  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(Math.max(0, Math.round(value)));
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Math.max(0, value));
}

function formatDashboardDate(date: Date, timezone: string) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: timezone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }
}

function getDateKey(date: Date, timezone: string) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: timezone,
    }).formatToParts(date);

    const year = parts.find((part) => part.type === 'year')?.value;

    const month = parts.find((part) => part.type === 'month')?.value;

    const day = parts.find((part) => part.type === 'day')?.value;

    if (year && month && day) {
      return `${year}-${month}-${day}`;
    }
  } catch {
    // Use local date below.
  }

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, '0');

  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDurationCompact(totalSeconds: number) {
  if (totalSeconds <= 0) {
    return '0m';
  }

  if (totalSeconds < 60) {
    return '<1m';
  }

  const minutes = Math.floor(totalSeconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function formatPracticeDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recent';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatMantraSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatWeekday(dateValue: string) {
  const date = new Date(`${dateValue}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
  })
    .format(date)
    .slice(0, 3);
}

function buildDistributionEntries(
  breakdown: MantraPracticeBreakdown[],
  mantras: Mantra[]
): DistributionEntry[] {
  const sorted = [...breakdown].sort(
    (left, right) => right.totalChants - left.totalChants
  );

  const totalChants = sorted.reduce(
    (total, item) => total + item.totalChants,
    0
  );

  if (totalChants <= 0) {
    return [];
  }

  const primaryEntries = sorted.slice(0, 3);

  const entries = primaryEntries.map((item): DistributionEntry => {
    const mantra = mantras.find(
      (candidate) => candidate.slug === item.mantraSlug
    );

    return {
      label: mantra?.title ?? formatMantraSlug(item.mantraSlug),

      chants: item.totalChants,

      percentage: Math.round((item.totalChants / totalChants) * 100),
    };
  });

  const otherChants = sorted
    .slice(3)
    .reduce((total, item) => total + item.totalChants, 0);

  if (otherChants > 0) {
    entries.push({
      label: 'Other Mantras',

      chants: otherChants,

      percentage: Math.round((otherChants / totalChants) * 100),
    });
  }

  return entries;
}

function createDistributionGradient(entries: DistributionEntry[]) {
  if (entries.length === 0) {
    return 'conic-gradient(var(--ds-border) 0% 100%)';
  }

  let start = 0;

  const segments = entries.map((entry, index) => {
    const end =
      index === entries.length - 1
        ? 100
        : Math.min(100, start + entry.percentage);

    const segment = `${getDistributionColor(index)} ${start}% ${end}%`;

    start = end;

    return segment;
  });

  return `conic-gradient(${segments.join(', ')})`;
}

function getDistributionColor(index: number) {
  switch (index) {
    case 0:
      return 'var(--ds-soft-gold)';

    case 1:
      return 'var(--ds-amber)';

    case 2:
      return 'var(--ds-gold)';

    default:
      return 'var(--ds-bronze)';
  }
}
