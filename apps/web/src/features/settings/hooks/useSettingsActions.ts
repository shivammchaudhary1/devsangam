import { getSettingsErrorMessage } from '../utils/settings-formatters';
import { useToast } from '@/components/feedback/useToast';
import {
  changeCurrentUserPassword,
  updateCurrentUser,
} from '@/features/auth/api/auth.api';
import type { AuthUser } from '@/features/auth/types/auth.types';
import { writePracticePreferences } from '@/features/practice/storage/practice-preferences.storage';
import { type FormEvent, useMemo, useState } from 'react';

const PRACTICE_TARGET_OPTIONS = [108, 216, 1008] as const;

export type PendingSetting =
  | 'target'
  | 'timezone'
  | 'sound'
  | 'haptic'
  | 'password'
  | null;

type UseSettingsActionsOptions = {
  user: AuthUser;
  setUser: (user: AuthUser) => void;
};

export function useSettingsActions({
  user,
  setUser,
}: UseSettingsActionsOptions) {
  const toast = useToast();

  const [pendingSetting, setPendingSetting] = useState<PendingSetting>(null);

  const [currentPassword, setCurrentPassword] = useState('');

  const [newPassword, setNewPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPasswords, setShowPasswords] = useState(false);

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

      toast.success('Default practice target updated.');
    } catch (error) {
      toast.error(
        getSettingsErrorMessage(error, 'Default target could not be updated.')
      );
    } finally {
      setPendingSetting(null);
    }
  }

  async function handleUseDeviceTimezone() {
    const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    if (!deviceTimezone) {
      toast.error('Your browser did not provide a timezone.');

      return;
    }

    if (deviceTimezone === user.preferences.timezone) {
      toast.info('Your account already uses this device timezone.');

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

      toast.success('Timezone updated to this device.');
    } catch (error) {
      toast.error(
        getSettingsErrorMessage(error, 'Timezone could not be updated.')
      );
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

      toast.success(
        nextValue ? 'Practice sounds enabled.' : 'Practice sounds disabled.'
      );
    } catch (error) {
      toast.error(
        getSettingsErrorMessage(error, 'Sound preference could not be updated.')
      );
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

      toast.success(
        nextValue ? 'Haptic feedback enabled.' : 'Haptic feedback disabled.'
      );
    } catch (error) {
      toast.error(
        getSettingsErrorMessage(
          error,
          'Haptic preference could not be updated.'
        )
      );
    } finally {
      setPendingSetting(null);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!currentPassword) {
      toast.error('Enter your current password.');

      return;
    }

    if (newPassword.length < 10) {
      toast.error('New password must contain at least 10 characters.');

      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.');

      return;
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from your current password.');

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

      toast.success('Password updated. Other signed-in sessions were closed.');
    } catch (error) {
      toast.error(
        getSettingsErrorMessage(error, 'Password could not be updated.')
      );
    } finally {
      setPendingSetting(null);
    }
  }

  return {
    confirmPassword,
    currentPassword,
    handleHapticToggle,
    handlePasswordSubmit,
    handleSoundToggle,
    handleTargetChange,
    handleUseDeviceTimezone,
    newPassword,
    pendingSetting,
    setConfirmPassword,
    setCurrentPassword,
    setNewPassword,
    setShowPasswords,
    showPasswords,
    targetOptions,
  };
}
