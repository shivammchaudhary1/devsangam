import { Router } from 'express';

import { getMe } from '../controllers/user.controller.ts';

import { requireAuth } from '../middleware/require-auth.ts';

import { requireActiveSession } from '../middleware/require-active-session.ts';

export const userRouter = Router();

userRouter.get(
  '/me',

  requireAuth,

  requireActiveSession,

  getMe
);
