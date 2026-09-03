import { formatNumber } from '../utils/dashboard-formatters';
import { ProgressRing } from './ProgressRing';
import { getPracticeRoute } from '@/app/constants/routes.constants';
import { Skeleton } from '@/components/loading/Skeleton';
import type { Mantra } from '@devsangam/types';
import { Play } from 'lucide-react';
import { Link } from 'react-router';

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

export function QuickStartCard({
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
      <div className="border-b border-[var(--ds-border-soft)] px-4 py-3">
        <h2 className="font-serif text-[14px] text-[var(--ds-cream)]">
          Quick Start
        </h2>
      </div>

      <div className="px-5 pb-5 pt-4">
        <div className="min-h-[46px] text-center">
          {isLoading ? (
            <Skeleton className="mx-auto h-9 w-48" />
          ) : (
            <>
              <p className="truncate text-[11px] font-semibold tracking-[0.03em] text-[var(--ds-text)]">
                {mantra?.title ?? 'Choose Your Mantra'}
              </p>

              <p className="font-devanagari mx-auto mt-1.5 max-w-[360px] truncate text-[13px] text-[var(--ds-soft-gold)]">
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
