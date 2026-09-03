import {
  formatPracticeDuration,
  MALA_SIZE,
} from '../utils/practice-session.utils';
import { PracticeStat } from './PracticeStat';
import { Clock3, RefreshCcw } from 'lucide-react';
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
      <section className="mx-auto grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
        <PracticeStat label="Target" value={target.toString()} />

        <PracticeStat label="Remaining" value={remaining.toString()} />

        <PracticeStat
          label="Mala"
          value={`${currentMalaRound} / ${totalMalaRounds}`}
        />
      </section>

      <section className="mx-auto mt-3 max-w-xl rounded-[10px] border border-[var(--ds-border-soft)] bg-[var(--ds-night)] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.015)] sm:px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="shrink-0">
            <p className="text-[7px] font-semibold uppercase tracking-[0.14em] text-[#5f6772]">
              Current Mala
            </p>

            <p className="mt-1 font-serif text-[11px] text-[var(--ds-soft-gold)]">
              {malaProgressCount} / {MALA_SIZE}
            </p>
          </div>

          <div className="min-w-0 flex-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-[var(--ds-white-03)]">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#8f581f,#c98b32_48%,#efc875)] shadow-[0_0_8px_rgba(216,154,53,0.12)] transition-[width] duration-200"
                style={{
                  width: `${malaProgressPercentage}%`,
                }}
              />
            </div>

            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-[7px] text-[var(--ds-muted)]">0</span>

              <span className="text-[7px] font-medium text-[var(--ds-bronze)]">
                {Math.round(malaProgressPercentage)}%
              </span>

              <span className="text-[7px] text-[var(--ds-muted)]">{MALA_SIZE}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-3 flex max-w-[210px] items-center justify-center gap-2.5 rounded-[10px] border border-[var(--ds-border-soft)] bg-[var(--ds-night)] px-4 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.015)]">
        <div className="flex size-7 items-center justify-center rounded-[7px] border border-[#d89a35]/12 bg-[#d89a35]/[0.035]">
          <Clock3 size={13} strokeWidth={1.6} className="text-[var(--ds-bronze)]" />
        </div>

        <div className="text-left">
          <p className="text-[7px] font-semibold uppercase tracking-[0.14em] text-[#5f6772]">
            Elapsed Time
          </p>

          <p className="mt-0.5 font-mono text-[13px] font-medium tabular-nums text-[var(--ds-cream)]">
            {formatPracticeDuration(elapsedSeconds)}
          </p>
        </div>
      </section>

      {syncMessage ? (
        <div className="mx-auto mt-3 flex max-w-xl items-start justify-center gap-2 rounded-[9px] border border-[#d89a35]/12 bg-[#d89a35]/[0.03] px-3 py-2 text-center">
          <RefreshCcw
            size={11}
            strokeWidth={1.7}
            className="mt-1 shrink-0 text-[var(--ds-bronze)]"
          />

          <p className="text-[8px] leading-5 text-[var(--ds-bronze)]">{syncMessage}</p>
        </div>
      ) : null}
    </>
  );
});
