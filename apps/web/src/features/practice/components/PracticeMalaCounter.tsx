import { BEAD_COUNT } from '../utils/practice-session.utils';
import { Pause } from 'lucide-react';
import { memo } from 'react';

const MALA_BEAD_ANGLES = Array.from(
  {
    length: BEAD_COUNT,
  },
  (_, index) => (360 / BEAD_COUNT) * index
);

type PracticeMalaCounterProps = {
  count: number;

  target: number;

  progress: number;

  isPaused: boolean;

  isOffline: boolean;

  onChant: () => void;
};

export const PracticeMalaCounter = memo(function PracticeMalaCounter({
  count,
  target,
  progress,
  isPaused,
  isOffline,
  onChant,
}: PracticeMalaCounterProps) {
  const illuminatedBeads = Math.round((progress / 100) * BEAD_COUNT);

  return (
    <section className="mt-5 flex flex-col items-center sm:mt-6">
      <button
        type="button"
        onClick={onChant}
        disabled={isPaused}
        aria-label={isPaused ? 'Practice is paused' : 'Tap to count one chant'}
        className="group relative flex size-[270px] touch-manipulation items-center justify-center rounded-full outline-none transition active:scale-[0.985] disabled:cursor-default sm:size-[330px]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-[8%] rounded-full bg-amber-400/[0.05] blur-2xl transition group-active:bg-amber-400/[0.09]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-[3%] rounded-full border border-amber-300/15 shadow-[0_0_50px_rgba(245,158,11,0.08)]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-[8%] rounded-full border border-amber-400/30 shadow-[inset_0_0_26px_rgba(245,158,11,0.07),0_0_24px_rgba(245,158,11,0.08)]"
        />

        <div aria-hidden="true" className="absolute inset-0">
          {MALA_BEAD_ANGLES.map((angle, index) => {
            const isLit = index < illuminatedBeads;

            return (
              <span
                key={index}
                className={[
                  'absolute left-1/2 top-1/2 size-[9px] rounded-full border sm:size-[11px]',
                  isLit
                    ? 'border-[#f9d67d] bg-[#dca53d] shadow-[0_0_10px_rgba(245,158,11,0.8)]'
                    : 'border-amber-300/30 bg-[#5d431f]',
                ].join(' ')}
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-123px)`,
                }}
              />
            );
          })}
        </div>

        <svg
          aria-hidden="true"
          className="absolute inset-[12%] -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1.5"
          />

          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(231,183,73,0.8)"
            strokeWidth="1.6"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - progress}
            className="transition-[stroke-dashoffset] duration-200"
          />
        </svg>

        <div className="relative flex size-[62%] flex-col items-center justify-center rounded-full border border-amber-300/15 bg-[radial-gradient(circle_at_center,#152033_0%,#0b1421_62%,#07101a_100%)] shadow-[inset_0_0_45px_rgba(0,0,0,0.55)]">
          {isPaused ? (
            <>
              <Pause size={34} className="text-[#e1b857]" />

              <span className="mt-3 text-[10px] uppercase tracking-[0.18em] text-amber-200/60">
                Paused
              </span>
            </>
          ) : (
            <>
              <span className="font-serif text-5xl font-medium tracking-[0.03em] text-[#f0ca6c] sm:text-6xl">
                {String(count).padStart(3, '0')}
              </span>

              <span className="mt-1 text-sm text-slate-500">/ {target}</span>

              <span className="mt-3 text-[9px] font-semibold uppercase tracking-[0.17em] text-amber-200/60">
                Tap to chant
              </span>

              <span className="mt-2 font-serif text-xl text-[#dba843]">ॐ</span>
            </>
          )}
        </div>
      </button>

      <p className="mt-3 text-center text-[10px] text-slate-600">
        {isPaused
          ? 'Resume when you are ready.'
          : isOffline
            ? 'Offline mode — your chants are saved on this device.'
            : 'Each tap counts one repetition.'}
      </p>
    </section>
  );
});
