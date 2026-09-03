import { Music2, Volume2, VolumeX } from 'lucide-react';
import { memo, type ReactNode } from 'react';

type PracticeAudioControlsProps = {
  omEnabled: boolean;

  omVolume: number;

  toneEnabled: boolean;

  toneVolume: number;

  onOmToggle: () => void;

  onToneToggle: () => void;

  onOmVolumeChange: (value: number) => void;

  onToneVolumeChange: (value: number) => void;
};

export const PracticeAudioControls = memo(function PracticeAudioControls({
  omEnabled,
  omVolume,
  toneEnabled,
  toneVolume,
  onOmToggle,
  onToneToggle,
  onOmVolumeChange,
  onToneVolumeChange,
}: PracticeAudioControlsProps) {
  return (
    <section className="rounded-[11px] border border-[var(--ds-border-soft)] bg-[linear-gradient(145deg,rgba(255,255,255,0.018),transparent_42%),#090f17] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.015)] sm:p-3.5">
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <Music2 size={12} strokeWidth={1.7} className="text-[var(--ds-bronze)]" />

          <p className="text-[8px] font-semibold uppercase tracking-[0.15em] text-[var(--ds-bronze)]">
            Audio
          </p>
        </div>

        <p className="mt-1.5 text-[8px] leading-4 text-[var(--ds-muted)]">
          Shape the sound of your practice.
        </p>
      </div>

      <div className="space-y-2.5">
        <AudioControlRow
          label="Om Background"
          description="Continuous devotional audio"
          enabled={omEnabled}
          volume={omVolume}
          icon={
            omEnabled ? (
              <Music2 size={15} strokeWidth={1.7} />
            ) : (
              <VolumeX size={15} strokeWidth={1.7} />
            )
          }
          onToggle={onOmToggle}
          onVolumeChange={onOmVolumeChange}
        />

        <AudioControlRow
          label="Tap Tone"
          description="Sound on each chant"
          enabled={toneEnabled}
          volume={toneVolume}
          icon={
            toneEnabled ? (
              <Volume2 size={15} strokeWidth={1.7} />
            ) : (
              <VolumeX size={15} strokeWidth={1.7} />
            )
          }
          onToggle={onToneToggle}
          onVolumeChange={onToneVolumeChange}
        />
      </div>
    </section>
  );
});

type AudioControlRowProps = {
  label: string;

  description: string;

  enabled: boolean;

  volume: number;

  icon: ReactNode;

  onToggle: () => void;

  onVolumeChange: (value: number) => void;
};

const AudioControlRow = memo(function AudioControlRow({
  label,
  description,
  enabled,
  volume,
  icon,
  onToggle,
  onVolumeChange,
}: AudioControlRowProps) {
  const volumePercentage = Math.round(volume * 100);

  return (
    <div className="rounded-[9px] border border-[var(--ds-border-soft)] bg-[var(--ds-sidebar)] p-2.5">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={enabled}
          aria-label={`${enabled ? 'Disable' : 'Enable'} ${label}`}
          className={[
            'flex size-9 shrink-0 items-center justify-center rounded-[8px] border transition-all duration-150',
            enabled
              ? [
                  'border-[#d89a35]/25',
                  'bg-[#d89a35]/[0.065]',
                  'text-[var(--ds-gold)]',
                  'shadow-[0_0_14px_rgba(216,154,53,0.04)]',
                ].join(' ')
              : [
                  'border-[var(--ds-border-soft)]',
                  'bg-[var(--ds-white-03)]',
                  'text-[var(--ds-muted)]',
                ].join(' '),
          ].join(' ')}
        >
          {icon}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p
                className={[
                  'truncate text-[10px] font-medium',
                  enabled ? 'text-[var(--ds-soft-gold)]' : 'text-[var(--ds-muted)]',
                ].join(' ')}
              >
                {label}
              </p>

              <p className="mt-0.5 truncate text-[7px] text-[var(--ds-muted)]">
                {description}
              </p>
            </div>

            <button
              type="button"
              onClick={onToggle}
              aria-pressed={enabled}
              className={[
                'relative h-5 w-9 shrink-0 rounded-full border transition-all duration-200',
                enabled
                  ? ['border-[#d89a35]/30', 'bg-[#d89a35]/[0.15]'].join(' ')
                  : ['border-[var(--ds-border-soft)]', 'bg-[var(--ds-white-03)]'].join(' '),
              ].join(' ')}
            >
              <span
                aria-hidden="true"
                className={[
                  'absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full transition-all duration-200',
                  enabled
                    ? 'left-[17px] bg-[#dca445] shadow-[0_0_8px_rgba(216,154,53,0.18)]'
                    : 'left-[3px] bg-[#606975]',
                ].join(' ')}
              />
            </button>
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <VolumeX
              size={10}
              strokeWidth={1.6}
              className="shrink-0 text-[var(--ds-muted)]"
            />

            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={volumePercentage}
              onChange={(event) => onVolumeChange(Number(event.target.value))}
              disabled={!enabled}
              aria-label={`${label} volume`}
              className="h-1 min-w-0 flex-1 cursor-pointer accent-[#d89a35] disabled:cursor-not-allowed disabled:opacity-30"
            />

            <Volume2
              size={11}
              strokeWidth={1.6}
              className="shrink-0 text-[var(--ds-bronze)]"
            />

            <span className="w-7 shrink-0 text-right font-mono text-[7px] tabular-nums text-[var(--ds-muted)]">
              {volumePercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
