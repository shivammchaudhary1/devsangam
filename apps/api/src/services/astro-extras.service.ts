import { AppError } from '../utils/app-error.ts';

// Extra endpoints are OPTIONAL, called only when an authenticated account
// requests a tab for an already saved reading. Never forward names/gender.
export type AstroExtraKind = 'navamsa' | 'dasha';
export type NavamsaPlacement = {
  name: string;
  sign: string;
  house: number | null;
  retrograde: boolean | null;
};
export type DashaPeriod = {
  lord: string;
  startsAt: string;
  endsAt: string;
};
export type SavedAstroBirth = {
  birthDate: string;
  birthTime: string;
  birthplace: {
    latitude: number;
    longitude: number;
    birthUtcOffset: number;
  };
};

const API_ROOT = 'https://json.freeastrologyapi.com';
const ROUTES: Record<AstroExtraKind, string> = {
  navamsa: 'navamsa-chart-info',
  dasha: 'vimsottari/maha-dasas',
};
const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
] as const;
const BODIES = [
  'Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus',
  'Saturn', 'Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto',
] as const;
const LORDS = new Set([
  'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus',
  'Saturn', 'Rahu', 'Ketu',
]);
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const integer = (value: unknown, low: number, high: number): number | null =>
  typeof value === 'number' && Number.isInteger(value) && value >= low && value <= high
    ? value : null;
const invalid = (): never => {
  throw new AppError(
    502, 'ASTRO_INVALID_RESPONSE', 'The astrology provider returned unexpected data.',
  );
};

function providerInput(birth: SavedAstroBirth) {
  const [year, month, date] = birth.birthDate.split('-').map(Number);
  const [hours, minutes] = birth.birthTime.split(':').map(Number);
  return {
    year, month, date, hours, minutes, seconds: 0,
    latitude: birth.birthplace.latitude,
    longitude: birth.birthplace.longitude,
    timezone: birth.birthplace.birthUtcOffset,
    config: {
      observation_point: 'topocentric',
      ayanamsha: 'lahiri',
      language: 'en',
    },
  };
}

async function fetchOptional(kind: AstroExtraKind, birth: SavedAstroBirth) {
  const key = process.env.FREE_ASTROLOGY_API_KEY?.trim();
  if (!key) {
    throw new AppError(503, 'ASTRO_NOT_CONFIGURED', 'Astrology is not configured yet.');
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  let response: Response;
  try {
    response = await fetch(`${API_ROOT}/${ROUTES[kind]}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key },
      body: JSON.stringify(providerInput(birth)),
      signal: controller.signal,
    });
  } catch {
    throw new AppError(503, 'ASTRO_PROVIDER_UNAVAILABLE', 'Astrology service is temporarily unavailable.');
  } finally {
    clearTimeout(timeout);
  }
  if (response.status === 429) {
    throw new AppError(429, 'ASTRO_PROVIDER_LIMIT', 'The provider quota is temporarily exhausted.');
  }
  if (!response.ok) {
    throw new AppError(503, 'ASTRO_PROVIDER_ERROR', 'The astrology service could not complete the request.');
  }
  if (Number(response.headers.get('content-length') || 0) > 131072) invalid();
  let text: string;
  try {
    text = await response.text();
  } catch {
    return invalid();
  }
  if (text.length > 131072) invalid();
  let result: unknown;
  try {
    result = JSON.parse(text) as unknown;
  } catch {
    return invalid();
  }
  if (!isRecord(result)) return invalid();
  if (result.statusCode !== 200) return invalid();
  // Some FreeAstrologyAPI endpoints return JSON as a JSON-encoded string.
  let output: unknown = result.output;
  if (typeof output === 'string') {
    if (output.length > 65536) invalid();
    try {
      output = JSON.parse(output) as unknown;
    } catch {
      return invalid();
    }
  }
  if (!isRecord(output)) return invalid();
  return output;
}

export function parseNavamsa(output: unknown): NavamsaPlacement[] {
  if (!isRecord(output)) return invalid();
  const rows: NavamsaPlacement[] = [];
  for (const value of Object.values(output).slice(0, 20)) {
    if (!isRecord(value) || typeof value.name !== 'string') continue;
    if (!(BODIES as readonly string[]).includes(value.name)) continue;
    const sign = integer(value.current_sign, 1, 12);
    if (sign === null) continue;
    const house = integer(value.house_number, 1, 12);
    const retro = value.isRetro;
    const retrograde = retro === true || retro === 'true'
      ? true : retro === false || retro === 'false' ? false : null;
    if (rows.some((row) => row.name === value.name)) continue;
    rows.push({ name: value.name, sign: SIGNS[sign - 1], house, retrograde });
  }
  if (!['Ascendant', 'Sun', 'Moon'].every((body) => rows.some((row) => row.name === body))) {
    invalid();
  }
  return rows.sort((a, b) =>
    BODIES.indexOf(a.name as typeof BODIES[number]) -
    BODIES.indexOf(b.name as typeof BODIES[number]));
}

const PROVIDER_DATE = new RegExp(
  String.raw`^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ` +
  String.raw`([01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?$`,
);
export function parseMahaDasha(output: unknown): DashaPeriod[] {
  if (!isRecord(output)) return invalid();
  const periods: DashaPeriod[] = [];
  for (const row of Object.values(output).slice(0, 20)) {
    if (!isRecord(row) || typeof row.Lord !== 'string' || !LORDS.has(row.Lord)) continue;
    if (typeof row.start_time !== 'string' || typeof row.end_time !== 'string') continue;
    if (!PROVIDER_DATE.test(row.start_time) || !PROVIDER_DATE.test(row.end_time)) continue;
    if (row.start_time >= row.end_time) continue;
    periods.push({
      lord: row.Lord,
      startsAt: row.start_time,
      endsAt: row.end_time,
    });
  }
  if (periods.length !== 9 || new Set(periods.map((row) => row.lord)).size !== 9) {
    invalid();
  }
  periods.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  return periods;
}

export async function calculateAstroExtra(
  kind: 'navamsa', birth: SavedAstroBirth,
): Promise<NavamsaPlacement[]>;
export async function calculateAstroExtra(kind: 'dasha', birth: SavedAstroBirth): Promise<DashaPeriod[]>;
export async function calculateAstroExtra(
  kind: AstroExtraKind, birth: SavedAstroBirth,
): Promise<NavamsaPlacement[] | DashaPeriod[]>;
export async function calculateAstroExtra(kind: AstroExtraKind, birth: SavedAstroBirth) {
  const data = await fetchOptional(kind, birth);
  return kind === 'navamsa' ? parseNavamsa(data) : parseMahaDasha(data);
}
