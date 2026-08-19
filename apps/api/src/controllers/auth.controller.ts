import type { Request, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';

import { UserModel } from '../models/user.model.ts';

import {
  createAuthSession,
  revokeAuthSession,
  rotateAuthSession,
} from '../services/auth-session.service.ts';

import { AppError } from '../utils/app-error.ts';

import { hashPassword, verifyPassword } from '../utils/password.ts';

import { clearAuthCookies, setAuthCookies } from '../utils/auth-cookies.ts';

import { serializeUser } from '../utils/serialize-user.ts';

import { AUTH } from '../config/auth.ts';

import type { RegisterInput } from '../validators/auth/register.schema.ts';

import type { LoginInput } from '../validators/auth/login.schema.ts';

import { AuthSessionModel } from '../models/auth-session.model.ts';

import { PasswordResetTokenModel } from '../models/password-reset-token.model.ts';

import { createPasswordReset } from '../services/password-reset.service.ts';

import { sendPasswordResetEmail } from '../services/email.service.ts';

import { hashToken } from '../utils/token.ts';

import type { ForgotPasswordInput } from '../validators/auth/forgot-password.schema.ts';

import type { ResetPasswordInput } from '../validators/auth/reset-password.schema.ts';

type SessionContextRequest = Pick<Request, 'get' | 'ip'>;

function getSessionContext(request: SessionContextRequest) {
  return {
    userAgent: request.get('user-agent'),

    ipAddress: request.ip,
  };
}

export async function register(
  request: Request<unknown, unknown, RegisterInput>,
  response: Response
) {
  const { name, email, password } = request.body;

  const existingUser = await UserModel.exists({
    email,
  });

  if (existingUser) {
    throw new AppError(
      409,
      'EMAIL_IN_USE',
      'An account with this email already exists.'
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await UserModel.create({
    name,

    email,

    passwordHash,
  });

  try {
    const { accessToken, refreshToken } = await createAuthSession(
      user._id.toString(),

      getSessionContext(request)
    );

    setAuthCookies(response, accessToken, refreshToken);

    response.status(201).json({
      success: true,

      data: {
        user: serializeUser(user),
      },
    });
  } catch (error) {
    /*
     * Don't leave an incomplete
     * registration behind if
     * session creation fails.
     */
    await UserModel.deleteOne({
      _id: user._id,
    });

    throw error;
  }
}

export async function login(
  request: Request<unknown, unknown, LoginInput>,
  response: Response
) {
  const { email, password } = request.body;

  const user = await UserModel.findOne({
    email,
  }).select('+passwordHash');

  /*
   * Same error whether the
   * email or password is wrong.
   */
  if (!user) {
    throw new AppError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password.'
    );
  }

  const validPassword = await verifyPassword(password, user.passwordHash);

  if (!validPassword) {
    throw new AppError(
      401,
      'INVALID_CREDENTIALS',
      'Invalid email or password.'
    );
  }

  const { accessToken, refreshToken } = await createAuthSession(
    user._id.toString(),

    getSessionContext(request)
  );

  setAuthCookies(response, accessToken, refreshToken);

  response.json({
    success: true,

    data: {
      user: serializeUser(user),
    },
  });
}

export async function refresh(request: Request, response: Response) {
  const refreshToken = request.cookies?.[AUTH.cookies.refresh] as
    | string
    | undefined;

  if (!refreshToken) {
    throw new AppError(
      401,
      'REFRESH_TOKEN_REQUIRED',
      'Authentication session is required.'
    );
  }

  const tokens = await rotateAuthSession(refreshToken);

  setAuthCookies(response, tokens.accessToken, tokens.refreshToken);

  response.json({
    success: true,

    data: {
      refreshed: true,
    },
  });
}

export async function logout(request: Request, response: Response) {
  const refreshToken = request.cookies?.[AUTH.cookies.refresh] as
    | string
    | undefined;

  await revokeAuthSession(refreshToken);

  clearAuthCookies(response);

  response.json({
    success: true,

    data: {
      loggedOut: true,
    },
  });
}

export async function forgotPassword(
  request: Request<ParamsDictionary, unknown, ForgotPasswordInput>,
  response: Response
) {
  const { email } = request.body;

  const user = await UserModel.findOne({
    email,
  }).select('_id name email');

  /*
   * Do not reveal whether
   * the account exists.
   */
  if (user) {
    const { resetUrl } = await createPasswordReset({
      userId: user._id.toString(),

      email: user.email,

      name: user.name,
    });

    await sendPasswordResetEmail({
      email: user.email,

      name: user.name,

      resetUrl,
    });
  }

  response.json({
    success: true,

    data: {
      message:
        'If an account exists for that email, password reset instructions have been sent.',
    },
  });
}

export async function resetPassword(
  request: Request<ParamsDictionary, unknown, ResetPasswordInput>,
  response: Response
) {
  const { token, password } = request.body;

  const tokenHash = hashToken(token);

  const resetToken = await PasswordResetTokenModel.findOne({
    tokenHash,

    expiresAt: {
      $gt: new Date(),
    },
  });

  if (!resetToken) {
    throw new AppError(
      400,
      'INVALID_RESET_TOKEN',
      'Password reset link is invalid or expired.'
    );
  }

  const passwordHash = await hashPassword(password);

  const updateResult = await UserModel.updateOne(
    {
      _id: resetToken.userId,
    },
    {
      $set: {
        passwordHash,
      },
    }
  );

  if (updateResult.matchedCount === 0) {
    await resetToken.deleteOne();

    throw new AppError(
      400,
      'INVALID_RESET_TOKEN',
      'Password reset link is invalid or expired.'
    );
  }

  /*
   * Token becomes single-use.
   */
  await Promise.all([
    PasswordResetTokenModel.deleteMany({
      userId: resetToken.userId,
    }),

    /*
     * Changing password logs
     * the user out everywhere.
     */
    AuthSessionModel.deleteMany({
      userId: resetToken.userId,
    }),
  ]);

  clearAuthCookies(response);

  response.json({
    success: true,

    data: {
      passwordReset: true,
    },
  });
}
