import type { RequestHandler } from 'express';

import { AuthSessionModel } from '../models/auth-session.model.ts';

import { AppError } from '../utils/app-error.ts';

export const requireActiveSession: RequestHandler = async (
  request,
  _response,
  next
) => {
  const auth = request.auth;

  if (!auth) {
    throw new AppError(
      401,
      'AUTHENTICATION_REQUIRED',
      'Authentication is required.'
    );
  }

  const session = await AuthSessionModel.findOne({
    _id: auth.sessionId,

    userId: auth.userId,
  }).select('_id expiresAt');

  if (!session) {
    throw new AppError(
      401,
      'SESSION_NOT_FOUND',
      'Authentication session is no longer active.'
    );
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await session.deleteOne();

    throw new AppError(
      401,
      'SESSION_EXPIRED',
      'Authentication session has expired.'
    );
  }

  next();
};
