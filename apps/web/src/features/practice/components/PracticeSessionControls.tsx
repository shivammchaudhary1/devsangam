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
    <section className="mx-auto mt-3 grid max-w-xl grid-cols-3 gap-2">
      <ControlButton
        label="Haptic"
        value={hapticEnabled ? 'On' : 'Off'}
        onClick={onHapticToggle}
        icon={<Waves size={16} />}
      />

      <button
        type="button"
        onClick={onPauseToggle}
        disabled={isBusy}
        className="flex min-h-[58px] flex-col items-center justify-center rounded-xl border border-amber-300/55 bg-gradient-to-b from-[#efbd54] to-[#c88624] px-2 text-[#261804] shadow-[0_0_20px_rgba(245,158,11,0.1)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isUpdating ? (
          <Loader2 size={16} className="animate-spin" />
        ) : isPaused ? (
          <Play size={16} fill="currentColor" />
        ) : (
          <Pause size={16} fill="currentColor" />
        )}

        <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.08em]">
          {isPaused ? 'Resume' : 'Pause'}
        </span>
      </button>

      <ControlButton
        label="Reset"
        value="Session"
        onClick={onReset}
        disabled={isBusy}
        icon={<RotateCcw size={16} />}
      />
    </section>
  );
});

type ControlButtonProps = {
  label: string;
  value: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
};

const ControlButton = memo(function ControlButton({
  label,
  value,
  icon,
  onClick,
  disabled = false,
}: ControlButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex min-h-[58px] flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#09121e] px-2 text-slate-400 transition hover:border-amber-400/20 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {icon}

      <span className="mt-1 text-[9px] uppercase tracking-[0.08em]">
        {label}
      </span>

      <span className="text-[8px] text-slate-600">{value}</span>
    </button>
  );
});
