import { AUTH } from '../config/auth.ts';
import { type JWTPayload,jwtVerify, SignJWT } from 'jose';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';

type TokenType = 'access' | 'refresh';

interface DevSangamTokenPayload extends JWTPayload {
  sid: string;

  type: TokenType;
}

function getSecret(type: TokenType) {
  const value =
    type === 'access'
      ? process.env.ACCESS_TOKEN_SECRET
      : process.env.REFRESH_TOKEN_SECRET;

  if (!value) {
    throw new Error(`${type.toUpperCase()}_TOKEN_SECRET is not configured`);
  }

  return new TextEncoder().encode(value);
}

async function signToken(userId: string, sessionId: string, type: TokenType) {
  const ttl = type === 'access' ? AUTH.accessToken.ttl : AUTH.refreshToken.ttl;

  return new SignJWT({
    sid: sessionId,

    type,
  })
    .setProtectedHeader({
      alg: 'HS256',

      typ: 'JWT',
    })
    .setSubject(userId)
    .setIssuer(AUTH.issuer)
    .setAudience(AUTH.audience)
    .setJti(randomUUID())
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(getSecret(type));
}

export function signAccessToken(userId: string, sessionId: string) {
  return signToken(userId, sessionId, 'access');
}

export function signRefreshToken(userId: string, sessionId: string) {
  return signToken(userId, sessionId, 'refresh');
}

async function verifyToken(
  token: string,
  type: TokenType
): Promise<DevSangamTokenPayload> {
  const { payload } = await jwtVerify(token, getSecret(type), {
    issuer: AUTH.issuer,

    audience: AUTH.audience,

    algorithms: ['HS256'],
  });

  if (
    payload.type !== type ||
    typeof payload.sid !== 'string' ||
    typeof payload.sub !== 'string'
  ) {
    throw new Error('Invalid authentication token.');
  }

  return payload as DevSangamTokenPayload;
}

export function verifyAccessToken(token: string) {
  return verifyToken(token, 'access');
}

export function verifyRefreshToken(token: string) {
  return verifyToken(token, 'refresh');
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function verifyTokenHash(token: string, storedHash: string) {
  const actual = Buffer.from(hashToken(token), 'hex');

  const expected = Buffer.from(storedHash, 'hex');

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}
