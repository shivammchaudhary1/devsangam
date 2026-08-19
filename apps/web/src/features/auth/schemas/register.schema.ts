import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must contain at least 2 characters.')
      .max(80, 'Name is too long.'),

    email: z.string().trim().email('Enter a valid email address.'),

    password: z
      .string()
      .min(10, 'Password must contain at least 10 characters.')
      .max(128, 'Password is too long.'),

    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',

    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
