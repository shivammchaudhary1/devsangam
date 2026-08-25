import { Loader2, Pause, Play, RotateCcw, Waves } from 'lucide-react';
import { memo, type ReactNode } from 'react';

type PracticeSessionControlsProps = {
  hapticEnabled: boolean;
  isPaused: boolean;
  isBusy: boolean;
  isUpdating: boolean;

  onHapticToggle: () => void;
  onPauseToggle: () => void;
  onReset: () => void;
};

export const PracticeSessionControls = memo(function PracticeSessionControls({
  hapticEnabled,
  isPaused,
  isBusy,
  isUpdating,
  onHapticToggle,
  onPauseToggle,
  onReset,
}: PracticeSessionControlsProps) {
  return (
    <section className="rounded-[11px] border border-white/[0.06] bg-[linear-gradient(145deg,rgba(255,255,255,0.018),transparent_42%),#090f17] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.015)] sm:p-3.5">
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <Waves size={12} strokeWidth={1.7} className="text-[#b98234]" />

          <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-[#a87838]">
            Session Controls
          </p>
        </div>

        <p className="mt-1.5 text-[8px] leading-4 text-[#5e6671]">
          Pause, reset, or adjust tactile feedback.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <ControlButton
          label="Haptic"
          value={hapticEnabled ? 'On' : 'Off'}
          onClick={onHapticToggle}
          active={hapticEnabled}
          icon={<Waves size={16} strokeWidth={1.7} />}
        />

        <button
          type="button"
          onClick={onPauseToggle}
          disabled={isBusy}
          aria-label={isPaused ? 'Resume practice' : 'Pause practice'}
          className="ds-gold-button flex min-h-[64px] flex-col items-center justify-center rounded-[9px] px-2 text-[#171007] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isUpdating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isPaused ? (
            <Play size={16} fill="currentColor" strokeWidth={1.7} />
          ) : (
            <Pause size={16} fill="currentColor" strokeWidth={1.7} />
          )}

          <span className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.1em]">
            {isPaused ? 'Resume' : 'Pause'}
          </span>

          <span className="mt-0.5 text-[7px] font-medium opacity-65">
            {isPaused ? 'Continue' : 'Hold'}
          </span>
        </button>

        <ControlButton
          label="Reset"
          value="Session"
          onClick={onReset}
          disabled={isBusy}
          icon={<RotateCcw size={16} strokeWidth={1.7} />}
        />
      </div>
    </section>
  );
});

type ControlButtonProps = {
  label: string;

  value: string;

  icon: ReactNode;

  onClick: () => void;

  disabled?: boolean;

  active?: boolean;
};

const ControlButton = memo(function ControlButton({
  label,
  value,
  icon,
  onClick,
  disabled = false,
  active = false,
}: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={label === 'Haptic' ? active : undefined}
      className={[
        'flex min-h-[64px] flex-col items-center justify-center rounded-[9px] border px-2 transition-all duration-150',
        active
          ? [
              'border-[#d89a35]/22',
              'bg-[#d89a35]/[0.055]',
              'text-[#d5a34b]',
              'shadow-[0_0_14px_rgba(216,154,53,0.035)]',
            ].join(' ')
          : [
              'border-white/[0.055]',
              'bg-[#070c12]',
              'text-[#7b8490]',
              'hover:border-[#d89a35]/15',
              'hover:bg-[#d89a35]/[0.025]',
              'hover:text-[#c89a50]',
            ].join(' '),
        disabled ? 'cursor-not-allowed opacity-40' : '',
      ].join(' ')}
    >
      {icon}

      <span className="mt-1.5 text-[8px] font-semibold uppercase tracking-[0.09em]">
        {label}
      </span>

      <span
        className={[
          'mt-0.5 text-[7px]',
          active ? 'text-[#98723b]' : 'text-[#535c67]',
        ].join(' ')}
      >
        {value}
      </span>
    </button>
  );
});
