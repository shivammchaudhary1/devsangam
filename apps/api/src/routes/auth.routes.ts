import {
  forgotPassword,
  login,
  logout,
  refresh,
  register,
  resetPassword,
} from '../controllers/auth.controller.ts';
import {
  forgotPasswordRateLimiter,
  loginRateLimiter,
  registerRateLimiter,
  resetPasswordRateLimiter,
} from '../middleware/rate-limiters.ts';
import { validateBody } from '../middleware/validate-body.ts';
import { forgotPasswordSchema } from '../validators/auth/forgot-password.schema.ts';
import { loginSchema } from '../validators/auth/login.schema.ts';
import { registerSchema } from '../validators/auth/register.schema.ts';
import { resetPasswordSchema } from '../validators/auth/reset-password.schema.ts';
import { Router } from 'express';

export const authRouter = Router();

authRouter.post(
  '/register',

  registerRateLimiter,

  validateBody(registerSchema),

  register
);

authRouter.post(
  '/login',

  loginRateLimiter,

  validateBody(loginSchema),

  login
);

authRouter.post(
  '/refresh',

  refresh
);

authRouter.post(
  '/logout',

  logout
);

authRouter.post(
  '/forgot-password',

  forgotPasswordRateLimiter,

  validateBody(forgotPasswordSchema),

  forgotPassword
);

authRouter.post(
  '/reset-password',

  resetPasswordRateLimiter,

  validateBody(resetPasswordSchema),

  resetPassword
);
