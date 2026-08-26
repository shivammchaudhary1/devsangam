import { updateCurrentUser } from '@/features/auth/api/auth.api';
import { LogoutButton } from '@/features/auth/components/LogoutButton';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthUser } from '@/features/auth/types/auth.types';
import { writePracticePreferences } from '@/features/practice/storage/practice-preferences.storage';
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Cloud,
  Flame,
  Globe2,
  Loader2,
  LockKeyhole,
  Palette,
  Pencil,
  Save,
  ShieldCheck,
  Sparkles,
  Target,
  User,
  Vibrate,
  Volume2,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

const PRACTICE_TARGET_OPTIONS = [108, 216, 1008] as const;

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

type PendingSetting =
  | 'profile'
  | 'target'
  | 'sound'
  | 'haptic'
  | 'timezone'
  | null;

type ProfileContentProps = {
  user: AuthUser;
  setUser: (user: AuthUser) => void;
};

export function ProfilePage() {
  const auth = useAuth();

  if (!auth.user) {
    return null;
  }

  return (
    <ProfileContent
      key={auth.user.id}
      user={auth.user}
      setUser={auth.setUser}
    />
  );
}

function ProfileContent({ user, setUser }: ProfileContentProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [editedName, setEditedName] = useState('');

  const [pendingSetting, setPendingSetting] = useState<PendingSetting>(null);

  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const isOnline = useOnlineStatus();

  const initials = useMemo(() => getInitials(user.name), [user.name]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setFeedback(null);
    }, 3500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [feedback]);

  function handleStartProfileEdit() {
    setEditedName(user.name);

    setIsEditingProfile(true);
  }

  function handleProfileCancel() {
    setEditedName('');

    setIsEditingProfile(false);
  }

  async function handleProfileSave() {
    const name = editedName.trim();

    if (name.length < 2) {
      setFeedback({
        type: 'error',
        message: 'Name must contain at least 2 characters.',
      });

      return;
    }

    if (name === user.name) {
      setIsEditingProfile(false);

      return;
    }

    setPendingSetting('profile');

    try {
      const updatedUser = await updateCurrentUser({
        name,
      });

      setEditedName(updatedUser.name);

      setIsEditingProfile(false);

      setUser(updatedUser);

      setFeedback({
        type: 'success',
        message: 'Profile updated successfully.',
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: getErrorMessage(error, 'Profile could not be updated.'),
      });
    } finally {
      setPendingSetting(null);
    }
  }

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

  return (
    <main className="relative min-h-full overflow-hidden bg-[var(--ds-obsidian)] px-4 pb-28 pt-5 text-[var(--ds-cream)] md:px-6 md:pb-9 md:pt-6 lg:px-8">
      <ProfileBackground />

      <div className="relative z-10 mx-auto w-full max-w-[1080px]">
        <ProfileHeader
          isEditing={isEditingProfile}
          isPending={pendingSetting === 'profile'}
          onEdit={handleStartProfileEdit}
          onSave={handleProfileSave}
          onCancel={handleProfileCancel}
        />

        {feedback ? <FeedbackBanner feedback={feedback} /> : null}

        <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.22fr)_minmax(300px,0.78fr)]">
          <ProfileIdentityCard
            name={user.name}
            email={user.email}
            initials={initials}
            avatar={user.avatar}
            memberSince={user.createdAt}
            emailVerified={user.emailVerified}
            isEditing={isEditingProfile}
            editedName={editedName}
            onNameChange={setEditedName}
          />

          <StreakCard
            current={user.streak.current}
            longest={user.streak.longest}
          />
        </section>

        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <PracticeDefaultsCard
            defaultTarget={user.preferences.defaultTarget}
            timezone={user.preferences.timezone}
            targetPending={pendingSetting === 'target'}
            timezonePending={pendingSetting === 'timezone'}
            onTargetChange={handleTargetChange}
            onUseDeviceTimezone={handleUseDeviceTimezone}
          />

          <AccountSecurityCard
            email={user.email}
            emailVerified={user.emailVerified}
            role={user.role}
          />

          <SoundHapticsCard
            soundEnabled={user.preferences.soundEnabled}
            hapticEnabled={user.preferences.hapticEnabled}
            soundPending={pendingSetting === 'sound'}
            hapticPending={pendingSetting === 'haptic'}
            onSoundToggle={handleSoundToggle}
            onHapticToggle={handleHapticToggle}
          />

          <SyncOfflineCard isOnline={isOnline} />

          <AppearanceLanguageCard
            theme={user.preferences.theme}
            language={user.preferences.language}
          />

          <PracticeStatsCard
            chants={user.totals.chants}
            malas={user.totals.malas}
            sessions={user.totals.sessions}
            durationSeconds={user.totals.durationSeconds}
          />
        </section>

        <section className="mt-4 md:hidden">
          <MobileAccountCard />
        </section>
      </div>
    </main>
  );
}

