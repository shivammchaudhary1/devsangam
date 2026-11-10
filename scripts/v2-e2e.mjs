// Full browser -> Nest -> temporary MongoDB -> private PDF integration.
// Only Razorpay's network/Checkout are fixtures. Never connects to a configured DB.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHmac } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
const require = createRequire(
  path.resolve(process.env.V2_QA_MODULE_ROOT || '.', 'package.json')
);
const { chromium } = require('playwright');
const base = 'http://localhost:4173';
const apiImport = (file) => import('../apps/api/' + (process.argv.includes('--compiled') ? 'dist/' + file.replace(/\.ts$/, '.js') : 'src/' + file));
const apiBase = 'http://localhost:4000/api/v1';
Object.assign(process.env, {
  NODE_ENV: 'test',
  WEB_ORIGIN: base,
  ACCESS_TOKEN_SECRET: 'e2e-access-fixture'.repeat(4),
  REFRESH_TOKEN_SECRET: 'e2e-refresh-fixture'.repeat(4),
  PAYMENTS_ENABLED: 'true',
  RAZORPAY_KEY_ID: 'rzp_test_fixture',
  RAZORPAY_KEY_SECRET: 'e2e-only-fixture',
  RAZORPAY_WEBHOOK_SECRET: 'e2e-webhook-fixture',
});
delete process.env.AZURE_STORAGE_CONNECTION_STRING;
const privateDirectory = await mkdtemp(
  path.join(tmpdir(), 'devsangam-v2-e2e-')
);
process.env.PRIVATE_ASSET_DIR = privateDirectory;
const originalFetch = globalThis.fetch;
let refunded = false;
globalThis.fetch = async (input, init) => {
  const url = String(input);
  if (!url.startsWith('https://api.razorpay.com/v1'))
    return originalFetch(input, init);
  if (url.endsWith('/orders')) {
    const { amount, currency } = JSON.parse(String(init.body));
    return Response.json({ id: 'order_e2e', amount, currency });
  }
  return Response.json({
    id: 'pay_e2e',
    order_id: 'order_e2e',
    amount: 49900,
    currency: 'INR',
    status: refunded ? 'refunded' : 'captured',
    amount_refunded: refunded ? 49900 : 0,
  });
};
let mongo, api, browser;
let checks = 0;
try {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(mongo.getUri());
  const { ensureV2Indexes } =
    await apiImport('config/v2-indexes.ts');
  await ensureV2Indexes();
  const { createApiApplication } = await apiImport('app.ts');
  api = await createApiApplication();
  await api.listen(4000, '0.0.0.0');
  const { DigitalProductModel, EntitlementModel, AdminAuditModel, OrderModel } =
    await apiImport('models/commerce.model.ts');
  const { UserModel } = await apiImport('models/user.model.ts');
  const { ContactMessageModel } =
    await apiImport('models/contact-message.model.ts');
  const { storePrivatePdf } =
    await apiImport('services/private-asset.service.ts');
  const pdf = Buffer.from('%PDF-1.7\nEnd-to-end fixture only\n%%EOF');
  const key = await storePrivatePdf(pdf);
  const product = await DigitalProductModel.create({
    title: 'E2E devotional resource',
    slug: 'e2e-resource',
    shortDescription: 'A local test resource.',
    description: 'Reading resource for an isolated end-to-end test.',
    accessType: 'paid',
    pricePaise: 49900,
    published: true,
    fileStorageKey: key,
  });
  const registration = await originalFetch(apiBase + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: base },
    body: JSON.stringify({
      name: 'E2E Practitioner',
      email: 'e2e@example.test',
      password: 'e2etestpassword123',
      role: 'admin',
    }),
  });
  assert.equal(registration.status, 201);
  checks++;
  const account = (await registration.json()).data.user;
  assert.equal(account.role, 'user');
  checks++;
  browser = await chromium.launch({ channel: process.env.V2_QA_BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined), headless: true });
  const ctx = await browser.newContext({
    serviceWorkers: 'block',
    acceptDownloads: true,
  });
  await ctx.addCookies(
    registration.headers.getSetCookie().map((value) => {
      const first = value.split(';')[0];
      const separator = first.indexOf('=');
      return {
        name: first.slice(0, separator),
        value: first.slice(separator + 1),
        domain: 'localhost',
        path: value.match(/; Path=([^;]+)/i)?.[1] ?? '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      };
    })
  );
  const signature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update('order_e2e|pay_e2e')
    .digest('hex');
  await ctx.route('https://checkout.razorpay.com/v1/checkout.js', (route) =>
    route.fulfill({
      contentType: 'text/javascript',
      body: `window.Razorpay = class { constructor(options) { this.options = options; } on() {}
      open() { this.options.handler({ razorpay_order_id: this.options.order_id, razorpay_payment_id: 'pay_e2e', razorpay_signature: '${signature}' }); } };`,
    })
  );
  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(base + '/admin');
  await page
    .getByRole('heading', { name: 'Administrator access unavailable' })
    .waitFor();
  checks++;
  await page.goto(base + '/store/e2e-resource');
  await page.getByRole('heading', { name: product.title }).waitFor();
  checks++;
  const fileUrl = `${apiBase}/store/${product.id}/file`;
  assert.equal(
    await page.evaluate(
      async (url) => (await fetch(url, { credentials: 'include' })).status,
      fileUrl
    ),
    403
  );
  checks++;
  await page.getByRole('button', { name: /Unlock/ }).click();
  await page
    .getByRole('button', { name: 'Download PDF', exact: true })
    .waitFor();
  checks++;
  assert.equal(
    await EntitlementModel.countDocuments({
      userId: account.id,
      resourceId: product._id,
      status: 'active',
    }),
    1
  );
  checks++;
  assert.equal((await OrderModel.findOne())?.amountPaise, 49900);
  checks++;
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download PDF' }).click();
  assert.deepEqual(await readFile(await (await downloaded).path()), pdf);
  checks++;
  await page.goto(base + '/digital-library');
  await page.getByRole('button', { name: 'Download PDF' }).waitFor();
  checks++;
  await page.goto(base + '/digital-library/purchases');
  await page.getByText('paid', { exact: false }).first().waitFor();
  checks++;
  await page.goto(base + '/contact');
  await page.getByLabel('Name', { exact: true }).fill('E2E Contact');
  await page.getByLabel('Email', { exact: true }).fill('e2e@example.test');
  await page
    .getByLabel('Message', { exact: true })
    .fill('End-to-end contact message.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await page
    .getByText('Your message has been received.', { exact: false })
    .waitFor();
  assert.equal(
    await ContactMessageModel.countDocuments({ name: 'E2E Contact' }),
    1
  );
  checks++;
  // Test-owned account only. The operator promotion CLI is separately integration-tested.
  await UserModel.updateOne({ _id: account.id }, { role: 'admin' });
  await page.goto(base + '/admin/analytics');
  await page.getByRole('heading', { name: 'Analytics', exact: true }).waitFor();
  checks++;
  await page.goto(base + '/admin/products');
  await page.getByRole('button', { name: 'Edit', exact: true }).click();
  await page
    .getByRole('textbox', { name: /^title$/i })
    .fill('Updated E2E resource');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.locator('form').waitFor({ state: 'hidden' });
  assert.equal(
    (await DigitalProductModel.findById(product._id))?.title,
    'Updated E2E resource'
  );
  assert.ok(
    await AdminAuditModel.exists({
      targetId: product.id,
      action: 'content.updated',
    })
  );
  checks += 2;
  await page.goto(base + '/admin/contact');
  await page.getByRole('button', { name: 'Mark reviewed' }).click();
  await page.getByText('Saved successfully.').waitFor();
  assert.equal((await ContactMessageModel.findOne())?.status, 'reviewed');
  checks++;
  refunded = true;
  const raw = JSON.stringify({
    event: 'refund.processed',
    payload: { refund: { entity: { payment_id: 'pay_e2e' } } },
  });
  const webhook = await originalFetch(apiBase + '/payments/webhook', {
    method: 'POST',
    body: raw,
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-event-id': 'e2e-refund',
      'x-razorpay-signature': createHmac(
        'sha256',
        process.env.RAZORPAY_WEBHOOK_SECRET
      )
        .update(raw)
        .digest('hex'),
    },
  });
  assert.equal(webhook.status, 200);
  assert.equal(
    await page.evaluate(
      async (url) => (await fetch(url, { credentials: 'include' })).status,
      fileUrl
    ),
    403
  );
  assert.equal(
    await EntitlementModel.countDocuments({
      userId: account.id,
      status: 'active',
    }),
    0
  );
  checks += 3;
  assert.deepEqual(errors, []);
  checks++;
  console.log(
    JSON.stringify(
      {
        result: 'PASS',
        checks,
        coverage:
          'Actual browser/Nest/MongoDB/private-PDF/contact/admin/payment-verification/entitlement/refund integration.',
        limits:
          'Razorpay and Checkout are local fixtures; live provider end-to-end remains blocked on configuration.',
      },
      null,
      2
    )
  );
  await ctx.close();
} finally {
  globalThis.fetch = originalFetch;
  if (browser) await browser.close();
  if (api) {
    api.getHttpServer().closeAllConnections();
    await api.close();
  }
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
  if (
    path.dirname(path.resolve(privateDirectory)) === path.resolve(tmpdir()) &&
    path.basename(privateDirectory).startsWith('devsangam-v2-e2e-')
  ) {
    await rm(privateDirectory, { recursive: true, force: true });
  }
}
