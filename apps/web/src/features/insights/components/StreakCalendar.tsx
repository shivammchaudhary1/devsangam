import { useInsightsOverview } from '../hooks/useInsightsOverview';
import { formatInsightsNumber } from '../utils/insights-format.utils';
import type { DailyPracticeActivity } from '@devsangam/types';
import { ChevronLeft, ChevronRight, Flame, LoaderCircle } from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const;

type StreakCalendarProps = {
  currentStreakDays: number;
  longestStreakDays: number;
};

type CalendarCell = {
  key: string;
  day: number | null;
  dateKey: string | null;
};

export const StreakCalendar = memo(function StreakCalendar({
  currentStreakDays,
  longestStreakDays,
}: StreakCalendarProps) {
  const today = useMemo(() => new Date(), []);

  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const {
    data: allTimeInsights,
    isLoading,
    isFetching,
  } = useInsightsOverview({
    range: 'all',
  });

  const activityByDate = useMemo(
    () =>
      new Map(
        (allTimeInsights?.dailyActivity ?? []).map((item) => [item.date, item])
      ),
    [allTimeInsights?.dailyActivity]
  );

  const calendarCells = useMemo(
    () => buildCalendarCells(visibleMonth),
    [visibleMonth]
  );

  const visibleMonthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
      }).format(visibleMonth),
    [visibleMonth]
  );

  const todayDateKey = useMemo(() => formatLocalDateKey(today), [today]);

  const isCurrentMonth =
    visibleMonth.getFullYear() === today.getFullYear() &&
    visibleMonth.getMonth() === today.getMonth();

  const handlePreviousMonth = useCallback(() => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
    );
  }, []);

  const handleNextMonth = useCallback(() => {
    setVisibleMonth((current) => {
      const nextMonth = new Date(
        current.getFullYear(),
        current.getMonth() + 1,
        1
      );

      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      if (nextMonth > currentMonth) {
        return current;
      }

      return nextMonth;
    });
  }, [today]);

  return (
    <section
      className={
        'relative overflow-hidden rounded-[11px] border ' +
        'border-[var(--ds-border-soft)] ' +
        'bg-[var(--ds-gradient-panel-soft)] p-4 ' +
        'shadow-[var(--ds-shadow-card)]'
      }
    >
      <div
        aria-hidden="true"
        className={
          'pointer-events-none absolute -left-14 -top-14 ' +
          'size-36 rounded-full bg-[var(--ds-amber-05)] ' +
          'blur-3xl'
        }
      />

      <div className="relative">
        <div className={'flex items-start justify-between gap-3'}>
          <div>
            <div className={'flex items-center gap-2'}>
              <Flame
                size={13}
                strokeWidth={1.7}
                className={'text-[var(--ds-gold)]'}
              />

              <p
                className={
                  'text-[9px] font-semibold uppercase ' +
                  'tracking-[0.15em] text-[var(--ds-gold)]'
                }
              >
                Streak Calendar
              </p>
            </div>

            <p className={'mt-1 text-[9px] leading-4 text-[var(--ds-muted)]'}>
              Completed Sadhana days
            </p>
          </div>

          {isFetching ? (
            <LoaderCircle
              size={13}
              className={'animate-spin text-[var(--ds-gold)] opacity-60'}
            />
          ) : null}
        </div>

        <div className={'mt-4 flex items-center justify-between'}>
          <button
            type="button"
            onClick={handlePreviousMonth}
            aria-label="Previous month"
            className={
              'flex size-7 items-center justify-center rounded-[7px] ' +
              'border border-transparent text-[var(--ds-muted)] ' +
              'transition hover:border-[var(--ds-border-soft)] ' +
              'hover:bg-[var(--ds-white-03)] ' +
              'hover:text-[var(--ds-cream)]'
            }
          >
            <ChevronLeft size={14} />
          </button>

          <p
            className={
              'font-serif text-[12px] font-medium ' + 'text-[var(--ds-cream)]'
            }
          >
            {visibleMonthLabel}
          </p>

          <button
            type="button"
            onClick={handleNextMonth}
            disabled={isCurrentMonth}
            aria-label="Next month"
            className={
              'flex size-7 items-center justify-center rounded-[7px] ' +
              'border border-transparent text-[var(--ds-muted)] ' +
              'transition hover:border-[var(--ds-border-soft)] ' +
              'hover:bg-[var(--ds-white-03)] ' +
              'hover:text-[var(--ds-cream)] ' +
              'disabled:cursor-not-allowed disabled:opacity-25'
            }
          >
            <ChevronRight size={14} />
          </button>
        </div>

        <div className={'mt-4 grid grid-cols-7 gap-1'}>
          {WEEKDAY_LABELS.map((weekday, index) => (
            <div
              key={`${weekday}-${index}`}
              className={
                'flex h-5 items-center justify-center ' +
                'text-[7px] font-semibold text-[var(--ds-muted)]'
              }
            >
              {weekday}
            </div>
          ))}

          {calendarCells.map((cell) => {
            if (cell.day === null || cell.dateKey === null) {
              return <div key={cell.key} className="aspect-square" />;
            }

            const activity = activityByDate.get(cell.dateKey);

            return (
              <CalendarDay
                key={cell.key}
                day={cell.day}
                activity={activity ?? null}
                isToday={cell.dateKey === todayDateKey}
              />
            );
          })}
        </div>

        {isLoading ? (
          <div className={'mt-4 flex h-8 items-center justify-center'}>
            <LoaderCircle
              className={'size-4 animate-spin text-[var(--ds-gold)] opacity-60'}
            />
          </div>
        ) : (
          <div
            className={
              'mt-4 grid grid-cols-2 gap-2 border-t ' +
              'border-[var(--ds-border-soft)] pt-3'
            }
          >
            <CalendarSummary
              label="Current"
              value={`${formatInsightsNumber(currentStreakDays)} ${
                currentStreakDays === 1 ? 'day' : 'days'
              }`}
            />

            <CalendarSummary
              label="Best"
              value={`${formatInsightsNumber(longestStreakDays)} ${
                longestStreakDays === 1 ? 'day' : 'days'
              }`}
            />
          </div>
        )}
      </div>
    </section>
  );
});

