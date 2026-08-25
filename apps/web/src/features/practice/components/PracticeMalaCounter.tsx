import { BEAD_COUNT } from '../utils/practice-session.utils';
import { Pause, Sparkles } from 'lucide-react';
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
    <section className="flex flex-col items-center">
      <div className="mb-3 flex items-center justify-center gap-2">
        <div className="h-px w-10 bg-[linear-gradient(90deg,transparent,rgba(216,154,53,0.18))]" />

        <Sparkles size={10} strokeWidth={1.6} className="text-[#9f722f]" />

        <p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-[#726044]">
          Sacred Count
        </p>

        <Sparkles size={10} strokeWidth={1.6} className="text-[#9f722f]" />

        <div className="h-px w-10 bg-[linear-gradient(90deg,rgba(216,154,53,0.18),transparent)]" />
      </div>

      <button
        type="button"
        onClick={onChant}
        disabled={isPaused}
        aria-label={isPaused ? 'Practice is paused' : 'Tap to count one chant'}
        className="group relative flex size-[268px] touch-manipulation items-center justify-center rounded-full outline-none transition-transform duration-150 active:scale-[0.985] disabled:cursor-default sm:size-[326px]"
      >
        <div
          aria-hidden="true"
          className="absolute inset-[4%] rounded-full bg-[#d89a35]/[0.035] blur-[28px] transition duration-200 group-active:bg-[#d89a35]/[0.075]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-[1.5%] rounded-full border border-[#d89a35]/10"
        />

        <div
          aria-hidden="true"
          className="absolute inset-[5.5%] rounded-full border border-[#d89a35]/18 shadow-[0_0_42px_rgba(216,154,53,0.065),inset_0_0_28px_rgba(216,154,53,0.025)]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-[9%] rounded-full border border-white/[0.035]"
        />

        <div aria-hidden="true" className="absolute inset-0">
          {MALA_BEAD_ANGLES.map((angle, index) => {
            const isLit = index < illuminatedBeads;

            return (
              <span
                key={index}
                className={[
                  'absolute left-1/2 top-1/2 size-[8px] rounded-full border transition-all duration-200 sm:size-[10px]',
                  isLit
                    ? [
                        'border-[#f1cf82]/70',
                        'bg-[radial-gradient(circle_at_35%_30%,#f1c86b,#ca852e_68%,#8d561d)]',
                        'shadow-[0_0_8px_rgba(216,154,53,0.34)]',
                      ].join(' ')
                    : [
                        'border-[#9a6b2f]/28',
                        'bg-[#49351f]',
                        'shadow-[inset_0_1px_1px_rgba(255,255,255,0.035)]',
                      ].join(' '),
                ].join(' ')}
                style={{
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-122px)`,
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
            stroke="rgba(255,255,255,0.025)"
            strokeWidth="1.2"
          />

          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="rgba(216,154,53,0.78)"
            strokeWidth="1.5"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - progress}
            className="transition-[stroke-dashoffset] duration-200"
          />
        </svg>

        <div className="relative flex size-[61%] flex-col items-center justify-center rounded-full border border-[#d89a35]/12 bg-[radial-gradient(circle_at_48%_42%,#141d28_0%,#0d141d_55%,#090f16_100%)] shadow-[inset_0_0_42px_rgba(0,0,0,0.5),0_0_26px_rgba(216,154,53,0.025)]">
          <div
            aria-hidden="true"
            className="absolute inset-[8px] rounded-full border border-white/[0.025]"
          />

          {isPaused ? (
            <>
              <div className="flex size-12 items-center justify-center rounded-full border border-[#d89a35]/14 bg-[#d89a35]/[0.045]">
                <Pause size={25} strokeWidth={1.6} className="text-[#d5a54b]" />
              </div>

              <span className="mt-3 text-[8px] font-semibold uppercase tracking-[0.17em] text-[#9d7a42]">
                Paused
              </span>

              <span className="mt-1 text-[8px] text-[#59616c]">
                Your count is safe
              </span>
            </>
          ) : (
            <>
              <span className="text-[7px] font-semibold uppercase tracking-[0.18em] text-[#756346]">
                Chant Count
              </span>

              <span className="mt-1.5 font-serif text-[45px] font-medium leading-none tracking-[0.025em] text-[#efc875] sm:text-[57px]">
                {String(count).padStart(3, '0')}
              </span>

              <span className="mt-1.5 text-[10px] font-medium text-[#69717c] sm:text-[11px]">
                / {target}
              </span>

              <div className="mt-3 h-px w-12 bg-[linear-gradient(90deg,transparent,rgba(216,154,53,0.3),transparent)]" />

              <span className="mt-3 text-[7px] font-semibold uppercase tracking-[0.16em] text-[#a27c3d]">
                Tap to chant
              </span>

              <span className="font-devanagari mt-1 text-[22px] leading-none text-[#d89a35]">
                ॐ
              </span>
            </>
          )}
        </div>

        {!isPaused ? (
          <div
            aria-hidden="true"
            className="absolute inset-[18%] rounded-full border border-[#d89a35]/[0.035] opacity-0 transition-opacity duration-150 group-active:opacity-100"
          />
        ) : null}
      </button>

      <div className="mt-3 min-h-5 text-center">
        <p
          className={[
            'text-[8px] leading-4',
            isOffline ? 'text-[#9b7041]' : 'text-[#59616c]',
          ].join(' ')}
        >
          {isPaused
            ? 'Resume when you are ready.'
            : isOffline
              ? 'Offline mode — your chants are saved safely on this device.'
              : 'Each tap counts one repetition.'}
        </p>
      </div>
    </section>
  );
});
