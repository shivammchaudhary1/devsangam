import { getWebPushClient } from '../config/web-push.ts';
import { PushSubscriptionModel } from '../models/push-subscription.model.ts';
import { createHash } from 'node:crypto';
import type { PushSubscription as WebPushSubscription } from 'web-push';

type BrowserPushSubscription = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

type SavePushSubscriptionInput = {
  userId: string;
  subscription: BrowserPushSubscription;
  userAgent: string | null;
};

export type PushNotificationPayload = {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: Record<string, unknown>;
};

export type PushDeliverySummary = {
  subscriptionCount: number;
  sent: number;
  failed: number;
  removed: number;
};

function hashPushEndpoint(endpoint: string) {
  return createHash('sha256').update(endpoint).digest('hex');
}

function getPushErrorStatusCode(error: unknown) {
  if (typeof error !== 'object' || error === null || !('statusCode' in error)) {
    return null;
  }

  const statusCode = (
    error as {
      statusCode?: unknown;
    }
  ).statusCode;

  return typeof statusCode === 'number' ? statusCode : null;
}

export async function savePushSubscription({
  userId,
  subscription,
  userAgent,
}: SavePushSubscriptionInput) {
  const endpointHash = hashPushEndpoint(subscription.endpoint);

  const expirationTime =
    subscription.expirationTime === undefined ||
    subscription.expirationTime === null
      ? null
      : new Date(subscription.expirationTime);

  await PushSubscriptionModel.findOneAndUpdate(
    {
      endpointHash,
    },
    {
      $set: {
        userId,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        expirationTime,
        userAgent,
        lastSeenAt: new Date(),
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );
}

export async function removePushSubscription(userId: string, endpoint: string) {
  const endpointHash = hashPushEndpoint(endpoint);

  const result = await PushSubscriptionModel.deleteOne({
    userId,
    endpointHash,
  });

  return result.deletedCount > 0;
}

export async function sendPushNotificationToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<PushDeliverySummary> {
  const now = new Date();

  /*
   * Some push services expose an
   * expiration time. Remove subscriptions
   * that are already known to be expired
   * before attempting delivery.
   */
  await PushSubscriptionModel.deleteMany({
    userId,

    expirationTime: {
      $ne: null,
      $lte: now,
    },
  });

  const subscriptions = await PushSubscriptionModel.find({
    userId,
  });

  if (subscriptions.length === 0) {
    return {
      subscriptionCount: 0,
      sent: 0,
      failed: 0,
      removed: 0,
    };
  }

  const webPush = getWebPushClient();

  const serializedPayload = JSON.stringify(payload);

  const results = await Promise.all(
    subscriptions.map(async (subscription) => {
      const keys = subscription.keys;

      /*
       * A stored subscription without encryption
       * keys cannot receive Web Push messages.
       * Treat it as invalid so it is cleaned up below.
       */
      if (!keys?.p256dh || !keys.auth) {
        return {
          sent: false,
          invalid: true,
          endpointHash: subscription.endpointHash,
        };
      }

      const browserSubscription: WebPushSubscription = {
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime?.getTime() ?? null,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      };

      try {
        await webPush.sendNotification(browserSubscription, serializedPayload, {
          TTL: 60 * 60,
          urgency: 'normal',
        });

        return {
          sent: true,
          invalid: false,
          endpointHash: subscription.endpointHash,
        };
      } catch (error) {
        const statusCode = getPushErrorStatusCode(error);

        const invalid = statusCode === 404 || statusCode === 410;

        /*
         * Never log the subscription
         * endpoint or encryption keys.
         */
        if (!invalid) {
          console.error('Web Push delivery failed.', {
            statusCode,
          });
        }

        return {
          sent: false,
          invalid,
          endpointHash: subscription.endpointHash,
        };
      }
    })
  );

  const invalidEndpointHashes = results
    .filter((result) => result.invalid)
    .map((result) => result.endpointHash);

  if (invalidEndpointHashes.length > 0) {
    await PushSubscriptionModel.deleteMany({
      userId,

      endpointHash: {
        $in: invalidEndpointHashes,
      },
    });
  }

  const sent = results.filter((result) => result.sent).length;

  const removed = invalidEndpointHashes.length;

  return {
    subscriptionCount: subscriptions.length,

    sent,

    failed: subscriptions.length - sent,

    removed,
  };
}
