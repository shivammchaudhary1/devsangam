import { APP_ROUTES } from '@/app/constants/routes.constants';
import { updateCurrentUser } from '@/features/auth/api/auth.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthUser } from '@/features/auth/types/auth.types';
import { useInsightsOverview } from '@/features/insights/hooks/useInsightsOverview';
import {
  CalendarDays,
  CheckCircle2,
  Flame,
  Loader2,
  Pencil,
  Save,
  Settings,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';

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
  const [editing, setEditing] = useState(false);

  const [editedName, setEditedName] = useState('');

  const [saving, setSaving] = useState(false);

  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const {
    data: insights,
    isLoading: insightsLoading,
    isError: insightsError,
  } = useInsightsOverview({
    range: 'all',

    timezone: user.preferences.timezone,
  });

  const initials = useMemo(() => getInitials(user.name), [user.name]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timeout = window.setTimeout(() => setFeedback(null), 3500);

    return () => window.clearTimeout(timeout);
  }, [feedback]);

  function startEditing() {
    setEditedName(user.name);

    setEditing(true);
  }

  function cancelEditing() {
    setEditedName('');

    setEditing(false);
  }

  async function saveProfile() {
    const name = editedName.trim();

    if (name.length < 2) {
      setFeedback({
        type: 'error',

        message: 'Name must contain at least 2 characters.',
      });

      return;
    }

    if (name === user.name) {
      setEditing(false);

      return;
    }

    setSaving(true);

    try {
      const updatedUser = await updateCurrentUser({
        name,
      });

      setUser(updatedUser);

      setEditing(false);

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
      setSaving(false);
    }
  }

  const summary = insights?.summary;

  return (
    <main className="relative min-h-full overflow-hidden bg-[var(--ds-obsidian)] px-4 pb-28 pt-5 text-[var(--ds-cream)] md:px-6 md:pb-9 md:pt-6 lg:px-8">
      <ProfileBackground />

      <div className="relative z-10 mx-auto w-full max-w-[1080px]">
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

            <h1 className="mt-2 font-serif text-[25px] font-medium text-[var(--ds-cream)] sm:text-[28px]">
              Profile
            </h1>

            <p className="mt-2 text-[12px] leading-5 text-[var(--ds-muted)]">
              Your identity and Sadhana journey.
            </p>
          </div>

          <Link
            to={APP_ROUTES.settings}
            className="flex h-9 shrink-0 items-center gap-2 rounded-[8px] border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] px-3 text-[11px] font-medium text-[var(--ds-soft-gold)] transition hover:bg-[var(--ds-amber-08)]"
          >
            <Settings size={13} strokeWidth={1.7} />
            Settings
          </Link>
        </header>

        {feedback ? <FeedbackBanner feedback={feedback} /> : null}

        <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
          <article className="relative overflow-hidden rounded-[12px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] p-5 shadow-[var(--ds-shadow-card)] sm:p-6">
            <div
              aria-hidden="true"
              className="absolute -left-14 -top-14 size-40 rounded-full bg-[var(--ds-amber-05)] blur-[70px]"
            />

            <div className="relative flex items-start gap-5">
              <Avatar avatar={user.avatar} initials={initials} />

              <div className="min-w-0 flex-1">
                {editing ? (
                  <>
                    <label
                      htmlFor="profile-name"
                      className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ds-muted)]"
                    >
                      Display Name
                    </label>

                    <input
                      id="profile-name"
                      value={editedName}
                      maxLength={80}
                      autoComplete="name"
                      onChange={(event) => setEditedName(event.target.value)}
                      className="mt-2 h-11 w-full rounded-[8px] border border-[var(--ds-border-gold)] bg-[var(--ds-night)] px-3 text-[13px] text-[var(--ds-cream)] outline-none"
                    />

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        disabled={saving}
                        className="flex h-9 items-center gap-2 rounded-[7px] border border-white/[0.08] px-3 text-[11px] text-[var(--ds-muted)]"
                      >
                        <X size={13} />
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() => void saveProfile()}
                        disabled={saving}
                        className="flex h-9 items-center gap-2 rounded-[7px] border border-[var(--ds-border-gold)] bg-[var(--ds-amber-08)] px-3 text-[11px] text-[var(--ds-soft-gold)]"
                      >
                        {saving ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Save size={13} />
                        )}
                        Save
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-serif text-[20px] text-[var(--ds-cream)]">
                        {user.name}
                      </h2>

                      <span className="rounded-[5px] border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)] px-2 py-1 text-[9px] font-semibold uppercase text-[var(--ds-gold)]">
                        Sadhak
                      </span>
                    </div>

                    <p className="mt-2 text-[12px] text-[var(--ds-muted)]">
                      {user.email}
                    </p>

                    <button
                      type="button"
                      onClick={startEditing}
                      className="mt-4 flex items-center gap-2 text-[11px] text-[var(--ds-gold)] transition hover:text-[var(--ds-soft-gold)]"
                    >
                      <Pencil size={12} />
                      Edit Profile
                    </button>
                  </>
                )}

                <div className="mt-4 flex flex-wrap gap-4 border-t border-white/[0.05] pt-4">
                  <span className="flex items-center gap-2 text-[10px] text-[var(--ds-muted)]">
                    <CalendarDays size={12} />
                    Member since {formatMemberSince(user.createdAt)}
                  </span>

                  {user.emailVerified ? (
                    <span className="flex items-center gap-2 text-[10px] text-emerald-300/70">
                      <CheckCircle2 size={12} />
                      Verified email
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </article>

          <article className="rounded-[12px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] p-5 shadow-[var(--ds-shadow-card)]">
            <p className="text-[11px] font-medium text-[var(--ds-muted)]">
              Your Streak
            </p>

            <div className="mt-4 flex items-center gap-3">
              <Flame
                size={26}
                strokeWidth={1.7}
                className="text-[var(--ds-amber-bright)]"
              />

              <span className="font-serif text-[31px] text-[var(--ds-soft-gold)]">
                {insightsLoading || insightsError
                  ? '—'
                  : (summary?.currentStreakDays ?? 0)}
              </span>

              <span className="text-[11px] text-[var(--ds-muted)]">days</span>
            </div>

            <div className="mt-5 flex justify-between border-t border-white/[0.05] pt-4 text-[11px]">
              <span className="text-[var(--ds-muted-soft)]">
                Longest streak
              </span>

              <span className="text-[var(--ds-gold)]">
                {insightsLoading || insightsError
                  ? '—'
                  : `${summary?.longestStreakDays ?? 0} days`}
              </span>
            </div>
          </article>
        </section>

        <section className="mt-4">
          <article className="overflow-hidden rounded-[11px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] shadow-[var(--ds-shadow-card)]">
            <div className="border-b border-white/[0.055] px-4 py-4">
              <h2 className="font-serif text-[14px] text-[var(--ds-cream)]">
                Practice Journey
              </h2>

              <p className="mt-1 text-[10px] text-[var(--ds-muted-soft)]">
                Lifetime completed Sadhana activity.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
              <JourneyStat
                label="Chants"
                value={
                  insightsLoading || insightsError
                    ? '—'
                    : formatCompactNumber(summary?.totalChants ?? 0)
                }
              />

              <JourneyStat
                label="Malas"
                value={
                  insightsLoading || insightsError
                    ? '—'
                    : formatCompactNumber(summary?.totalMalas ?? 0)
                }
              />

              <JourneyStat
                label="Sessions"
                value={
                  insightsLoading || insightsError
                    ? '—'
                    : formatCompactNumber(summary?.totalCompletedSessions ?? 0)
                }
              />

              <JourneyStat
                label="Practice Time"
                value={
                  insightsLoading || insightsError
                    ? '—'
                    : formatDuration(summary?.totalPracticeSeconds ?? 0)
                }
              />
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

type AvatarProps = {
  avatar: string | null;
  initials: string;
};

function Avatar({ avatar, initials }: AvatarProps) {
  return (
    <div className="relative flex size-[76px] shrink-0 items-center justify-center rounded-full border border-[var(--ds-border-gold)] bg-[var(--ds-amber-05)]">
      {avatar ? (
        <img
          src={avatar}
          alt=""
          className="size-[62px] rounded-full object-cover"
        />
      ) : initials ? (
        <span className="font-serif text-[22px] text-[var(--ds-soft-gold)]">
          {initials}
        </span>
      ) : (
        <User size={28} className="text-[var(--ds-soft-gold)]" />
      )}
    </div>
  );
}

type JourneyStatProps = {
  label: string;
  value: string;
};

function JourneyStat({ label, value }: JourneyStatProps) {
  return (
    <div className="rounded-[8px] border border-white/[0.045] bg-white/[0.018] p-4">
      <p className="font-serif text-[20px] text-[var(--ds-soft-gold)]">
        {value}
      </p>

      <p className="mt-1.5 text-[10px] text-[var(--ds-muted-soft)]">{label}</p>
    </div>
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
      {success ? <CheckCircle2 size={14} /> : <X size={14} />}

      {feedback.message}
    </div>
  );
}

function ProfileBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="absolute right-[8%] top-[-180px] size-[380px] rounded-full bg-[var(--ds-amber-03)] blur-[125px]" />
    </div>
  );
}

function getInitials(name: string) {
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

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(Math.max(0, value));
}

function formatDuration(seconds: number) {
  if (seconds <= 0) {
    return '0m';
  }

  if (seconds < 60) {
    return '<1m';
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);

  const remaining = minutes % 60;

  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
