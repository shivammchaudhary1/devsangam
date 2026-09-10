import { z } from 'zod';

const pushKeysSchema = z
  .object({
    p256dh: z
      .string()
      .trim()
      .min(1, 'Push encryption key is required.')
      .max(4096, 'Push encryption key is too long.'),

    auth: z
      .string()
      .trim()
      .min(1, 'Push authentication key is required.')
      .max(1024, 'Push authentication key is too long.'),
  })
  .strict();

export const subscribePushSchema = z
  .object({
    endpoint: z
      .string()
      .trim()
      .url('Push endpoint must be a valid URL.')
      .max(4096, 'Push endpoint is too long.'),

    expirationTime: z.number().finite().nonnegative().nullable().optional(),

    keys: pushKeysSchema,
  })
  .strict();

export type SubscribePushInput = z.infer<typeof subscribePushSchema>;
