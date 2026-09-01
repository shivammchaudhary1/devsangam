import { PracticeJourneyCard } from '../components/PracticeJourneyCard';
import { ProfileBackground } from '../components/ProfileBackground';
import { ProfileHeader } from '../components/ProfileHeader';
import { ProfileIdentityCard } from '../components/ProfileIdentityCard';
import { ProfileStreakCard } from '../components/ProfileStreakCard';
import { getErrorMessage, getInitials } from '../utils/profile-formatters';
import { useToast } from '@/components/feedback/useToast';
import { updateCurrentUser } from '@/features/auth/api/auth.api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { AuthUser } from '@/features/auth/types/auth.types';
import { useInsightsOverview } from '@/features/insights/hooks/useInsightsOverview';
import { useMemo, useState } from 'react';

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
  const toast = useToast();

  const [editing, setEditing] = useState(false);

  const [editedName, setEditedName] = useState('');

  const [saving, setSaving] = useState(false);

  const {
    data: insights,
    isLoading: insightsLoading,
    isError: insightsError,
  } = useInsightsOverview({
    range: 'all',
    timezone: user.preferences.timezone,
  });

  const initials = useMemo(() => getInitials(user.name), [user.name]);

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
      toast.error('Name must contain at least 2 characters.');

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
    <main className="relative min-h-full overflow-hidden bg-[var(--ds-obsidian)] px-4 pb-28 pt-5 text-[var(--ds-cream)] md:px-6 md:pb-9 md:pt-6 lg:px-8">
      <ProfileBackground />

      <div className="relative z-10 mx-auto w-full max-w-[1080px]">
        <ProfileHeader />

        <section className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
          <ProfileIdentityCard
            user={user}
            initials={initials}
            editing={editing}
            editedName={editedName}
            saving={saving}
            onStartEditing={startEditing}
            onCancelEditing={cancelEditing}
            onEditedNameChange={setEditedName}
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
