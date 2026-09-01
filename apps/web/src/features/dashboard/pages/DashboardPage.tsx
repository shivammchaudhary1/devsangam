import { DashboardBackground } from '../components/DashboardBackground';
import {
  DesktopDashboardHeader,
  MobileStreakBar,
} from '../components/DashboardHeader';
import {
  DailyStreakCard,
  MobileTodaySummary,
  OverallProgressCard,
  TodaysPracticeCard,
} from '../components/DashboardSummaryCards';
import { MantraDistributionCard } from '../components/MantraDistributionCard';
import { QuickStartCard } from '../components/QuickStartCard';
import { RecentSessionsCard } from '../components/RecentSessionsCard';
import { WeeklyPracticeCard } from '../components/WeeklyPracticeCard';
import {
  DEFAULT_PRACTICE_TARGET,
  getPercentage,
  getWeeklyConsistency,
} from '../utils/dashboard-analytics';
import { getDateKey, getFirstName } from '../utils/dashboard-formatters';
import {
  getPracticeRoute,
  getPracticeSessionRoute,
} from '@/app/constants/routes.constants';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInsightsOverview } from '@/features/insights/hooks/useInsightsOverview';
import { usePracticeHistory } from '@/features/insights/hooks/usePracticeHistory';
import { useMantras } from '@/features/mantras/hooks/useMantras';

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
