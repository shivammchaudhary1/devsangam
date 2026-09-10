import { PushReminderDispatchModel } from '../models/push-reminder-dispatch.model.ts';
import { UserModel } from '../models/user.model.ts';
import { sendPushNotificationToUser } from './push.service.ts';

const REMINDER_SWEEP_INTERVAL_MS = 30 * 1000;

let sweepInProgress = false;

type LocalReminderClock = {
  date: string;
  time: string;
};

function getDateTimePart(
  parts: Intl.DateTimeFormatPart[],
  type: string
): string | null {
  const part = parts.find((item) => item.type === type);

  return part?.value ?? null;
}

function getLocalReminderClock(
  date: Date,
  timezone: string
): LocalReminderClock | null {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date);

    const year = getDateTimePart(parts, 'year');
    const month = getDateTimePart(parts, 'month');
    const day = getDateTimePart(parts, 'day');
    const hour = getDateTimePart(parts, 'hour');
    const minute = getDateTimePart(parts, 'minute');

    if (!year || !month || !day || !hour || !minute) {
      return null;
    }

    return {
      date: `${year}-${month}-${day}`,
      time: `${hour}:${minute}`,
    };
  } catch {
    return null;
  }
}

function isDuplicateKeyError(error: unknown) {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return false;
  }

  return (error as { code?: unknown }).code === 11000;
}

async function claimReminder(
  userId: string,
  localDate: string,
  reminderTime: string
) {
  try {
    const dispatch = await PushReminderDispatchModel.create({
      userId,
      localDate,
      reminderTime,
    });

    return dispatch;
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return null;
    }

    throw error;
  }
}

async function processDuePushReminders() {
  const now = new Date();

  const users = await UserModel.find({
    'preferences.reminderEnabled': true,

    'preferences.reminderTime': {
      $ne: null,
    },
  }).select('_id preferences.reminderTime preferences.timezone');

  for (const user of users) {
    const preferences = user.preferences;

    if (!preferences) {
      continue;
    }

    const reminderTime = preferences.reminderTime;
    const timezone = preferences.timezone;

    if (!reminderTime || !timezone) {
      continue;
    }

    const localClock = getLocalReminderClock(now, timezone);

    if (!localClock || localClock.time !== reminderTime) {
      continue;
    }

    const dispatch = await claimReminder(
      user._id.toString(),
      localClock.date,
      reminderTime
    );

    if (!dispatch) {
      continue;
    }

    try {
      const delivery = await sendPushNotificationToUser(user._id.toString(), {
        title: 'Your Sadhana reminder',

        body: 'A quiet moment for your daily practice is ready when you are.',

        icon: '/pwa-192x192.png',

        badge: '/pwa-192x192.png',

        url: '/practice',

        tag: 'devsangam-daily-reminder',

        data: {
          kind: 'daily-reminder',
        },
      });

      if (delivery.sent > 0 || delivery.subscriptionCount === 0) {
        dispatch.sentAt = new Date();

        await dispatch.save();

        continue;
      }

      /*
       * All known subscriptions failed without being removed.
       * Release the claim so the next sweep in this reminder
       * minute can retry delivery.
       */
      await dispatch.deleteOne();
    } catch (error) {
      await dispatch.deleteOne().catch(() => undefined);

      console.error('Daily push reminder delivery failed:', error);
    }
  }
}

async function runPushReminderSweep() {
  if (sweepInProgress) {
    return;
  }

  sweepInProgress = true;

  try {
    await processDuePushReminders();
  } catch (error) {
    console.error('Push reminder sweep failed:', error);
  } finally {
    sweepInProgress = false;
  }
}

export function startPushReminderScheduler() {
  void runPushReminderSweep();

  const interval = setInterval(() => {
    void runPushReminderSweep();
  }, REMINDER_SWEEP_INTERVAL_MS);

  interval.unref();
}
