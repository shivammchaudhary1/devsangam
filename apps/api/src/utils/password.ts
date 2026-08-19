import { argon2, randomBytes, timingSafeEqual } from 'node:crypto';

const PARAMETERS = {
  parallelism: 4,

  tagLength: 64,

  memory: 65536,

  passes: 3,
} as const;

function derivePassword(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    argon2(
      'argon2id',
      {
        message: password,

        nonce: salt,

        ...PARAMETERS,
      },
      (error, derivedKey) => {
        if (error) {
          reject(error);

          return;
        }

        resolve(derivedKey);
      }
    );
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);

  const hash = await derivePassword(password, salt);

  return [
    'argon2id',

    PARAMETERS.memory,

    PARAMETERS.passes,

    PARAMETERS.parallelism,

    salt.toString('base64url'),

    hash.toString('base64url'),
  ].join('$');
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, memory, passes, parallelism, encodedSalt, encodedHash] =
    storedHash.split('$');

  if (
    algorithm !== 'argon2id' ||
    !memory ||
    !passes ||
    !parallelism ||
    !encodedSalt ||
    !encodedHash
  ) {
    return false;
  }

  const salt = Buffer.from(encodedSalt, 'base64url');

  const expected = Buffer.from(encodedHash, 'base64url');

  const actual = await derivePassword(password, salt);

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}
