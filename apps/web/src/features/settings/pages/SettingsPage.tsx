import {
  changeCurrentUserPassword,
  updateCurrentUser,
} from '@/features/auth/api/auth.api';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthUser } from '@/features/auth/types/auth.types';
import { writePracticePreferences } from '@/features/practice/storage/practice-preferences.storage';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Loader2,
  LogOut,
  Settings,
  ShieldCheck,
  Target,
  Vibrate,
  Volume2,
  X,
} from 'lucide-react';
import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';

const PRACTICE_TARGET_OPTIONS = [108, 216, 1008] as const;

type PendingSetting =
  | 'target'
  | 'timezone'
  | 'sound'
  | 'haptic'
  | 'password'
  | null;

type FeedbackState =
  | {
      type: 'success';
      message: string;
    }
  | {
      type: 'error';
      message: string;
    }
  | null;

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
  const [pendingSetting, setPendingSetting] = useState<PendingSetting>(null);

  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const [currentPassword, setCurrentPassword] = useState('');

  const [newPassword, setNewPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPasswords, setShowPasswords] = useState(false);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setFeedback(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [feedback]);

  const targetOptions = useMemo(() => {
    const values = new Set<number>(PRACTICE_TARGET_OPTIONS);

    values.add(user.preferences.defaultTarget);

    return [...values].sort((left, right) => left - right);
  }, [user.preferences.defaultTarget]);

  async function handleTargetChange(target: number) {
    if (target === user.preferences.defaultTarget) {
      return;
    }

    setPendingSetting('target');

    try {
      const updatedUser = await updateCurrentUser({
        preferences: {
          defaultTarget: target,
        },
      });

      setUser(updatedUser);

      setFeedback({
        type: 'success',
        message: 'Default practice target updated.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Default target could not be updated.'),
      });
    } finally {
      setPendingSetting(null);
    }
  }

  async function handleUseDeviceTimezone() {
    const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (!deviceTimezone) {
      setFeedback({
        type: 'error',
        message: 'Your browser did not provide a timezone.',
      });

      return;
    }

    if (deviceTimezone === user.preferences.timezone) {
      setFeedback({
        type: 'success',
        message: 'Your account already uses this device timezone.',
      });

      return;
    }

    setPendingSetting('timezone');

    try {
      const updatedUser = await updateCurrentUser({
        preferences: {
          timezone: deviceTimezone,
        },
      });

      setUser(updatedUser);

      setFeedback({
        type: 'success',
        message: 'Timezone updated to this device.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Timezone could not be updated.'),
      });
    } finally {
      setPendingSetting(null);
    }
  }

  async function handleSoundToggle() {
    const nextValue = !user.preferences.soundEnabled;

    setPendingSetting('sound');

    try {
      const updatedUser = await updateCurrentUser({
        preferences: {
          soundEnabled: nextValue,
        },
      });

      setUser(updatedUser);

      writePracticePreferences(user.id, {
        omEnabled: nextValue,

        toneEnabled: nextValue,
      });

      setFeedback({
        type: 'success',
        message: nextValue
          ? 'Practice sounds enabled.'
          : 'Practice sounds disabled.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(
          error,
          'Sound preference could not be updated.'
        ),
      });
    } finally {
      setPendingSetting(null);
    }
  }

  async function handleHapticToggle() {
    const nextValue = !user.preferences.hapticEnabled;

    setPendingSetting('haptic');

    try {
      const updatedUser = await updateCurrentUser({
        preferences: {
          hapticEnabled: nextValue,
        },
      });

      setUser(updatedUser);

      writePracticePreferences(user.id, {
        hapticEnabled: nextValue,
      });

      setFeedback({
        type: 'success',
        message: nextValue
          ? 'Haptic feedback enabled.'
          : 'Haptic feedback disabled.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(
          error,
          'Haptic preference could not be updated.'
        ),
      });
    } finally {
      setPendingSetting(null);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentPassword) {
      setFeedback({
        type: 'error',
        message: 'Enter your current password.',
      });

      return;
    }

    if (newPassword.length < 10) {
      setFeedback({
        type: 'error',
        message: 'New password must contain at least 10 characters.',
      });

      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({
        type: 'error',
        message: 'New password and confirmation do not match.',
      });

      return;
    }

    if (currentPassword === newPassword) {
      setFeedback({
        type: 'error',
        message: 'New password must be different from your current password.',
      });

      return;
    }

    setPendingSetting('password');

    try {
      await changeCurrentUserPassword({
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setFeedback({
        type: 'success',
        message: 'Password updated. Other signed-in sessions were closed.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Password could not be updated.'),
      });
    } finally {
      setPendingSetting(null);
    }
  }

  return (
    <main className="relative min-h-full overflow-hidden bg-[var(--ds-obsidian)] px-4 pb-28 pt-5 text-[var(--ds-cream)] md:px-6 md:pb-9 md:pt-6 lg:px-8">
      <SettingsBackground />

      <div className="relative z-10 mx-auto w-full max-w-[1080px]">
        <header className="border-b border-white/[0.055] pb-5">
          <div className="flex items-center gap-2">
            <Settings
              size={14}
              strokeWidth={1.7}
              className="text-[var(--ds-amber)]"
            />

            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-gold)]">
              Preferences
            </p>
          </div>

          <h1 className="mt-2 font-serif text-[25px] font-medium tracking-[0.01em] text-[var(--ds-cream)] sm:text-[28px]">
            Settings
          </h1>

          <p className="mt-2 text-[12px] leading-5 text-[var(--ds-muted)]">
            Configure how DevSangam supports your daily Sadhana.
          </p>
        </header>

        {feedback ? <FeedbackBanner feedback={feedback} /> : null}

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
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
                {pendingSetting === 'target' ? (
                  <Loader2
                    size={13}
                    className="animate-spin text-[var(--ds-gold)]"
                  />
                ) : null}

                <select
                  value={user.preferences.defaultTarget}
                  disabled={pendingSetting === 'target'}
                  onChange={(event) =>
                    void handleTargetChange(Number(event.target.value))
                  }
                  className="h-9 min-w-[100px] rounded-[7px] border border-white/[0.08] bg-[var(--ds-night)] px-3 text-[11px] text-[var(--ds-text)] outline-none transition focus:border-[var(--ds-border-gold)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {targetOptions.map((target) => (
                    <option key={target} value={target}>
                      {formatNumber(target)}
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
                onClick={() => void handleUseDeviceTimezone()}
                disabled={pendingSetting === 'timezone'}
                className="flex max-w-[220px] items-center gap-2 rounded-[7px] border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[10px] text-[var(--ds-muted)] transition hover:border-[var(--ds-border-gold)] hover:text-[var(--ds-soft-gold)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendingSetting === 'timezone' ? (
                  <Loader2 size={12} className="shrink-0 animate-spin" />
                ) : (
                  <Globe2 size={12} strokeWidth={1.6} className="shrink-0" />
                )}

                <span className="truncate">{user.preferences.timezone}</span>
              </button>
            </SettingsRow>
          </SettingsCard>

          <SettingsCard
            icon={<Volume2 size={16} strokeWidth={1.7} />}
            title="Sound & Haptics"
            description="Customize feedback used during your practice."
          >
            <SettingsRow
              label="Practice Sound"
              description="Use Om ambience and chant feedback during Sadhana."
            >
              <Toggle
                enabled={user.preferences.soundEnabled}
                pending={pendingSetting === 'sound'}
                onToggle={handleSoundToggle}
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

                <Toggle
                  enabled={user.preferences.hapticEnabled}
                  pending={pendingSetting === 'haptic'}
                  onToggle={handleHapticToggle}
                />
              </div>
            </SettingsRow>
          </SettingsCard>

          <SettingsCard
            icon={<KeyRound size={16} strokeWidth={1.7} />}
            title="Change Password"
            description="Confirm your current password before choosing a new one."
          >
            <form onSubmit={handlePasswordSubmit} className="space-y-3 p-4">
              <PasswordField
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
                visible={showPasswords}
                autoComplete="current-password"
              />

              <PasswordField
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
                visible={showPasswords}
                autoComplete="new-password"
              />

              <PasswordField
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                visible={showPasswords}
                autoComplete="new-password"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPasswords((value) => !value)}
                  className="flex items-center gap-2 text-[10px] text-[var(--ds-muted)] transition hover:text-[var(--ds-text)]"
                >
                  {showPasswords ? (
                    <EyeOff size={13} strokeWidth={1.7} />
                  ) : (
                    <Eye size={13} strokeWidth={1.7} />
                  )}

                  {showPasswords ? 'Hide passwords' : 'Show passwords'}
                </button>

                <button
                  type="submit"
                  disabled={pendingSetting === 'password'}
                  className="flex h-9 items-center justify-center gap-2 rounded-[7px] border border-[var(--ds-border-gold)] bg-[var(--ds-amber-08)] px-4 text-[11px] font-medium text-[var(--ds-soft-gold)] transition hover:bg-[var(--ds-amber-14)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pendingSetting === 'password' ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={13} strokeWidth={1.7} />
                  )}
                  Update Password
                </button>
              </div>

              <p className="text-[9px] leading-4 text-[var(--ds-muted-soft)]">
                Use at least 10 characters. Changing your password closes your
                other signed-in sessions.
              </p>
            </form>
          </SettingsCard>

          <SettingsCard
            icon={<LogOut size={16} strokeWidth={1.7} />}
            title="Account Session"
            description={`Signed in as ${user.email}.`}
          >
            <div className="p-2">
              <LogoutButton />
            </div>
          </SettingsCard>
        </section>
      </div>
    </main>
  );
}

