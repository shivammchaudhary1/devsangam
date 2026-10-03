import { validateProductionEnvironment } from '../config/env.ts';
import { ensureV2Indexes } from '../config/v2-indexes.ts';
import { AuthSessionModel } from '../models/auth-session.model.ts';
import {
  AdminAuditModel,
  DigitalProductModel,
  EntitlementModel,
  OrderModel,
  PaymentEventModel,
} from '../models/commerce.model.ts';
import { ContactMessageModel } from '../models/contact-message.model.ts';
import { MantraModel } from '../models/mantra.model.ts';
import { PasswordResetTokenModel } from '../models/password-reset-token.model.ts';
import { PracticeSessionModel } from '../models/practice-session.model.ts';
import { UserModel } from '../models/user.model.ts';
import { storePrivatePdf } from '../services/private-asset.service.ts';
import { signAccessToken } from '../utils/token.ts';
import { hashToken } from '../utils/token.ts';
import { registerSchema } from '../validators/auth/register.schema.ts';
import { smtpFixture } from './smtp-fixture.ts';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import type { Server } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { promisify } from 'node:util';

let mongo: MongoMemoryReplSet;
let server: Server;
let base: string;
let adminCookie: string;
let userCookie: string;
let adminId: string;
let userId: string;
let privateDirectory: string;
let smtp: Awaited<ReturnType<typeof smtpFixture>>;
const originalFetch = globalThis.fetch;
const externalPayments = new Map<
  string,
  {
    id: string;
    order_id: string;
    amount: number;
    currency: string;
    status: string;
    amount_refunded: number;
  }
>();
let externalOrderSequence = 0;
let productId: string;
let internalOrderId: string;
let externalOrderId: string;
const pdf = Buffer.from('%PDF-1.7\nLocal test fixture only\n%%EOF');
const signed = (body: string, secret = process.env.RAZORPAY_KEY_SECRET!) =>
  createHmac('sha256', secret).update(body).digest('hex');
