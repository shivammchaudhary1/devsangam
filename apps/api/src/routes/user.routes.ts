import {
  addFavoriteMantra,
  getFavoriteMantras,
  removeFavoriteMantra,
} from '../controllers/favorite.controller.ts';
import {
  changePassword,
  deleteMyAvatar,
  getMe,
  updateMe,
  uploadMyAvatar,
} from '../controllers/user.controller.ts';
import { uploadAvatarFile } from '../middleware/avatar-upload.ts';
import { requireActiveSession } from '../middleware/require-active-session.ts';
import { requireAuth } from '../middleware/require-auth.ts';
import { validateBody } from '../middleware/validate-body.ts';
import { changePasswordSchema } from '../validators/user/change-password.schema.ts';
import { updateProfileSchema } from '../validators/user/update-profile.schema.ts';
import { Router } from 'express';

export const userRouter = Router();

userRouter.use(requireAuth, requireActiveSession);

userRouter.get('/me', getMe);

userRouter.patch('/me', validateBody(updateProfileSchema), updateMe);

userRouter.post(
  '/me/avatar',

  uploadAvatarFile,

  uploadMyAvatar
);

userRouter.delete('/me/avatar', deleteMyAvatar);

userRouter.patch(
  '/me/password',

  validateBody(changePasswordSchema),

  changePassword
);

userRouter.get('/me/favorites', getFavoriteMantras);

userRouter.put('/me/favorites/:slug', addFavoriteMantra);

userRouter.delete('/me/favorites/:slug', removeFavoriteMantra);
