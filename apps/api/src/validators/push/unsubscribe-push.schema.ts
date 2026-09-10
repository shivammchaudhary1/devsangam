import { z } from 'zod';

export const unsubscribePushSchema = z
  .object({
    endpoint: z
      .string()
      .trim()
      .url(
        'Push endpoint must be a valid URL.'
      )
      .max(
        4096,
        'Push endpoint is too long.'
      ),
  })
  .strict();

export type UnsubscribePushInput =
  z.infer<
    typeof unsubscribePushSchema
  >;