before(
  async () => {
    process.env.NODE_ENV = 'test';
    process.env.WEB_ORIGIN = 'http://localhost:5173';
    process.env.ACCESS_TOKEN_SECRET =
      'test-access-only-not-a-production-secret'.repeat(2);
    process.env.REFRESH_TOKEN_SECRET =
      'test-refresh-only-not-a-production-secret'.repeat(2);
    process.env.PAYMENTS_ENABLED = 'true';
    process.env.RAZORPAY_KEY_ID = 'rzp_test_local_fixture';
    process.env.RAZORPAY_KEY_SECRET = 'local-test-key-secret';
    process.env.RAZORPAY_WEBHOOK_SECRET = 'local-test-webhook-secret';
    delete process.env.AZURE_STORAGE_CONNECTION_STRING;
    smtp = await smtpFixture();
    process.env.EMAIL_HOST = '127.0.0.1';
    process.env.EMAIL_PORT = String(smtp.port);
    process.env.EMAIL_USER = 'smtp-fixture@example.test';
    process.env.EMAIL_PASSWORD = 'smtp-fixture-only';
    privateDirectory = await mkdtemp(
      path.join(tmpdir(), 'devsangam-v2-assets-')
    );
    process.env.PRIVATE_ASSET_DIR = privateDirectory;
    globalThis.fetch = async (input, init) => {
      const url = String(input);
      if (!url.startsWith('https://api.razorpay.com/v1'))
        return originalFetch(input, init);
      if (url.endsWith('/orders') && init?.method === 'POST') {
        const payload = JSON.parse(String(init.body));
        assert.equal(payload.currency, 'INR');
        assert.ok(Number.isInteger(payload.amount));
        return Response.json({
          id: `order_fixture${++externalOrderSequence}`,
          amount: payload.amount,
          currency: 'INR',
        });
      }
      const paymentId = url.split('/').at(-1)!;
      const payment = externalPayments.get(paymentId);
      return payment
        ? Response.json(payment)
        : Response.json({ error: 'fixture missing' }, { status: 404 });
    };
    mongo = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    await mongoose.connect(mongo.getUri());
    await ensureV2Indexes();
    const { app } = await import('../app.ts');
    server = app.listen(0);
    await once(server, 'listening');
    base = `http://127.0.0.1:${(server.address() as { port: number }).port}/api/v1`;
    async function account(role: 'user' | 'admin') {
      const user = await UserModel.create({
        name: 'V2 Test',
        email: `${role}@example.test`,
        passwordHash: 'test',
        role,
      });
      const session = await AuthSessionModel.create({
        userId: user._id,
        refreshTokenHash: 'test',
        expiresAt: new Date(Date.now() + 3600000),
      });
      return {
        id: user.id,
        cookie: `ds_access=${await signAccessToken(user.id, session.id)}`,
      };
    }
    const admin = await account('admin');
    const user = await account('user');
    adminId = admin.id;
    userId = user.id;
    adminCookie = admin.cookie;
    userCookie = user.cookie;
  },
  { timeout: 180000 }
);
after(async () => {
  globalThis.fetch = originalFetch;
  if (server)
    await new Promise<void>((resolve) => server.close(() => resolve()));
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
  if (smtp) await smtp.close();
  // Only remove the test-owned mkdtemp directory after verifying its absolute parent.
  if (
    privateDirectory &&
    path.dirname(path.resolve(privateDirectory)) === path.resolve(tmpdir()) &&
    path.basename(privateDirectory).startsWith('devsangam-v2-assets-')
  ) {
    await rm(privateDirectory, { recursive: true, force: true });
  }
});
async function request(
  url: string,
  method = 'GET',
  body?: unknown,
  cookie?: string
) {
  return fetch(base + url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.WEB_ORIGIN!,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}
test('contact validates, stores plain text and enforces strict body/spam limits', async () => {
  const message = {
    name: 'Test',
    email: 'test@example.test',
    category: 'general',
    message: '<script>alert("hi")</script>',
  };
  assert.equal(
    (await request('/contact', 'POST', { ...message, email: 'invalid' }))
      .status,
    400
  );
  assert.equal(
    (await request('/contact', 'POST', { ...message, website: 'spam' })).status,
    400
  );
  assert.equal((await request('/contact', 'POST', message)).status, 201);
  assert.equal((await ContactMessageModel.findOne())?.message, message.message);
  assert.equal(
    (
      await request('/contact', 'POST', {
        ...message,
        message: 'x'.repeat(10000),
      })
    ).status,
    413
  );
  assert.equal((await request('/contact', 'POST', message)).status, 201);
  assert.equal((await request('/contact', 'POST', message)).status, 429);
});
test('admin APIs enforce auth, active session and current DB role', async () => {
  assert.equal((await request('/admin/session')).status, 401);
  assert.equal(
    (await request('/admin/session', 'GET', undefined, userCookie)).status,
    403
  );
  assert.equal(
    (await request('/admin/session', 'GET', undefined, adminCookie)).status,
    200
  );
  await UserModel.updateOne({ _id: adminId }, { role: 'user' });
  assert.equal(
    (await request('/admin/session', 'GET', undefined, adminCookie)).status,
    403
  );
  await UserModel.updateOne({ _id: adminId }, { role: 'admin' });
  await AuthSessionModel.updateMany({ userId }, { expiresAt: new Date(0) });
  assert.equal(
    (await request('/admin/session', 'GET', undefined, userCookie)).status,
    401
  );
  const session = await AuthSessionModel.create({
    userId,
    refreshTokenHash: 'test',
    expiresAt: new Date(Date.now() + 3600000),
  });
  userCookie = `ds_access=${await signAccessToken(userId, session.id)}`;
});
test('registration never accepts role', () => {
  assert.equal(
    'role' in
      registerSchema.parse({
        name: 'Test',
        email: 'test@example.test',
        password: 'testpassword123',
        role: 'admin',
      }),
    false
  );
});

test('origin hardening rejects forged and missing browser-cookie origins', async () => {
  for (const origin of ['https://untrusted.example', undefined]) {
    const response = await fetch(base + '/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: adminCookie,
        ...(origin ? { Origin: origin } : {}),
      },
      body: '{}',
    });
    assert.equal(response.status, 403);
  }
});

