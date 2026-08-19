import { z } from 'zod';

export const resetPasswordSchema = z.object({
  token: z.string().min(20, 'Reset token is invalid.'),

  password: z
    .string()
    .min(10, 'Password must contain at least 10 characters.')
    .max(128, 'Password is too long.'),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
