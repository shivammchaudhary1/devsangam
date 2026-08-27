import { SettingsCard, SettingsRow } from './SettingsCard';
import { SettingToggle } from './SettingToggle';
import { Vibrate, Volume2 } from 'lucide-react';

type SoundHapticsSettingsProps = {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  soundPending: boolean;
  hapticPending: boolean;
  onSoundToggle: () => void | Promise<void>;
  onHapticToggle: () => void | Promise<void>;
};

export function SoundHapticsSettings({
  soundEnabled,
  hapticEnabled,
  soundPending,
  hapticPending,
  onSoundToggle,
  onHapticToggle,
}: SoundHapticsSettingsProps) {
  return (
    <SettingsCard
      icon={<Volume2 size={16} strokeWidth={1.7} />}
      title="Sound & Haptics"
      description="Customize feedback used during your practice."
    >
      <SettingsRow
        label="Practice Sound"
        description="Use Om ambience and chant feedback during Sadhana."
      >
        <SettingToggle
          enabled={soundEnabled}
          pending={soundPending}
          onToggle={onSoundToggle}
        />
      </SettingsRow>

      <SettingsRow
        label="Haptic Feedback"
        description="Use vibration feedback when supported by your device."
        last
      >
        <div className="flex items-center gap-2">
          <Vibrate
            size={14}
            strokeWidth={1.6}
            className="text-[var(--ds-muted-soft)]"
          />

          <SettingToggle
            enabled={hapticEnabled}
            pending={hapticPending}
            onToggle={onHapticToggle}
          />
        </div>
      </SettingsRow>
    </SettingsCard>
  );
}
