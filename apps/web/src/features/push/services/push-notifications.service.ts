import type { PushSubscriptionPayload } from '../api/push.api';
import {
  deletePushSubscription,
  getPushPublicKey,
  savePushSubscription,
} from '../api/push.api';

export type PushSupportStatus = {
  supported: boolean;

  reason: string | null;
};

function getUnsupportedReason() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'Push notifications are only available in a browser.';
  }

  if (!window.isSecureContext) {
    return 'Push notifications require HTTPS or localhost.';
  }

  if (!('serviceWorker' in navigator)) {
    return 'This browser does not support service workers.';
  }

  if (!('PushManager' in window)) {
    return 'This browser does not support Web Push.';
  }

  if (!('Notification' in window)) {
    return 'This browser does not support notifications.';
  }

  return null;
}

export function getPushSupportStatus(): PushSupportStatus {
  const reason = getUnsupportedReason();

  return {
    supported: reason === null,

    reason,
  };
}

function urlBase64ToArrayBuffer(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);

  const normalized = (value + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(normalized);

  const bytes = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    bytes[index] = rawData.charCodeAt(index);
  }

  return bytes.buffer as ArrayBuffer;
}

function serializePushSubscription(
  subscription: PushSubscription
): PushSubscriptionPayload {
  const json = subscription.toJSON();

  const p256dh = json.keys?.p256dh;

  const auth = json.keys?.auth;

  if (!p256dh || !auth) {
    throw new Error('The browser did not provide valid push encryption keys.');
  }

  return {
    endpoint: subscription.endpoint,

    expirationTime: subscription.expirationTime ?? null,

    keys: {
      p256dh,

      auth,
    },
  };
}

async function getRegistrationForSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();

  if (registration) {
    return registration;
  }

  /*
   * vite-plugin-pwa does not run the generated
   * service worker during the normal Vite dev server.
   * Avoid waiting forever on navigator.serviceWorker.ready
   * in that environment.
   */
  if (import.meta.env.DEV) {
    throw new Error(
      'Push notifications require the production PWA. Build and preview the app before testing.'
    );
  }

  return navigator.serviceWorker.ready;
}

export async function getCurrentPushSubscription() {
  const support = getPushSupportStatus();

  if (!support.supported) {
    return null;
  }

  const registration = await navigator.serviceWorker.getRegistration();

  if (!registration) {
    return null;
  }

  return registration.pushManager.getSubscription();
}

export async function synchronizeExistingPushSubscription() {
  const support = getPushSupportStatus();

  if (!support.supported || Notification.permission !== 'granted') {
    return null;
  }

  const subscription = await getCurrentPushSubscription();

  if (!subscription) {
    return null;
  }

  await savePushSubscription(serializePushSubscription(subscription));

  return subscription;
}

export async function enablePushNotifications() {
  const support = getPushSupportStatus();

  if (!support.supported) {
    throw new Error(support.reason ?? 'Push notifications are not supported.');
  }

  if (Notification.permission === 'denied') {
    throw new Error(
      'Notifications are blocked in this browser. Re-enable them in the site permission settings.'
    );
  }

  const permission =
    Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission();

  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.');
  }

  const registration = await getRegistrationForSubscription();

  const publicKey = await getPushPublicKey();

  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,

      applicationServerKey: urlBase64ToArrayBuffer(publicKey),
    });
  }

  await savePushSubscription(serializePushSubscription(subscription));

  return subscription;
}

async function removeBrowserSubscription(subscription: PushSubscription) {
  const endpoint = subscription.endpoint;

  await subscription.unsubscribe();

  try {
    await deletePushSubscription(endpoint);
  } catch {
    /*
     * The browser subscription is already revoked locally.
     * A stale server endpoint will be removed automatically
     * after the push service returns 404/410.
     */
  }
}

export async function disablePushNotifications() {
  const support = getPushSupportStatus();

  if (!support.supported) {
    return false;
  }

  const subscription = await getCurrentPushSubscription();

  if (!subscription) {
    return false;
  }

  await removeBrowserSubscription(subscription);

  return true;
}

export async function cleanupPushSubscriptionForLogout() {
  const support = getPushSupportStatus();

  if (!support.supported) {
    return;
  }

  try {
    const subscription = await getCurrentPushSubscription();

    if (!subscription) {
      return;
    }

    const endpoint = subscription.endpoint;

    await subscription.unsubscribe();

    /*
     * Local unsubscription protects privacy immediately.
     * Server cleanup is best-effort so logout is never
     * blocked by a slow or unavailable network request.
     */
    void deletePushSubscription(endpoint).catch(() => undefined);
  } catch {
    /*
     * Logout must still proceed if push cleanup fails.
     * Never retain authentication just because the
     * browser push service is unavailable.
     */
  }
}
