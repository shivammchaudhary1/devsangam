/* eslint-disable max-len -- Astro UI markup and provider schema literals use long declarative values. */
import { AppError } from '../utils/app-error.ts';
import type { AstroChartInput } from '../validators/astro.schema.ts';

const BASE = 'https://json.freeastrologyapi.com';
const BODY_NAMES = ['Ascendant', 'Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto'] as const;

export type PlanetInfo = {
  sign: string;
  degree: number | null;
  house: number | null;
  nakshatra: string | null;
  pada: number | null;
  retrograde: boolean | null;
};
export type AstroSnapshot = {
  summary: { sun: PlanetInfo; moon: PlanetInfo; ascendant: PlanetInfo };
  planets: Record<string, PlanetInfo>;
};
export type ResolvedPlace = { name: string; latitude: number; longitude: number; timezone: string };

type RecordData = Record<string, unknown>;
const record = (x: unknown): x is RecordData => typeof x === 'object' && x !== null && !Array.isArray(x);
const asText = (x: unknown, max = 70): string | null => typeof x === 'string' && x.length > 0 && x.length <= max ? x : null;
const finite = (x: unknown): number | null => typeof x === 'number' && Number.isFinite(x) ? x : null;
const integerBetween = (x: unknown, min: number, max: number) => typeof x === 'number' && Number.isInteger(x) && x >= min && x <= max ? x : null;

// Never forward a provider error body, secret or request data to the client or server logs.
async function providerRequest(route: 'geo-details' | 'planets/extended', payload: RecordData): Promise<unknown> {
  const key = process.env.FREE_ASTROLOGY_API_KEY?.trim();
  if (!key) throw new AppError(503, 'ASTRO_NOT_CONFIGURED', 'Astrology is not configured yet. Please try again later.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  let response: globalThis.Response;
  try {
    response = await fetch(`${BASE}/${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': key },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch {
    throw new AppError(503, 'ASTRO_PROVIDER_UNAVAILABLE', 'Astrology provider is temporarily unavailable.');
  } finally { clearTimeout(timer); }
  if (response.status === 429) throw new AppError(429, 'ASTRO_PROVIDER_LIMIT', 'Astrology quota reached. Please try again later.');
  if (!response.ok) throw new AppError(503, 'ASTRO_PROVIDER_ERROR', 'Astrology provider could not complete this request.');
  const length = Number(response.headers.get('content-length') || 0);
  if (length > 262144) throw new AppError(502, 'ASTRO_INVALID_RESPONSE', 'Unexpected astrology provider response.');
  let raw: string;
  try { raw = await response.text(); } catch { throw new AppError(502, 'ASTRO_INVALID_RESPONSE', 'Unexpected astrology provider response.'); }
  if (raw.length > 262144) throw new AppError(502, 'ASTRO_INVALID_RESPONSE', 'Unexpected astrology provider response.');
  try { return JSON.parse(raw) as unknown; } catch { throw new AppError(502, 'ASTRO_INVALID_RESPONSE', 'Unexpected astrology provider response.'); }
}

export async function searchAstroPlaces(query: string): Promise<ResolvedPlace[]> {
  const response = await providerRequest('geo-details', { location: query });
  const rows = Array.isArray(response) ? response : record(response) && Array.isArray(response.output) ? response.output : [];
  const results: ResolvedPlace[] = [];
  for (const row of rows.slice(0, 12)) {
    if (!record(row)) continue;
    const latitude = finite(row.latitude);
    const longitude = finite(row.longitude);
    const timezone = asText(row.timezone);
    const name = asText(row.complete_name, 200) ?? asText(row.location_name, 200);
    if (latitude === null || longitude === null || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180 || !timezone || !name) continue;
    try { new Intl.DateTimeFormat('en', { timeZone: timezone }); } catch { continue; }
    results.push({ name, latitude, longitude, timezone });
  }
  return results;
}

function zoneOffsetAt(zone: string, utcMilliseconds: number): number {
  const zoneName = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'shortOffset' })
    .formatToParts(new Date(utcMilliseconds)).find((p) => p.type === 'timeZoneName')?.value;
  if (zoneName === 'GMT' || zoneName === 'UTC') return 0;
  const match = /^GMT([+-])(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2}))?$/.exec(zoneName ?? '');
  if (!match) throw new AppError(400, 'INVALID_TIMEZONE', 'Birthplace timezone is unavailable for this date.');
  return (match[1] === '-' ? -1 : 1) * (Number(match[2]) + Number(match[3] ?? 0) / 60 + Number(match[4] ?? 0) / 3600);
}

// The provider expects a numeric UTC offset at the *birth time*. A present-day
// geo-details offset would be wrong for historical DST; calculate using IANA timezone.
export function birthOffset(date: string, time: string, zone: string): number {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const localMillis = Date.UTC(year, month - 1, day, hour, minute);
  let utcMillis = localMillis;
  for (let attempt = 0; attempt < 5; attempt++) {
    const offset = zoneOffsetAt(zone, utcMillis);
    const next = localMillis - offset * 3600000;
    if (utcMillis === next) break;
    utcMillis = next;
  }
  const offset = zoneOffsetAt(zone, utcMillis);
  if (Math.abs(localMillis - (utcMillis + offset * 3600000)) > 1000)
    throw new AppError(400, 'INVALID_LOCAL_BIRTH_TIME', 'This local birth time is not valid in the selected timezone (daylight saving change).');
  return Math.round(offset * 6000) / 6000;
}

function parsePlanet(value: unknown): PlanetInfo | null {
  if (!record(value)) return null;
  const sign = asText(value.zodiac_sign_name);
  if (!sign) return null;
  const degree = finite(value.normDegree);
  const house = integerBetween(value.house_number, 1, 12);
  const nakshatra = asText(value.nakshatra_name);
  const pada = integerBetween(value.nakshatra_pada, 1, 4);
  const retrograde = value.isRetro === true || value.isRetro === 'true' ? true : value.isRetro === false || value.isRetro === 'false' ? false : null;
  return { sign, degree: degree !== null && degree >= 0 && degree < 30 ? degree : null, house, nakshatra, pada, retrograde };
}

export async function getAstroSnapshot(input: AstroChartInput, offset: number): Promise<AstroSnapshot> {
  const [year, month, date] = input.birthDate.split('-').map(Number);
  const [hours, minutes] = input.birthTime.split(':').map(Number);
  const raw = await providerRequest('planets/extended', {
    year, month, date, hours, minutes, seconds: 0,
    latitude: input.birthplace.latitude, longitude: input.birthplace.longitude,
    timezone: offset,
    config: { observation_point: 'topocentric', ayanamsha: 'lahiri', language: 'en' },
  });
  if (!record(raw) || !record(raw.output) || (raw.statusCode !== undefined && raw.statusCode !== 200))
    throw new AppError(502, 'ASTRO_INVALID_RESPONSE', 'Astrology provider returned an unexpected result.');
  const planets: Record<string, PlanetInfo> = {};
  for (const name of BODY_NAMES) {
    const planet = parsePlanet(raw.output[name]);
    if (planet) planets[name] = planet;
  }
  if (!planets.Sun || !planets.Moon || !planets.Ascendant)
    throw new AppError(502, 'ASTRO_INVALID_RESPONSE', 'Astrology provider did not return the required chart positions.');
  return { summary: { sun: planets.Sun, moon: planets.Moon, ascendant: planets.Ascendant }, planets };
}
