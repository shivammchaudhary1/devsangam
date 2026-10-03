import { z } from 'zod';

export const contactSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z
      .email()
      .max(254)
      .transform((value) => value.toLowerCase()),
    category: z.enum(['general', 'account', 'practice', 'feedback']),
    message: z.string().trim().min(10).max(2000),
    website: z.string().max(0).optional(),
  })
  .strict();
