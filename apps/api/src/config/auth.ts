export const AUTH = {
  issuer: 'devsangam-api',
  audience: 'devsangam-web',

  accessToken: {
    ttl: '15m',
    maxAgeMs: 15 * 60 * 1000,
  },

  refreshToken: {
    ttl: '30d',
    maxAgeMs: 30 * 24 * 60 * 60 * 1000,
  },

  cookies: {
    access: 'ds_access',
    refresh: 'ds_refresh',
  },
} as const;