test('admin content validation, private PDF upload, publish/unpublish and safe projections', async () => {
  const draft = {
    title: 'Test reading',
    slug: 'test-reading',
    description: 'A local integration test reading.',
    shortDescription: 'Local fixture',
    accessType: 'paid',
    pricePaise: 49900,
    published: false,
  };
  assert.equal(
    (
      await request(
        '/admin/products',
        'POST',
        { ...draft, pricePaise: -1 },
        adminCookie
      )
    ).status,
    400
  );
  assert.equal(
    (await request('/admin/products', 'POST', draft, userCookie)).status,
    403
  );
  const created = await request('/admin/products', 'POST', draft, adminCookie);
  assert.equal(created.status, 201);
  productId = (await created.json()).data.id;
  assert.equal((await request('/store/test-reading')).status, 404);
  assert.equal(
    (
      await request(
        `/admin/products/${productId}`,
        'PUT',
        { ...draft, published: true },
        adminCookie
      )
    ).status,
    400
  );
  async function upload(bytes: Buffer) {
    const body = new FormData();
    body.append(
      'file',
      new Blob([new Uint8Array(bytes)], { type: 'application/pdf' }),
      'fixture.pdf'
    );
    return fetch(base + `/admin/products/${productId}/file`, {
      method: 'POST',
      headers: { Cookie: adminCookie, Origin: process.env.WEB_ORIGIN! },
      body,
    });
  }
  assert.equal((await upload(Buffer.from('invalid file'))).status, 400);
  assert.equal((await upload(pdf)).status, 200);
  assert.equal(
    (
      await request(
        `/admin/products/${productId}`,
        'PUT',
        { ...draft, published: true },
        adminCookie
      )
    ).status,
    200
  );
  const detail = await request('/store/test-reading');
  const publicData = await detail.json();
  assert.equal(publicData.data.owned, false);
  assert.equal('fileStorageKey' in publicData.data.product, false);
  assert.equal((await request(`/store/${productId}/file`)).status, 401);
  assert.equal(
    (await request(`/store/${productId}/file`, 'GET', undefined, userCookie))
      .status,
    403
  );
  const users = await (
    await request('/admin/users', 'GET', undefined, adminCookie)
  ).json();
  assert.equal('passwordHash' in users.data.items[0], false);
  assert.equal('preferences' in users.data.items[0], false);
  const listing = await (
    await request('/admin/products', 'GET', undefined, adminCookie)
  ).json();
  assert.equal(listing.data.items[0].hasFile, true);
  assert.equal('fileStorageKey' in listing.data.items[0], false);
  assert.equal(
    (
      await request(
        `/admin/products/${productId}`,
        'DELETE',
        undefined,
        adminCookie
      )
    ).status,
    200
  );
  assert.equal((await request('/store/test-reading')).status, 404);
  assert.equal(
    (
      await request(
        `/admin/products/${productId}`,
        'PUT',
        { ...draft, published: true },
        adminCookie
      )
    ).status,
    200
  );
  assert.ok(
    (await AdminAuditModel.countDocuments({ targetId: productId })) >= 4
  );
});

