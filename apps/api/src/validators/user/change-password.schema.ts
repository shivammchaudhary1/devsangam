import { z } from 'zod';

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Current password is required.')
      .max(128, 'Current password is too long.'),

    newPassword: z
      .string()
      .min(10, 'New password must contain at least 10 characters.')
      .max(128, 'New password is too long.'),
  })
  .refine((input) => input.currentPassword !== input.newPassword, {
    path: ['newPassword'],
    message: 'New password must be different from your current password.',
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
