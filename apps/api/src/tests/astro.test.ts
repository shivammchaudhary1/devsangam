 
import { ensureV2Indexes } from '../config/v2-indexes.ts';
import { AstroReadingModel } from '../models/astro-reading.model.ts';
import { AuthSessionModel } from '../models/auth-session.model.ts';
import { UserModel } from '../models/user.model.ts';
import { birthOffset } from '../services/astro-provider.service.ts';
import { signAccessToken } from '../utils/token.ts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { after, before, test } from 'node:test';

let database: MongoMemoryServer;
let app: NestExpressApplication;
let base: string;
let userCookie: string;
let secondCookie: string;
let userId: string;
let originalFetch: typeof fetch;
const forwardedBodies: Array<Record<string, unknown>> = [];
let providerBadResponse = false;

const planet = (sign: string, nakshatra: string, house = 1) => ({
  zodiac_sign_name: sign, normDegree: 12.25, house_number: house,
  nakshatra_name: nakshatra, nakshatra_pada: 2, isRetro: 'false',
});
const sampleBirth = {
  name: 'Astro Reader', gender: 'prefer_not_to_say', birthDate: '1997-04-21', birthTime: '08:30',
  birthplace: { name: 'New Delhi, Delhi, India', latitude: 28.63576, longitude: 77.22445, timezone: 'Asia/Kolkata' },
  consent: true,
};

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.WEB_ORIGIN = 'http://localhost:5173';
  process.env.ACCESS_TOKEN_SECRET = 'astro-test-access-'.repeat(4);
  process.env.REFRESH_TOKEN_SECRET = 'astro-test-refresh-'.repeat(4);
  process.env.FREE_ASTROLOGY_API_KEY = 'fixture-secret-key';
  process.env.PAYMENTS_ENABLED = 'false';
  originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (!url.startsWith('https://json.freeastrologyapi.com/')) return originalFetch(input, init);
    assert.equal(new Headers(init?.headers).get('x-api-key'), 'fixture-secret-key');
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    forwardedBodies.push(body);
    assert.equal('name' in body, false);
    assert.equal('gender' in body, false);
    if (url.endsWith('/geo-details')) {
      return Response.json([{
        location_name: 'New Delhi', complete_name: 'New Delhi, Delhi, India',
        latitude: 28.63576, longitude: 77.22445, timezone: 'Asia/Kolkata', timezone_offset: 5.5,
      }]);
    }
    if (providerBadResponse) return Response.json({ statusCode: 200, output: { Sun: planet('Taurus', 'Rohini') } });
    return Response.json({ statusCode: 200, output: {
      Ascendant: planet('Leo', 'Magha'), Sun: planet('Aries', 'Ashwini'),
      Moon: planet('Libra', 'Swati'), Mars: planet('Gemini', 'Mrigashirsha'),
    } });
  };
  database = await MongoMemoryServer.create();
  await mongoose.connect(database.getUri());
  await ensureV2Indexes();
  const { createApiApplication } = await import('../app.ts');
  app = await createApiApplication();
  await app.listen(0, '127.0.0.1');
  const server = app.getHttpServer() as Server;
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/v1`;
  for (const [which, email] of ['first@example.test', 'second@example.test'].entries()) {
    const user = await UserModel.create({ name: 'Astro Test', email, passwordHash: 'fixture' });
    const session = await AuthSessionModel.create({ userId: user._id, refreshTokenHash: 'fixture', expiresAt: new Date(Date.now() + 60000) });
    const cookie = `ds_access=${await signAccessToken(user.id, session.id)}`;
    if (which === 0) { userCookie = cookie; userId = user.id; } else secondCookie = cookie;
  }
}, { timeout: 180000 });

after(async () => {
  globalThis.fetch = originalFetch;
  delete process.env.FREE_ASTROLOGY_API_KEY;
  if (app) await app.close();
  await mongoose.disconnect();
  if (database) await database.stop();
});

function request(route: string, method = 'GET', body?: unknown, cookie?: string) {
  return fetch(base + route, {
    method, headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173', ...(cookie ? { Cookie: cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

test('astrology endpoints require a current session', async () => {
  assert.equal((await request('/astro/history')).status, 401);
  assert.equal((await request('/astro/places?q=Delhi')).status, 401);
  assert.equal((await request('/astro/chart', 'POST', sampleBirth)).status, 401);
});

test('birthplace geocoding is private and validates query', async () => {
  assert.equal((await request('/astro/places?q=ab', 'GET', undefined, userCookie)).status, 400);
  assert.equal((await request('/astro/places?q=Delhi', 'GET', undefined, userCookie)).status, 200);
  const results = await (await request('/astro/places?q=Delhi', 'GET', undefined, userCookie)).json();
  assert.equal(results.data.places[0].timezone, 'Asia/Kolkata');
  assert.equal(results.data.places[0].latitude, 28.63576);
});

test('birth date timezone uses historical offsets, not current geo offset', () => {
  assert.equal(birthOffset('2000-01-15', '12:00', 'America/New_York'), -5);
  assert.equal(birthOffset('2000-07-15', '12:00', 'America/New_York'), -4);
  assert.equal(birthOffset('1997-04-21', '08:30', 'Asia/Kolkata'), 5.5);
});

test('chart validation, provider mapping, private history, deletion and no key exposure', async () => {
  assert.equal((await request('/astro/chart', 'POST', { ...sampleBirth, consent: false }, userCookie)).status, 400);
  assert.equal((await request('/astro/chart', 'POST', { ...sampleBirth, birthDate: '2002-02-30' }, userCookie)).status, 400);
  assert.equal((await request('/astro/chart', 'POST', { ...sampleBirth, gender: 'admin' }, userCookie)).status, 400);
  const made = await request('/astro/chart', 'POST', sampleBirth, userCookie);
  assert.equal(made.status, 201);
  const { item } = (await made.json()).data;
  assert.equal(item.summary.moon.sign, 'Libra');
  assert.equal(item.summary.ascendant.nakshatra, 'Magha');
  assert.equal(item.birthplace.birthUtcOffset, 5.5);
  assert.equal(item.gender, 'prefer_not_to_say');
  assert.equal(JSON.stringify(item).includes('fixture-secret-key'), false);
  assert.equal(forwardedBodies.at(-1)?.timezone, 5.5);
  assert.equal((await AstroReadingModel.countDocuments({ userId })), 1);
  assert.equal((await request('/astro/history', 'GET', undefined, secondCookie)).status, 200);
  const other = await (await request('/astro/history', 'GET', undefined, secondCookie)).json();
  assert.equal(other.data.total, 0);
  assert.equal((await request(`/astro/history/${item._id}`, 'GET', undefined, secondCookie)).status, 404);
  assert.equal((await request(`/astro/history/${item._id}`, 'DELETE', undefined, secondCookie)).status, 404);
  const own = await (await request('/astro/history?page=1&limit=8', 'GET', undefined, userCookie)).json();
  assert.equal(own.data.total, 1);
  assert.equal(own.data.items[0].name, sampleBirth.name);
  assert.equal((await request(`/astro/history/${item._id}`, 'DELETE', undefined, userCookie)).status, 200);
  assert.equal((await AstroReadingModel.countDocuments({ userId })), 0);
});

test('provider responses must contain Sun, Moon and Ascendant; missing key fails closed', async () => {
  providerBadResponse = true;
  try {
    assert.equal((await request('/astro/chart', 'POST', sampleBirth, userCookie)).status, 502);
    assert.equal((await AstroReadingModel.countDocuments({ userId })), 0);
  } finally { providerBadResponse = false; }
  delete process.env.FREE_ASTROLOGY_API_KEY;
  try { assert.equal((await request('/astro/places?q=Delhi', 'GET', undefined, userCookie)).status, 503); }
  finally { process.env.FREE_ASTROLOGY_API_KEY = 'fixture-secret-key'; }
});
