import type { Mantra } from '@devsangam/types';
import { ArrowLeft, CloudOff, Sparkles } from 'lucide-react';
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
      <div className="flex min-h-11 items-center justify-between gap-3 rounded-[10px] border border-[var(--ds-border-soft)] bg-[var(--ds-night)] px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.018)] backdrop-blur-md sm:px-4">
        <button
          type="button"
          onClick={onExit}
          disabled={isBusy}
          className="group inline-flex items-center gap-2 rounded-[7px] px-1.5 py-1 text-[10px] font-medium text-[var(--ds-muted)] transition hover:bg-[var(--ds-white-03)] hover:text-[#dfb35c] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeft
            size={14}
            strokeWidth={1.7}
            className="transition-transform group-hover:-translate-x-0.5"
          />

          <span>Exit Session</span>
        </button>

        <div className="flex min-w-0 items-center gap-3">
          <div
            className={[
              'flex items-center gap-1.5 rounded-full border px-2 py-1',
              isOffline
                ? 'border-orange-400/15 bg-orange-400/[0.04]'
                : 'border-emerald-400/12 bg-emerald-400/[0.035]',
            ].join(' ')}
          >
            {isOffline ? (
              <CloudOff
                size={10}
                strokeWidth={1.7}
                className="text-orange-300/80"
              />
            ) : (
              <span className="size-1.5 rounded-full bg-[#4da779]" />
            )}

            <span
              className={[
                'hidden text-[7px] font-semibold uppercase tracking-[0.1em] min-[380px]:inline',
                isOffline ? 'text-orange-300/70' : 'text-[#78988a]',
              ].join(' ')}
            >
              {isOffline ? 'Offline' : 'Synced'}
            </span>
          </div>

          <div className="flex min-w-0 items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--ds-muted)]">
            <span className="truncate">
              Mala {currentMalaRound} / {totalMalaRounds}
            </span>

            <Sparkles
              size={11}
              strokeWidth={1.6}
              className="shrink-0 text-[var(--ds-gold)]"
            />
          </div>
        </div>
      </div>

      <header className="mx-auto mt-5 max-w-xl px-2 text-center sm:mt-6">
        <div className="flex items-center justify-center gap-2">
          <div className="h-px w-8 bg-[linear-gradient(90deg,transparent,rgba(216,154,53,0.22))]" />

          <p className="text-[8px] font-semibold uppercase tracking-[0.19em] text-[#a97938]">
            {mantra.deity ?? 'Daily Sadhana'}
          </p>

          <div className="h-px w-8 bg-[linear-gradient(90deg,rgba(216,154,53,0.22),transparent)]" />
        </div>

        <h1 className="mt-2 font-serif text-[20px] font-medium uppercase tracking-[0.07em] text-[var(--ds-soft-gold)] sm:text-[23px]">
          {mantra.title}
        </h1>

        <p className="font-devanagari mt-2 text-[14px] leading-7 text-[var(--ds-soft-gold)] sm:text-[16px]">
          {mantra.sanskrit}
        </p>

        {mantra.transliteration ? (
          <p className="mx-auto mt-1.5 max-w-lg text-[9px] leading-4 tracking-[0.02em] text-[var(--ds-muted)] sm:text-[10px]">
            {mantra.transliteration}
          </p>
        ) : null}
      </header>
    </>
  );
});