type PasswordFieldProps = {
  label: string;
  value: string;
  visible: boolean;
  autoComplete: 'current-password' | 'new-password';
  onChange: (value: string) => void;
};

function PasswordField({
  label,
  value,
  visible,
  autoComplete,
  onChange,
}: PasswordFieldProps) {
  return (
    <label className="block">
      <span className="text-[10px] font-medium text-[var(--ds-text)]">
        {label}
      </span>

      <input
        type={visible ? 'text' : 'password'}
        value={value}
        autoComplete={autoComplete}
        maxLength={128}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-10 w-full rounded-[7px] border border-white/[0.08] bg-[var(--ds-night)] px-3 text-[12px] text-[var(--ds-cream)] outline-none transition focus:border-[var(--ds-border-gold)] focus:shadow-[0_0_0_2px_var(--ds-amber-05)]"
      />
    </label>
  );
}

type FeedbackBannerProps = {
  feedback: Exclude<FeedbackState, null>;
};

function FeedbackBanner({ feedback }: FeedbackBannerProps) {
  const success = feedback.type === 'success';

  return (
    <div
      className={[
        'mt-4 flex items-center gap-2 rounded-[9px] border px-4 py-3 text-[11px]',
        success
          ? 'border-emerald-400/15 bg-emerald-400/[0.035] text-emerald-200/80'
          : 'border-red-400/15 bg-red-400/[0.035] text-red-200/80',
      ].join(' ')}
    >
      {success ? (
        <CheckCircle2 size={14} strokeWidth={1.7} />
      ) : (
        <X size={14} strokeWidth={1.7} />
      )}

      {feedback.message}
    </div>
  );
}

type SettingsCardProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

function SettingsCard({
  icon,
  title,
  description,
  children,
}: SettingsCardProps) {
  return (
    <article className="overflow-hidden rounded-[11px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] shadow-[var(--ds-shadow-card)]">
      <div className="flex items-start gap-3 border-b border-white/[0.055] px-4 py-4">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[8px] border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] text-[var(--ds-gold)]">
          {icon}
        </div>

        <div>
          <h2 className="font-serif text-[14px] text-[var(--ds-cream)]">
            {title}
          </h2>

          <p className="mt-1 text-[10px] leading-4 text-[var(--ds-muted-soft)]">
            {description}
          </p>
        </div>
      </div>

      {children}
    </article>
  );
}

type SettingsRowProps = {
  label: string;
  description: string;
  children: ReactNode;
  last?: boolean;
};

function SettingsRow({
  label,
  description,
  children,
  last = false,
}: SettingsRowProps) {
  return (
    <div
      className={[
        'flex min-h-[68px] items-center justify-between gap-4 px-4 py-3',
        last ? '' : 'border-b border-white/[0.045]',
      ].join(' ')}
    >
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-[var(--ds-text)]">{label}</p>

        <p className="mt-1 max-w-[350px] text-[10px] leading-4 text-[var(--ds-muted-soft)]">
          {description}
        </p>
      </div>

      <div className="shrink-0">{children}</div>
    </div>
  );
}

type ToggleProps = {
  enabled: boolean;
  pending: boolean;
  onToggle: () => void | Promise<void>;
};

function Toggle({ enabled, pending, onToggle }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={pending}
      onClick={() => void onToggle()}
      className={[
        'relative flex h-[24px] w-[42px] items-center rounded-full border transition-all duration-200',
        enabled
          ? 'border-[#e1a541]/45 bg-[linear-gradient(90deg,#b96f22,#dda13e)]'
          : 'border-white/[0.09] bg-white/[0.055]',
        pending ? 'cursor-not-allowed opacity-60' : '',
      ].join(' ')}
    >
      {pending ? (
        <Loader2
          size={10}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin"
        />
      ) : (
        <span
          className={[
            'block size-[17px] rounded-full shadow transition-transform duration-200',
            enabled
              ? 'translate-x-[21px] bg-[#fff1ce]'
              : 'translate-x-[3px] bg-[#858b94]',
          ].join(' ')}
        />
      )}
    </button>
  );
}

function SettingsBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute right-[8%] top-[-180px] size-[380px] rounded-full bg-[var(--ds-amber-03)] blur-[125px]" />

      <div className="absolute bottom-[-220px] left-[6%] size-[420px] rounded-full bg-[var(--ds-amber-03)] blur-[130px]" />
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