test('legacy/free content stays readable; paid text, favorites and practice require server entitlements', async () => {
  const legacy = await MantraModel.create({
    title: 'Legacy mantra',
    slug: 'legacy-test',
    sanskrit: 'legacy text',
    transliteration: 'legacy',
    meaning: 'legacy meaning',
    defaultTargets: [3],
  });
  // Emulate a V1 record that predates the new fields without changing production data.
  await MantraModel.collection.updateOne(
    { _id: legacy._id },
    { $unset: { accessType: '', pricePaise: '' } }
  );
  const free = await request('/mantras/legacy-test');
  assert.equal(free.status, 200);
  assert.equal((await free.json()).data.mantra.sanskrit, 'legacy text');
  const paid = await MantraModel.create({
    title: 'Paid mantra',
    slug: 'paid-test',
    sanskrit: 'private chant',
    transliteration: 'private words',
    meaning: 'private meaning',
    accessType: 'paid',
    pricePaise: 10000,
  });
  const locked = await request(
    '/mantras/paid-test',
    'GET',
    undefined,
    userCookie
  );
  assert.equal(locked.headers.get('x-devsangam-public'), 'false');
  assert.equal((await locked.json()).data.mantra.sanskrit, '');
  assert.equal(
    (
      await request(
        '/users/me/favorites/paid-test',
        'PUT',
        undefined,
        userCookie
      )
    ).status,
    200
  );
  const favorites = await (
    await request('/users/me/favorites', 'GET', undefined, userCookie)
  ).json();
  assert.equal(
    favorites.data.mantras.find(
      (item: { slug: string }) => item.slug === 'paid-test'
    ).sanskrit,
    ''
  );
  assert.equal(
    (
      await request(
        '/practice/sessions',
        'POST',
        { mantraSlug: 'paid-test', targetCount: 3 },
        userCookie
      )
    ).status,
    403
  );
  const sourceOrderId = new mongoose.Types.ObjectId();
  await EntitlementModel.create({
    userId,
    resourceType: 'mantra',
    resourceId: paid._id,
    sourceOrderId,
  });
  const owned = await request(
    '/mantras/paid-test',
    'GET',
    undefined,
    userCookie
  );
  assert.equal((await owned.json()).data.mantra.sanskrit, 'private chant');
  assert.match(owned.headers.get('cache-control')!, /no-store/);
  assert.equal(
    (
      await request(
        '/practice/sessions',
        'POST',
        { mantraSlug: 'paid-test', targetCount: 3 },
        userCookie
      )
    ).status,
    201
  );
  await PracticeSessionModel.deleteMany({ userId, mantraId: paid._id });
  const session = await request(
    '/practice/sessions',
    'POST',
    { mantraSlug: 'paid-test', targetCount: 3 },
    userCookie
  );
  const sessionId = (await session.json()).data.session._id;
  await EntitlementModel.updateMany(
    { userId, resourceId: paid._id },
    { status: 'revoked' }
  );
  assert.equal(
    (
      await request(
        `/practice/sessions/${sessionId}`,
        'PATCH',
        { completedCount: 1 },
        userCookie
      )
    ).status,
    403
  );
  assert.equal(
    (
      await request(
        `/practice/sessions/${sessionId}`,
        'PATCH',
        { status: 'abandoned' },
        userCookie
      )
    ).status,
    200
  );
});

