import {
  addFavoriteMantra,
  getFavoriteMantras,
  removeFavoriteMantra,
} from '../controllers/favorite.controller.ts';
import { getMe } from '../controllers/user.controller.ts';
import { requireActiveSession } from '../middleware/require-active-session.ts';
import { requireAuth } from '../middleware/require-auth.ts';
import { Router } from 'express';

export const userRouter = Router();

/*
 * Everything under /users
 * requires an authenticated,
 * active user session.
 */
userRouter.use(requireAuth, requireActiveSession);

userRouter.get('/me', getMe);

userRouter.get('/me/favorites', getFavoriteMantras);

userRouter.put('/me/favorites/:slug', addFavoriteMantra);

userRouter.delete('/me/favorites/:slug', removeFavoriteMantra);
