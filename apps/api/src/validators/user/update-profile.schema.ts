import { z } from 'zod';

const updatePreferencesSchema = z
  .object({
    language: z
      .string()
      .trim()
      .min(2, 'Language is required.')
      .max(20, 'Language value is too long.')
      .optional(),

    theme: z.enum(['dark', 'light']).optional(),

    soundEnabled: z.boolean().optional(),

    hapticEnabled: z.boolean().optional(),

    reminderEnabled: z.boolean().optional(),

    reminderTime: z
      .union([
        z
          .string()
          .regex(
            /^(?:[01]\d|2[0-3]):[0-5]\d$/,
            'Reminder time must use HH:MM format.'
          ),
        z.null(),
      ])
      .optional(),

    timezone: z
      .string()
      .trim()
      .min(1, 'Timezone is required.')
      .max(100, 'Timezone value is too long.')
      .optional(),

    defaultTarget: z
      .number()
      .int('Default target must be a whole number.')
      .min(1, 'Default target must be at least 1.')
      .max(100000, 'Default target cannot exceed 100000.')
      .optional(),
  })
  .refine((preferences) => Object.keys(preferences).length > 0, {
    message: 'At least one preference must be provided.',
  });

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must contain at least 2 characters.')
      .max(80, 'Name is too long.')
      .optional(),

    preferences: updatePreferencesSchema.optional(),
  })
  .refine(
    (input) => input.name !== undefined || input.preferences !== undefined,
    {
      message: 'At least one profile field must be provided.',
    }
  );

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
