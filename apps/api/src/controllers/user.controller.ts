import { AuthSessionModel } from '../models/auth-session.model.ts';
import { PasswordResetTokenModel } from '../models/password-reset-token.model.ts';
import { UserModel } from '../models/user.model.ts';
import {
  deleteProfileAvatar,
  uploadProfileAvatar,
} from '../services/avatar.service.ts';
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

  if (input.bio !== undefined) {
    user.bio = input.bio;
  }

  if (input.intention !== undefined) {
    user.intention = input.intention;
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

export async function uploadMyAvatar(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);

  if (!request.file) {
    throw new AppError(400, 'AVATAR_REQUIRED', 'A profile photo is required.');
  }

  const user = await UserModel.findById(userId).select('+avatarPublicId');

  if (!user) {
    throw new AppError(
      401,
      'USER_NOT_FOUND',
      'Authenticated user no longer exists.'
    );
  }

  const uploadedAvatar = await uploadProfileAvatar({
    userId,

    buffer: request.file.buffer,
  });

  user.avatar = uploadedAvatar.avatarUrl;
  user.avatarPublicId = uploadedAvatar.publicId;

  await user.save();

  response.json({
    success: true,

    data: {
      user: serializeUser(user),
    },
  });
}

export async function deleteMyAvatar(request: Request, response: Response) {
  const userId = getAuthenticatedUserId(request);

  const user = await UserModel.findById(userId).select('+avatarPublicId');

  if (!user) {
    throw new AppError(
      401,
      'USER_NOT_FOUND',
      'Authenticated user no longer exists.'
    );
  }

  const avatarPublicId = user.avatarPublicId;

  user.avatar = null;
  user.avatarPublicId = null;

  await user.save();

  /*
   * Database state is authoritative.
   * If Cloudinary deletion temporarily
   * fails, do not restore a removed avatar
   * to the user's profile.
   */
  if (avatarPublicId) {
    try {
      await deleteProfileAvatar(avatarPublicId);
    } catch (error) {
      console.error('Cloudinary avatar cleanup failed:', error);
    }
  }

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
