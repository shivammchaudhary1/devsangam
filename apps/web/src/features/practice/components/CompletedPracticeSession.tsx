import { formatShortPracticeDuration, MALA_SIZE,} from '../utils/practice-session.utils';
import { PracticeStat } from './PracticeStat';
import { APP_ROUTES } from '@/app/constants/routes.constants';
import type { Mantra, PracticeSession } from '@devsangam/types';
import { Sparkles } from 'lucide-react';
import { memo } from 'react';
import { useNavigate } from 'react-router';

type CompletedPracticeSessionProps = {
  session: PracticeSession;
  mantra: Mantra;
  isPendingSync?: boolean;
};

export const CompletedPracticeSession = memo(function CompletedPracticeSession({
  session,
  mantra,
  isPendingSync = false,
}: CompletedPracticeSessionProps) {
  const navigate = useNavigate();

  const malaCount = session.targetCount / MALA_SIZE;

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-[var(--ds-obsidian)] px-4 pb-28 pt-8 text-[var(--ds-cream)] md:pb-8">
      <section className="w-full max-w-lg rounded-3xl border border-amber-400/20 bg-[var(--ds-charcoal)] p-6 text-center shadow-[0_20px_80px_rgba(0,0,0,0.28)] sm:p-8">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/[0.08]">
          <Sparkles className="text-[var(--ds-soft-gold)]" />
        </div>

        <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-400">
          Sadhana Complete
        </p>

        <h1 className="mt-2 font-serif text-2xl text-[var(--ds-soft-gold)]">
          {mantra.title}
        </h1>

        <p className="mt-3 font-serif text-sm leading-6 text-amber-50/70">
          {mantra.sanskrit}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-2">
          <PracticeStat label="Chants" value={`${session.completedCount}`} />

          <PracticeStat
            label="Malas"
            value={
              Number.isInteger(malaCount)
                ? malaCount.toString()
                : malaCount.toFixed(1)
            }
          />

          <PracticeStat
            label="Time"
            value={formatShortPracticeDuration(session.activeDurationSeconds)}
          />
        </div>

        {isPendingSync ? (
          <p className="mt-4 rounded-xl border border-amber-400/15 bg-amber-400/[0.04] px-3 py-2 text-[10px] leading-5 text-amber-100/60">
            Completed on this device. Server sync will finish when you are
            online.
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => navigate(APP_ROUTES.practice)}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl border border-amber-300/70 bg-gradient-to-b from-[#f3c45d] to-[#d89627] text-sm font-semibold text-[#241704] transition hover:brightness-105"
        >
          Practice Again
        </button>

        <button
          type="button"
          onClick={() => navigate(APP_ROUTES.home)}
          className="mt-2 h-10 w-full rounded-xl border border-[var(--ds-border-soft)] bg-[var(--ds-white-03)] text-xs text-slate-400 transition hover:border-[var(--ds-border-soft)] hover:text-[var(--ds-cream)]"
        >
          Return Home
        </button>
      </section>
    </main>
  );
});
