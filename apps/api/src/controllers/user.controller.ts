import { AuthSessionModel } from '../models/auth-session.model.ts';
import { PasswordResetTokenModel } from '../models/password-reset-token.model.ts';
import { UserModel } from '../models/user.model.ts';
import { AppError } from '../utils/app-error.ts';
import { hashPassword, verifyPassword } from '../utils/password.ts';
import { serializeUser } from '../utils/serialize-user.ts';
import type { ChangePasswordInput } from '../validators/user/change-password.schema.ts';
import type { UpdateProfileInput } from '../validators/user/update-profile.schema.ts';
import type { Request, Response } from 'express';

function getAuthenticatedUserId(request: Request) {
  const userId = request.auth?.userId;

  if (!userId) {
    throw new AppError(
      401,
      'AUTHENTICATION_REQUIRED',
      'Authentication is required.'
    );
  }

  return userId;
}

export async function getMe(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);

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
  const userId = getAuthenticatedUserId(request);

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

export async function changePassword(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);

  const sessionId = request.auth?.sessionId;

  if (!sessionId) {
    throw new AppError(
      401,
      'AUTHENTICATION_REQUIRED',
      'Authentication session is required.'
    );
  }

  const { currentPassword, newPassword } = request.body as ChangePasswordInput;

  const user = await UserModel.findById(userId).select('+passwordHash');

  if (!user) {
    throw new AppError(
      401,
      'USER_NOT_FOUND',
      'Authenticated user no longer exists.'
    );
  }

  const currentPasswordValid = await verifyPassword(
    currentPassword,
    user.passwordHash
  );

  if (!currentPasswordValid) {
    throw new AppError(
      400,
      'CURRENT_PASSWORD_INVALID',
      'Current password is incorrect.'
    );
  }

  const passwordUnchanged = await verifyPassword(
    newPassword,
    user.passwordHash
  );

  if (passwordUnchanged) {
    throw new AppError(
      400,
      'PASSWORD_UNCHANGED',
      'New password must be different from your current password.'
    );
  }

  user.passwordHash = await hashPassword(newPassword);

  await user.save();

  /*
   * A password change invalidates
   * password-reset links and signs
   * out other sessions.
   *
   * The current authenticated
   * session remains active.
   */
  await Promise.all([
    PasswordResetTokenModel.deleteMany({
      userId: user._id,
    }),

    AuthSessionModel.deleteMany({
      userId: user._id,

      _id: {
        $ne: sessionId,
      },
    }),
  ]);

  response.json({
    success: true,

    data: {
      passwordChanged: true,
    },
  });
}
