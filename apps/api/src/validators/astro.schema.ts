import { z } from 'zod';

const isoBirthDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid birth date.').refine((value) => {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value &&
    value >= '1900-01-01' && value <= new Date().toISOString().slice(0, 10);
}, 'Birth date must be a real date between 1900 and today.');

export const astroPlaceQuerySchema = z.object({
  q: z.string().trim().min(3).max(90).regex(/^[\p{L}\p{M}0-9 .,'-]+$/u),
}).strict();

export const astroChartSchema = z.object({
  name: z.string().trim().min(2).max(80).regex(/^[\p{L}\p{M}\p{N} .'-]+$/u, 'Use letters and a simple name.'),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  birthDate: isoBirthDate,
  birthTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use a 24-hour time, HH:mm.'),
  birthplace: z.object({
    name: z.string().trim().min(2).max(200),
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180),
    timezone: z.string().min(3).max(70).refine((zone) => {
      try { new Intl.DateTimeFormat('en', { timeZone: zone }); return true; } catch { return false; }
    }, 'A valid IANA timezone is required.'),
  }).strict(),
  consent: z.literal(true),
}).strict();

export type AstroChartInput = z.infer<typeof astroChartSchema>;
