import { ensureV2Indexes } from '../config/v2-indexes.ts';
import { AstroReadingModel } from '../models/astro-reading.model.ts';
import { AuthSessionModel } from '../models/auth-session.model.ts';
import { UserModel } from '../models/user.model.ts';
import { parseMahaDasha, parseNavamsa } from '../services/astro-extras.service.ts';
import { signAccessToken } from '../utils/token.ts';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import assert from 'node:assert/strict';
import type { Server } from 'node:http';
import { after, before, test } from 'node:test';

const planets = (name: string, sign: number) => ({
  name, current_sign: sign, house_number: sign, isRetro: 'false',
});
const dashaLords = [
  'Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus',
  'Sun', 'Moon', 'Mars', 'Rahu',
];
const dashaRows = Object.fromEntries(dashaLords.map((Lord, index) => [
  String(index + 1), {
    Lord,
    start_time: `${2000 + index * 10}-01-01 06:00:00.000000`,
    end_time: `${2010 + index * 10}-01-01 06:00:00.000000`,
  },
]));
const navamsaRows = {
  0: planets('Ascendant', 1), 1: planets('Sun', 2),
  2: planets('Moon', 3), 3: planets('Mars', 4),
};

let mongo: MongoMemoryServer;
let app: NestExpressApplication;
let base: string;
let ownCookie: string;
let otherCookie: string;
let readingId: string;
let ownId: string;
let calls = 0;
let providerBroken = false;
const originalFetch = globalThis.fetch;

before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.WEB_ORIGIN = 'http://localhost:5173';
  process.env.ACCESS_TOKEN_SECRET = 'astro-extras-access-fixture-'.repeat(3);
  process.env.REFRESH_TOKEN_SECRET = 'astro-extras-refresh-fixture-'.repeat(3);
  process.env.FREE_ASTROLOGY_API_KEY = 'test-provider-secret';
  process.env.PAYMENTS_ENABLED = 'false';
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    if (!url.startsWith('https://json.freeastrologyapi.com/')) {
      return originalFetch(input, init);
    }
    calls++;
    assert.equal(new Headers(init?.headers).get('x-api-key'), 'test-provider-secret');
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    assert.equal(body.year, 1997);
    assert.equal(body.timezone, 5.5);
    assert.equal('name' in body, false);
    assert.equal('gender' in body, false);
    if (providerBroken) return Response.json({ statusCode: 200, output: {} });
    if (url.endsWith('navamsa-chart-info')) {
      return Response.json({ statusCode: 200, output: navamsaRows });
    }
    if (url.endsWith('vimsottari/maha-dasas')) {
      return Response.json({ statusCode: 200, output: JSON.stringify(dashaRows) });
    }
    throw new Error('Unexpected provider URL.');
  };
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await ensureV2Indexes();
  const { createApiApplication } = await import('../app.ts');
  app = await createApiApplication();
  await app.listen(0, '127.0.0.1');
  const server = app.getHttpServer() as Server;
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/v1`;
  for (const [index, email] of ['one@example.test', 'two@example.test'].entries()) {
    const account = await UserModel.create({ name: 'Test Reader', email, passwordHash: 'fixture' });
    const session = await AuthSessionModel.create({
      userId: account._id, refreshTokenHash: 'fixture',
      expiresAt: new Date(Date.now() + 3600000),
    });
    const cookie = `ds_access=${await signAccessToken(account.id, session.id)}`;
    if (index === 0) {
      ownId = account.id;
      ownCookie = cookie;
    } else otherCookie = cookie;
  }
  const chart = await makeReading();
  readingId = chart.id;
}, { timeout: 180000 });

after(async () => {
  globalThis.fetch = originalFetch;
  delete process.env.FREE_ASTROLOGY_API_KEY;
  if (app) await app.close();
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
});

function makeReading() {
  const placement = {
    sign: 'Aries', degree: 12, house: 1, nakshatra: 'Ashwini',
    pada: 2, retrograde: false,
  };
  return AstroReadingModel.create({
    userId: ownId,
    name: 'Private Name',
    gender: 'prefer_not_to_say',
    birthDate: '1997-04-21',
    birthTime: '08:30',
    birthplace: {
      name: 'New Delhi, India', latitude: 28.64, longitude: 77.22,
      timezone: 'Asia/Kolkata', birthUtcOffset: 5.5,
    },
    summary: { sun: placement, moon: placement, ascendant: placement },
    planets: { Sun: placement, Moon: placement, Ascendant: placement },
    provider: 'freeastrologyapi', ayanamsha: 'lahiri', consentAt: new Date(),
  });
}
function post(id: string, kind: string, cookie?: string) {
  return fetch(`${base}/astro/history/${id}/extras/${kind}`, {
    method: 'POST',
    headers: { Origin: 'http://localhost:5173', ...(cookie ? { Cookie: cookie } : {}) },
  });
}

test('provider response normalization ignores untrusted fields and fails closed', () => {
  const parsed = parseNavamsa(navamsaRows);
  assert.equal(parsed[0].name, 'Ascendant');
  assert.equal(parsed[2].sign, 'Gemini');
  assert.equal(parseMahaDasha(dashaRows).length, 9);
  assert.throws(() => parseNavamsa({ 0: planets('Moon', 1) }));
  assert.throws(() => parseMahaDasha({ 1: { Lord: '<script>' } }));
});

test('extra endpoints enforce owner/session and validate kind before provider calls', async () => {
  assert.equal((await post(readingId, 'navamsa')).status, 401);
  assert.equal((await post(readingId, 'navamsa', otherCookie)).status, 404);
  assert.equal((await post(readingId, 'bogus', ownCookie)).status, 400);
  assert.equal(calls, 0);
});

test('navamsa and dasha are fetched on demand, stored privately and cached', async () => {
  const first = await post(readingId, 'navamsa', ownCookie);
  assert.equal(first.status, 200);
  const navamsa = (await first.json()).data;
  assert.equal(navamsa.items[0].sign, 'Aries');
  assert.equal(navamsa.cached, false);
  const again = (await (await post(readingId, 'navamsa', ownCookie)).json()).data;
  assert.equal(again.cached, true);
  assert.equal(calls, 1);
  const second = await post(readingId, 'dasha', ownCookie);
  assert.equal(second.status, 200);
  assert.equal((await second.json()).data.items.length, 9);
  assert.equal(calls, 2);
  const saved = await AstroReadingModel.findById(readingId).lean();
  assert.equal(saved?.extras?.dasha?.length, 9);
  assert.equal(saved?.extras?.navamsa?.length, 4);
  assert.equal(JSON.stringify(saved).includes('test-provider-secret'), false);
  assert.equal((await post(readingId, 'dasha', otherCookie)).status, 404);
});

test('provider failure does not store an invalid optional reading', async () => {
  const extra = await makeReading();
  providerBroken = true;
  try {
    assert.equal((await post(extra.id, 'navamsa', ownCookie)).status, 502);
    const chart = await AstroReadingModel.findById(extra.id).lean();
    assert.equal(chart?.extras?.navamsa, undefined);
  } finally {
    providerBroken = false;
  }
});

test('daily optional requests have a separate user quota, even across saved charts', async () => {
  // The first two successes and the failed invalid response have spent three calls.
  for (let i = 0; i < 3; i++) {
    const extra = await makeReading();
    assert.equal((await post(extra.id, 'navamsa', ownCookie)).status, 200);
  }
  const capped = await makeReading();
  assert.equal((await post(capped.id, 'navamsa', ownCookie)).status, 429);
  assert.equal(calls, 6);
});
