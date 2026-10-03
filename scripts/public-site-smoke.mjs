// Run against a built Vite preview. See docs/V2_TODO.md for setup.
// Mocked sessions exercise routing; they do not verify real auth/provider services.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(
  path.resolve(process.env.V2_QA_MODULE_ROOT, 'package.json')
);
const { chromium } = require('playwright');
const base = process.env.V2_QA_URL || 'http://127.0.0.1:4173';
const output =
  process.env.V2_QA_OUTPUT ||
  path.join(process.env.TEMP, 'devsangam-v2-qa', 'screenshots');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const routes = [
  ['/', 'Make space for daily Sadhana'],
  ['/about', 'About DevSangam'],
  ['/how-it-works', 'How It Works'],
  ['/contact', 'Contact'],
  ['/privacy', 'Privacy Policy'],
  ['/terms', 'Terms & Conditions'],
  ['/store', 'Digital Library'],
];
let checks = 0;
const errors = [];
const user = {
  id: '507f1f77bcf86cd799439011',
  name: 'V2 Tester',
  email: 'v2@example.test',
  avatar: null,
  bio: null,
  intention: null,
  role: 'user',
  emailVerified: false,
  preferences: {
    language: 'en',
    theme: 'dark',
    soundEnabled: false,
    hapticEnabled: false,
    reminderEnabled: false,
    reminderTime: null,
    timezone: 'Asia/Calcutta',
    defaultTarget: 108,
  },
  streak: { current: 0, longest: 0, lastPracticeDate: null },
  totals: { chants: 0, malas: 0, sessions: 0, durationSeconds: 0 },
  createdAt: '2026-10-03T00:00:00.000Z',
  updatedAt: '2026-10-03T00:00:00.000Z',
};
async function context(
  authenticated = false,
  viewport = { width: 1440, height: 1000 }
) {
  const ctx = await browser.newContext({ viewport, serviceWorkers: 'block' });
  ctx.setDefaultTimeout(15000);
  await ctx.route('**/api/v1/**', async (route) => {
    const me = new URL(route.request().url()).pathname.endsWith('/users/me');
    await route.fulfill({
      status: authenticated && me ? 200 : authenticated ? 503 : 401,
      contentType: 'application/json',
      headers: {
        'Access-Control-Allow-Origin': base,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify(
        authenticated && me
          ? { success: true, data: { user } }
          : {
              error: {
                code: 'SMOKE_MOCK',
                message: 'Mock service unavailable.',
              },
            }
      ),
    });
  });
  return ctx;
}
async function heading(page, name) {
  await page.getByRole('heading', { level: 1, name, exact: true }).waitFor();
  checks++;
}
async function noOverflow(page) {
  const result = await page.evaluate(() => {
    const limit = document.documentElement.clientWidth;
    return [...document.querySelectorAll('main *, header *, footer *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > limit + 1 || r.left < -1);
      })
      .map((el) => el.tagName + ':' + el.textContent.slice(0, 50));
  });
  assert.deepEqual(result, [], 'No off-screen public content');
  checks++;
}
try {
  if (!process.argv.includes('--auth-only')) {
    const guest = await context();
    const page = await guest.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    for (const [url, title] of routes) {
      await page.goto(base + url);
      await heading(page, title);
      await noOverflow(page);
      assert.equal(
        await page
          .getByRole('navigation', { name: 'Public navigation' })
          .count(),
        1
      );
      checks++;
    }
    await page.goto(base);
    await heading(page, routes[0][1]);
    for (const [link, title] of [
      ['About', 'About DevSangam'],
      ['How It Works', 'How It Works'],
      ['Contact', 'Contact'],
    ]) {
      await page
        .getByRole('navigation', { name: 'Public navigation' })
        .getByRole('link', { name: link, exact: true })
        .click();
      await heading(page, title);
    }
    for (const [link, title] of [
      ['Privacy Policy', 'Privacy Policy'],
      ['Terms & Conditions', 'Terms & Conditions'],
    ]) {
      await page
        .getByRole('navigation', { name: 'Footer navigation' })
        .getByRole('link', { name: link })
        .click();
      await heading(page, title);
      assert.ok(
        (await page.locator('main').innerText()).includes(
          'pending professional legal review'
        )
      );
      checks++;
    }
    await page
      .getByRole('link', { name: 'Digital Library', exact: true })
      .click();
    await heading(page, 'Digital Library');
    checks++;
    await page.goto(base + '/contact');
    await heading(page, 'Contact');
    await page.getByRole('button', { name: 'Send message' }).click();
    assert.equal(await page.locator('form [aria-invalid="true"]').count(), 3);
    assert.equal(
      await page
        .locator('#contact-name')
        .evaluate((el) => el === document.activeElement),
      true
    );
    checks += 2;
    let submissions = 0;
    page.on('request', (req) => {
      if (req.method() === 'POST' && req.url().includes('/contact'))
        submissions++;
    });
    await page.getByLabel('Name', { exact: true }).fill('Test Practitioner');
    await page.getByLabel('Email', { exact: true }).fill('invalid');
    await page
      .getByLabel('Message', { exact: true })
      .fill('This is a test message.');
    await page.getByRole('button', { name: 'Send message' }).click();
    await page.locator('#contact-email-error').waitFor();
    checks++;
    await page.getByLabel('Email', { exact: true }).fill('test@example.test');
    await page.getByRole('button', { name: 'Send message' }).click();
    await page
      .getByRole('status')
      .filter({ hasText: 'could not be sent' })
      .waitFor();
    assert.equal(submissions, 1);
    checks++;
    for (const width of [320, 390, 768, 1024, 1440]) {
      console.log(`Checking public routes at ${width}px in dark/light/system`);
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ['dark', 'light', 'system']) {
        await page.goto(base);
        await heading(page, routes[0][1]);
        if (width < 1280)
          await page.getByRole('button', { name: 'Open navigation' }).click();
        await page
          .getByRole('combobox', { name: 'Theme', exact: true })
          .selectOption(theme);
        await page.waitForFunction(
          () =>
            document.documentElement.classList.contains('light') ||
            document.documentElement.classList.contains('dark')
        );
        await noOverflow(page);
        for (const [url, title] of routes.slice(1)) {
          await page.goto(base + url);
          await heading(page, title);
          await noOverflow(page);
        }
        await page.screenshot({
          path: path.join(output, `terms-${width}-${theme}.png`),
          fullPage: true,
        });
      }
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base);
    await heading(page, routes[0][1]);
    const menu = page.getByRole('button', { name: 'Open navigation' });
    await menu.focus();
    await page.keyboard.press('Enter');
    assert.equal(
      await page
        .getByRole('button', { name: 'Close navigation' })
        .getAttribute('aria-expanded'),
      'true'
    );
    await page
      .getByRole('navigation', { name: 'Public navigation' })
      .getByRole('link', { name: 'About', exact: true })
      .focus();
    await page.keyboard.press('Escape');
    assert.equal(
      await menu.evaluate((el) => el === document.activeElement),
      true
    );
    checks += 2;
    await menu.click();
    await page
      .getByRole('navigation', { name: 'Public navigation' })
      .getByRole('link', { name: 'About', exact: true })
      .click();
    await heading(page, 'About DevSangam');
    assert.equal(
      await page
        .getByRole('button', { name: 'Open navigation' })
        .getAttribute('aria-expanded'),
      'false'
    );
    checks++;
    await page.emulateMedia({ colorScheme: 'dark' });
    await menu.click();
    await page
      .getByRole('combobox', { name: 'Theme', exact: true })
      .selectOption('system');
    await page.waitForFunction(() =>
      document.documentElement.classList.contains('dark')
    );
    await page.emulateMedia({ colorScheme: 'light' });
    await page.waitForFunction(() =>
      document.documentElement.classList.contains('light')
    );
    checks++;
    await page.goto(base);
    await heading(page, routes[0][1]);
    await page.screenshot({
      path: path.join(output, 'landing-mobile-light.png'),
      fullPage: true,
    });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page
      .getByRole('combobox', { name: 'Theme', exact: true })
      .selectOption('dark');
    await page.screenshot({
      path: path.join(output, 'landing-desktop-dark.png'),
      fullPage: true,
    });
    for (const url of [
      '/library',
      '/library/gayatri',
      '/practice',
      '/practice/gayatri/session/test',
      '/insights',
      '/profile',
      '/settings',
    ]) {
      await page.goto(base + url);
      await page.waitForURL('**/auth/login');
      await page.locator('input[type="password"]').waitFor();
      checks++;
    }
    for (const url of [
      '/auth/register',
      '/auth/forgot-password',
      '/auth/reset-password?token=smoke-placeholder',
    ]) {
      await page.goto(base + url);
      await page.locator('form').waitFor();
      checks++;
    }
    await guest.close();
  }
  const auth = await context(true);
  const app = await auth.newPage();
  app.on('pageerror', (e) => errors.push(e.message));
  await app.goto(base);
  await app.getByRole('heading', { name: 'Namaste, V2' }).waitFor();
  assert.equal(
    await app.getByRole('navigation', { name: 'Public navigation' }).count(),
    0
  );
  checks++;
  await app.goto(base + '/about');
  await heading(app, 'About DevSangam');
  assert.equal(
    await app.getByRole('link', { name: 'Get Started', exact: true }).count(),
    0
  );
  await app
    .locator('#public-navigation')
    .getByRole('link', { name: 'Open App', exact: true })
    .click();
  await app.getByRole('heading', { name: 'Namaste, V2' }).waitFor();
  checks++;
  await app.goto(base + '/library');
  await heading(app, 'Choose your mantra');
  assert.equal(
    await app.getByRole('navigation', { name: 'Public navigation' }).count(),
    0
  );
  checks++;
  await app.goto(base + '/auth/login');
  await app.waitForURL(base + '/');
  await app.getByRole('heading', { name: 'Namaste, V2' }).waitFor();
  checks++;
  await app.goto(base);
  await app.getByRole('heading', { name: 'Namaste, V2' }).waitFor();
  await app.evaluate(() =>
    window.dispatchEvent(new Event('devsangam:auth-expired'))
  );
  await heading(app, routes[0][1]);
  checks++;
  await auth.close();

  const offline = await context(true);
  await offline.addInitScript((cached) => {
    localStorage.setItem('devsangam.auth.cached-user', JSON.stringify(cached));
    Object.defineProperty(navigator, 'onLine', { get: () => false });
  }, user);
  const offlinePage = await offline.newPage();
  offlinePage.on('pageerror', (e) => errors.push(e.message));
  await offlinePage.goto(base);
  await offlinePage.getByRole('heading', { name: 'Namaste, V2' }).waitFor();
  assert.equal(
    await offlinePage
      .getByRole('navigation', { name: 'Public navigation' })
      .count(),
    0
  );
  checks++;
  await offline.close();

  const rejected = await context();
  await rejected.addInitScript((cached) => {
    localStorage.setItem('devsangam.auth.cached-user', JSON.stringify(cached));
  }, user);
  const rejectedPage = await rejected.newPage();
  rejectedPage.on('pageerror', (e) => errors.push(e.message));
  await rejectedPage.goto(base);
  await heading(rejectedPage, routes[0][1]);
  assert.equal(
    await rejectedPage.evaluate(() =>
      localStorage.getItem('devsangam.auth.cached-user')
    ),
    null
  );
  checks++;
  await rejected.close();
  assert.deepEqual(errors, [], 'No uncaught browser errors');
  console.log(
    JSON.stringify(
      {
        result: 'PASS',
        checks,
        browser: 'Edge/Chromium',
        screenshots: output,
        limits:
          'Mocked auth/API; service workers blocked for deterministic routing. Real V1/provider/PWA runtime QA remains manual.',
      },
      null,
      2
    )
  );
} finally {
  await browser.close();
}
