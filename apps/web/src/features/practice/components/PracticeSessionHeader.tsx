import type { Mantra } from '@devsangam/types';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { memo } from 'react';

type PracticeSessionHeaderProps = {
  mantra: Mantra;

  currentMalaRound: number;

  totalMalaRounds: number;

  isOffline: boolean;

  isBusy: boolean;

  onExit: () => void;
};

export const PracticeSessionHeader = memo(function PracticeSessionHeader({
  mantra,
  currentMalaRound,
  totalMalaRounds,
  isOffline,
  isBusy,
  onExit,
}: PracticeSessionHeaderProps) {
  return (
    <>
      <div className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-[#0a1320]/80 px-3 backdrop-blur-md sm:px-4">
        <button
          type="button"
          onClick={onExit}
          disabled={isBusy}
          className="inline-flex items-center gap-2 text-[11px] text-slate-400 transition hover:text-amber-300 disabled:opacity-40"
        >
          <ArrowLeft size={14} />

          <span>Exit Session</span>
        </button>

        <div className="flex items-center gap-3">
          <span
            className={[
              'size-1.5 rounded-full',
              isOffline ? 'bg-orange-400' : 'bg-emerald-400',
            ].join(' ')}
          />

          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.13em] text-slate-500">
            <span>
              Mala {currentMalaRound} / {totalMalaRounds}
            </span>

            <Sparkles size={12} className="text-amber-400" />
          </div>
        </div>
      </div>

      <header className="mx-auto mt-5 max-w-xl text-center sm:mt-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-400/85">
          {mantra.deity ?? 'Daily Sadhana'}
        </p>

        <h1 className="mt-2 font-serif text-xl font-medium uppercase tracking-[0.08em] text-[#e7c76e] sm:text-2xl">
          {mantra.title}
        </h1>

        <p className="mt-2 font-serif text-sm leading-6 text-amber-50/80 sm:text-base">
          {mantra.sanskrit}
        </p>
      </header>
    </>
  );
});