test('server-priced orders reject injected price and grant nothing before verified capture', async () => {
  assert.equal(
    (
      await request(
        '/payments/orders',
        'POST',
        { itemType: 'digital_product', itemId: productId, amountPaise: 1 },
        userCookie
      )
    ).status,
    400
  );
  const response = await request(
    '/payments/orders',
    'POST',
    { itemType: 'digital_product', itemId: productId },
    userCookie
  );
  assert.equal(response.status, 201);
  const data = (await response.json()).data;
  internalOrderId = data.orderId;
  externalOrderId = data.razorpayOrderId;
  assert.equal(data.amountPaise, 49900);
  assert.equal(data.keyId, 'rzp_test_local_fixture');
  assert.equal('secret' in data, false);
  assert.equal(
    await EntitlementModel.countDocuments({ resourceId: productId }),
    0
  );
  externalPayments.set('pay_fixture1', {
    id: 'pay_fixture1',
    order_id: externalOrderId,
    amount: 49900,
    currency: 'INR',
    status: 'authorized',
    amount_refunded: 0,
  });
  const input = {
    orderId: internalOrderId,
    razorpay_order_id: externalOrderId,
    razorpay_payment_id: 'pay_fixture1',
    razorpay_signature: signed(`${externalOrderId}|pay_fixture1`),
  };
  assert.equal(
    (
      await request(
        '/payments/verify',
        'POST',
        { ...input, razorpay_signature: '0'.repeat(64) },
        userCookie
      )
    ).status,
    400
  );
  assert.equal(
    (await request('/payments/verify', 'POST', input, adminCookie)).status,
    400
  );
  assert.equal(
    (await request('/payments/verify', 'POST', input, userCookie)).status,
    202
  );
  assert.equal(
    await EntitlementModel.countDocuments({ resourceId: productId }),
    0
  );
  externalPayments.get('pay_fixture1')!.status = 'failed';
  assert.equal(
    (await request('/payments/verify', 'POST', input, userCookie)).status,
    202
  );
  assert.equal(
    await EntitlementModel.countDocuments({ resourceId: productId }),
    0
  );
  externalPayments.get('pay_fixture1')!.status = 'captured';
  externalPayments.get('pay_fixture1')!.amount = 1;
  assert.equal(
    (await request('/payments/verify', 'POST', input, userCookie)).status,
    400
  );
  externalPayments.get('pay_fixture1')!.amount = 49900;
  externalPayments.get('pay_fixture1')!.order_id = 'order_wrong';
  assert.equal(
    (await request('/payments/verify', 'POST', input, userCookie)).status,
    400
  );
  externalPayments.get('pay_fixture1')!.order_id = externalOrderId;
  for (let i = 0; i < 2; i++)
    assert.equal(
      (await request('/payments/verify', 'POST', input, userCookie)).status,
      200
    );
  assert.equal(
    await EntitlementModel.countDocuments({
      resourceId: productId,
      status: 'active',
    }),
    1
  );
  const download = await request(
    `/store/${productId}/file`,
    'GET',
    undefined,
    userCookie
  );
  assert.equal(download.status, 200);
  assert.match(download.headers.get('cache-control')!, /no-store/);
  assert.deepEqual(Buffer.from(await download.arrayBuffer()), pdf);
  assert.equal(
    (await request(`/store/${productId}/file`, 'GET', undefined, adminCookie))
      .status,
    403
  );
  assert.equal(
    (
      await request(
        '/payments/orders',
        'POST',
        { itemType: 'digital_product', itemId: productId },
        userCookie
      )
    ).status,
    409
  );
});

