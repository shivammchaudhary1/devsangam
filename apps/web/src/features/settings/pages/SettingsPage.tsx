import { AccountSessionSettings } from '../components/AccountSessionSettings';
import { AppearanceSettings } from '../components/AppearanceSettings';
import { NotificationSettings } from '../components/NotificationSettings';
import { PasswordSettings } from '../components/PasswordSettings';
import { PracticeDefaultsSettings } from '../components/PracticeDefaultsSettings';
import { SettingsBackground } from '../components/SettingsBackground';
import { SettingsHeader } from '../components/SettingsHeader';
import { SoundHapticsSettings } from '../components/SoundHapticsSettings';
import { useSettingsActions } from '../hooks/useSettingsActions';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthUser } from '@/features/auth/types/auth.types';
import { useTheme } from '@/features/theme/hooks/useTheme';

type SettingsContentProps = {
  user: AuthUser;
  setUser: (user: AuthUser) => void;
};

export function SettingsPage() {
  const auth = useAuth();

  if (!auth.user) {
    return null;
  }

  return (
    <SettingsContent
      key={auth.user.id}
      user={auth.user}
      setUser={auth.setUser}
    />
  );
}

function SettingsContent({ user, setUser }: SettingsContentProps) {
  const theme = useTheme();

  const settings = useSettingsActions({
    user,
    setUser,
  });

  return (
    <main
      className={
        'relative min-h-full overflow-hidden ' +
        'bg-[var(--ds-obsidian)] px-4 pb-28 pt-5 ' +
        'text-[var(--ds-cream)] md:px-6 md:pb-9 ' +
        'md:pt-6 lg:px-8'
      }
    >
      <SettingsBackground />

      <div className={'relative z-10 mx-auto w-full ' + 'max-w-[1080px]'}>
        <SettingsHeader />

        <section className={'mt-5 grid gap-4 lg:grid-cols-2'}>
          <AppearanceSettings
            themePreference={user.preferences.theme}
            resolvedTheme={theme.resolvedTheme}
            pending={settings.pendingSetting === 'theme'}
            onThemeChange={settings.handleThemeChange}
          />

          <PracticeDefaultsSettings
            defaultTarget={user.preferences.defaultTarget}
            timezone={user.preferences.timezone}
            targetOptions={settings.targetOptions}
            targetPending={settings.pendingSetting === 'target'}
            timezonePending={settings.pendingSetting === 'timezone'}
            onTargetChange={settings.handleTargetChange}
            onUseDeviceTimezone={settings.handleUseDeviceTimezone}
          />

          <SoundHapticsSettings
            soundEnabled={user.preferences.soundEnabled}
            hapticEnabled={user.preferences.hapticEnabled}
            soundPending={settings.pendingSetting === 'sound'}
            hapticPending={settings.pendingSetting === 'haptic'}
            onSoundToggle={settings.handleSoundToggle}
            onHapticToggle={settings.handleHapticToggle}
          />

          <NotificationSettings user={user} setUser={setUser} />

          <PasswordSettings
            currentPassword={settings.currentPassword}
            newPassword={settings.newPassword}
            confirmPassword={settings.confirmPassword}
            showPasswords={settings.showPasswords}
            pending={settings.pendingSetting === 'password'}
            onCurrentPasswordChange={settings.setCurrentPassword}
            onNewPasswordChange={settings.setNewPassword}
            onConfirmPasswordChange={settings.setConfirmPassword}
            onShowPasswordsChange={settings.setShowPasswords}
            onSubmit={settings.handlePasswordSubmit}
          />

          <AccountSessionSettings email={user.email} />
        </section>
      </div>
    </main>
  );
}
