import { usePracticeHistory } from '../hooks/usePracticeHistory';
import {
  formatInsightsDuration,
  formatInsightsNumber,
} from '../utils/insights-format.utils';
import { getMantraDetailRoute } from '@/app/constants/routes.constants';
import { useMantras } from '@/features/mantras/hooks/useMantras';
import type {
  Mantra,
  PracticeSession,
  PracticeSessionStatus,
} from '@devsangam/types';
import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  History,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Target,
} from 'lucide-react';
import { memo, useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router';

const HISTORY_PAGE_SIZE = 8;

type HistoryStatusFilter = 'all' | PracticeSessionStatus;

const HISTORY_STATUS_FILTERS: readonly {
  value: HistoryStatusFilter;
  label: string;
}[] = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: 'completed',
    label: 'Completed',
  },
  {
    value: 'in_progress',
    label: 'In progress',
  },
  {
    value: 'paused',
    label: 'Paused',
  },
  {
    value: 'abandoned',
    label: 'Abandoned',
  },
];

export const PracticeHistoryPanel = memo(function PracticeHistoryPanel() {
  const [page, setPage] = useState(1);

  const [statusFilter, setStatusFilter] = useState<HistoryStatusFilter>('all');

  const {
    data: history,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = usePracticeHistory({
    page,

    limit: HISTORY_PAGE_SIZE,

    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const { data: mantras = [] } = useMantras();

  const mantraBySlug = useMemo(
    () => new Map(mantras.map((mantra) => [mantra.slug, mantra])),
    [mantras]
  );

  const handleStatusChange = useCallback((status: HistoryStatusFilter) => {
    setStatusFilter(status);

    setPage(1);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setPage((currentPage) => Math.max(1, currentPage - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage((currentPage) => currentPage + 1);
  }, []);

  const handleRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  return (
    <section className="mt-6 rounded-2xl border border-white/[0.07] bg-[#09121e] p-4 sm:p-5">
      <header className="flex flex-col gap-4 border-b border-white/[0.06] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <History size={14} strokeWidth={1.7} className="text-amber-400" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Practice History
            </p>
          </div>

          <h2 className="mt-1 font-serif text-xl text-slate-200">
            Your Sadhana record
          </h2>

          <p className="mt-1 text-[11px] leading-5 text-slate-600">
            Review your recent practice sessions and progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isFetching && !isLoading ? (
            <LoaderCircle
              size={14}
              className="animate-spin text-amber-400/70"
            />
          ) : null}

          {history ? (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-right">
              <p className="text-[8px] uppercase tracking-[0.1em] text-slate-600">
                Sessions
              </p>

              <p className="mt-1 font-serif text-base text-slate-300">
                {formatInsightsNumber(history.pagination.totalItems)}
              </p>
            </div>
          ) : null}
        </div>
      </header>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-1.5">
          {HISTORY_STATUS_FILTERS.map((filter) => {
            const isActive = statusFilter === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                aria-pressed={isActive}
                onClick={() => handleStatusChange(filter.value)}
                className={[
                  'rounded-lg border px-3 py-2 text-[9px] font-semibold transition',
                  isActive
                    ? [
                        'border-amber-400/20',
                        'bg-amber-400/[0.09]',
                        'text-amber-200',
                      ].join(' ')
                    : [
                        'border-white/[0.05]',
                        'bg-white/[0.015]',
                        'text-slate-500',
                        'hover:border-white/[0.09]',
                        'hover:text-slate-300',
                      ].join(' '),
                ].join(' ')}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <PracticeHistoryLoadingState />
      ) : isError ? (
        <PracticeHistoryErrorState
          message={
            error instanceof Error
              ? error.message
              : 'Practice history could not be loaded.'
          }
          onRetry={handleRetry}
        />
      ) : !history || history.sessions.length === 0 ? (
        <PracticeHistoryEmptyState statusFilter={statusFilter} />
      ) : (
        <>
          <div className="mt-4 space-y-2.5">
            {history.sessions.map((session) => (
              <PracticeHistoryRow
                key={session._id}
                session={session}
                mantra={mantraBySlug.get(session.mantraSlug) ?? null}
              />
            ))}
          </div>

          <footer className="mt-5 flex flex-col gap-3 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[10px] text-slate-600">
              Page{' '}
              <span className="text-slate-400">{history.pagination.page}</span>{' '}
              of{' '}
              <span className="text-slate-400">
                {Math.max(history.pagination.totalPages, 1)}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePreviousPage}
                disabled={isFetching || !history.pagination.hasPreviousPage}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 text-[10px] font-medium text-slate-400 transition hover:border-white/[0.12] hover:text-slate-200 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft size={13} />
                Previous
              </button>

              <button
                type="button"
                onClick={handleNextPage}
                disabled={isFetching || !history.pagination.hasNextPage}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-amber-400/15 bg-amber-400/[0.06] px-3 text-[10px] font-medium text-amber-200 transition hover:bg-amber-400/[0.10] disabled:cursor-not-allowed disabled:opacity-35"
              >
                Next
                <ChevronRight size={13} />
              </button>
            </div>
          </footer>
        </>
      )}
    </section>
  );
});

type PracticeHistoryRowProps = {
  session: PracticeSession;

  mantra: Mantra | null;
};

const PracticeHistoryRow = memo(function PracticeHistoryRow({
  session,
  mantra,
}: PracticeHistoryRowProps) {
  const progress =
    session.targetCount > 0
      ? Math.min(
          100,
          Math.round((session.completedCount / session.targetCount) * 100)
        )
      : 0;

  const title = mantra?.title ?? formatMantraSlug(session.mantraSlug);

  return (
    <article className="rounded-xl border border-white/[0.055] bg-white/[0.015] p-3.5 transition hover:border-white/[0.09] hover:bg-white/[0.022] sm:p-4">
      <div className="flex items-start gap-3">
        <div className="size-11 shrink-0 overflow-hidden rounded-xl border border-white/[0.07] bg-[#070f19]">
          {mantra?.image ? (
            <img
              src={mantra.image}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Sparkles size={15} className="text-amber-400/45" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <Link
                to={getMantraDetailRoute(session.mantraSlug)}
                className="block truncate font-serif text-sm text-slate-200 transition hover:text-amber-200"
              >
                {title}
              </Link>

              <p className="mt-1 text-[9px] text-slate-600">
                {formatHistoryDate(session.completedAt ?? session.startedAt)}
              </p>
            </div>

            <PracticeStatusBadge status={session.status} />
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between gap-3 text-[9px]">
              <span className="text-slate-600">Chant progress</span>

              <span className="text-slate-400">
                {formatInsightsNumber(session.completedCount)} /{' '}
                {formatInsightsNumber(session.targetCount)}
              </span>
            </div>

            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#9b631a] via-[#c68a2e] to-[#e4bc58]"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            <HistoryMeta icon={Target} value={`${progress}% complete`} />

            <HistoryMeta
              icon={Clock3}
              value={formatInsightsDuration(session.activeDurationSeconds)}
            />

            <HistoryMeta
              icon={Sparkles}
              value={`${formatInsightsNumber(
                Math.floor(session.completedCount / 108)
              )} ${
                Math.floor(session.completedCount / 108) === 1
                  ? 'mala'
                  : 'malas'
              }`}
            />
          </div>
        </div>
      </div>
    </article>
  );
});

type HistoryMetaProps = {
  icon: typeof Sparkles;

  value: string;
};

const HistoryMeta = memo(function HistoryMeta({
  icon: Icon,
  value,
}: HistoryMetaProps) {
  return (
    <div className="flex items-center gap-1.5 text-[9px] text-slate-500">
      <Icon size={10} strokeWidth={1.6} className="text-amber-400/45" />

      <span>{value}</span>
    </div>
  );
});

type PracticeStatusBadgeProps = {
  status: PracticeSessionStatus;
};

const PracticeStatusBadge = memo(function PracticeStatusBadge({
  status,
}: PracticeStatusBadgeProps) {
  return (
    <span
      className={[
        'inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.08em]',
        getStatusClasses(status),
      ].join(' ')}
    >
      {formatStatusLabel(status)}
    </span>
  );
});

function PracticeHistoryLoadingState() {
  return (
    <div className="mt-4 space-y-2.5">
      {Array.from({
        length: 4,
      }).map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.02]"
        />
      ))}
    </div>
  );
}

type PracticeHistoryErrorStateProps = {
  message: string;

  onRetry: () => void;
};

function PracticeHistoryErrorState({
  message,
  onRetry,
}: PracticeHistoryErrorStateProps) {
  return (
    <div className="mt-5 rounded-xl border border-red-400/15 bg-red-400/[0.025] px-5 py-8 text-center">
      <p className="font-serif text-base text-slate-300">History unavailable</p>

      <p className="mx-auto mt-2 max-w-md text-[10px] leading-5 text-slate-600">
        {message}
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-400/15 bg-amber-400/[0.06] px-3 py-2 text-[10px] text-amber-200"
      >
        <RotateCcw size={12} />
        Try again
      </button>
    </div>
  );
}

type PracticeHistoryEmptyStateProps = {
  statusFilter: HistoryStatusFilter;
};

function PracticeHistoryEmptyState({
  statusFilter,
}: PracticeHistoryEmptyStateProps) {
  return (
    <div className="mt-5 flex min-h-44 items-center justify-center rounded-xl border border-dashed border-white/[0.07] bg-white/[0.012] px-6 text-center">
      <div>
        <History size={22} className="mx-auto text-amber-400/40" />

        <p className="mt-3 font-serif text-base text-slate-300">
          No sessions found
        </p>

        <p className="mx-auto mt-2 max-w-sm text-[10px] leading-5 text-slate-600">
          {statusFilter === 'all'
            ? 'Your Sadhana sessions will appear here as you practice.'
            : `You do not have any ${formatStatusLabel(
                statusFilter
              ).toLowerCase()} sessions yet.`}
        </p>
      </div>
    </div>
  );
}

function getStatusClasses(status: PracticeSessionStatus) {
  switch (status) {
    case 'completed':
      return 'border-emerald-400/15 bg-emerald-400/[0.06] text-emerald-300';

    case 'in_progress':
      return 'border-sky-400/15 bg-sky-400/[0.06] text-sky-300';

    case 'paused':
      return 'border-amber-400/15 bg-amber-400/[0.06] text-amber-300';

    case 'abandoned':
      return 'border-red-400/15 bg-red-400/[0.05] text-red-300';
  }
}

function formatStatusLabel(status: PracticeSessionStatus) {
  switch (status) {
    case 'completed':
      return 'Completed';

    case 'in_progress':
      return 'In progress';

    case 'paused':
      return 'Paused';

    case 'abandoned':
      return 'Abandoned';
  }
}

function formatHistoryDate(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatMantraSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
