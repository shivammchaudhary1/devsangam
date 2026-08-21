import { AUTH } from '../config/auth.ts';
import { AuthSessionModel } from '../models/auth-session.model.ts';
import { UserModel } from '../models/user.model.ts';
import { AppError } from '../utils/app-error.ts';
import {
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  verifyTokenHash,
} from '../utils/token.ts';

interface SessionContext {
  userAgent?: string;

  ipAddress?: string;
}

export async function createAuthSession(
  userId: string,
  context: SessionContext = {}
) {
  /*
   * Mongoose assigns an _id
   * immediately when the
   * document is instantiated.
   *
   * That gives us the session
   * ID before saving.
   */
  const session = new AuthSessionModel({
    userId,

    /*
     * Temporary value.
     * Replaced before save().
     */
    refreshTokenHash: 'pending',

    expiresAt: new Date(Date.now() + AUTH.refreshToken.maxAgeMs),

    lastUsedAt: new Date(),

    userAgent: context.userAgent ?? null,

    ipAddress: context.ipAddress ?? null,
  });

  const sessionId = session._id.toString();

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(userId, sessionId),

    signRefreshToken(userId, sessionId),
  ]);

  session.refreshTokenHash = hashToken(refreshToken);

  await session.save();

  return {
    session,

    accessToken,

    refreshToken,
  };
}

export async function rotateAuthSession(refreshToken: string) {
  let payload;

  try {
    payload = await verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError(
      401,
      'INVALID_REFRESH_TOKEN',
      'Authentication session is invalid.'
    );
  }

  const userId = payload.sub;

  const sessionId = payload.sid;

  if (!userId || !sessionId) {
    throw new AppError(
      401,
      'INVALID_REFRESH_TOKEN',
      'Authentication session is invalid.'
    );
  }

  const session = await AuthSessionModel.findOne({
    _id: sessionId,

    userId,
  }).select('+refreshTokenHash');

  if (!session) {
    throw new AppError(
      401,
      'SESSION_NOT_FOUND',
      'Authentication session has expired.'
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

  const validToken = verifyTokenHash(
    refreshToken,

    session.refreshTokenHash
  );

  if (!validToken) {
    /*
     * Possible stale/replayed
     * refresh token.
     *
     * Revoke this session.
     */
    await session.deleteOne();

    throw new AppError(
      401,
      'INVALID_REFRESH_TOKEN',
      'Authentication session is invalid.'
    );
  }

  const userExists = await UserModel.exists({
    _id: userId,
  });

  if (!userExists) {
    await session.deleteOne();

    throw new AppError(
      401,
      'USER_NOT_FOUND',
      'Authentication session is invalid.'
    );
  }

  const [accessToken, newRefreshToken] = await Promise.all([
    signAccessToken(userId, sessionId),

    signRefreshToken(userId, sessionId),
  ]);

  session.refreshTokenHash = hashToken(newRefreshToken);

  session.lastUsedAt = new Date();

  session.expiresAt = new Date(Date.now() + AUTH.refreshToken.maxAgeMs);

  await session.save();

  return {
    accessToken,

    refreshToken: newRefreshToken,
  };
}

export async function revokeAuthSession(refreshToken?: string) {
  if (!refreshToken) {
    return;
  }

  try {
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload.sid || !payload.sub) {
      return;
    }

    await AuthSessionModel.deleteOne({
      _id: payload.sid,

      userId: payload.sub,
    });
  } catch {
    /*
     * Logout should remain
     * idempotent.
     *
     * Invalid/expired tokens
     * are simply ignored.
     */
  }
}
