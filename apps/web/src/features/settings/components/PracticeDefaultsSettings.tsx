import { formatSettingNumber } from '../utils/settings-formatters';
import { SettingsCard, SettingsRow } from './SettingsCard';
import { Globe2, Loader2, Target } from 'lucide-react';

type PracticeDefaultsSettingsProps = {
  defaultTarget: number;
  timezone: string;
  targetOptions: number[];
  targetPending: boolean;
  timezonePending: boolean;
  onTargetChange: (target: number) => void | Promise<void>;
  onUseDeviceTimezone: () => void | Promise<void>;
};

export function PracticeDefaultsSettings({
  defaultTarget,
  timezone,
  targetOptions,
  targetPending,
  timezonePending,
  onTargetChange,
  onUseDeviceTimezone,
}: PracticeDefaultsSettingsProps) {
  return (
    <SettingsCard
      icon={<Target size={16} strokeWidth={1.7} />}
      title="Practice Defaults"
      description="Choose the defaults used when beginning a new Sadhana."
    >
      <SettingsRow
        label="Default Target"
        description="Preferred chant count for new practice sessions."
      >
        <div className="flex items-center gap-2">
          {targetPending ? (
            <Loader2
              size={13}
              className={'animate-spin ' + 'text-[var(--ds-gold)]'}
            />
          ) : null}

          <select
            value={defaultTarget}
            disabled={targetPending}
            onChange={(event) =>
              void onTargetChange(Number(event.target.value))
            }
            className={
              'h-9 min-w-[100px] rounded-[7px] border ' +
              'border-[var(--ds-border-soft)] ' +
              'bg-[var(--ds-night)] px-3 text-[11px] ' +
              'text-[var(--ds-text)] outline-none transition ' +
              'focus:border-[var(--ds-border-gold)] ' +
              'disabled:cursor-not-allowed disabled:opacity-60'
            }
          >
            {targetOptions.map((target) => (
              <option key={target} value={target}>
                {formatSettingNumber(target)}
              </option>
            ))}
          </select>
        </div>
      </SettingsRow>

      <SettingsRow
        label="Timezone"
        description="Used to calculate streaks and daily practice activity."
        last
      >
        <button
          type="button"
          onClick={() => void onUseDeviceTimezone()}
          disabled={timezonePending}
          className={
            'flex max-w-[220px] items-center gap-2 ' +
            'rounded-[7px] border ' +
            'border-[var(--ds-border-soft)] ' +
            'bg-[var(--ds-white-02)] px-3 py-2 ' +
            'text-[10px] text-[var(--ds-muted)] ' +
            'transition hover:border-[var(--ds-border-gold)] ' +
            'hover:text-[var(--ds-soft-gold)] ' +
            'disabled:cursor-not-allowed disabled:opacity-60'
          }
        >
          {timezonePending ? (
            <Loader2 size={12} className={'shrink-0 animate-spin'} />
          ) : (
            <Globe2 size={12} strokeWidth={1.6} className="shrink-0" />
          )}

          <span className="truncate">{timezone}</span>
        </button>
      </SettingsRow>
    </SettingsCard>
  );
}