type ProfileHeaderProps = {
  isEditing: boolean;
  isPending: boolean;
  onEdit: () => void;
  onSave: () => void | Promise<void>;
  onCancel: () => void;
};

function ProfileHeader({
  isEditing,
  isPending,
  onEdit,
  onSave,
  onCancel,
}: ProfileHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-white/[0.055] pb-5">
      <div>
        <div className="flex items-center gap-2">
          <Sparkles
            size={14}
            strokeWidth={1.7}
            className="text-[var(--ds-amber)]"
          />

          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ds-gold)]">
            Your Space
          </p>
        </div>

        <h1 className="mt-2 font-serif text-[25px] font-medium tracking-[0.01em] text-[var(--ds-cream)] sm:text-[28px]">
          Profile &amp; Settings
        </h1>

        <p className="mt-2 text-[12px] leading-5 text-[var(--ds-muted)]">
          Manage your account, preferences, and practice experience.
        </p>
      </div>

      {isEditing ? (
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="flex h-9 items-center gap-2 rounded-[8px] border border-white/[0.08] bg-white/[0.02] px-3 text-[11px] font-medium text-[var(--ds-muted)] transition hover:bg-white/[0.04] hover:text-[var(--ds-text)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={13} strokeWidth={1.8} />
            Cancel
          </button>

          <button
            type="button"
            onClick={() => void onSave()}
            disabled={isPending}
            className="flex h-9 items-center gap-2 rounded-[8px] border border-[var(--ds-border-gold)] bg-[var(--ds-amber-08)] px-3 text-[11px] font-medium text-[var(--ds-soft-gold)] transition hover:bg-[var(--ds-amber-14)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Save size={13} strokeWidth={1.8} />
            )}
            Save
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onEdit}
          className="flex h-9 shrink-0 items-center gap-2 rounded-[8px] border border-white/[0.08] bg-white/[0.02] px-3 text-[11px] font-medium text-[var(--ds-muted)] transition hover:border-[var(--ds-border-gold)] hover:bg-[var(--ds-amber-05)] hover:text-[var(--ds-soft-gold)]"
        >
          <Pencil size={12} strokeWidth={1.7} />
          Edit Profile
        </button>
      )}
    </header>
  );
}

type FeedbackBannerProps = {
  feedback: Exclude<FeedbackState, null>;
};

function FeedbackBanner({ feedback }: FeedbackBannerProps) {
  const isSuccess = feedback.type === 'success';

  return (
    <div
      className={[
        'mt-4 flex items-center gap-2 rounded-[9px] border px-4 py-3 text-[11px]',
        isSuccess
          ? 'border-emerald-400/15 bg-emerald-400/[0.035] text-emerald-200/80'
          : 'border-red-400/15 bg-red-400/[0.035] text-red-200/80',
      ].join(' ')}
    >
      {isSuccess ? (
        <CheckCircle2 size={14} strokeWidth={1.7} />
      ) : (
        <X size={14} strokeWidth={1.7} />
      )}

      {feedback.message}
    </div>
  );
}

