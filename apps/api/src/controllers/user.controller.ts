import { UserModel } from '../models/user.model.ts';
import { AppError } from '../utils/app-error.ts';
import { serializeUser } from '../utils/serialize-user.ts';
import type { UpdateProfileInput } from '../validators/user/update-profile.schema.ts';
import type { Request, Response } from 'express';

export async function getMe(request: Request, response: Response) {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError(
      401,
      'AUTHENTICATION_REQUIRED',
      'Authentication is required.'
    );
  }

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError(
      401,
      'USER_NOT_FOUND',
      'Authenticated user no longer exists.'
    );
  }

  response.json({
    success: true,

    data: {
      user: serializeUser(user),
    },
  });
}

export async function updateMe(request: Request, response: Response) {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError(
      401,
      'AUTHENTICATION_REQUIRED',
      'Authentication is required.'
    );
  }

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError(
      401,
      'USER_NOT_FOUND',
      'Authenticated user no longer exists.'
    );
  }

  const input = request.body as UpdateProfileInput;

  if (input.name !== undefined) {
    user.name = input.name;
  }

  const preferences = input.preferences;

  if (preferences) {
    if (preferences.language !== undefined) {
      user.set('preferences.language', preferences.language);
    }

    if (preferences.theme !== undefined) {
      user.set('preferences.theme', preferences.theme);
    }

    if (preferences.soundEnabled !== undefined) {
      user.set('preferences.soundEnabled', preferences.soundEnabled);
    }

    if (preferences.hapticEnabled !== undefined) {
      user.set('preferences.hapticEnabled', preferences.hapticEnabled);
    }

    if (preferences.reminderEnabled !== undefined) {
      user.set('preferences.reminderEnabled', preferences.reminderEnabled);
    }

    if (preferences.reminderTime !== undefined) {
      user.set('preferences.reminderTime', preferences.reminderTime);
    }

    if (preferences.timezone !== undefined) {
      user.set('preferences.timezone', preferences.timezone);
    }

    if (preferences.defaultTarget !== undefined) {
      user.set('preferences.defaultTarget', preferences.defaultTarget);
    }
  }

  await user.save();

  response.json({
    success: true,

    data: {
      user: serializeUser(user),
    },
  });
}
