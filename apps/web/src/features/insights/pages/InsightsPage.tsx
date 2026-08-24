import { InsightMetricCard } from '../components/InsightMetricCard';
import { InsightsRangeSelector } from '../components/InsightsRangeSelector';
import { MantraBreakdownPanel } from '../components/MantraBreakdownPanel';
import { PracticeActivityChart } from '../components/PracticeActivityChart';
import { PracticeHistoryPanel } from '../components/PracticeHistoryPanel';
import { useInsightsOverview } from '../hooks/useInsightsOverview';
import {
  formatInsightsDuration,
  formatInsightsNumber,
  getInsightsRangeLabel,
} from '../utils/insights-format.utils';
import type { InsightsRange } from '@devsangam/types';
import {
  BarChart3,
  Clock3,
  Flame,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { useCallback, useState } from 'react';

export function InsightsPage() {
  const [range, setRange] = useState<InsightsRange>('7d');

  const {
    data: insights,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useInsightsOverview({
    range,
  });

  const handleRangeChange = useCallback((nextRange: InsightsRange) => {
    setRange(nextRange);
  }, []);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <div className="relative min-h-full overflow-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8 xl:px-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute left-[18%] top-[-180px] size-[460px] rounded-full bg-amber-400/[0.025] blur-[110px]" />

        <div className="absolute right-[-180px] top-[220px] size-[460px] rounded-full border border-amber-400/[0.035]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1180px]">
        <header className="flex flex-col gap-5 border-b border-white/[0.07] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles
                size={14}
                strokeWidth={1.7}
                className="text-amber-400"
              />

              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400/80">
                Your Sadhana Journey
              </p>
            </div>

            <h1 className="mt-2 font-serif text-3xl font-medium tracking-wide text-[#e7ca75] sm:text-4xl">
              Insights & Progress
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Reflect on your practice, consistency, and chanting progress over
              time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isFetching && !isLoading ? (
              <LoaderCircle
                size={15}
                className="animate-spin text-amber-400/70"
              />
            ) : null}

            <InsightsRangeSelector value={range} onChange={handleRangeChange} />
          </div>
        </header>

        {isLoading ? (
          <InsightsLoadingState />
        ) : isError || !insights ? (
          <InsightsErrorState
            message={
              error instanceof Error
                ? error.message
                : 'Insights could not be loaded.'
            }
            onRetry={handleRetry}
          />
        ) : (
          <>
            <div className="mt-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Overview
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  {getInsightsRangeLabel(range)}
                </p>
              </div>

              <div className="hidden items-center gap-2 text-[10px] text-slate-600 sm:flex">
                <span className="size-1.5 rounded-full bg-emerald-400" />

                <span>Synced with your completed practice</span>
              </div>
            </div>

            <section className="mt-4 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3 xl:gap-4">
              <InsightMetricCard
                label="Total Chants"
                value={formatInsightsNumber(insights.summary.totalChants)}
                description="Completed mantra repetitions in this period."
                icon={Sparkles}
                emphasized
              />

              <InsightMetricCard
                label="Sessions"
                value={formatInsightsNumber(
                  insights.summary.totalCompletedSessions
                )}
                description="Sadhana sessions completed successfully."
                icon={BarChart3}
              />

              <InsightMetricCard
                label="Practice Time"
                value={formatInsightsDuration(
                  insights.summary.totalPracticeSeconds
                )}
                description="Active time devoted to your completed practice."
                icon={Clock3}
              />

              <InsightMetricCard
                label="Completed Malas"
                value={formatInsightsNumber(insights.summary.totalMalas)}
                description="Full sets of 108 repetitions completed."
                icon={Trophy}
              />

              <InsightMetricCard
                label="Current Streak"
                value={`${formatInsightsNumber(
                  insights.summary.currentStreakDays
                )} ${
                  insights.summary.currentStreakDays === 1 ? 'day' : 'days'
                }`}
                description="Your currently active chain of practice days."
                icon={Flame}
                emphasized
              />

              <InsightMetricCard
                label="Longest Streak"
                value={`${formatInsightsNumber(
                  insights.summary.longestStreakDays
                )} ${
                  insights.summary.longestStreakDays === 1 ? 'day' : 'days'
                }`}
                description="Your longest consecutive Sadhana streak."
                icon={Trophy}
              />
            </section>

            <section className="mt-6 grid gap-4 lg:grid-cols-[1.45fr_0.85fr]">
              <PracticeActivityChart
                activity={insights.dailyActivity}
                range={range}
              />

              <MantraBreakdownPanel
                breakdown={insights.mantraBreakdown}
                totalChants={insights.summary.totalChants}
              />
            </section>

            <PracticeHistoryPanel />
          </>
        )}
      </div>
    </div>
  );
}

function InsightsLoadingState() {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <LoaderCircle size={15} className="animate-spin text-amber-400" />

        <span>Gathering your practice insights...</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]"
          />
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.45fr_0.85fr]">
        <div className="h-72 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />

        <div className="h-72 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
      </div>
    </div>
  );
}

type InsightsErrorStateProps = {
  message: string;

  onRetry: () => void;
};

function InsightsErrorState({ message, onRetry }: InsightsErrorStateProps) {
  return (
    <div className="mt-8 rounded-2xl border border-red-400/15 bg-red-400/[0.035] px-5 py-8 text-center">
      <p className="font-serif text-lg text-slate-200">Insights unavailable</p>

      <p className="mx-auto mt-2 max-w-lg text-xs leading-6 text-slate-500">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.08] px-4 py-2.5 text-xs font-medium text-amber-200 transition hover:bg-amber-400/[0.12]"
      >
        <RotateCcw size={14} />
        Try again
      </button>
    </div>
  );
}
