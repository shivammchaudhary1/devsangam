import { randomUUID } from 'node:crypto';

import { hashPassword, verifyPassword } from '../utils/password.ts';

import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../utils/token.ts';

async function run() {
  console.log('Testing password hashing...');

  const password = 'devsangam-test-password';

  const hash = await hashPassword(password);

  const valid = await verifyPassword(password, hash);

  const invalid = await verifyPassword('wrong-password', hash);

  console.log({
    valid,
    invalid,
  });

  if (!valid || invalid) {
    throw new Error('Password verification failed.');
  }

  console.log('✓ Password hashing works');

  const userId = randomUUID();

  const sessionId = randomUUID();

  const accessToken = await signAccessToken(userId, sessionId);

  const refreshToken = await signRefreshToken(userId, sessionId);

  const accessPayload = await verifyAccessToken(accessToken);

  const refreshPayload = await verifyRefreshToken(refreshToken);

  console.log({
    access: {
      sub: accessPayload.sub,

      sid: accessPayload.sid,

      type: accessPayload.type,
    },

    refresh: {
      sub: refreshPayload.sub,

      sid: refreshPayload.sid,

      type: refreshPayload.type,
    },
  });

  console.log('✓ JWT signing works');

  console.log('✓ JWT verification works');

  console.log('\nPhase 2A auth foundation is healthy.');
}

await run();
