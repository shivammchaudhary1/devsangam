// Real Next server HTML and a browser check for Next's native 404 recovery shell.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
const base = process.env.V2_QA_URL || 'http://127.0.0.1:4173';
const canonical = process.env.NEXT_PUBLIC_SITE_URL || 'https://devsangam.me';
let checks = 0;
const observed = [];
const product = {
  _id: '507f1f77bcf86cd799439022', slug: 'ssr-fixture', title: 'SSR devotional fixture',
  shortDescription: 'Public reading metadata for SSR verification.', description: 'Public description, not PDF contents.',
  accessType: 'paid', pricePaise: 9900, published: true, featured: false,
  coverImage: null, createdAt: '2026-10-10T00:00:00.000Z', updatedAt: '2026-10-10T00:00:00.000Z',
};
const api = createServer((req, res) => {
  observed.push({ url: req.url, cookie: req.headers.cookie, authorization: req.headers.authorization });
  const path = new URL(req.url, 'http://localhost:4000').pathname;
  let data;
  if (path === '/api/v1/store') data = { products: [product], total: 1, page: 1, limit: 50 };
  if (path === '/api/v1/store/ssr-fixture') data = { product, owned: false, paymentsEnabled: false };
  res.writeHead(data ? 200 : 404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data ? { success: true, data } : { success: false, error: { code: 'NOT_FOUND', message: 'Product unavailable.' } }));
});
const visible = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ');
async function document(path, cookie = '') {
  const response = await fetch(base + path, { headers: { Cookie: cookie, 'User-Agent': 'facebookexternalhit/1.1' } });
  const html = await response.text();
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff'); checks++;
  assert.equal(response.headers.get('x-frame-options'), 'DENY'); checks++;
  assert.equal(response.headers.get('x-powered-by'), null); checks++;
  return { response, html, content: visible(html) };
}
try {
  api.listen(4000, 'localhost'); await once(api, 'listening');
  const titles = new Set();
  for (const [route, text] of [
    ['/', 'Make space for daily Sadhana'], ['/about', 'About DevSangam'],
    ['/how-it-works', 'How It Works'], ['/contact', 'Contact'],
    ['/privacy', 'Privacy Policy'], ['/terms', 'Terms &amp; Conditions'],
    ['/store', product.title], ['/store/ssr-fixture', product.title],
  ]) {
    const { response, html, content } = await document(route, 'accessToken=forged-admin; fixture=private-user-marker');
    assert.equal(response.status, 200, route); checks++;
    assert.ok(content.includes(text), route + ' has real server-rendered content'); checks++;
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    assert.ok(title && !titles.has(title), route + ' unique title'); titles.add(title); checks++;
    assert.ok(html.includes('name="description"')); checks++;
    assert.ok(html.includes('rel="canonical" href="' + canonical + (route === '/' ? '' : route) + '"'), route + ' canonical'); checks++;
    assert.ok(html.includes('property="og:title"')); checks++;
    assert.ok(!html.includes('private-user-marker') && !html.includes('fileStorageKey')); checks++;
    assert.equal(response.headers.get('x-devsangam-offline-shell'), 'true'); checks++;
  }
  const home = await document('/');
  assert.ok(home.html.includes('application/ld+json') && home.html.includes('https://schema.org')); checks++;
  for (const route of ['/admin', '/profile', '/settings', '/insights', '/library', '/practice', '/digital-library', '/auth/login', '/astro', '/offline']) {
    const { html, response } = await document(route, 'accessToken=forged-admin');
    assert.equal(response.status, 200, route); checks++;
    assert.match(html, /name="robots" content="noindex[^"]*"/); checks++;
    assert.ok(!html.includes('fileStorageKey') && !html.includes('offline@example.test')); checks++;
  }
  const missing = await document('/store/missing-fixture');
  assert.equal(missing.response.status, 404, 'unpublished/missing products have 404 for crawlers'); checks++;
  // Next emits a minimal 404 HTML document and recovers the segment's UI from
  // Flight during hydration. Check its status/robots AND the real recovered UI.
  assert.ok(missing.html.includes('ProductUnavailable')); checks++;
  assert.match(missing.html, /noindex/); checks++;
  const browser = await chromium.launch({ channel: process.env.V2_QA_BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined), headless: true });
  try {
    const page = await browser.newPage();
    const errors = []; page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(base + '/store/missing-fixture');
    assert.equal(response.status(), 404); checks++;
    await page.getByRole('heading', { name: 'Resource unavailable', exact: true }).waitFor(); checks++;
    assert.equal(await page.locator('header').count(), 1); checks++;
    assert.deepEqual(errors, []); checks++;
  } finally { await browser.close(); }
  const unknown = await document('/unknown-fixture'); assert.equal(unknown.response.status, 404); checks++;
  const map = await (await fetch(base + '/sitemap.xml')).text();
  assert.ok(map.includes(canonical + '/store/ssr-fixture')); checks++;
  for (const privatePath of ['/admin', '/profile', '/auth', '/library', '/practice', '/astro']) { assert.ok(!map.includes(canonical + privatePath)); checks++; }
  const robots = await (await fetch(base + '/robots.txt')).text();
  assert.ok(robots.includes('Disallow: /admin') && robots.includes('Sitemap: ' + canonical + '/sitemap.xml')); checks++;
  const manifest = await (await fetch(base + '/manifest.webmanifest')).json();
  assert.equal(manifest.id, '/'); assert.equal(manifest.start_url, '/'); assert.equal(manifest.scope, '/'); checks += 3;
  const sw = await fetch(base + '/sw.js');
  assert.match(sw.headers.get('cache-control'), /no-cache/); assert.equal(sw.headers.get('service-worker-allowed'), '/'); checks += 2;
  const worker = await sw.text();
  assert.ok(worker.includes('/offline') && worker.includes('devsangam-mantras') && worker.includes('X-DevSangam-Public')); checks++;
  assert.ok(worker.includes('NetworkOnly')); checks++;
  const reset = await fetch(base + '/auth/reset-password?token=private-reset-fixture');
  assert.equal(reset.headers.get('x-devsangam-offline-shell'), 'false'); checks++;
  assert.ok(observed.length > 0 && observed.every((req) => !req.cookie && !req.authorization)); checks++;
  // Concurrent requests never receive the other request's cookies/user data.
  const pair = await Promise.all(['account-one', 'account-two'].map((marker) => document('/store/ssr-fixture', 'fixture=' + marker)));
  assert.ok(pair.every(({ html }) => !html.includes('account-one') && !html.includes('account-two'))); checks++;
  console.log(JSON.stringify({ result: 'PASS', checks, coverage: 'Native Next SSR HTML, unique SEO/canonical/OG, noindex/404, public sitemap, manifest/worker/security headers and anonymous request isolation.' }, null, 2));
} finally {
  api.closeAllConnections(); await new Promise((resolve) => api.close(resolve));
}
