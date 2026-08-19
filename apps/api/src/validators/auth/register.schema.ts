import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must contain at least 2 characters.')
    .max(80, 'Name is too long.'),

  email: z
    .email('Enter a valid email address.')
    .transform((value) => value.trim().toLowerCase()),

  password: z
    .string()
    .min(10, 'Password must contain at least 10 characters.')
    .max(128, 'Password is too long.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
