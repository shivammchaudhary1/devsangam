import {
  formatDurationCompact,
  formatMantraSlug,
  formatNumber,
  formatPracticeDate,
} from '../utils/dashboard-formatters';
import { DashboardMessage } from './DashboardMessage';
import { APP_ROUTES } from '@/app/constants/routes.constants';
import { Skeleton } from '@/components/loading/Skeleton';
import { MANTRA_IMAGES } from '@/features/mantras/constants/mantra-images';
import type { Mantra, PracticeSession } from '@devsangam/types';
import { Flame, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

type RecentSessionsCardProps = {
  sessions: PracticeSession[];
  mantras: Mantra[];
  isLoading: boolean;
  isError: boolean;
};

export function RecentSessionsCard({
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
  const artwork = mantra?.image || MANTRA_IMAGES[session.mantraSlug];

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

function RecentSessionsLoading() {
  return (
    <div className="space-y-2">
      {[0, 1, 2].map((item) => (
        <Skeleton key={item} className="h-[64px] border border-white/[0.04]" />
      ))}
    </div>
  );
}
