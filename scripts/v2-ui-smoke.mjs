// Browser UI state tests; database/signature security is exercised by npm test.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
const require = createRequire(
  path.resolve(process.env.V2_QA_MODULE_ROOT || '.', 'package.json')
);
const { chromium } = require('playwright');
const base = process.env.V2_QA_URL || 'http://127.0.0.1:4173';
const output = path.join(process.env.TEMP || tmpdir(), 'devsangam-v2-qa', 'screenshots');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.V2_QA_BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined), headless: true });
let checks = 0;
const errors = [];
const user = {
  id: '507f1f77bcf86cd799439011',
  name: 'UI Tester',
  email: 'test@example.test',
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
const product = {
  _id: '507f1f77bcf86cd799439022',
  title: 'Devotional reading',
  slug: 'devotional-reading',
  description: 'A respectful reading resource.',
  shortDescription: 'Reading for your practice.',
  accessType: 'paid',
  pricePaise: 49900,
  currency: 'INR',
  published: true,
  hasFile: true,
  coverImage: null,
};
const mantra = {
  _id: '507f1f77bcf86cd799439023',
  title: 'Premium mantra',
  slug: 'premium-mantra',
  accessType: 'paid',
  pricePaise: 9900,
  locked: true,
  sanskrit: '',
  transliteration: '',
  meaning: '',
  categories: [],
  benefits: [],
  defaultTargets: [108],
  createdAt: new Date().toISOString(),
};
async function makeContext({
  admin = false,
  guest = false,
  capture = true,
} = {}) {
  let owned = false;
  const orders = [];
  const mutations = [];
  let theme = 'dark';
  const ctx = await browser.newContext({
    serviceWorkers: 'block',
    acceptDownloads: true,
  });
  ctx.setDefaultTimeout(15000);
  await ctx.route('https://checkout.razorpay.com/v1/checkout.js', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: `window.Razorpay = class { constructor(options) { this.options = options; }
      on() {} open() { this.options.handler({ razorpay_order_id: 'order_ui', razorpay_payment_id: 'pay_ui', razorpay_signature: '0'.repeat(64) }); } };`,
    })
  );
  await ctx.route('**/api/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const api = url.pathname.replace('/api/v1', '');
    const headers = {
      'Access-Control-Allow-Origin': base,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    };
    if (req.method() === 'OPTIONS')
      return route.fulfill({ status: 204, headers });
    if (!['GET', 'HEAD'].includes(req.method()))
      mutations.push({ api, body: req.postData(), method: req.method() });
    let status = 200;
    let data = {};
    if (api === '/users/me') {
      status = guest ? 401 : 200;
      data = {
        user: {
          ...user,
          preferences: { ...user.preferences, theme },
          role: admin ? 'admin' : 'user',
        },
      };
    } else if (api === '/auth/refresh') status = 401;
    else if (api === '/admin/session') {
      status = admin ? 200 : 403;
      data = { authorized: admin };
    } else if (api === '/admin/metrics')
      data = {
        users: 1,
        newUsers: 1,
        products: 1,
        practice: { sessions: 0, chants: 0 },
        revenue: { capturedRevenuePaise: 49900, refundedPaise: 0 },
        recentUsers: [user],
        recentOrders: [],
        recentContacts: [],
      };
    else if (api.startsWith('/admin/')) {
      if (!admin) status = 403;
      else if (req.method() !== 'GET')
        data = { id: product._id, uploaded: true };
      else
        data = {
          items:
            api === '/admin/products'
              ? [product]
              : api === '/admin/content'
                ? [mantra]
                : api === '/admin/users'
                  ? [{ ...user, _id: user.id }]
                  : [],
          total: 1,
          page: 1,
          limit: 20,
        };
    } else if (api === '/store')
      data = {
        products: url.searchParams.has('free') ? [] : [product],
        total: 1,
      };
    else if (api.endsWith('/file'))
      return route.fulfill({
        headers: {
          ...headers,
          'Content-Disposition': 'attachment; filename="test.pdf"',
        },
        contentType: 'application/pdf',
        body: '%PDF-1.7\nfixture\n%%EOF',
      });
    else if (api === '/store/devotional-reading')
      data = { product, owned, paymentsEnabled: true };
    else if (api === '/payments/orders') {
      data = {
        orderId: '507f1f77bcf86cd799439024',
        razorpayOrderId: 'order_ui',
        amountPaise: 49900,
        currency: 'INR',
        keyId: 'rzp_test_ui',
        title: product.title,
      };
      status = 201;
      orders.push({
        _id: data.orderId,
        title: product.title,
        amountPaise: 49900,
        status: 'payment_pending',
        createdAt: new Date().toISOString(),
      });
    } else if (api === '/payments/verify') {
      if (capture) {
        owned = true;
        orders[0].status = 'paid';
        data = { status: 'paid' };
      } else status = 503;
    } else if (api === '/library/items')
      data = {
        items: owned
          ? [
              {
                id: product._id,
                type: 'digital_product',
                title: product.title,
                available: true,
                slug: product.slug,
                purchasedAt: new Date().toISOString(),
              },
            ]
          : [],
        total: owned ? 1 : 0,
      };
    else if (api === '/library/orders') data = { orders, total: orders.length };
    else if (api === '/mantras/premium-mantra') data = { mantra };
    else if (api === '/mantras') data = { mantras: [mantra] };
    else if (api === '/users/me/favorites') data = { mantras: [] };
    else if (api === '/practice/sessions') data = { sessions: [] };
    else if (api === '/contact') {
      status = 201;
      data = { received: true };
    } else {
      status = 503;
    }
    await route.fulfill({
      status,
      headers,
      contentType: 'application/json',
      body: JSON.stringify({
        success: status < 400,
        data,
        ...(status >= 400
          ? {
              error: {
                code: 'UI_FIXTURE',
                message: 'Fixture service unavailable.',
              },
            }
          : {}),
      }),
    });
  });
  return {
    ctx,
    mutations,
    setTheme: (value) => {
      theme = value;
    },
  };
}
async function title(page, text) {
  await page
    .getByRole('heading', { name: text, exact: true, level: 1 })
    .waitFor();
  checks++;
}
async function bounds(page) {
  const overflow = await page.evaluate(() =>
    [...document.querySelectorAll('body *')]
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        return rect.width && (rect.right > innerWidth + 1 || rect.left < -1);
      })
      .map((el) => ({
        tag: el.tagName,
        text: el.textContent.slice(0, 60),
        class: el.className,
      }))
  );
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1
    ),
    `${page.url()}: ${JSON.stringify(overflow)}`
  );
  checks++;
}
try {
  const normal = await makeContext();
  const page = await normal.ctx.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(base + '/admin');
  await title(page, 'Administrator access unavailable');
  assert.equal(
    await page.getByRole('navigation', { name: 'Admin navigation' }).count(),
    0
  );
  checks++;
  await page.goto(base + '/astro');
  await page.locator('section[aria-label="Astro"]').waitFor();
  assert.equal(
    await page.locator('section[aria-label="Astro"]').innerText(),
    ''
  );
  checks++;
  await page.goto(base + '/library/premium-mantra');
  await title(page, mantra.title);
  assert.ok((await page.locator('main').innerText()).includes('Unlock'));
  checks++;
  await page.goto(base + '/practice?mantra=premium-mantra');
  await title(page, mantra.title);
  assert.equal(
    await page
      .getByRole('button', { name: 'Start Practice', exact: true })
      .count(),
    0
  );
  checks++;
  await page.goto(base + '/digital-library');
  await title(page, 'My digital library');
  await page
    .getByText('No purchased resources yet.', { exact: false })
    .waitFor();
  checks++;
  await page.goto(base + '/store/devotional-reading');
  await title(page, product.title);
  await page.getByRole('button', { name: /Unlock/ }).click();
  await page
    .getByRole('button', { name: 'Download PDF', exact: true })
    .waitFor();
  checks++;
  const orderMutation = normal.mutations.find(
    (item) => item.api === '/payments/orders'
  );
  assert.deepEqual(JSON.parse(orderMutation.body), {
    itemType: 'digital_product',
    itemId: product._id,
  });
  checks++;
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  await downloadPromise;
  checks++;
  await page.goto(base + '/digital-library');
  await title(page, 'My digital library');
  await page.getByRole('button', { name: 'Download PDF' }).waitFor();
  checks++;
  await page.goto(base + '/digital-library/purchases');
  await title(page, 'Purchase history');
  assert.ok((await page.locator('main').innerText()).toLowerCase().includes('paid'));
  checks++;
  await normal.ctx.close();
  const failure = await makeContext({ capture: false });
  const failedPage = await failure.ctx.newPage();
  await failedPage.goto(base + '/store/devotional-reading');
  await title(failedPage, product.title);
  await failedPage.getByRole('button', { name: /Unlock/ }).click();
  await failedPage
    .getByText('Payment confirmation is pending.', { exact: false })
    .waitFor();
  assert.equal(
    await failedPage.getByRole('button', { name: 'Download PDF' }).count(),
    0
  );
  checks++;
  await failure.ctx.close();
  const admin = await makeContext({ admin: true });
  const adminPage = await admin.ctx.newPage();
  adminPage.on('pageerror', (error) => errors.push(error.message));
  for (const width of [320, 390, 768, 1440]) {
    await adminPage.setViewportSize({ width, height: 1000 });
    for (const theme of ['light', 'dark']) {
      admin.setTheme(theme);
      for (const section of [
        'analytics',
        'content',
        'products',
        'users',
        'orders',
        'contact',
        'entitlements',
        'audit',
      ]) {
        await adminPage.goto(base + '/admin/' + section);
        await title(
          adminPage,
          section === 'content'
            ? 'Mantras'
            : section === 'analytics'
              ? 'Analytics'
              : section
        );
        assert.ok(
          await adminPage.evaluate(
            (theme) => document.documentElement.classList.contains(theme),
            theme
          )
        );
        checks++;
        await bounds(adminPage);
      }
      await adminPage.goto(base + '/store');
      await title(adminPage, 'Digital Library');
      await bounds(adminPage);
      await adminPage.screenshot({
        path: path.join(output, `store-${width}-${theme}.png`),
        fullPage: true,
      });
    }
  }
  await adminPage.goto(base + '/admin/products');
  await title(adminPage, 'products');
  await adminPage.getByRole('button', { name: 'Edit', exact: true }).click();
  await adminPage
    .getByRole('textbox', { name: /^title$/i })
    .fill('Updated reading');
  await adminPage.getByRole('button', { name: 'Save', exact: true }).click();
  await adminPage.getByRole('button', { name: 'Edit', exact: true }).waitFor();
  assert.ok(
    admin.mutations.some(
      (item) =>
        item.method === 'PUT' &&
        JSON.parse(item.body).title === 'Updated reading'
    )
  );
  checks++;
  await adminPage
    .getByRole('button', { name: 'Unpublish', exact: true })
    .click();
  await adminPage.getByText('Saved successfully.').waitFor();
  checks++;
  await adminPage.screenshot({
    path: path.join(output, 'admin-products.png'),
    fullPage: true,
  });
  await admin.ctx.close();
  const guest = await makeContext({ guest: true });
  const contact = await guest.ctx.newPage();
  await contact.goto(base + '/contact');
  await title(contact, 'Contact');
  await contact.getByLabel('Name', { exact: true }).fill('UI Test');
  await contact.getByLabel('Email', { exact: true }).fill('ui@example.test');
  await contact
    .getByLabel('Message', { exact: true })
    .fill('A local browser test message.');
  await contact.getByRole('button', { name: 'Send message' }).click();
  await contact
    .getByText('Your message has been received.', { exact: false })
    .waitFor();
  checks++;
  assert.equal(
    await contact.getByLabel('Name', { exact: true }).inputValue(),
    ''
  );
  checks++;
  await guest.ctx.close();
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        result: 'PASS',
        checks,
        screenshots: output,
        limits:
          'Mocked UI provider/API. npm test covers actual temporary MongoDB/server authorization and signatures.',
      },
      null,
      2
    )
  );
} finally {
  await browser.close();
}
