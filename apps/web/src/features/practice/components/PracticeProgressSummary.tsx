import {
  formatPracticeDuration,
  MALA_SIZE,
} from '../utils/practice-session.utils';
import { PracticeStat } from './PracticeStat';
import { Clock3 } from 'lucide-react';
import { memo } from 'react';

type PracticeProgressSummaryProps = {
  target: number;

  remaining: number;

  currentMalaRound: number;

  totalMalaRounds: number;

  malaProgressCount: number;

  elapsedSeconds: number;

  syncMessage: string | null;
};

export const PracticeProgressSummary = memo(function PracticeProgressSummary({
  target,
  remaining,
  currentMalaRound,
  totalMalaRounds,
  malaProgressCount,
  elapsedSeconds,
  syncMessage,
}: PracticeProgressSummaryProps) {
  const malaProgressPercentage = Math.min(
    (malaProgressCount / MALA_SIZE) * 100,
    100
  );

  return (
    <>
      <section className="mx-auto mt-5 grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
        <PracticeStat label="Target" value={target.toString()} />

        <PracticeStat label="Remaining" value={remaining.toString()} />

        <PracticeStat
          label="Mala"
          value={`${currentMalaRound} / ${totalMalaRounds}`}
        />
      </section>

      <section className="mx-auto mt-3 max-w-xl rounded-xl border border-white/[0.07] bg-[#09121e] px-3 py-3">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[9px] uppercase tracking-[0.15em] text-slate-600">
              Current mala progress
            </p>

            <p className="mt-1 text-xs text-slate-300">
              {malaProgressCount} / {MALA_SIZE}
            </p>
          </div>

          <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#b87a20] to-[#f0c45c] transition-[width] duration-200"
              style={{
                width: `${malaProgressPercentage}%`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto mt-3 flex max-w-[200px] items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-[#09121e] px-4 py-2.5">
        <Clock3 size={14} className="text-amber-400/70" />

        <div className="text-center">
          <p className="text-[8px] uppercase tracking-[0.15em] text-slate-600">
            Elapsed Time
          </p>

          <p className="mt-0.5 font-mono text-sm text-slate-200">
            {formatPracticeDuration(elapsedSeconds)}
          </p>
        </div>
      </section>

      {syncMessage ? (
        <div className="mx-auto mt-3 max-w-xl rounded-xl border border-amber-400/15 bg-amber-400/[0.04] px-3 py-2 text-center text-[10px] leading-5 text-amber-100/60">
          {syncMessage}
        </div>
      ) : null}
    </>
  );
});
