// Real Workbox update, isolated proxy/fixtures; never alters built worker or live data.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
const upstream = process.env.V2_QA_URL || 'http://127.0.0.1:4173';
const base = 'http://127.0.0.1:4174';
let revision = 1;
const user = { id: '507f1f77bcf86cd799439011', name: 'Update Tester', email: 'update@example.test', role: 'user',
  preferences: { theme: 'dark', timezone: 'Asia/Kolkata', soundEnabled: false, hapticEnabled: false, reminderEnabled: false },
  totals: { chants: 0, malas: 0, sessions: 0, durationSeconds: 0 }, streak: { current: 0, longest: 0 } };
const now = new Date().toISOString();
const mantra = { _id: '507f1f77bcf86cd799439022', title: 'Update fixture', slug: 'update-fixture', sanskrit: 'Om',
  transliteration: 'Om', meaning: 'Free fixture', categories: [], benefits: [], defaultTargets: [108], estimatedSecondsPerChant: 1,
  isPublished: true, accessType: 'free', pricePaise: 0, locked: false, createdAt: now, updatedAt: now };
const session = { _id: '507f1f77bcf86cd799439023', userId: user.id, mantraId: mantra._id, mantraSlug: mantra.slug,
  targetCount: 108, completedCount: 0, activeDurationSeconds: 0, status: 'in_progress', startedAt: now,
  completedAt: null, createdAt: now, updatedAt: now };
const api = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', base); res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  const url = new URL(req.url, 'http://localhost:4000');
  const route = url.pathname.replace('/api/v1', '');
  const data = route === '/users/me' ? { user } : route.startsWith('/mantras/') ? { mantra }
    : route === '/users/me/favorites' ? { mantras: [] } : route.startsWith('/practice/sessions/') ? { session } : {};
  res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ success: true, data }));
});
const proxy = createServer(async (req, res) => {
  try {
    const response = await fetch(upstream + req.url, { headers: { Accept: req.headers.accept || '*/*' } });
    for (const [name, value] of response.headers) if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(name)) res.setHeader(name, value);
    res.statusCode = response.status;
    if (req.url.split('?')[0] === '/sw.js') {
      res.setHeader('Cache-Control', 'no-store'); res.end((await response.text()) + '\n// Isolated QA revision ' + revision);
    } else res.end(Buffer.from(await response.arrayBuffer()));
  } catch { res.writeHead(502); res.end('Fixture proxy unavailable.'); }
});
let browser;
try {
  api.listen(4000, 'localhost'); await once(api, 'listening');
  proxy.listen(4174, '127.0.0.1'); await once(proxy, 'listening');
  browser = await chromium.launch({ channel: process.env.V2_QA_BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined), headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage(); page.setDefaultTimeout(30000);
  const errors = []; page.on('pageerror', (error) => errors.push(error.message));
  const practiceUrl = base + '/practice/' + mantra.slug + '/session/' + session._id;
  await page.goto(practiceUrl);
  await page.getByRole('button', { name: 'Tap to count one chant' }).waitFor();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); await page.getByRole('button', { name: 'Tap to count one chant' }).waitFor();
  revision++;
  await page.evaluate(async () => { const registration = await navigator.serviceWorker.getRegistration(); await registration.update(); });
  await page.getByText('DevSangam update ready', { exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Finish Sadhana First' }).isDisabled(), true);
  assert.equal(page.url(), practiceUrl);
  assert.equal(await page.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration()).waiting)), true);
  await page.getByRole('button', { name: 'Tap to count one chant' }).click();
  assert.equal(page.url(), practiceUrl);
  await page.goto(base + '/about');
  await page.getByRole('heading', { name: 'About DevSangam', exact: true }).waitFor();
  const update = page.getByRole('button', { name: 'Update Now', exact: true });
  await update.waitFor(); assert.equal(await update.isEnabled(), true);
  const reload = page.waitForEvent('load'); await update.click(); await reload;
  await page.getByRole('heading', { name: 'About DevSangam', exact: true }).waitFor();
  assert.equal(await page.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration()).waiting)), false);
  assert.equal(page.url(), base + '/about'); assert.deepEqual(errors, []);
  console.log(JSON.stringify({ result: 'PASS', checks: 10, coverage: 'Real generated SW update waits during Sadhana, disables update action, keeps counting active, and reloads only after explicit update outside practice.' }, null, 2));
} finally {
  if (browser) await browser.close();
  for (const server of [proxy, api]) { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); }
}
