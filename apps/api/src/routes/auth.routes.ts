import { Router } from 'express';

import {
  login,
  logout,
  refresh,
  register,
} from '../controllers/auth.controller.ts';

import { validateBody } from '../middleware/validate-body.ts';

import { loginSchema } from '../validators/auth/login.schema.ts';

import { registerSchema } from '../validators/auth/register.schema.ts';

import {
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.ts';

import { forgotPasswordSchema } from '../validators/auth/forgot-password.schema.ts';

import { resetPasswordSchema } from '../validators/auth/reset-password.schema.ts';

export const authRouter = Router();

authRouter.post(
  '/register',

  validateBody(registerSchema),

  register
);

authRouter.post(
  '/login',

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

  validateBody(forgotPasswordSchema),

  forgotPassword
);

authRouter.post(
  '/reset-password',

  validateBody(resetPasswordSchema),

  resetPassword
);
