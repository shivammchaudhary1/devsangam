// Exercise real generated service worker + Dexie using a loopback API fixture.
// Requires preview built with NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { once } from 'node:events';
import path from 'node:path';
const require = createRequire(
  path.resolve(process.env.V2_QA_MODULE_ROOT || '.', 'package.json')
);
const { chromium } = require('playwright');
const base = process.env.V2_QA_URL || 'http://127.0.0.1:4173';
const now = new Date().toISOString();
const user = {
  id: '507f1f77bcf86cd799439011',
  name: 'Offline Tester',
  email: 'offline@example.test',
  role: 'user',
  preferences: {
    theme: 'dark',
    timezone: 'Asia/Kolkata',
    soundEnabled: false,
    hapticEnabled: false,
    reminderEnabled: false,
  },
  totals: { chants: 0, malas: 0, sessions: 0, durationSeconds: 0 },
  streak: { current: 0, longest: 0 },
};
const mantra = {
  _id: '507f1f77bcf86cd799439022',
  title: 'Offline free mantra',
  slug: 'offline-fixture',
  sanskrit: 'Om',
  transliteration: 'Om',
  meaning: 'Free fixture',
  categories: [],
  benefits: [],
  defaultTargets: [3],
  estimatedSecondsPerChant: 1,
  isPublished: true,
  accessType: 'free',
  pricePaise: 0,
  locked: false,
  createdAt: now,
  updatedAt: now,
};
const session = {
  _id: '507f1f77bcf86cd799439023',
  userId: user.id,
  mantraId: mantra._id,
  mantraSlug: mantra.slug,
  targetCount: 3,
  completedCount: 0,
  activeDurationSeconds: 0,
  status: 'in_progress',
  startedAt: now,
  completedAt: null,
  createdAt: now,
  updatedAt: now,
};
let completions = 0;
const api = createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', base);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  res.setHeader('Access-Control-Expose-Headers', 'X-DevSangam-Public');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }
  const url = new URL(req.url, 'http://localhost:4000');
  const route = url.pathname.replace('/api/v1', '');
  let data = {};
  let status = 200;
  if (route === '/users/me') data = { user };
  else if (route === '/mantras/offline-fixture') {
    data = { mantra };
    res.setHeader('X-DevSangam-Public', 'true');
    res.setHeader('Cache-Control', 'public, max-age=60');
  } else if (route === '/mantras/paid-fixture') {
    data = {
      mantra: {
        ...mantra,
        _id: '507f1f77bcf86cd799439024',
        slug: 'paid-fixture',
        title: 'Paid fixture',
        sanskrit: 'Private fixture text',
        accessType: 'paid',
        pricePaise: 9900,
      },
    };
    res.setHeader('X-DevSangam-Public', 'false');
    res.setHeader('Cache-Control', 'no-store');
  } else if (route === '/users/me/favorites') data = { mantras: [] };
  else if (route === '/practice/sessions') data = { sessions: [session] };
  else if (
    route === `/practice/sessions/${session._id}` ||
    route === `/practice/sessions/${session._id}/complete`
  ) {
    if (req.method !== 'GET') {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      const input = JSON.parse(raw || '{}');
      Object.assign(session, input);
      if (route.endsWith('/complete') && session.status !== 'completed') {
        session.status = 'completed';
        session.completedAt = new Date().toISOString();
        completions++;
      }
    }
    data = { session };
  } else status = 503;
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      success: status < 400,
      data,
      ...(status >= 400
        ? {
            error: { code: 'OFFLINE_FIXTURE', message: 'Fixture unavailable.' },
          }
        : {}),
    })
  );
});
let browser;
try {
  api.listen(4000, 'localhost');
  await once(api, 'listening');
  browser = await chromium.launch({ channel: process.env.V2_QA_BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined), headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(base + `/practice/${mantra.slug}/session/${session._id}`);
  await page.getByRole('button', { name: 'Tap to count one chant' }).waitFor();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await page.getByRole('button', { name: 'Tap to count one chant' }).waitFor();
  await page.waitForFunction(async () =>
    Boolean(
      await caches.match('http://localhost:4000/api/v1/mantras/offline-fixture')
    )
  );
  await ctx.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: 'Tap to count one chant' }).waitFor();
  // This URL has never been visited: Next must recover from the generic precache
  // shell, including dynamic params, instead of relying on a cached RSC request.
  const fallback = await page.goto(base + `/practice/${mantra.slug}/session/${session._id}?offline-fixture=unvisited`);
  const fallbackHtml = await fallback.text();
  assert.ok(fallbackHtml.includes('offline'));
  assert.ok(!fallbackHtml.includes(user.email));
  await page.getByRole('button', { name: 'Tap to count one chant' }).waitFor();
  await page.goto(base + '/settings');
  await page.getByRole('heading', { name: 'Settings', exact: true }).waitFor();
  await page.goto(base + `/practice/${mantra.slug}/session/${session._id}`);
  await page.getByRole('button', { name: 'Tap to count one chant' }).waitFor();
  await page.getByRole('button', { name: 'Tap to count one chant' }).click();
  await page.getByRole('button', { name: 'Pause practice' }).click();
  await page.getByRole('button', { name: 'Practice is paused' }).waitFor();
  await page.getByRole('button', { name: 'Resume practice' }).click();
  await page.getByRole('button', { name: 'Tap to count one chant' }).click();
  await page.getByRole('button', { name: 'Tap to count one chant' }).click();
  await page.getByText('Sadhana Complete', { exact: true }).waitFor();
  await page.getByText('Completed on this device.', { exact: false }).waitFor();
  assert.equal(session.status, 'in_progress');
  await ctx.setOffline(false);
  await page.waitForFunction(() => navigator.onLine);
  const deadline = Date.now() + 20000;
  while (session.status !== 'completed' && Date.now() < deadline)
    await new Promise((resolve) => setTimeout(resolve, 200));
  assert.equal(session.status, 'completed');
  assert.equal(session.completedCount, 3);
  assert.equal(completions, 1);
  await page.goto(base + '/library/paid-fixture');
  await page
    .getByRole('heading', { name: 'Paid fixture', exact: true })
    .waitFor();
  assert.equal(
    await page.evaluate(async () =>
      Boolean(
        await caches.match('http://localhost:4000/api/v1/mantras/paid-fixture')
      )
    ),
    false
  );
  assert.equal(
    await page.evaluate(async () =>
      Boolean(
        await caches.match(
          'http://localhost:4000/api/v1/mantras/offline-fixture'
        )
      )
    ),
    true
  );
  // URL query values can be serialized into Next Flight HTML. Never persist
  // auth documents or query-bearing documents, even with a public route path.
  await page.goto(base + '/auth/reset-password?token=private-reset-fixture');
  await page.locator('form').waitFor();
  await page.goto(base + '/about?token=private-query-fixture');
  await page.getByRole('heading', { name: 'About DevSangam', exact: true }).waitFor();
  assert.equal(await page.evaluate(async () => {
    const keys = await caches.keys();
    for (const key of keys) for (const request of await (await caches.open(key)).keys())
      if (request.url.includes('private-reset-fixture') || request.url.includes('private-query-fixture')) return true;
    return false;
  }), false);
  await ctx.setOffline(true);
  await page.goto(base + '/auth/reset-password?token=private-reset-fixture');
  await page.locator('form').waitFor();
  await ctx.setOffline(false);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        result: 'PASS',
        checks: 21,
        coverage:
          'Real SW/cache and Dexie offline/unvisited route recovery, one synced completion, free cache retained, paid text/auth/query tokens excluded, offline reset form recovery.',
        limits:
          'Loopback API fixture. npm test exercises actual MongoDB/API; installed-device push/PWA update remains manual.',
      },
      null,
      2
    )
  );
  await ctx.close();
} finally {
  if (browser) await browser.close();
  api.closeAllConnections();
  await new Promise((resolve) => api.close(resolve));
}