type CalendarDayProps = {
  day: number;
  activity: DailyPracticeActivity | null;
  isToday: boolean;
};

const CalendarDay = memo(function CalendarDay({
  day,
  activity,
  isToday,
}: CalendarDayProps) {
  const hasPractice = Boolean(activity && activity.completedSessions > 0);

  const tooltip = activity
    ? `${activity.chants} chants · ${activity.completedSessions} completed ${
        activity.completedSessions === 1 ? 'session' : 'sessions'
      }`
    : 'No completed practice';

  return (
    <div className={'flex aspect-square items-center justify-center'}>
      <div
        title={tooltip}
        className={[
          'relative flex size-[27px] items-center justify-center',
          'rounded-full text-[8px] font-medium transition',

          hasPractice
            ? [
                'border',
                'border-[var(--ds-border-gold)]',
                'bg-[var(--ds-gradient-gold)]',
                'text-[#181007]',
                'shadow-[var(--ds-shadow-gold)]',
              ].join(' ')
            : isToday
              ? [
                  'border',
                  'border-[var(--ds-border-gold)]',
                  'bg-[var(--ds-amber-05)]',
                  'text-[var(--ds-soft-gold)]',
                ].join(' ')
              : [
                  'border',
                  'border-transparent',
                  'text-[var(--ds-muted)]',
                  'hover:border-[var(--ds-border-soft)]',
                  'hover:bg-[var(--ds-white-03)]',
                ].join(' '),
        ].join(' ')}
      >
        {day}

        {isToday ? (
          <span
            aria-hidden="true"
            className={[
              'absolute -bottom-[3px] size-1 rounded-full',
              hasPractice ? 'bg-[#f4d995]' : 'bg-[var(--ds-gold)]',
            ].join(' ')}
          />
        ) : null}
      </div>
    </div>
  );
});

type CalendarSummaryProps = {
  label: string;
  value: string;
};

const CalendarSummary = memo(function CalendarSummary({
  label,
  value,
}: CalendarSummaryProps) {
  return (
    <div
      className={
        'rounded-[8px] border border-[var(--ds-border-soft)] ' +
        'bg-[var(--ds-white-03)] px-2.5 py-2'
      }
    >
      <p
        className={
          'text-[7px] font-semibold uppercase tracking-[0.1em] ' +
          'text-[var(--ds-muted)]'
        }
      >
        {label}
      </p>

      <p className={'mt-1 font-serif text-[10px] text-[var(--ds-text)]'}>
        {value}
      </p>
    </div>
  );
});

function buildCalendarCells(month: Date): CalendarCell[] {
  const year = month.getFullYear();

  const monthIndex = month.getMonth();

  const firstDay = new Date(year, monthIndex, 1).getDay();

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  const cells: CalendarCell[] = [];

  for (let index = 0; index < firstDay; index += 1) {
    cells.push({
      key: `empty-start-${index}`,
      day: null,
      dateKey: null,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      key: `${year}-${monthIndex}-${day}`,

      day,

      dateKey: formatLocalDateKey(new Date(year, monthIndex, day)),
    });
  }

  while (cells.length < 42) {
    cells.push({
      key: `empty-end-${cells.length}`,
      day: null,
      dateKey: null,
    });
  }

  return cells;
}

function formatLocalDateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, '0');

  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
