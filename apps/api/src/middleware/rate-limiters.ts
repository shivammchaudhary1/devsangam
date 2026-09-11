import { rateLimit } from 'express-rate-limit';

const rateLimitResponse = {
  success: false,

  error: {
    code: 'TOO_MANY_REQUESTS',
    message: 'Too many requests. Please try again later.',
  },
};

const commonOptions = {
  standardHeaders: 'draft-8' as const,
  legacyHeaders: false,
  message: rateLimitResponse,
};

export const apiRateLimiter = rateLimit({
  ...commonOptions,

  windowMs: 15 * 60 * 1000,

  limit: 600,
});

export const registerRateLimiter = rateLimit({
  ...commonOptions,

  windowMs: 60 * 60 * 1000,

  limit: 10,
});

export const loginRateLimiter = rateLimit({
  ...commonOptions,

  windowMs: 15 * 60 * 1000,

  limit: 10,

  skipSuccessfulRequests: true,
});

export const forgotPasswordRateLimiter = rateLimit({
  ...commonOptions,

  windowMs: 15 * 60 * 1000,

  limit: 5,
});

export const resetPasswordRateLimiter = rateLimit({
  ...commonOptions,

  windowMs: 15 * 60 * 1000,

  limit: 10,
});