async function webhook(type: string, eventId: string, valid = true) {
  const raw = JSON.stringify({
    event: type,
    payload: {
      payment: { entity: { id: 'pay_fixture1', order_id: externalOrderId } },
    },
  });
  return fetch(base + '/payments/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': valid
        ? signed(raw, process.env.RAZORPAY_WEBHOOK_SECRET)
        : '0'.repeat(64),
      'x-razorpay-event-id': eventId,
    },
    body: raw,
  });
}
test('webhooks verify raw signatures, remain idempotent concurrently, and refunds/replays cannot regrant access', async () => {
  assert.equal(
    (await webhook('payment.captured', 'event-invalid', false)).status,
    400
  );
  const parallel = await Promise.all([
    webhook('payment.captured', 'event-captured'),
    webhook('payment.captured', 'event-captured'),
  ]);
  assert.deepEqual(
    parallel.map((response) => response.status),
    [200, 200]
  );
  assert.equal(
    await PaymentEventModel.countDocuments({ eventId: 'event-captured' }),
    1
  );
  assert.equal(
    await EntitlementModel.countDocuments({ resourceId: productId }),
    1
  );
  const grant = await EntitlementModel.findOne({ resourceId: productId });
  assert.equal(
    (
      await request(
        `/admin/entitlements/${grant!.id}/revoke`,
        'POST',
        undefined,
        adminCookie
      )
    ).status,
    200
  );
  assert.equal(
    (await webhook('payment.captured', 'event-after-revoke')).status,
    200
  );
  assert.equal(
    await EntitlementModel.countDocuments({
      resourceId: productId,
      status: 'active',
    }),
    0
  );
  externalPayments.get('pay_fixture1')!.amount_refunded = 49900;
  externalPayments.get('pay_fixture1')!.status = 'refunded';
  assert.equal((await webhook('refund.processed', 'event-refund')).status, 200);
  assert.equal(
    (await OrderModel.findById(internalOrderId))?.status,
    'refunded'
  );
  externalPayments.get('pay_fixture1')!.amount_refunded = 0;
  externalPayments.get('pay_fixture1')!.status = 'captured';
  assert.equal(
    (await webhook('payment.captured', 'event-old-capture')).status,
    200
  );
  assert.equal(
    await EntitlementModel.countDocuments({
      resourceId: productId,
      status: 'active',
    }),
    0
  );
  assert.equal(
    (await request(`/store/${productId}/file`, 'GET', undefined, userCookie))
      .status,
    403
  );
  const metrics = await (
    await request('/admin/metrics', 'GET', undefined, adminCookie)
  ).json();
  assert.equal(metrics.data.revenue.capturedRevenuePaise, 49900);
  assert.equal(metrics.data.revenue.refundedPaise, 49900);
});

test('free PDFs, hidden drafts, missing files, own library/history and bounded pagination', async () => {
  const key = await storePrivatePdf(pdf);
  const free = await DigitalProductModel.create({
    title: 'Free fixture',
    slug: 'free-fixture',
    description: 'Free local reading.',
    shortDescription: 'Free local reading.',
    fileStorageKey: key,
    published: true,
  });
  const missing = await DigitalProductModel.create({
    title: 'Missing fixture',
    slug: 'missing-fixture',
    description: 'Missing local reading.',
    shortDescription: 'Missing local reading.',
    published: true,
  });
  await DigitalProductModel.create({
    title: 'Hidden fixture',
    slug: 'hidden-fixture',
    description: 'Draft local reading.',
    shortDescription: 'Draft local reading.',
  });
  assert.equal(
    (await request(`/store/${free.id}/file`, 'GET', undefined, userCookie))
      .status,
    200
  );
  assert.equal(
    (await request(`/store/${missing.id}/file`, 'GET', undefined, userCookie))
      .status,
    404
  );
  const catalog = await (await request('/store?free=true')).json();
  assert.equal(
    catalog.data.products.every(
      (item: { accessType: string }) => item.accessType === 'free'
    ),
    true
  );
  assert.equal(
    catalog.data.products.some(
      (item: { slug: string }) => item.slug === 'hidden-fixture'
    ),
    false
  );
  assert.equal((await request('/store?limit=5000')).status, 400);
  const history = await (
    await request('/library/orders', 'GET', undefined, userCookie)
  ).json();
  assert.ok(
    history.data.orders.some(
      (item: { _id: string }) => item._id === internalOrderId
    )
  );
  const otherHistory = await (
    await request('/library/orders', 'GET', undefined, adminCookie)
  ).json();
  assert.equal(otherHistory.data.orders.length, 0);
  assert.equal(
    (
      await request(
        `/payments/orders/${internalOrderId}/reconcile`,
        'POST',
        undefined,
        adminCookie
      )
    ).status,
    404
  );
  assert.equal((await request('/library/items')).status, 401);
});

