// Real browser + compiled Nest + isolated Mongo; Cloudinary is a local stream fixture.
import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { chromium } from '@playwright/test';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';

const base = 'http://localhost:4173';
Object.assign(process.env, {
  NODE_ENV: 'test', WEB_ORIGIN: base,
  ACCESS_TOKEN_SECRET: 'admin-browser-access-fixture'.repeat(3),
  REFRESH_TOKEN_SECRET: 'admin-browser-refresh-fixture'.repeat(3),
  CLOUDINARY_CLOUD_NAME: 'local-fixture', CLOUDINARY_API_KEY: 'local-fixture',
  CLOUDINARY_API_SECRET: 'local-fixture', PAYMENTS_ENABLED: 'false',
});
const output = await mkdtemp(path.join(tmpdir(), 'devsangam-admin-qa-'));
let mongo, api, browser;
let checks = 0;
const errors = [];
let failUpload = true;
let storedImage;
const uploadOriginal = cloudinary.uploader.upload_stream;
const destroyOriginal = cloudinary.uploader.destroy;
cloudinary.uploader.upload_stream = (options, callback) => {
  const chunks = [];
  const stream = new Writable({ write(chunk, _encoding, done) { chunks.push(chunk); done(); } });
  stream.on('finish', () => {
    if (failUpload) return callback(new Error('Local provider failure fixture'));
    storedImage = Buffer.concat(chunks);
    callback(null, { secure_url: 'https://example.test/admin-test.webp', public_id: options.public_id });
  });
  return stream;
};
cloudinary.uploader.destroy = async () => ({ result: 'ok' });
function check(condition, label) { assert.ok(condition, label); checks++; }
try {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(mongo.getUri());
  const { UserModel } = await import('../apps/api/dist/models/user.model.js');
  const { MantraModel } = await import('../apps/api/dist/models/mantra.model.js');
  const { PracticeSessionModel } = await import('../apps/api/dist/models/practice-session.model.js');
  const { hashPassword } = await import('../apps/api/dist/utils/password.js');
  const { createApiApplication } = await import('../apps/api/dist/app.js');
  const admin = await UserModel.create({ name: 'Admin QA', email: 'admin-qa@example.test', role: 'admin',
    passwordHash: await hashPassword('localbrowserpass123'), preferences: { timezone: 'Asia/Kolkata' } });
  await UserModel.create({ name: 'User QA', email: 'user-qa@example.test', role: 'user',
    passwordHash: await hashPassword('localbrowserpass123'), preferences: { timezone: 'Europe/London' } });
  await MantraModel.insertMany(Array.from({ length: 25 }, (_, index) => ({
    slug: `pagination-${index}`, title: `Pagination mantra ${index}`, sanskrit: 'ॐ', transliteration: 'Om',
    meaning: 'A sacred syllable', createdAt: new Date(Date.now() - index * 86400000),
  })));
  api = await createApiApplication();
  await api.listen(4000, '0.0.0.0');
  browser = await chromium.launch({ channel: process.env.V2_QA_BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : 'chromium'), headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block' });
  await ctx.route('https://example.test/**', route => storedImage && route.request().url().endsWith('/admin-test.webp')
    ? route.fulfill({ contentType: 'image/webp', body: storedImage }) : route.abort());
  const page = await ctx.newPage();
  page.on('pageerror', error => errors.push(error.message));
  async function go(url, heading) {
    await page.goto(base + url);
    await page.getByRole('heading', { name: heading, exact: true }).waitFor();
  }
  async function login(p, email) {
    await p.goto(base + '/auth/login');
    await p.getByLabel('Email', { exact: true }).fill(email);
    await p.getByLabel('Password', { exact: true }).fill('localbrowserpass123');
    await p.getByRole('button', { name: 'Sign In', exact: true }).click();
    await p.waitForURL(base + '/');
  }
  await login(page, 'admin-qa@example.test');
  await go('/admin/analytics', 'Analytics');
  check(await page.getByRole('heading', { name: 'Last 30 days', exact: true }).isVisible(), 'real activity chart');
  await page.getByRole('button', { name: 'New users', exact: true }).click();
  check(await page.getByRole('button', { name: 'New users', exact: true }).getAttribute('aria-pressed') === 'true', 'interactive chart metric');
  await go('/admin/location', 'Graphical Location');
  await page.getByRole('cell', { name: 'Asia/Kolkata', exact: false }).waitFor();
  check(await page.getByRole('cell', { name: 'Europe/London', exact: false }).isVisible(), 'real timezone data');
  await page.getByRole('button', { name: /^Asia\s/ }).click();
  check(await page.getByRole('cell', { name: 'Europe/London', exact: false }).count() === 0, 'regional filtering');
  await go('/admin/content', 'Mantras');
  await page.getByRole('textbox', { name: 'Search records' }).fill('Pagination mantra 24');
  await page.getByRole('heading', { name: 'Pagination mantra 24', exact: true }).waitFor();
  check(await page.getByRole('button', { name: 'Next', exact: true }).isDisabled(), 'search across pages with correct totals');
  await page.getByRole('textbox', { name: 'Search records' }).fill('');
  await page.getByRole('button', { name: 'Create mantra', exact: true }).click();
  const form = page.locator('form');
  for (const [name, value] of [['Title','Browser created mantra'],['URL slug','browser-created-mantra'],['Sanskrit','ॐ नमः'],['Transliteration','Om namah'],['Meaning','A devotional practice'],['Audio link','https://example.test/audio.mp3'],['Video link','https://example.test/video.mp4']]) {
    await form.getByLabel(name, { exact: false }).fill(value);
  }
  const input = await sharp({ create: { width: 1800, height: 1400, channels: 3, background: '#cda762' } }).png().toBuffer();
  await page.getByLabel('Upload mantra image').setInputFiles({ name: 'mantra.png', mimeType: 'image/png', buffer: input });
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('alert').filter({ hasText: 'Mantra saved. Image upload failed' }).waitFor();
  check(await MantraModel.countDocuments({ slug: 'browser-created-mantra' }) === 1, 'provider failure preserves one saved record');
  failUpload = false;
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByRole('heading', { name: 'Browser created mantra', exact: true }).waitFor();
  check(await MantraModel.countDocuments({ slug: 'browser-created-mantra' }) === 1, 'retry never duplicates creation');
  const saved = await MantraModel.findOne({ slug: 'browser-created-mantra' });
  check(saved.image === 'https://example.test/admin-test.webp', 'uploaded image saved');
  check(saved.audioUrl === 'https://example.test/audio.mp3' && saved.videoUrl.endsWith('/video.mp4'), 'optional media metadata saved');
  check((await sharp(storedImage).metadata()).width === 1200 && storedImage.length < input.length, 'real pre-storage compression');
  await page.getByRole('textbox', { name: 'Search records' }).fill('Browser created');
  let card = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Browser created mantra', exact: true }) });
  await card.getByRole('button', { name: 'Edit', exact: true }).click();
  check(await page.getByLabel('URL slug', { exact: false }).getAttribute('readonly') !== null, 'practice URL preserved');
  await page.getByLabel('Title', { exact: false }).fill('Browser updated mantra');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  const updatedSearch = page.waitForResponse(response => response.url().includes('/admin/content?') && response.url().includes('q=Browser%20updated') && response.status() === 200);
  await page.getByRole('textbox', { name: 'Search records' }).fill('Browser updated');
  await updatedSearch;
  await page.getByRole('heading', { name: 'Browser updated mantra', exact: true }).waitFor();
  check((await MantraModel.findById(saved.id)).title === 'Browser updated mantra', 'edit persisted');
  const history = await PracticeSessionModel.create({ userId: admin.id, mantraId: saved.id,
    mantraSlug: saved.slug, targetCount: 108, completedCount: 108, status: 'completed' });
  card = page.locator('article').filter({ has: page.getByRole('heading', { name: 'Browser updated mantra', exact: true }) });
  await card.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByRole('alertdialog').waitFor();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.waitForFunction(() => document.activeElement?.textContent?.trim() === 'Delete');
  check(await card.getByRole('button', { name: 'Delete', exact: true }).evaluate((button) => button === document.activeElement), 'cancel restores focus to delete trigger');
  check((await MantraModel.findById(saved.id)).isPublished, 'cancel does not delete');
  await card.getByRole('button', { name: 'Delete', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm delete', exact: true }).click();
  await page.getByText('Saved successfully.', { exact: true }).waitFor();
  check(Boolean((await MantraModel.findById(saved.id).select('+deletedAt')).deletedAt), 'confirmed archive');
  check(Boolean(await PracticeSessionModel.exists({ _id: history.id })), 'practice history preserved');
  await page.getByLabel('Publication status').selectOption('archived');
  await page.getByRole('button', { name: 'Restore draft', exact: true }).click();
  await page.getByLabel('Publication status').selectOption('draft');
  await page.getByRole('heading', { name: 'Browser updated mantra', exact: true }).waitFor();
  check(!(await MantraModel.findById(saved.id)).isPublished, 'restored as unpublished draft');
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page.getByRole('checkbox', { name: /^Published/ }).check();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.locator('form').waitFor({ state: 'hidden' });
  await MantraModel.updateOne({ _id: saved.id }, { image: 'https://example.test/missing.png' });
  await go('/library/browser-created-mantra', 'Browser updated mantra');
  await page.locator('[data-mantra-placeholder="true"]').waitFor({ timeout: 10000 });
  check(await page.getByRole('link', { name: 'Listen to audio' }).isVisible(), 'public media resource link');
  check(await page.locator('[data-mantra-placeholder="true"]').count() === 1, 'broken image fallback');
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ['light','dark']) {
      await UserModel.updateOne({ _id: admin.id }, { 'preferences.theme': theme });
      for (const [url, heading, name] of [['/admin/analytics','Analytics','analytics'],['/admin/location','Graphical Location','location'],['/admin/content','Mantras','mantras']]) {
        await go(url, heading);
        await page.waitForFunction(value => document.documentElement.classList.contains(value), theme);
        check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `no overflow ${name} ${width} ${theme}`);
        await page.screenshot({ path: path.join(output, `${name}-${width}-${theme}.png`), fullPage: true });
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await UserModel.updateOne({ _id: admin.id }, { 'preferences.theme': 'light' });
  await go('/admin/content', 'Mantras');
  await page.waitForFunction(() => document.documentElement.classList.contains('light'));
  await page.getByRole('button', { name: 'Edit', exact: true }).first().click();
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'mobile editor has no viewport overflow');
  await page.screenshot({ path: path.join(output, 'editor-390-light.png'), fullPage: true });
  await page.getByRole('button', { name: 'Cancel editor', exact: true }).click();
  await page.getByRole('button', { name: 'Delete', exact: true }).first().click();
  const confirmation = page.getByRole('alertdialog');
  const bounds = await confirmation.boundingBox();
  check(bounds && bounds.x >= 15 && bounds.x + bounds.width <= 375 && bounds.y >= 0, 'mobile confirmation fits the viewport');
  await page.screenshot({ path: path.join(output, 'confirmation-390-light.png'), fullPage: true });
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  const menu = page.getByRole('button', { name: 'Open admin navigation', exact: true });
  await menu.click();
  const drawer = page.getByRole('dialog', { name: 'Admin navigation drawer' });
  await drawer.waitFor();
  for (let i = 0; i < 14; i++) await page.keyboard.press('Tab');
  check(await page.evaluate(() => Boolean(document.activeElement.closest('[role="dialog"]'))), 'drawer traps keyboard focus');
  await page.keyboard.press('Escape');
  check(await menu.evaluate(element => document.activeElement === element), 'Escape restores menu focus');
  await menu.click();
  await drawer.getByRole('link', { name: /Graphical Location/ }).click();
  await page.getByRole('heading', { name: 'Graphical Location', exact: true }).waitFor();
  check(await page.getByRole('dialog').count() === 0, 'drawer closes on navigation');
  const userCtx = await browser.newContext({ serviceWorkers: 'block' });
  const userPage = await userCtx.newPage();
  await login(userPage, 'user-qa@example.test');
  await userPage.goto(base + '/admin');
  await userPage.getByRole('heading', { name: 'Administrator access unavailable' }).waitFor();
  check(await userPage.getByRole('navigation', { name: 'Admin navigation' }).count() === 0, 'normal user denied admin UI');
  check(!errors.length, `page errors: ${errors.join(', ')}`);
  console.log(JSON.stringify({ result: 'PASS', checks, screenshots: 14, output, coverage: 'Real compiled Nest/Mongo CRUD, search, archive/restore/history, compressed upload and provider-failure retry, media/fallback, timezone/chart, responsive themes/editor/confirmation and accessible drawer, non-admin denial.' }));
} finally {
  await browser?.close();
  await api?.close();
  await mongoose.disconnect();
  await mongo?.stop();
  cloudinary.uploader.upload_stream = uploadOriginal;
  cloudinary.uploader.destroy = destroyOriginal;
}
