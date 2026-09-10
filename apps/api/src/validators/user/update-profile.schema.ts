import { z } from 'zod';

const profileIntentionSchema = z.enum([
  'Peace',
  'Focus',
  'Healing',
  'Discipline',
  'Devotion',
]);

function isValidTimezone(value: string) {
  try {
    new Intl.DateTimeFormat('en-US', {
      timeZone: value,
    }).format();

    return true;
  } catch {
    return false;
  }
}

const updatePreferencesSchema = z
  .object({
    language: z
      .string()
      .trim()
      .min(2, 'Language is required.')
      .max(20, 'Language value is too long.')
      .optional(),

    theme: z.enum(['dark', 'light', 'system']).optional(),

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
      .refine(isValidTimezone, 'Timezone must be a valid IANA timezone.')
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

    bio: z
      .union([
        z.string().trim().max(240, 'Bio cannot exceed 240 characters.'),
        z.null(),
      ])
      .optional(),

    intention: z.union([profileIntentionSchema, z.null()]).optional(),

    preferences: updatePreferencesSchema.optional(),
  })
  .refine(
    (input) =>
      input.name !== undefined ||
      input.bio !== undefined ||
      input.intention !== undefined ||
      input.preferences !== undefined,
    {
      message: 'At least one profile field must be provided.',
    }
  );

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;