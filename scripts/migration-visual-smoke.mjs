// Same screenshots before/after migration; never connects to a real account/API.
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import pixelmatch from 'pixelmatch';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';

const base = process.env.V2_QA_URL || 'http://127.0.0.1:4173';
const phase = process.argv[2] || 'after';
const root = path.join(tmpdir(), 'devsangam-framework-visual');
await mkdir(path.join(root, phase), { recursive: true });
const browser = await chromium.launch({ channel: process.env.V2_QA_BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined), headless: true });
const measurements = [];
try {
  for (const width of [390, 1440]) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 }, serviceWorkers: 'block',
      });
      await context.addInitScript((value) => {
        localStorage.setItem('devsangam.theme', value);
      }, theme);
      await context.route('**/api/v1/**', (route) => route.fulfill({
        status: 401, contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': base, 'Access-Control-Allow-Credentials': 'true' },
        body: JSON.stringify({ success: false, error: { code: 'FIXTURE', message: 'Unavailable.' } }),
      }));
      const page = await context.newPage();
      for (const route of ['/', '/about', '/contact', '/auth/login']) {
        await page.goto(base + route);
        await page.locator('h1').first().waitFor();
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(500);
        const name = `${route.replaceAll('/', '-') || 'home'}-${width}-${theme}`;
        const items = await page.locator('h1, header, main, footer').evaluateAll((nodes) => nodes.map((node) => {
          const box = node.getBoundingClientRect();
          const style = getComputedStyle(node);
          return { tag: node.tagName, text: node.tagName === 'H1' ? node.textContent : '',
            x: box.x, y: box.y, width: box.width, height: box.height,
            font: style.fontFamily, fontSize: style.fontSize, color: style.color };
        }));
        assert.ok(items.some((item) => item.tag === 'H1'));
        measurements.push({ name, items });
        await page.screenshot({ path: path.join(root, phase, name + '.png'), animations: 'disabled' });
      }
      await context.close();
    }
  }
  await writeFile(path.join(root, phase + '.json'), JSON.stringify(measurements, null, 2));
  const parity = [];
  if (process.argv.includes('--compare')) {
    const baseline = JSON.parse(await readFile(path.join(root, 'before.json'), 'utf8'));
    assert.deepEqual(measurements, baseline, 'Geometry, headings, fonts and colors match the committed V2 UI');
    const require = createRequire(import.meta.url);
    const sharp = createRequire(require.resolve('next/package.json'))('sharp');
    for (const { name } of measurements) {
      const before = await sharp(path.join(root, 'before', name + '.png')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      const after = await sharp(path.join(root, phase, name + '.png')).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      assert.deepEqual(after.info, before.info, name + ' screenshot dimensions');
      let differences = 0;
      for (let i = 0; i < before.data.length; i++) if (before.data[i] !== after.data[i]) differences++;
      const percentage = differences / before.data.length * 100;
      const perceptualPixels = pixelmatch(before.data, after.data, null, before.info.width, before.info.height, { threshold: 0.1, includeAA: false });
      assert.ok(perceptualPixels / (before.info.width * before.info.height) < 0.001, name + ' visual parity (ignore antialiasing, at most 0.1% differing pixels)');
      parity.push({ name, changedChannelsPercent: percentage, perceptualPixels,
        perceptualPixelPercent: perceptualPixels / (before.info.width * before.info.height) * 100 });
    }
    await writeFile(path.join(root, 'parity.json'), JSON.stringify(parity, null, 2));
  }
  console.log(JSON.stringify({ result: 'PASS', phase, snapshots: measurements.length, root,
    ...(parity.length ? { geometryFontsColors: 'EXACT', pixelExact: parity.filter((item) => !item.changedChannelsPercent).length,
      maxChangedChannelsPercent: Math.max(...parity.map((item) => item.changedChannelsPercent)),
      maxPerceptualPixelPercent: Math.max(...parity.map((item) => item.perceptualPixelPercent)) } : {}) }));
} finally {
  await browser.close();
}
