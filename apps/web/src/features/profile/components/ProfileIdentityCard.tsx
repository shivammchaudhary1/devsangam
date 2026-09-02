import { formatMemberSince } from '../utils/profile-formatters';
import { ProfileAvatar } from './ProfileAvatar';
import type {
  AuthUser,
  ProfileIntention,
} from '@/features/auth/types/auth.types';
import {
  CalendarDays,
  CheckCircle2,
  Loader2,
  Pencil,
  Save,
  Sparkles,
  X,
} from 'lucide-react';

const PROFILE_INTENTIONS: ProfileIntention[] = [
  'Peace',
  'Focus',
  'Healing',
  'Discipline',
  'Devotion',
];

type ProfileIdentityCardProps = {
  user: AuthUser;
  initials: string;
  editing: boolean;
  editedName: string;
  editedBio: string;
  editedIntention: ProfileIntention | '';
  saving: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onEditedNameChange: (value: string) => void;
  onEditedBioChange: (value: string) => void;
  onEditedIntentionChange: (value: ProfileIntention | '') => void;
  onSave: () => void | Promise<void>;
};

export function ProfileIdentityCard({
  user,
  initials,
  editing,
  editedName,
  editedBio,
  editedIntention,
  saving,
  onStartEditing,
  onCancelEditing,
  onEditedNameChange,
  onEditedBioChange,
  onEditedIntentionChange,
  onSave,
}: ProfileIdentityCardProps) {
  return (
    <article className="relative overflow-hidden rounded-[12px] border border-[var(--ds-border-soft)] bg-[var(--ds-gradient-panel-soft)] p-5 shadow-[var(--ds-shadow-card)] sm:p-6">
      <div
        aria-hidden="true"
        className="absolute -left-14 -top-14 size-40 rounded-full bg-[var(--ds-amber-05)] blur-[70px]"
      />

      <div className="relative flex items-start gap-5">
        <ProfileAvatar avatar={user.avatar} initials={initials} />

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
                onChange={(event) => onEditedNameChange(event.target.value)}
                className="mt-2 h-11 w-full rounded-[8px] border border-[var(--ds-border-gold)] bg-[var(--ds-night)] px-3 text-[13px] text-[var(--ds-cream)] outline-none"
              />

              <label
                htmlFor="profile-intention"
                className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ds-muted)]"
              >
                Spiritual Intention
              </label>

              <select
                id="profile-intention"
                value={editedIntention}
                onChange={(event) =>
                  onEditedIntentionChange(
                    event.target.value as ProfileIntention | ''
                  )
                }
                className="mt-2 h-11 w-full rounded-[8px] border border-[var(--ds-border-gold)] bg-[var(--ds-night)] px-3 text-[13px] text-[var(--ds-cream)] outline-none"
              >
                <option value="">Not selected</option>

                {PROFILE_INTENTIONS.map((intention) => (
                  <option key={intention} value={intention}>
                    {intention}
                  </option>
                ))}
              </select>

              <label
                htmlFor="profile-bio"
                className="mt-4 block text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--ds-muted)]"
              >
                About Your Practice
              </label>

              <textarea
                id="profile-bio"
                value={editedBio}
                maxLength={240}
                rows={4}
                onChange={(event) => onEditedBioChange(event.target.value)}
                placeholder="A short note about your practice or intention..."
                className="mt-2 w-full resize-none rounded-[8px] border border-[var(--ds-border-gold)] bg-[var(--ds-night)] px-3 py-3 text-[13px] leading-5 text-[var(--ds-cream)] outline-none placeholder:text-[var(--ds-muted)]"
              />

              <p className="mt-1 text-right text-[9px] text-[var(--ds-muted)]">
                {editedBio.length}/240
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={onCancelEditing}
                  disabled={saving}
                  className="flex h-9 items-center gap-2 rounded-[7px] border border-white/[0.08] px-3 text-[11px] text-[var(--ds-muted)]"
                >
                  <X size={13} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void onSave()}
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

              {user.intention ? (
                <div className="mt-3 flex items-center gap-2">
                  <Sparkles size={12} className="text-[var(--ds-gold)]" />

                  <span className="text-[11px] text-[var(--ds-soft-gold)]">
                    Intention: {user.intention}
                  </span>
                </div>
              ) : null}

              {user.bio ? (
                <p className="mt-3 max-w-xl text-[12px] leading-5 text-[var(--ds-muted)]">
                  {user.bio}
                </p>
              ) : null}

              <button
                type="button"
                onClick={onStartEditing}
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
  );
}