type ProfileIdentityCardProps = {
  name: string;
  email: string;
  initials: string;
  avatar: string | null;
  memberSince: string;
  emailVerified: boolean;
  isEditing: boolean;
  editedName: string;
  onNameChange: (value: string) => void;
};

function ProfileIdentityCard({
  name,
  email,
  initials,
  avatar,
  memberSince,
  emailVerified,
  isEditing,
  editedName,
  onNameChange,
}: ProfileIdentityCardProps) {
  return (
    <article className="relative overflow-hidden rounded-[12px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] p-5 shadow-[var(--ds-shadow-card)] sm:p-6">
      <div
        aria-hidden="true"
        className="absolute -left-14 -top-14 size-40 rounded-full bg-[var(--ds-amber-05)] blur-[70px]"
      />

      <div className="relative flex items-start gap-5">
        <Avatar avatar={avatar} initials={initials} />

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div>
              <label
                htmlFor="profile-name"
                className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ds-muted)]"
              >
                Display Name
              </label>

              <input
                id="profile-name"
                type="text"
                value={editedName}
                onChange={(event) => onNameChange(event.target.value)}
                maxLength={80}
                autoComplete="name"
                className="mt-2 h-11 w-full rounded-[8px] border border-[var(--ds-border-gold)] bg-[var(--ds-night)] px-3 text-[13px] text-[var(--ds-cream)] outline-none transition placeholder:text-[var(--ds-faint)] focus:border-[var(--ds-amber)] focus:shadow-[0_0_0_2px_var(--ds-amber-05)]"
              />
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-serif text-[19px] font-medium text-[var(--ds-cream)]">
                {name}
              </h2>

              <span className="rounded-[5px] border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--ds-gold)]">
                Sadhak
              </span>
            </div>
          )}

          <p className="mt-2 truncate text-[12px] text-[var(--ds-muted)]">
            {email}
          </p>

          <p className="mt-3 text-[11px] leading-5 text-[var(--ds-muted-soft)]">
            On the path of inner transformation.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <div className="flex items-center gap-2 text-[10px] text-[var(--ds-muted)]">
              <CalendarDays size={12} strokeWidth={1.6} />
              Member since {formatMemberSince(memberSince)}
            </div>

            {emailVerified ? (
              <div className="flex items-center gap-2 text-[10px] text-emerald-300/70">
                <CheckCircle2 size={12} strokeWidth={1.7} />
                Verified email
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

type AvatarProps = {
  avatar: string | null;
  initials: string;
};

function Avatar({ avatar, initials }: AvatarProps) {
  return (
    <div className="relative flex size-[76px] shrink-0 items-center justify-center rounded-full border border-[var(--ds-border-gold)] bg-[radial-gradient(circle_at_50%_35%,rgba(237,199,119,0.2),rgba(216,154,53,0.08)_45%,rgba(7,11,17,0.95)_75%)] shadow-[0_0_28px_rgba(216,154,53,0.08)]">
      <div
        aria-hidden="true"
        className="absolute inset-[5px] rounded-full border border-[var(--ds-amber-18)]"
      />

      {avatar ? (
        <img
          src={avatar}
          alt=""
          className="relative size-[62px] rounded-full object-cover"
        />
      ) : initials ? (
        <span className="relative font-serif text-[22px] text-[var(--ds-soft-gold)]">
          {initials}
        </span>
      ) : (
        <User
          size={28}
          strokeWidth={1.5}
          className="relative text-[var(--ds-soft-gold)]"
        />
      )}
    </div>
  );
}

type StreakCardProps = {
  current: number;
  longest: number;
};

function StreakCard({ current, longest }: StreakCardProps) {
  return (
    <article className="rounded-[12px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] p-5 shadow-[var(--ds-shadow-card)]">
      <p className="text-[11px] font-medium text-[var(--ds-muted)]">
        Your Streak
      </p>

      <div className="mt-3 flex items-center gap-3">
        <Flame
          size={25}
          strokeWidth={1.7}
          className="text-[var(--ds-amber-bright)]"
        />

        <p className="font-serif text-[30px] leading-none text-[var(--ds-soft-gold)]">
          {current}
        </p>

        <span className="text-[11px] text-[var(--ds-muted)]">days</span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/[0.055] pt-4">
        <span className="text-[10px] text-[var(--ds-muted-soft)]">
          Longest streak
        </span>

        <span className="text-[11px] font-medium text-[var(--ds-gold)]">
          {longest} days
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-1">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="flex flex-col items-center gap-2"
          >
            <span className="text-[9px] text-[var(--ds-muted-soft)]">
              {day}
            </span>

            <span
              className={[
                'size-2.5 rounded-full border',
                index < Math.min(current, 7)
                  ? 'border-[var(--ds-amber-bright)] bg-[var(--ds-amber)] shadow-[0_0_8px_rgba(216,154,53,0.2)]'
                  : 'border-white/[0.08] bg-white/[0.02]',
              ].join(' ')}
            />
          </div>
        ))}
      </div>
    </article>
  );
}

