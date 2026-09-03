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
    <section className={'flex flex-col items-center'}>
      <div className={'mb-3 flex items-center justify-center gap-2'}>
        <div
          className={
            'h-px w-10 bg-gradient-to-r ' +
            'from-transparent to-[var(--ds-border-gold)]'
          }
        />

        <Sparkles
          size={10}
          strokeWidth={1.6}
          className={'text-[var(--ds-bronze)]'}
        />

        <p
          className={
            'text-[7px] font-semibold uppercase ' +
            'tracking-[0.16em] text-[var(--ds-bronze)]'
          }
        >
          Sacred Count
        </p>

        <Sparkles
          size={10}
          strokeWidth={1.6}
          className={'text-[var(--ds-bronze)]'}
        />

        <div
          className={
            'h-px w-10 bg-gradient-to-r ' +
            'from-[var(--ds-border-gold)] to-transparent'
          }
        />
      </div>

      <button
        type="button"
        onClick={onChant}
        disabled={isPaused}
        aria-label={isPaused ? 'Practice is paused' : 'Tap to count one chant'}
        className={
          'group relative flex size-[268px] touch-manipulation ' +
          'items-center justify-center rounded-full outline-none ' +
          'transition-transform duration-150 active:scale-[0.985] ' +
          'disabled:cursor-default sm:size-[326px]'
        }
      >
        <div
          aria-hidden="true"
          className={
            'absolute inset-[4%] rounded-full ' +
            'bg-[var(--ds-amber-05)] blur-[28px] ' +
            'transition duration-200 ' +
            'group-active:bg-[var(--ds-amber-10)]'
          }
        />

        <div
          aria-hidden="true"
          className={
            'absolute inset-[1.5%] rounded-full border ' +
            'border-[var(--ds-border-gold)] opacity-45'
          }
        />

        <div
          aria-hidden="true"
          className={
            'absolute inset-[5.5%] rounded-full border ' +
            'border-[var(--ds-border-gold)] ' +
            'shadow-[var(--ds-shadow-gold-inset)] opacity-70'
          }
        />

        <div
          aria-hidden="true"
          className={
            'absolute inset-[9%] rounded-full border ' +
            'border-[var(--ds-border-soft)]'
          }
        />

        <div aria-hidden="true" className="absolute inset-0">
          {MALA_BEAD_ANGLES.map((angle, index) => {
            const isLit = index < illuminatedBeads;

            return (
              <span
                key={index}
                className={[
                  'absolute left-1/2 top-1/2 size-[8px]',
                  'rounded-full border transition-all duration-200',
                  'sm:size-[10px]',

                  isLit
                    ? [
                        'border-[var(--ds-border-gold)]',
                        'bg-[var(--ds-gradient-gold)]',
                        'shadow-[var(--ds-shadow-gold-strong)]',
                      ].join(' ')
                    : [
                        'border-[var(--ds-border-gold)]',
                        'bg-[var(--ds-bronze)]',
                        'opacity-80',
                      ].join(' '),
                ].join(' ')}
                style={{
                  transform:
                    `translate(-50%, -50%) rotate(${angle}deg) ` +
                    'translateY(-122px)',
                }}
              />
            );
          })}
        </div>

        <svg
          aria-hidden="true"
          className={'absolute inset-[12%] -rotate-90'}
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="var(--ds-border-soft)"
            strokeWidth="1.2"
          />

          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="var(--ds-amber)"
            strokeWidth="1.5"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - progress}
            className={'transition-[stroke-dashoffset] duration-200'}
          />
        </svg>

        <div
          className={
            'relative flex size-[61%] flex-col items-center ' +
            'justify-center rounded-full border ' +
            'border-[var(--ds-border-gold)] ' +
            'bg-[var(--ds-gradient-panel)] ' +
            'shadow-[var(--ds-shadow-card-deep)]'
          }
        >
          <div
            aria-hidden="true"
            className={
              'absolute inset-[8px] rounded-full border ' +
              'border-[var(--ds-border-soft)]'
            }
          />

          <div
            aria-hidden="true"
            className={
              'pointer-events-none absolute inset-[14%] ' +
              'rounded-full bg-[var(--ds-amber-03)] blur-xl'
            }
          />

          {isPaused ? (
            <>
              <div
                className={
                  'relative flex size-12 items-center justify-center ' +
                  'rounded-full border border-[var(--ds-border-gold)] ' +
                  'bg-[var(--ds-amber-05)]'
                }
              >
                <Pause
                  size={25}
                  strokeWidth={1.6}
                  className={'text-[var(--ds-gold)]'}
                />
              </div>

              <span
                className={
                  'relative mt-3 text-[8px] font-semibold uppercase ' +
                  'tracking-[0.17em] text-[var(--ds-bronze)]'
                }
              >
                Paused
              </span>

              <span
                className={'relative mt-1 text-[8px] text-[var(--ds-muted)]'}
              >
                Your count is safe
              </span>
            </>
          ) : (
            <>
              <span
                className={
                  'relative text-[7px] font-semibold uppercase ' +
                  'tracking-[0.18em] text-[var(--ds-bronze)]'
                }
              >
                Chant Count
              </span>

              <span
                className={
                  'relative mt-1.5 font-serif text-[45px] ' +
                  'font-medium leading-none tracking-[0.025em] ' +
                  'text-[var(--ds-soft-gold)] sm:text-[57px]'
                }
              >
                {String(count).padStart(3, '0')}
              </span>

              <span
                className={
                  'relative mt-1.5 text-[10px] font-medium ' +
                  'text-[var(--ds-muted)] sm:text-[11px]'
                }
              >
                / {target}
              </span>

              <div
                className={
                  'relative mt-3 h-px w-12 bg-gradient-to-r ' +
                  'from-transparent via-[var(--ds-border-gold)] ' +
                  'to-transparent'
                }
              />

              <span
                className={
                  'relative mt-3 text-[7px] font-semibold uppercase ' +
                  'tracking-[0.16em] text-[var(--ds-bronze)]'
                }
              >
                Tap to chant
              </span>

              <span
                className={
                  'font-devanagari relative mt-1 text-[22px] ' +
                  'leading-none text-[var(--ds-gold)]'
                }
              >
                ॐ
              </span>
            </>
          )}
        </div>

        {!isPaused ? (
          <div
            aria-hidden="true"
            className={
              'absolute inset-[18%] rounded-full border ' +
              'border-[var(--ds-border-gold)] opacity-0 ' +
              'transition-opacity duration-150 ' +
              'group-active:opacity-40'
            }
          />
        ) : null}
      </button>

      <div className={'mt-3 min-h-5 text-center'}>
        <p
          className={[
            'text-[8px] leading-4',

            isOffline ? 'text-[var(--ds-bronze)]' : 'text-[var(--ds-muted)]',
          ].join(' ')}
        >
          {isPaused
            ? 'Resume when you are ready.'
            : isOffline
              ? 'Offline mode — your chants are saved safely ' +
                'on this device.'
              : 'Each tap counts one repetition.'}
        </p>
      </div>
    </section>
  );
});
