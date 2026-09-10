import { apiRequest } from '@/services/api/client';

export type PushSubscriptionPayload = {
  endpoint: string;

  expirationTime: number | null;

  keys: {
    p256dh: string;

    auth: string;
  };
};

type PushPublicKeyResponse = {
  success: true;

  data: {
    publicKey: string;
  };
};

type PushSubscriptionResponse = {
  success: true;

  data: {
    subscribed: boolean;
  };
};

type PushUnsubscriptionResponse = {
  success: true;

  data: {
    unsubscribed: boolean;
  };
};

export type PushDeliverySummary = {
  subscriptionCount: number;

  sent: number;

  failed: number;

  removed: number;
};

type TestPushResponse = {
  success: true;

  data: {
    delivery: PushDeliverySummary;
  };
};

export async function getPushPublicKey() {
  const response = await apiRequest<PushPublicKeyResponse>('/push/public-key');

  return response.data.publicKey;
}

export function savePushSubscription(payload: PushSubscriptionPayload) {
  return apiRequest<PushSubscriptionResponse>('/push/subscriptions', {
    method: 'POST',

    body: JSON.stringify(payload),
  });
}

export function deletePushSubscription(endpoint: string) {
  return apiRequest<PushUnsubscriptionResponse>('/push/subscriptions', {
    method: 'DELETE',

    body: JSON.stringify({
      endpoint,
    }),
  });
}

export async function sendTestPushNotification() {
  const response = await apiRequest<TestPushResponse>('/push/test', {
    method: 'POST',
  });

  return response.data.delivery;
}
