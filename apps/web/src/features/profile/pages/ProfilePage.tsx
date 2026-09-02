import { PracticeJourneyCard } from '../components/PracticeJourneyCard';
import { ProfileBackground } from '../components/ProfileBackground';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileIdentityCard } from '../components/ProfileIdentityCard';
import { ProfileStreakCard } from '../components/ProfileStreakCard';
import { getErrorMessage, getInitials } from '../utils/profile-formatters';
import { useToast } from '@/components/feedback/useToast';
import {
  deleteCurrentUserAvatar,
  updateCurrentUser,
  uploadCurrentUserAvatar,
} from '@/features/auth/api/auth.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type {
  AuthUser,
  ProfileIntention,
} from '@/features/auth/types/auth.types';
import { useInsightsOverview } from '@/features/insights/hooks/useInsightsOverview';
import { useEffect, useMemo, useState } from 'react';

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

type ProfileContentProps = {
  user: AuthUser;
  setUser: (user: AuthUser) => void;
};

type AvatarSelection = {
  file: File;
  previewUrl: string;
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
  const toast = useToast();

  const [editing, setEditing] = useState(false);

  const [editedName, setEditedName] = useState('');

  const [editedBio, setEditedBio] = useState('');

  const [editedIntention, setEditedIntention] = useState<ProfileIntention | ''>(
    ''
  );

  const [saving, setSaving] = useState(false);

  const [avatarSelection, setAvatarSelection] =
    useState<AvatarSelection | null>(null);

  const [avatarUploading, setAvatarUploading] = useState(false);

  const [avatarRemoving, setAvatarRemoving] = useState(false);

  const {
    data: insights,
    isLoading: insightsLoading,
    isError: insightsError,
  } = useInsightsOverview({
    range: 'all',

    timezone: user.preferences.timezone,
  });

  const initials = useMemo(() => getInitials(user.name), [user.name]);

  /*
   * The backend uses a deterministic
   * Cloudinary public ID when replacing
   * an avatar. Adding updatedAt to the
   * displayed URL prevents a stale browser
   * image from remaining after replacement.
   */
  const currentAvatarUrl = useMemo(() => {
    if (!user.avatar) {
      return null;
    }

    const separator = user.avatar.includes('?') ? '&' : '?';

    return (
      `${user.avatar}${separator}` + `v=${encodeURIComponent(user.updatedAt)}`
    );
  }, [user.avatar, user.updatedAt]);

  const displayedAvatarUrl = avatarSelection?.previewUrl ?? currentAvatarUrl;

  const avatarBusy = avatarUploading || avatarRemoving;

  useEffect(() => {
    return () => {
      if (avatarSelection) {
        URL.revokeObjectURL(avatarSelection.previewUrl);
      }
    };
  }, [avatarSelection]);

  function startEditing() {
    setEditedName(user.name);
    setEditedBio(user.bio ?? '');
    setEditedIntention(user.intention ?? '');
    setEditing(true);
  }

  function cancelEditing() {
    setEditedName('');
    setEditedBio('');
    setEditedIntention('');
    setEditing(false);
  }

  function selectAvatarFile(file: File) {
    if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
      toast.error('Profile photo must be a JPEG, PNG, or WebP image.');

      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error('Profile photo cannot exceed 5 MB.');

      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setAvatarSelection({
      file,
      previewUrl,
    });
  }

  function cancelAvatarSelection() {
    setAvatarSelection(null);
  }

  async function uploadAvatar() {
    if (!avatarSelection) {
      return;
    }

    setAvatarUploading(true);

    try {
      const updatedUser = await uploadCurrentUserAvatar(avatarSelection.file);

      setUser(updatedUser);
      setAvatarSelection(null);

      toast.success('Profile photo updated successfully.');
    } catch (error) {
      toast.error(
        getErrorMessage(error, 'Profile photo could not be uploaded.')
      );
    } finally {
      setAvatarUploading(false);
    }
  }

  async function removeAvatar() {
    if (!user.avatar) {
      return;
    }

    setAvatarRemoving(true);

    try {
      const updatedUser = await deleteCurrentUserAvatar();

      setUser(updatedUser);
      setAvatarSelection(null);

      toast.success('Profile photo removed.');
    } catch (error) {
      toast.error(
        getErrorMessage(error, 'Profile photo could not be removed.')
      );
    } finally {
      setAvatarRemoving(false);
    }
  }

  async function saveProfile() {
    const name = editedName.trim();
    const bio = editedBio.trim() || null;
    const intention = editedIntention || null;

    if (name.length < 2) {
      toast.error('Name must contain at least 2 characters.');

      return;
    }

    if (name.length > 80) {
      toast.error('Name cannot exceed 80 characters.');

      return;
    }

    if (editedBio.trim().length > 240) {
      toast.error('Bio cannot exceed 240 characters.');

      return;
    }

    const unchanged =
      name === user.name && bio === user.bio && intention === user.intention;

    if (unchanged) {
      setEditing(false);

      return;
    }

    setSaving(true);

    try {
      const updatedUser = await updateCurrentUser({
        name,
        bio,
        intention,
      });

      setUser(updatedUser);
      setEditing(false);

      toast.success('Profile updated successfully.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Profile could not be updated.'));
    } finally {
      setSaving(false);
    }
  }

  const summary = insights?.summary;

  const insightsUnavailable = insightsLoading || insightsError;

  return (
    <main
      className={
        'relative min-h-full overflow-hidden ' +
        'bg-[var(--ds-obsidian)] px-4 pb-28 pt-5 ' +
        'text-[var(--ds-cream)] md:px-6 md:pb-9 ' +
        'md:pt-6 lg:px-8'
      }
    >
      <ProfileBackground />

      <div className={'relative z-10 mx-auto w-full max-w-[1080px]'}>
        <ProfileHeader />

        <section
          className={
            'mt-5 grid gap-4 ' +
            'lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]'
          }
        >
          <ProfileIdentityCard
            user={user}
            initials={initials}
            avatarUrl={displayedAvatarUrl}
            avatarSelectionActive={Boolean(avatarSelection)}
            avatarBusy={avatarBusy}
            avatarUploading={avatarUploading}
            avatarRemoving={avatarRemoving}
            editing={editing}
            editedName={editedName}
            editedBio={editedBio}
            editedIntention={editedIntention}
            saving={saving}
            onAvatarFileSelected={selectAvatarFile}
            onUploadAvatar={uploadAvatar}
            onCancelAvatarSelection={cancelAvatarSelection}
            onRemoveAvatar={removeAvatar}
            onStartEditing={startEditing}
            onCancelEditing={cancelEditing}
            onEditedNameChange={setEditedName}
            onEditedBioChange={setEditedBio}
            onEditedIntentionChange={setEditedIntention}
            onSave={saveProfile}
          />

          <ProfileStreakCard
            currentStreak={summary?.currentStreakDays ?? 0}
            longestStreak={summary?.longestStreakDays ?? 0}
            unavailable={insightsUnavailable}
          />
        </section>

        <section className="mt-4">
          <PracticeJourneyCard
            totalChants={summary?.totalChants ?? 0}
            totalMalas={summary?.totalMalas ?? 0}
            totalCompletedSessions={summary?.totalCompletedSessions ?? 0}
            totalPracticeSeconds={summary?.totalPracticeSeconds ?? 0}
            unavailable={insightsUnavailable}
          />
        </section>
      </div>
    </main>
  );
}
