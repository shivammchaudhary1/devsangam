import { InsightMetricCard } from '../components/InsightMetricCard';
import { InsightsRangeSelector } from '../components/InsightsRangeSelector';
import { MantraBreakdownPanel } from '../components/MantraBreakdownPanel';
import { MobileInsightsOverview } from '../components/MobileInsightsOverview';
import { PracticeActivityChart } from '../components/PracticeActivityChart';
import { PracticeHistoryPanel } from '../components/PracticeHistoryPanel';
import { StreakCalendar } from '../components/StreakCalendar';
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

  const { data: weeklyInsights } = useInsightsOverview({
    range: '7d',
  });

  const handleRangeChange = useCallback((nextRange: InsightsRange) => {
    setRange(nextRange);
  }, []);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <div
      className={
        'relative min-h-full overflow-hidden ' +
        'bg-[var(--ds-obsidian)] px-4 py-5 ' +
        'sm:px-5 lg:px-7 lg:py-6 xl:px-8'
      }
    >
      <div
        aria-hidden="true"
        className={'pointer-events-none absolute inset-0 overflow-hidden'}
      >
        <div
          className={
            'absolute left-[34%] top-[-220px] size-[520px] ' +
            'rounded-full bg-[var(--ds-amber-03)] blur-[120px]'
          }
        />

        <div
          className={
            'absolute right-[-220px] top-[260px] size-[480px] ' +
            'rounded-full border border-[var(--ds-border-gold)] ' +
            'opacity-20'
          }
        />
      </div>

      <div className={'relative z-10 mx-auto w-full max-w-[1220px]'}>
        <header
          className={
            'flex flex-col gap-4 border-b ' +
            'border-[var(--ds-border-soft)] pb-5 ' +
            'lg:flex-row lg:items-end lg:justify-between'
          }
        >
          <div>
            <div className={'flex items-center gap-2'}>
              <Sparkles
                size={12}
                strokeWidth={1.7}
                className={'text-[var(--ds-gold)]'}
              />

              <p
                className={
                  'text-[9px] font-semibold uppercase ' +
                  'tracking-[0.18em] text-[var(--ds-gold)]'
                }
              >
                Your Sadhana Journey
              </p>
            </div>

            <h1
              className={
                'mt-2 font-serif text-[26px] font-medium ' +
                'tracking-[0.015em] text-[var(--ds-cream)] ' +
                'sm:text-[30px]'
              }
            >
              Insights & Progress
            </h1>

            <p
              className={
                'mt-1.5 max-w-2xl text-[11px] leading-5 ' +
                'text-[var(--ds-muted)] sm:text-xs'
              }
            >
              Track your chanting journey and grow with every mantra.
            </p>
          </div>

          <div className={'flex max-w-full items-center gap-2 md:self-auto'}>
            {isFetching && !isLoading ? (
              <LoaderCircle
                size={14}
                className={
                  'shrink-0 animate-spin text-[var(--ds-gold)] ' + 'opacity-70'
                }
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
            <MobileInsightsOverview
              insights={insights}
              weeklyActivity={
                weeklyInsights?.dailyActivity ??
                insights.dailyActivity.slice(-7)
              }
            />

            <div className="hidden md:block">
              <div className={'mt-5 flex items-center justify-between gap-4'}>
                <div>
                  <p
                    className={
                      'text-[8px] font-semibold uppercase ' +
                      'tracking-[0.16em] text-[var(--ds-muted)]'
                    }
                  >
                    Overview
                  </p>

                  <p className={'mt-1 text-[9px] text-[var(--ds-muted)]'}>
                    {getInsightsRangeLabel(range)}
                  </p>
                </div>

                <div
                  className={
                    'hidden items-center gap-2 text-[8px] ' +
                    'text-[var(--ds-muted)] sm:flex'
                  }
                >
                  <span
                    className={'size-1.5 rounded-full bg-[var(--ds-success)]'}
                  />

                  <span>Synced with completed practice</span>
                </div>
              </div>

              <section
                className={
                  'mt-3 grid grid-cols-1 gap-2.5 ' +
                  'min-[420px]:grid-cols-2 lg:grid-cols-3 ' +
                  'xl:grid-cols-6'
                }
              >
                <InsightMetricCard
                  label="Current Streak"
                  value={`${formatInsightsNumber(
                    insights.summary.currentStreakDays
                  )} ${
                    insights.summary.currentStreakDays === 1 ? 'day' : 'days'
                  }`}
                  description={'Your active chain of completed practice days.'}
                  icon={Flame}
                  emphasized
                />

                <InsightMetricCard
                  label="Malas Completed"
                  value={formatInsightsNumber(insights.summary.totalMalas)}
                  description={'Full sets of 108 repetitions completed.'}
                  icon={Trophy}
                  emphasized
                />

                <InsightMetricCard
                  label="Total Chants"
                  value={formatInsightsNumber(insights.summary.totalChants)}
                  description={'Completed mantra repetitions in this period.'}
                  icon={Sparkles}
                />

                <InsightMetricCard
                  label="Sessions"
                  value={formatInsightsNumber(
                    insights.summary.totalCompletedSessions
                  )}
                  description={'Completed Sadhana sessions.'}
                  icon={BarChart3}
                />

                <InsightMetricCard
                  label="Time Chanted"
                  value={formatInsightsDuration(
                    insights.summary.totalPracticeSeconds
                  )}
                  description={'Active time spent in completed practice.'}
                  icon={Clock3}
                />

                <InsightMetricCard
                  label="Best Streak"
                  value={`${formatInsightsNumber(
                    insights.summary.longestStreakDays
                  )} ${
                    insights.summary.longestStreakDays === 1 ? 'day' : 'days'
                  }`}
                  description={'Your longest consecutive practice streak.'}
                  icon={Trophy}
                />
              </section>

              <section
                className={
                  'mt-4 grid gap-3 ' + 'xl:grid-cols-[0.72fr_1.35fr_0.78fr]'
                }
              >
                <StreakCalendar
                  currentStreakDays={insights.summary.currentStreakDays}
                  longestStreakDays={insights.summary.longestStreakDays}
                />

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

              <div className={'mt-7 hidden items-center gap-4 pb-2 lg:flex'}>
                <div
                  className={
                    'h-px flex-1 bg-gradient-to-r ' +
                    'from-transparent to-[var(--ds-border-gold)]'
                  }
                />

                <p
                  className={
                    'font-serif text-[10px] tracking-[0.05em] ' +
                    'text-[var(--ds-bronze)]'
                  }
                >
                  Consistency in chanting transforms practice into discipline.
                </p>

                <div
                  className={
                    'h-px flex-1 bg-gradient-to-r ' +
                    'from-[var(--ds-border-gold)] to-transparent'
                  }
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function InsightsLoadingState() {
  return (
    <div className="mt-6">
      <div
        className={
          'flex items-center gap-2 text-[10px] ' + 'text-[var(--ds-muted)]'
        }
      >
        <LoaderCircle
          size={14}
          className={'animate-spin text-[var(--ds-gold)]'}
        />

        <span>Gathering your practice insights...</span>
      </div>

      <div
        className={
          'mt-4 grid grid-cols-2 gap-2.5 ' + 'lg:grid-cols-3 xl:grid-cols-6'
        }
      >
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <div
            key={index}
            className={
              'h-[118px] animate-pulse rounded-[11px] border ' +
              'border-[var(--ds-border-soft)] ' +
              'bg-[var(--ds-white-03)]'
            }
          />
        ))}
      </div>

      <div
        className={'mt-4 grid gap-3 ' + 'xl:grid-cols-[0.72fr_1.35fr_0.78fr]'}
      >
        {Array.from({
          length: 3,
        }).map((_, index) => (
          <div
            key={index}
            className={
              'h-72 animate-pulse rounded-[11px] border ' +
              'border-[var(--ds-border-soft)] ' +
              'bg-[var(--ds-white-03)]'
            }
          />
        ))}
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
    <div
      className={
        'mt-6 rounded-[11px] border border-red-400/15 ' +
        'bg-red-400/[0.028] px-5 py-8 text-center'
      }
    >
      <p className={'font-serif text-lg text-[var(--ds-cream)]'}>
        Insights unavailable
      </p>

      <p
        className={
          'mx-auto mt-2 max-w-lg text-[10px] leading-5 ' +
          'text-[var(--ds-muted)]'
        }
      >
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className={
          'mt-4 inline-flex items-center gap-2 rounded-[8px] ' +
          'border border-[var(--ds-border-gold)] ' +
          'bg-[var(--ds-amber-05)] px-3.5 py-2.5 ' +
          'text-[10px] font-medium text-[var(--ds-soft-gold)] ' +
          'transition hover:bg-[var(--ds-amber-10)]'
        }
      >
        <RotateCcw size={13} />
        Try again
      </button>
    </div>
  );
}
