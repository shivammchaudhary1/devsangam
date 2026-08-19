import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .email('Enter a valid email address.')
    .transform((value) => value.trim().toLowerCase()),

  password: z.string().min(1, 'Password is required.'),
});

export type LoginInput = z.infer<typeof loginSchema>;
