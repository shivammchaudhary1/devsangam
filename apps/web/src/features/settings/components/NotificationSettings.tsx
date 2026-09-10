import { getSettingsErrorMessage } from '../utils/settings-formatters';
import { SettingsCard, SettingsRow } from './SettingsCard';
import { SettingToggle } from './SettingToggle';
import { useToast } from '@/components/feedback/useToast';
import { updateCurrentUser } from '@/features/auth/api/auth.api';
import type { AuthUser } from '@/features/auth/types/auth.types';
import { sendTestPushNotification } from '@/features/push/api/push.api';
import {
  disablePushNotifications,
  enablePushNotifications,
  getCurrentPushSubscription,
  getPushSupportStatus,
  synchronizeExistingPushSubscription,
} from '@/features/push/services/push-notifications.service';
import { BellRing, Loader2, Send } from 'lucide-react';
import { useEffect, useState } from 'react';

type NotificationSettingsProps = {
  user: AuthUser;

  setUser: (user: AuthUser) => void;
};

type PermissionState = NotificationPermission | 'unsupported';

export function NotificationSettings({
  user,
  setUser,
}: NotificationSettingsProps) {
  const toast = useToast();

  const support = getPushSupportStatus();

  const [deviceEnabled, setDeviceEnabled] = useState(false);

  const [checkingDevice, setCheckingDevice] = useState(true);

  const [devicePending, setDevicePending] = useState(false);

  const [reminderPending, setReminderPending] = useState(false);

  const [reminderTimePending, setReminderTimePending] = useState(false);

  const [testPending, setTestPending] = useState(false);

  const [permission, setPermission] = useState<PermissionState>(() =>
    support.supported ? Notification.permission : 'unsupported'
  );

  useEffect(() => {
    let cancelled = false;

    async function refreshDeviceState() {
      if (!support.supported) {
        if (!cancelled) {
          setPermission('unsupported');
          setDeviceEnabled(false);
          setCheckingDevice(false);
        }

        return;
      }

      try {
        const subscription = await getCurrentPushSubscription();

        if (!cancelled) {
          setPermission(Notification.permission);
          setDeviceEnabled(Boolean(subscription));
        }

        if (subscription && Notification.permission === 'granted') {
          void synchronizeExistingPushSubscription().catch(() => {
            // A later reconnect or manual action will retry reconciliation.
          });
        }
      } finally {
        if (!cancelled) {
          setCheckingDevice(false);
        }
      }
    }

    void refreshDeviceState();

    window.addEventListener('online', refreshDeviceState);

    return () => {
      cancelled = true;

      window.removeEventListener('online', refreshDeviceState);
    };
  }, [support.supported]);

  async function handleDeviceToggle() {
    if (!support.supported) {
      toast.error(support.reason ?? 'Push notifications are not supported.');

      return;
    }

    setDevicePending(true);

    try {
      if (deviceEnabled) {
        await disablePushNotifications();

        setDeviceEnabled(false);
        setPermission(Notification.permission);

        toast.success('Notifications disabled on this device.');

        return;
      }

      await enablePushNotifications();

      setDeviceEnabled(true);
      setPermission(Notification.permission);

      toast.success('Notifications enabled on this device.');
    } catch (error) {
      setPermission(
        support.supported ? Notification.permission : 'unsupported'
      );

      toast.error(
        getSettingsErrorMessage(
          error,
          'Notifications could not be updated on this device.'
        )
      );
    } finally {
      setDevicePending(false);
    }
  }

  async function handleReminderToggle() {
    const nextValue = !user.preferences.reminderEnabled;

    if (nextValue && !user.preferences.reminderTime) {
      toast.info('Choose a daily reminder time first.');

      return;
    }

    setReminderPending(true);

    try {
      const updatedUser = await updateCurrentUser({
        preferences: {
          reminderEnabled: nextValue,
        },
      });

      setUser(updatedUser);

      toast.success(
        nextValue
          ? 'Daily Sadhana reminder enabled.'
          : 'Daily Sadhana reminder disabled.'
      );
    } catch (error) {
      toast.error(
        getSettingsErrorMessage(
          error,
          'Daily reminder preference could not be updated.'
        )
      );
    } finally {
      setReminderPending(false);
    }
  }

  async function handleReminderTimeChange(value: string) {
    if (value === (user.preferences.reminderTime ?? '')) {
      return;
    }

    setReminderTimePending(true);

    try {
      const updatedUser = await updateCurrentUser({
        preferences: {
          reminderTime: value || null,

          ...(value
            ? {}
            : {
                reminderEnabled: false,
              }),
        },
      });

      setUser(updatedUser);

      toast.success(
        value ? 'Daily reminder time updated.' : 'Daily reminder cleared.'
      );
    } catch (error) {
      toast.error(
        getSettingsErrorMessage(error, 'Reminder time could not be updated.')
      );
    } finally {
      setReminderTimePending(false);
    }
  }

  async function handleSendTest() {
    setTestPending(true);

    try {
      const delivery = await sendTestPushNotification();

      toast.success(
        delivery.sent === 1
          ? 'Test notification sent.'
          : `Test notification sent to ${delivery.sent} devices.`
      );
    } catch (error) {
      toast.error(
        getSettingsErrorMessage(error, 'Test notification could not be sent.')
      );
    } finally {
      setTestPending(false);
    }
  }

  const deviceDescription = (() => {
    if (!support.supported) {
      return support.reason ?? 'Web Push is unavailable in this browser.';
    }

    if (permission === 'denied') {
      return 'Blocked by the browser. Re-enable notifications in site permissions.';
    }

    if (deviceEnabled) {
      return 'This browser can receive DevSangam notifications when the app is closed.';
    }

    return 'Allow this browser to receive DevSangam notifications when the app is closed.';
  })();

  return (
    <SettingsCard
      icon={<BellRing size={16} strokeWidth={1.7} />}
      title="Notifications & Reminders"
      description="Control Web Push on this device and your daily Sadhana reminder."
    >
      <SettingsRow label="Device Notifications" description={deviceDescription}>
        <SettingToggle
          enabled={deviceEnabled}
          pending={checkingDevice || devicePending}
          disabled={!support.supported || permission === 'denied'}
          onToggle={handleDeviceToggle}
        />
      </SettingsRow>

      <SettingsRow
        label="Daily Sadhana Reminder"
        description={
          'Send a gentle reminder every day at your chosen time ' +
          `in ${user.preferences.timezone}.`
        }
      >
        <SettingToggle
          enabled={user.preferences.reminderEnabled}
          pending={reminderPending}
          onToggle={handleReminderToggle}
        />
      </SettingsRow>

      <SettingsRow
        label="Reminder Time"
        description="Choose the local time for your daily reminder."
      >
        <div className="flex items-center gap-2">
          {reminderTimePending ? (
            <Loader2
              size={13}
              className={'animate-spin ' + 'text-[var(--ds-gold)]'}
            />
          ) : null}

          <input
            type="time"
            value={user.preferences.reminderTime ?? ''}
            disabled={reminderTimePending}
            onChange={(event) =>
              void handleReminderTimeChange(event.target.value)
            }
            aria-label="Daily reminder time"
            className={
              'h-9 rounded-[7px] border ' +
              'border-[var(--ds-border-soft)] ' +
              'bg-[var(--ds-night)] px-3 text-[11px] ' +
              'text-[var(--ds-text)] outline-none transition ' +
              'focus:border-[var(--ds-border-gold)] ' +
              'disabled:cursor-not-allowed disabled:opacity-60'
            }
          />
        </div>
      </SettingsRow>

      <SettingsRow
        label="Test Notification"
        description="Send a test push to your currently enabled DevSangam devices."
        last
      >
        <button
          type="button"
          disabled={!deviceEnabled || checkingDevice || testPending}
          onClick={() => void handleSendTest()}
          className={
            'ds-secondary-button inline-flex min-h-9 items-center ' +
            'justify-center gap-2 px-3 text-[9px] ' +
            'disabled:cursor-not-allowed disabled:opacity-50'
          }
        >
          {testPending ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Send size={13} strokeWidth={1.8} />
          )}

          Send Test
        </button>
      </SettingsRow>
    </SettingsCard>
  );
}