test('V1 register/login/refresh/logout/reset, free practice lifecycle, favorites, profile and insights regressions', async () => {
  const account = {
    name: 'Regression user',
    email: 'regression@example.test',
    password: 'testpassword123',
    role: 'admin',
  };
  const registered = await request('/auth/register', 'POST', account);
  assert.equal(registered.status, 201);
  assert.equal((await registered.json()).data.user.role, 'user');
  const cookieFrom = (response: Response) =>
    response.headers
      .getSetCookie()
      .map((value) => value.split(';')[0])
      .join('; ');
  let cookie = cookieFrom(registered);
  assert.equal(
    (await request('/users/me', 'GET', undefined, cookie)).status,
    200
  );
  const refreshed = await request('/auth/refresh', 'POST', undefined, cookie);
  assert.equal(refreshed.status, 200);
  cookie = cookieFrom(refreshed);
  assert.equal(
    (await request('/users/me', 'PATCH', { bio: 'Local regression' }, cookie))
      .status,
    200
  );
  assert.equal(
    (await request('/users/me/favorites/legacy-test', 'PUT', undefined, cookie))
      .status,
    200
  );
  assert.equal(
    (
      await request(
        '/users/me/favorites/legacy-test',
        'DELETE',
        undefined,
        cookie
      )
    ).status,
    200
  );
  const created = await request(
    '/practice/sessions',
    'POST',
    { mantraSlug: 'legacy-test', targetCount: 3 },
    cookie
  );
  assert.equal(created.status, 201);
  const id = (await created.json()).data.session._id;
  const preferences = await request(
    '/users/me',
    'PATCH',
    {
      role: 'admin',
      preferences: {
        theme: 'system',
        soundEnabled: false,
        hapticEnabled: false,
        reminderEnabled: true,
        reminderTime: '07:00',
        timezone: 'Asia/Kolkata',
        defaultTarget: 108,
      },
    },
    cookie
  );
  assert.equal(preferences.status, 200);
  const preferencesData = (await preferences.json()).data.user;
  assert.equal(preferencesData.role, 'user');
  assert.equal(preferencesData.preferences.theme, 'system');
  const subscription = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/local-fixture',
    keys: { p256dh: 'fixture', auth: 'fixture' },
  };
  assert.equal(
    (await request('/push/subscriptions', 'POST', subscription, cookie)).status,
    201
  );
  assert.equal(
    (
      await request(
        '/push/subscriptions',
        'DELETE',
        { endpoint: subscription.endpoint },
        cookie
      )
    ).status,
    200
  );
  const avatar = new FormData();
  avatar.append(
    'avatar',
    new Blob(['invalid'], { type: 'text/plain' }),
    'test.txt'
  );
  assert.equal(
    (
      await fetch(base + '/users/me/avatar', {
        method: 'POST',
        body: avatar,
        headers: { Cookie: cookie, Origin: process.env.WEB_ORIGIN! },
      })
    ).status,
    400
  );
  for (const status of ['paused', 'in_progress'])
    assert.equal(
      (
        await request(
          `/practice/sessions/${id}`,
          'PATCH',
          { completedCount: 2, activeDurationSeconds: 5, status },
          cookie
        )
      ).status,
      200
    );
  assert.equal(
    (
      await request(
        `/practice/sessions/${id}/complete`,
        'POST',
        { completedCount: 3, activeDurationSeconds: 10 },
        cookie
      )
    ).status,
    200
  );
  const second = await request(
    '/practice/sessions',
    'POST',
    { mantraSlug: 'legacy-test', targetCount: 3 },
    cookie
  );
  const secondId = (await second.json()).data.session._id;
  assert.equal(
    (
      await request(
        `/practice/sessions/${secondId}`,
        'PATCH',
        { completedCount: 0, activeDurationSeconds: 0, status: 'abandoned' },
        cookie
      )
    ).status,
    200
  );
  assert.equal(
    (await request('/practice/sessions', 'GET', undefined, cookie)).status,
    200
  );
  for (const url of [
    '/insights/overview?range=7d&timezone=Asia%2FKolkata',
    '/insights/history?timezone=Asia%2FKolkata',
  ])
    assert.equal((await request(url, 'GET', undefined, cookie)).status, 200);
  assert.equal(
    (await request('/auth/logout', 'POST', undefined, cookie)).status,
    200
  );
  assert.equal(
    (await request('/users/me', 'GET', undefined, cookie)).status,
    401
  );
  const loggedIn = await request('/auth/login', 'POST', account);
  assert.equal(loggedIn.status, 200);
  const regressionUser = await UserModel.findOne({ email: account.email });
  assert.equal(
    (await request('/auth/forgot-password', 'POST', { email: account.email }))
      .status,
    200
  );
  assert.equal(smtp.messages.length, 1);
  const emailBody = smtp.messages[0].replace(/=\r\n/g, '').replace(/=3D/g, '=');
  const resetToken = emailBody.match(/token=([A-Za-z0-9_-]{43})/)?.[1];
  assert.ok(resetToken);
  assert.ok(
    await PasswordResetTokenModel.exists({
      userId: regressionUser!._id,
      tokenHash: hashToken(resetToken),
    })
  );
  assert.equal(
    (
      await request('/auth/reset-password', 'POST', {
        token: resetToken,
        password: 'newpassword123',
      })
    ).status,
    200
  );
  assert.equal(
    (
      await request('/auth/login', 'POST', {
        ...account,
        password: 'newpassword123',
      })
    ).status,
    200
  );
  assert.equal(
    (
      await request('/auth/forgot-password', 'POST', {
        email: 'absent@example.test',
      })
    ).status,
    200
  );
});