type PracticeDefaultsCardProps = {
  defaultTarget: number;
  timezone: string;
  targetPending: boolean;
  timezonePending: boolean;
  onTargetChange: (target: number) => void | Promise<void>;
  onUseDeviceTimezone: () => void | Promise<void>;
};

function PracticeDefaultsCard({
  defaultTarget,
  timezone,
  targetPending,
  timezonePending,
  onTargetChange,
  onUseDeviceTimezone,
}: PracticeDefaultsCardProps) {
  const targetOptions = useMemo(() => {
    const values = new Set<number>(PRACTICE_TARGET_OPTIONS);

    values.add(defaultTarget);

    return [...values].sort((left, right) => left - right);
  }, [defaultTarget]);

  return (
    <SettingsCard
      icon={<Target size={16} strokeWidth={1.7} />}
      title="Practice Defaults"
      description="Set the defaults used when beginning a new Sadhana."
    >
      <SettingsRow
        label="Default Target"
        description="Preferred chant count for new practice sessions."
      >
        <div className="flex items-center gap-2">
          {targetPending ? (
            <Loader2 size={13} className="animate-spin text-[var(--ds-gold)]" />
          ) : null}

          <select
            value={defaultTarget}
            disabled={targetPending}
            onChange={(event) =>
              void onTargetChange(Number(event.target.value))
            }
            className="h-9 min-w-[96px] rounded-[7px] border border-white/[0.08] bg-[var(--ds-night)] px-3 text-[11px] text-[var(--ds-text)] outline-none transition focus:border-[var(--ds-border-gold)] disabled:cursor-not-allowed disabled:opacity-60"
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
        description="Used for streaks, daily activity, and insights."
        last
      >
        <button
          type="button"
          onClick={() => void onUseDeviceTimezone()}
          disabled={timezonePending}
          className="flex max-w-[210px] items-center gap-2 rounded-[7px] border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-right text-[10px] text-[var(--ds-muted)] transition hover:border-[var(--ds-border-gold)] hover:text-[var(--ds-soft-gold)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {timezonePending ? (
            <Loader2 size={12} className="shrink-0 animate-spin" />
          ) : (
            <Globe2 size={12} strokeWidth={1.6} className="shrink-0" />
          )}

          <span className="truncate">{timezone}</span>
        </button>
      </SettingsRow>
    </SettingsCard>
  );
}

type AccountSecurityCardProps = {
  email: string;
  emailVerified: boolean;
  role: string;
};

