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
    <section className="mx-auto mt-4 max-w-xl rounded-2xl border border-white/[0.08] bg-[#09121e] p-3 sm:p-4">
      <div className="mb-3">
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-amber-400/75">
          Audio
        </p>

        <p className="mt-1 text-[10px] text-slate-600">
          Control background Om and chant confirmation tone independently.
        </p>
      </div>

      <div className="space-y-3">
        <AudioControlRow
          label="Om Background"
          description="Continuous devotional audio"
          enabled={omEnabled}
          volume={omVolume}
          icon={omEnabled ? <Music2 size={16} /> : <VolumeX size={16} />}
          onToggle={onOmToggle}
          onVolumeChange={onOmVolumeChange}
        />

        <AudioControlRow
          label="Tap Tone"
          description="Short sound on each chant"
          enabled={toneEnabled}
          volume={toneVolume}
          icon={toneEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
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
    <div className="rounded-xl border border-white/[0.07] bg-[#07101a] p-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={enabled}
          className={[
            'flex size-10 shrink-0 items-center justify-center rounded-xl border transition',
            enabled
              ? 'border-amber-400/35 bg-amber-400/[0.10] text-amber-300'
              : 'border-white/[0.08] bg-white/[0.025] text-slate-600',
          ].join(' ')}
        >
          {icon}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200">{label}</p>

              <p className="mt-0.5 truncate text-[9px] text-slate-600">
                {description}
              </p>
            </div>

            <button
              type="button"
              onClick={onToggle}
              className={[
                'shrink-0 rounded-full border px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] transition',
                enabled
                  ? 'border-amber-400/30 bg-amber-400/[0.08] text-amber-300'
                  : 'border-white/[0.08] bg-white/[0.025] text-slate-600',
              ].join(' ')}
            >
              {enabled ? 'On' : 'Off'}
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <VolumeX size={12} className="shrink-0 text-slate-600" />

            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={volumePercentage}
              onChange={(event) => onVolumeChange(Number(event.target.value))}
              disabled={!enabled}
              aria-label={`${label} volume`}
              className="h-1.5 min-w-0 flex-1 cursor-pointer accent-amber-400 disabled:cursor-not-allowed disabled:opacity-35"
            />

            <Volume2 size={13} className="shrink-0 text-amber-400/60" />

            <span className="w-8 shrink-0 text-right font-mono text-[9px] text-slate-500">
              {volumePercentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
