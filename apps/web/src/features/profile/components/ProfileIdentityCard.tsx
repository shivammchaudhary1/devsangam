import { formatMemberSince } from '../utils/profile-formatters';
import { ProfileAvatar } from './ProfileAvatar';
import type {
  AuthUser,
  ProfileIntention,
} from '@/features/auth/types/auth.types';
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  Loader2,
  Pencil,
  Save,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { ChangeEvent } from 'react';

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
  avatarUrl: string | null;
  avatarSelectionActive: boolean;
  avatarBusy: boolean;
  avatarUploading: boolean;
  avatarRemoving: boolean;
  editing: boolean;
  editedName: string;
  editedBio: string;
  editedIntention: ProfileIntention | '';
  saving: boolean;
  onAvatarFileSelected: (file: File) => void;
  onUploadAvatar: () => void | Promise<void>;
  onCancelAvatarSelection: () => void;
  onRemoveAvatar: () => void | Promise<void>;
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
  avatarUrl,
  avatarSelectionActive,
  avatarBusy,
  avatarUploading,
  avatarRemoving,
  editing,
  editedName,
  editedBio,
  editedIntention,
  saving,
  onAvatarFileSelected,
  onUploadAvatar,
  onCancelAvatarSelection,
  onRemoveAvatar,
  onStartEditing,
  onCancelEditing,
  onEditedNameChange,
  onEditedBioChange,
  onEditedIntentionChange,
  onSave,
}: ProfileIdentityCardProps) {
  function handleAvatarFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    /*
     * Clearing the input lets the user
     * select the same file again later.
     */
    event.target.value = '';

    if (file) {
      onAvatarFileSelected(file);
    }
  }

  return (
    <article
      className={
        'relative overflow-hidden rounded-[12px] ' +
        'border border-[var(--ds-border-soft)] ' +
        'bg-[var(--ds-gradient-panel-soft)] p-5 ' +
        'shadow-[var(--ds-shadow-card)] sm:p-6'
      }
    >
      <div
        aria-hidden="true"
        className={
          'absolute -left-14 -top-14 size-40 rounded-full ' +
          'bg-[var(--ds-amber-05)] blur-[70px]'
        }
      />

      <div className="relative flex items-start gap-5">
        <div className="flex shrink-0 flex-col items-center">
          <ProfileAvatar
            avatar={avatarUrl}
            initials={initials}
            busy={avatarBusy}
          />

          <input
            id="profile-avatar-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={avatarBusy}
            onChange={handleAvatarFileChange}
            className="sr-only"
          />

          {avatarSelectionActive ? (
            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                disabled={avatarBusy}
                onClick={() => void onUploadAvatar()}
                className={
                  'flex h-8 items-center justify-center gap-1.5 ' +
                  'rounded-[7px] border border-[var(--ds-border-gold)] ' +
                  'bg-[var(--ds-amber-08)] px-2.5 text-[9px] ' +
                  'text-[var(--ds-soft-gold)] disabled:opacity-50'
                }
              >
                {avatarUploading ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : (
                  <Upload size={11} />
                )}
                Upload
              </button>

              <button
                type="button"
                disabled={avatarBusy}
                onClick={onCancelAvatarSelection}
                className={
                  'flex h-8 items-center justify-center gap-1.5 ' +
                  'rounded-[7px] border border-[var(--ds-border-soft)] ' +
                  'px-2.5 text-[9px] text-[var(--ds-muted)] ' +
                  'disabled:opacity-50'
                }
              >
                <X size={11} />
                Cancel
              </button>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              <label
                htmlFor="profile-avatar-input"
                aria-disabled={avatarBusy}
                className={
                  'flex h-8 cursor-pointer items-center justify-center ' +
                  'gap-1.5 rounded-[7px] border ' +
                  'border-[var(--ds-border-gold)] px-2.5 ' +
                  'text-[9px] text-[var(--ds-gold)] ' +
                  (avatarBusy ? 'pointer-events-none opacity-50' : '')
                }
              >
                <Camera size={11} />

                {user.avatar ? 'Change' : 'Add Photo'}
              </label>

              {user.avatar ? (
                <button
                  type="button"
                  disabled={avatarBusy}
                  onClick={() => void onRemoveAvatar()}
                  className={
                    'flex h-8 items-center justify-center gap-1.5 ' +
                    'rounded-[7px] border border-[var(--ds-border-soft)] ' +
                    'px-2.5 text-[9px] text-[var(--ds-muted)] ' +
                    'transition hover:text-red-300 disabled:opacity-50'
                  }
                >
                  {avatarRemoving ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Trash2 size={11} />
                  )}
                  Remove
                </button>
              ) : null}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          {editing ? (
            <>
              <label
                htmlFor="profile-name"
                className={
                  'text-[10px] font-semibold uppercase tracking-[0.1em] ' +
                  'text-[var(--ds-muted)]'
                }
              >
                Display Name
              </label>

              <input
                id="profile-name"
                value={editedName}
                maxLength={80}
                autoComplete="name"
                onChange={(event) => onEditedNameChange(event.target.value)}
                className={
                  'mt-2 h-11 w-full rounded-[8px] ' +
                  'border border-[var(--ds-border-gold)] ' +
                  'bg-[var(--ds-night)] px-3 text-[13px] ' +
                  'text-[var(--ds-cream)] outline-none'
                }
              />

              <label
                htmlFor="profile-intention"
                className={
                  'mt-4 block text-[10px] font-semibold uppercase ' +
                  'tracking-[0.1em] text-[var(--ds-muted)]'
                }
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
                className={
                  'mt-2 h-11 w-full rounded-[8px] ' +
                  'border border-[var(--ds-border-gold)] ' +
                  'bg-[var(--ds-night)] px-3 text-[13px] ' +
                  'text-[var(--ds-cream)] outline-none'
                }
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
                className={
                  'mt-4 block text-[10px] font-semibold uppercase ' +
                  'tracking-[0.1em] text-[var(--ds-muted)]'
                }
              >
                About Your Practice
              </label>

              <textarea
                id="profile-bio"
                value={editedBio}
                maxLength={240}
                rows={4}
                onChange={(event) => onEditedBioChange(event.target.value)}
                placeholder={'A short note about your practice or intention...'}
                className={
                  'mt-2 w-full resize-none rounded-[8px] ' +
                  'border border-[var(--ds-border-gold)] ' +
                  'bg-[var(--ds-night)] px-3 py-3 text-[13px] ' +
                  'leading-5 text-[var(--ds-cream)] outline-none ' +
                  'placeholder:text-[var(--ds-muted)]'
                }
              />

              <p
                className={
                  'mt-1 text-right text-[9px] ' + 'text-[var(--ds-muted)]'
                }
              >
                {editedBio.length}/240
              </p>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={onCancelEditing}
                  disabled={saving}
                  className={
                    'flex h-9 items-center gap-2 rounded-[7px] ' +
                    'border border-[var(--ds-border-soft)] px-3 text-[11px] ' +
                    'text-[var(--ds-muted)] disabled:opacity-50'
                  }
                >
                  <X size={13} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void onSave()}
                  disabled={saving}
                  className={
                    'flex h-9 items-center gap-2 rounded-[7px] ' +
                    'border border-[var(--ds-border-gold)] ' +
                    'bg-[var(--ds-amber-08)] px-3 text-[11px] ' +
                    'text-[var(--ds-soft-gold)] disabled:opacity-50'
                  }
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
                <h2
                  className={
                    'font-serif text-[20px] ' + 'text-[var(--ds-cream)]'
                  }
                >
                  {user.name}
                </h2>

                <span
                  className={
                    'rounded-[5px] border ' +
                    'border-[var(--ds-border-gold)] ' +
                    'bg-[var(--ds-amber-05)] px-2 py-1 text-[9px] ' +
                    'font-semibold uppercase text-[var(--ds-gold)]'
                  }
                >
                  Sadhak
                </span>
              </div>

              <p className="mt-2 text-[12px] text-[var(--ds-muted)]">
                {user.email}
              </p>

              {user.intention ? (
                <div className="mt-3 flex items-center gap-2">
                  <Sparkles size={12} className="text-[var(--ds-gold)]" />

                  <span
                    className={'text-[11px] ' + 'text-[var(--ds-soft-gold)]'}
                  >
                    Intention: {user.intention}
                  </span>
                </div>
              ) : null}

              {user.bio ? (
                <p
                  className={
                    'mt-3 max-w-xl text-[12px] leading-5 ' +
                    'text-[var(--ds-muted)]'
                  }
                >
                  {user.bio}
                </p>
              ) : null}

              <button
                type="button"
                onClick={onStartEditing}
                className={
                  'mt-4 flex items-center gap-2 text-[11px] ' +
                  'text-[var(--ds-gold)] transition ' +
                  'hover:text-[var(--ds-soft-gold)]'
                }
              >
                <Pencil size={12} />
                Edit Profile
              </button>
            </>
          )}

          <div
            className={
              'mt-4 flex flex-wrap gap-4 border-t ' + 'border-[var(--ds-border-soft)] pt-4'
            }
          >
            <span
              className={
                'flex items-center gap-2 text-[10px] ' +
                'text-[var(--ds-muted)]'
              }
            >
              <CalendarDays size={12} />
              Member since {formatMemberSince(user.createdAt)}
            </span>

            {user.emailVerified ? (
              <span
                className={
                  'flex items-center gap-2 text-[10px] ' + 'text-emerald-300/70'
                }
              >
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
