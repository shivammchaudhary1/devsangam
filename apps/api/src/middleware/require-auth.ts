import type { RequestHandler } from 'express';

import { AUTH } from '../config/auth.ts';

import { AppError } from '../utils/app-error.ts';

import { verifyAccessToken } from '../utils/token.ts';

export const requireAuth: RequestHandler = async (request, _response, next) => {
  const accessToken = request.cookies?.[AUTH.cookies.access] as
    | string
    | undefined;

  if (!accessToken) {
    throw new AppError(
      401,
      'AUTHENTICATION_REQUIRED',
      'Authentication is required.'
    );
  }

  let payload;

  try {
    payload = await verifyAccessToken(accessToken);
  } catch {
    throw new AppError(
      401,
      'INVALID_ACCESS_TOKEN',
      'Authentication session is invalid or expired.'
    );
  }

  if (!payload.sub || !payload.sid) {
    throw new AppError(
      401,
      'INVALID_ACCESS_TOKEN',
      'Authentication session is invalid.'
    );
  }

  request.auth = {
    userId: payload.sub,

    sessionId: payload.sid,
  };

  next();
};