function AccountSecurityCard({
  email,
  emailVerified,
  role,
}: AccountSecurityCardProps) {
  return (
    <SettingsCard
      icon={<ShieldCheck size={16} strokeWidth={1.7} />}
      title="Account & Security"
      description="Review your account and security status."
    >
      <SettingsRow label="Email" description={email}>
        <StatusBadge
          active={emailVerified}
          activeLabel="Verified"
          inactiveLabel="Unverified"
        />
      </SettingsRow>

      <SettingsRow
        label="Password"
        description="Password recovery is available through the secure sign-in flow."
      >
        <LockKeyhole
          size={15}
          strokeWidth={1.6}
          className="text-[var(--ds-muted)]"
        />
      </SettingsRow>

      <SettingsRow
        label="Account Role"
        description="Current DevSangam access level."
        last
      >
        <span className="text-[11px] capitalize text-[var(--ds-muted)]">
          {role}
        </span>
      </SettingsRow>
    </SettingsCard>
  );
}

type SoundHapticsCardProps = {
  soundEnabled: boolean;
  hapticEnabled: boolean;
  soundPending: boolean;
  hapticPending: boolean;
  onSoundToggle: () => void | Promise<void>;
  onHapticToggle: () => void | Promise<void>;
};

function SoundHapticsCard({
  soundEnabled,
  hapticEnabled,
  soundPending,
  hapticPending,
  onSoundToggle,
  onHapticToggle,
}: SoundHapticsCardProps) {
  return (
    <SettingsCard
      icon={<Volume2 size={16} strokeWidth={1.7} />}
      title="Sound & Haptics"
      description="Customize audio and vibration feedback during practice."
    >
      <SettingsRow
        label="Chanting Sound"
        description="Use Om ambience and chant feedback during Sadhana."
      >
        <Toggle
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

          <Toggle
            enabled={hapticEnabled}
            pending={hapticPending}
            onToggle={onHapticToggle}
          />
        </div>
      </SettingsRow>
    </SettingsCard>
  );
}

type SyncOfflineCardProps = {
  isOnline: boolean;
};

function SyncOfflineCard({ isOnline }: SyncOfflineCardProps) {
  return (
    <SettingsCard
      icon={<Cloud size={16} strokeWidth={1.7} />}
      title="Sync & Offline"
      description="Your Sadhana remains usable even when connectivity changes."
    >
      <SettingsRow
        label="Connection"
        description={
          isOnline ? 'Connected to DevSangam.' : 'Offline mode is active.'
        }
      >
        <div
          className={[
            'flex items-center gap-2 text-[11px]',
            isOnline ? 'text-emerald-300/70' : 'text-[var(--ds-gold)]',
          ].join(' ')}
        >
          {isOnline ? (
            <Wifi size={14} strokeWidth={1.7} />
          ) : (
            <WifiOff size={14} strokeWidth={1.7} />
          )}

          {isOnline ? 'Online' : 'Offline'}
        </div>
      </SettingsRow>

      <SettingsRow
        label="Practice Sync"
        description="Completed offline Sadhana is reconciled automatically after reconnecting."
      >
        <span className="text-[11px] text-[var(--ds-gold)]">Automatic</span>
      </SettingsRow>

      <SettingsRow
        label="Offline Practice"
        description="Active sessions can continue without a network connection."
        last
      >
        <Check size={15} strokeWidth={2} className="text-emerald-300/70" />
      </SettingsRow>
    </SettingsCard>
  );
}

type AppearanceLanguageCardProps = {
  theme: 'dark' | 'light';
  language: string;
};

function AppearanceLanguageCard({
  theme,
  language,
}: AppearanceLanguageCardProps) {
  return (
    <SettingsCard
      icon={<Palette size={16} strokeWidth={1.7} />}
      title="Appearance & Language"
      description="Current account display preferences."
    >
      <SettingsRow
        label="Theme"
        description="DevSangam currently uses its dark-first spiritual interface."
      >
        <span className="text-[11px] capitalize text-[var(--ds-muted)]">
          {theme}
        </span>
      </SettingsRow>

      <SettingsRow
        label="Language"
        description="Saved account language. Full interface localization comes later."
        last
      >
        <span className="text-[11px] uppercase text-[var(--ds-muted)]">
          {language}
        </span>
      </SettingsRow>
    </SettingsCard>
  );
}

type PracticeStatsCardProps = {
  chants: number;
  malas: number;
  sessions: number;
  durationSeconds: number;
};