test('production configuration validates secrets and feature-specific settings without exposing values', () => {
  assert.throws(
    () => validateProductionEnvironment({ NODE_ENV: 'production' }),
    /Invalid production configuration/
  );
  const config = {
    NODE_ENV: 'production',
    WEB_ORIGIN: 'https://example.test',
    MONGODB_URI: 'mongodb://test',
    ACCESS_TOKEN_SECRET: 'a'.repeat(60),
    REFRESH_TOKEN_SECRET: 'b'.repeat(60),
  };
  assert.doesNotThrow(() => validateProductionEnvironment(config));
  assert.throws(
    () =>
      validateProductionEnvironment({ ...config, PAYMENTS_ENABLED: 'true' }),
    /RAZORPAY_KEY_ID/
  );
  assert.throws(
    () =>
      validateProductionEnvironment({
        ...config,
        PRIVATE_DOWNLOADS_ENABLED: 'true',
      }),
    /AZURE_STORAGE/
  );
});

test('provider failures stay safe and production never falls back to local PDF files', async () => {
  const wrappedFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    if (String(input).startsWith('https://api.razorpay.com'))
      throw new Error('fixture-secret-must-not-leak');
    return wrappedFetch(input, init);
  };
  try {
    const response = await request(
      '/payments/orders',
      'POST',
      { itemType: 'digital_product', itemId: productId },
      adminCookie
    );
    assert.equal(response.status, 503);
    assert.equal((await response.text()).includes('fixture-secret'), false);
    assert.equal(await EntitlementModel.countDocuments({ userId: adminId }), 0);
  } finally {
    globalThis.fetch = wrappedFetch;
  }
  const free = await DigitalProductModel.findOne({ slug: 'free-fixture' });
  process.env.NODE_ENV = 'production';
  try {
    assert.equal(
      (await request(`/store/${free!.id}/file`, 'GET', undefined, userCookie))
        .status,
      503
    );
  } finally {
    process.env.NODE_ENV = 'test';
  }
});

test('operator promotion CLI only updates an existing account and writes an audit record', async () => {
  await promisify(execFile)(
    process.execPath,
    ['src/scripts/promote-admin.ts', 'user@example.test'],
    {
      env: { ...process.env, MONGODB_URI: mongo.getUri() },
      timeout: 30000,
    }
  );
  assert.equal((await UserModel.findById(userId))?.role, 'admin');
  assert.ok(
    await AdminAuditModel.exists({ targetId: userId, action: 'role.promoted' })
  );
  await UserModel.updateOne({ _id: userId }, { role: 'user' });
});
