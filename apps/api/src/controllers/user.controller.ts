import type { Request, Response } from 'express';

import { UserModel } from '../models/user.model.ts';

import { AppError } from '../utils/app-error.ts';

import { serializeUser } from '../utils/serialize-user.ts';

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
