import { getVapidPublicKey } from '../config/web-push.ts';
import {
  removePushSubscription,
  savePushSubscription,
  sendPushNotificationToUser,
} from '../services/push.service.ts';
import { AppError } from '../utils/app-error.ts';
import type { SubscribePushInput } from '../validators/push/subscribe-push.schema.ts';
import type { UnsubscribePushInput } from '../validators/push/unsubscribe-push.schema.ts';
import type { Request, Response } from 'express';

function getAuthenticatedUserId(request: Request) {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError(
      401,
      'AUTHENTICATION_REQUIRED',
      'Authentication is required.'
    );
  }

  return userId;
}

function getRequestUserAgent(request: Request) {
  const value = request.get('user-agent');

  if (!value) {
    return null;
  }

  return value.slice(0, 512);
}

export async function getPushPublicKey(request: Request, response: Response) {
  getAuthenticatedUserId(request);

  response.json({
    success: true,

    data: {
      publicKey: getVapidPublicKey(),
    },
  });
}

export async function subscribeToPush(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);

  const input = request.body as SubscribePushInput;

  await savePushSubscription({
    userId,

    subscription: input,

    userAgent: getRequestUserAgent(request),
  });

  response.status(201).json({
    success: true,

    data: {
      subscribed: true,
    },
  });
}

export async function unsubscribeFromPush(
  request: Request,
  response: Response
) {
  const userId = getAuthenticatedUserId(request);

  const { endpoint } = request.body as UnsubscribePushInput;

  const removed = await removePushSubscription(userId, endpoint);

  response.json({
    success: true,

    data: {
      unsubscribed: removed,
    },
  });
}

export async function sendTestPush(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);

  const delivery = await sendPushNotificationToUser(userId, {
    title: 'DevSangam',

    body: 'Push notifications are working on this device.',

    icon: '/pwa-192x192.png',

    badge: '/pwa-192x192.png',

    url: '/settings',

    tag: 'devsangam-test',
  });

  if (delivery.subscriptionCount === 0) {
    throw new AppError(
      409,
      'PUSH_SUBSCRIPTION_NOT_FOUND',
      'Enable notifications on this device before sending a test notification.'
    );
  }

  if (delivery.sent === 0) {
    throw new AppError(
      502,
      'PUSH_DELIVERY_FAILED',
      'The test notification could not be delivered.',
      {
        failed: delivery.failed,

        removed: delivery.removed,
      }
    );
  }

  response.json({
    success: true,

    data: {
      delivery,
    },
  });
}
