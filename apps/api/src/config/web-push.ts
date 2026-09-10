import webPush from 'web-push';

let configured = false;

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function validateVapidSubject(subject: string) {
  if (!subject.startsWith('mailto:') && !subject.startsWith('https://')) {
    throw new Error('VAPID_SUBJECT must be a mailto: address or an HTTPS URL.');
  }
}

export function getVapidPublicKey() {
  return getRequiredEnv('VAPID_PUBLIC_KEY');
}

export function getWebPushClient() {
  if (configured) {
    return webPush;
  }

  const subject = getRequiredEnv('VAPID_SUBJECT');
  const publicKey = getRequiredEnv('VAPID_PUBLIC_KEY');
  const privateKey = getRequiredEnv('VAPID_PRIVATE_KEY');

  validateVapidSubject(subject);

  webPush.setVapidDetails(subject, publicKey, privateKey);

  configured = true;

  return webPush;
}
