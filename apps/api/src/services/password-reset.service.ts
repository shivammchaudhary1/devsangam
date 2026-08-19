import { randomBytes } from 'node:crypto';

import { PasswordResetTokenModel } from '../models/password-reset-token.model.ts';

import { hashToken } from '../utils/token.ts';

const PASSWORD_RESET_TTL = 15 * 60 * 1000;

interface CreateResetOptions {
  userId: string;
  email: string;
  name: string;
}

export async function createPasswordReset(options: CreateResetOptions) {
  await PasswordResetTokenModel.deleteMany({
    userId: options.userId,
  });

  const rawToken = randomBytes(32).toString('base64url');

  const tokenHash = hashToken(rawToken);

  await PasswordResetTokenModel.create({
    userId: options.userId,

    tokenHash,

    expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL),
  });

  const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:5173';

  const resetUrl =
    `${webOrigin}` +
    `/auth/reset-password` +
    `?token=${encodeURIComponent(rawToken)}`;

  return {
    resetUrl,
  };
}