function PracticeStatsCard({
  chants,
  malas,
  sessions,
  durationSeconds,
}: PracticeStatsCardProps) {
  return (
    <SettingsCard
      icon={<Sparkles size={16} strokeWidth={1.7} />}
      title="Practice Journey"
      description="Your lifetime DevSangam activity."
    >
      <div className="grid grid-cols-2 gap-2.5 p-4">
        <MiniStat label="Chants" value={formatCompactNumber(chants)} />

        <MiniStat label="Malas" value={formatCompactNumber(malas)} />

        <MiniStat label="Sessions" value={formatCompactNumber(sessions)} />

        <MiniStat
          label="Practice Time"
          value={formatDuration(durationSeconds)}
        />
      </div>
    </SettingsCard>
  );
}

function MobileAccountCard() {
  return (
    <article className="overflow-hidden rounded-[10px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] shadow-[var(--ds-shadow-card)]">
      <div className="flex items-center gap-2 border-b border-white/[0.055] px-4 py-3">
        <User size={15} strokeWidth={1.7} className="text-[var(--ds-gold)]" />

        <h2 className="font-serif text-[14px] text-[var(--ds-cream)]">
          Account
        </h2>
      </div>

      <div className="p-2">
        <LogoutButton />
      </div>
    </article>
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

        <div className="min-w-0">
          <h2 className="font-serif text-[14px] text-[var(--ds-cream)]">
            {title}
          </h2>

          <p className="mt-1 text-[10px] leading-4 text-[var(--ds-muted-soft)]">
            {description}
          </p>
        </div>
      </div>

      <div>{children}</div>
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
        'flex min-h-[66px] items-center justify-between gap-4 px-4 py-3',
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
          ? 'border-[#e1a541]/45 bg-[linear-gradient(90deg,#b96f22,#dda13e)] shadow-[0_0_12px_rgba(216,154,53,0.12)]'
          : 'border-white/[0.09] bg-white/[0.055]',
        pending ? 'cursor-not-allowed opacity-60' : '',
      ].join(' ')}
    >
      {pending ? (
        <Loader2
          size={10}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-[var(--ds-cream)]"
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

type StatusBadgeProps = {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
};

function StatusBadge({ active, activeLabel, inactiveLabel }: StatusBadgeProps) {
  return (
    <span
      className={[
        'rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.06em]',
        active
          ? 'border-emerald-400/15 bg-emerald-400/[0.04] text-emerald-300/70'
          : 'border-amber-400/15 bg-amber-400/[0.04] text-amber-300/70',
      ].join(' ')}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

type MiniStatProps = {
  label: string;
  value: string;
};

function MiniStat({ label, value }: MiniStatProps) {
  return (
    <div className="rounded-[8px] border border-white/[0.045] bg-white/[0.018] p-4">
      <p className="font-serif text-[19px] text-[var(--ds-soft-gold)]">
        {value}
      </p>

      <p className="mt-1.5 text-[10px] text-[var(--ds-muted-soft)]">{label}</p>
    </div>
  );
}

function ProfileBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute right-[8%] top-[-180px] size-[380px] rounded-full bg-[var(--ds-amber-03)] blur-[125px]" />

      <div className="absolute bottom-[-220px] left-[6%] size-[420px] rounded-full bg-[var(--ds-amber-03)] blur-[130px]" />

      <div className="absolute right-[-190px] top-[36%] size-[380px] rounded-full border border-[var(--ds-amber-03)]" />
    </div>
  );
}

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(() => {
    if (typeof navigator === 'undefined') {
      return true;
    }

    return navigator.onLine;
  });

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);

    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);

      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

function getInitials(name?: string) {
  if (!name?.trim()) {
    return '';
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function formatMemberSince(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'DevSangam';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(Math.max(0, Math.round(value)));
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Math.max(0, value));
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.max(0, Math.round(totalSeconds / 60));

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);

  const remaining = minutes % 60;

  if (remaining === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remaining}m`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
