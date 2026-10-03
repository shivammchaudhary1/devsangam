export function validateProductionEnvironment(
  env: NodeJS.ProcessEnv = process.env
) {
  if (env.NODE_ENV !== 'production') return;
  const errors: string[] = [];
  const required = (keys: string[]) =>
    keys.forEach((key) => {
      if (!env[key]?.trim()) errors.push(key);
    });
  required([
    'MONGODB_URI',
    'WEB_ORIGIN',
    'ACCESS_TOKEN_SECRET',
    'REFRESH_TOKEN_SECRET',
  ]);
  try {
    const url = new URL(env.WEB_ORIGIN || '');
    if (url.protocol !== 'https:' || url.origin !== env.WEB_ORIGIN)
      errors.push('WEB_ORIGIN (HTTPS origin only)');
  } catch {
    errors.push('WEB_ORIGIN (invalid)');
  }
  for (const key of ['ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET']) {
    if ((env[key]?.length ?? 0) < 48)
      errors.push(`${key} (minimum 48 characters)`);
  }
  if (env.ACCESS_TOKEN_SECRET === env.REFRESH_TOKEN_SECRET)
    errors.push('distinct token secrets');
  if (
    env.PORT &&
    (!/^\d+$/.test(env.PORT) ||
      Number(env.PORT) < 1 ||
      Number(env.PORT) > 65535)
  )
    errors.push('PORT');
  if (env.TRUST_PROXY_HOPS && !/^[0-3]$/.test(env.TRUST_PROXY_HOPS))
    errors.push('TRUST_PROXY_HOPS (0–3)');
  for (const key of ['PAYMENTS_ENABLED', 'PRIVATE_DOWNLOADS_ENABLED']) {
    if (env[key] && !['true', 'false'].includes(env[key]!)) errors.push(key);
  }
  if (env.PAYMENTS_ENABLED === 'true')
    required([
      'RAZORPAY_KEY_ID',
      'RAZORPAY_KEY_SECRET',
      'RAZORPAY_WEBHOOK_SECRET',
    ]);
  if (env.PRIVATE_DOWNLOADS_ENABLED === 'true')
    required(['AZURE_STORAGE_CONNECTION_STRING', 'AZURE_PRIVATE_CONTAINER']);
  const vapid = ['VAPID_SUBJECT', 'VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY'];
  if (vapid.some((key) => env[key])) required(vapid);
  const email = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
  if (email.some((key) => env[key])) required(email);
  if (
    env.EMAIL_PORT &&
    (!/^\d+$/.test(env.EMAIL_PORT) ||
      Number(env.EMAIL_PORT) < 1 ||
      Number(env.EMAIL_PORT) > 65535)
  )
    errors.push('EMAIL_PORT');
  const cloudinary = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];
  if (!env.CLOUDINARY_URL && cloudinary.some((key) => env[key]))
    required(cloudinary);
  if (errors.length)
    throw new Error(
      `Invalid production configuration: ${[...new Set(errors)].join(', ')}`
    );
}
