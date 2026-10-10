# DevSangam V2 operation and release verification

V2 adds public pages, Astro, contact storage, admin tools and PDF commerce to V1.
The original authenticated `/`, `/library`, practice and auth/session paths stay
in place. This branch uses Next SSR/Nest; deployment migration is explicitly
deferred. This document does not mark a deployed release verified.

## Configuration

Existing production hosts were not changed. Retain API secrets in the host secret
manager. Next SSR requires a server-capable frontend runtime; review staging before
changing the previous static Pages deployment. Do not put secrets in
`NEXT_PUBLIC_*`/`VITE_*`, Git, screenshots
or command arguments. `apps/api/.env.example` contains names and safe defaults only.

| Setting | Meaning |
| --- | --- |
| `PAYMENTS_ENABLED=false` | Default; payment routes fail safely until configured |
| `RAZORPAY_KEY_ID` | Test Mode key initially; only the public key ID reaches Checkout |
| `RAZORPAY_KEY_SECRET` | Server-only order/payment verification secret |
| `RAZORPAY_WEBHOOK_SECRET` | Independent server-only webhook secret |
| `PRIVATE_DOWNLOADS_ENABLED=false` | Default; production PDF operations fail safely |
| `AZURE_STORAGE_CONNECTION_STRING` | Server-only credentials for private Blob Storage |
| `AZURE_PRIVATE_CONTAINER` | Existing private container, default `devsangam-private` |
| `PRIVATE_ASSET_DIR` | Development-only private directory; never a public web directory |
| `TRUST_PROXY_HOPS=0` | Set 0–3 only after verifying the actual trusted reverse-proxy chain |
| `WEB_ORIGIN` | Exact HTTPS web origin in production; no path or trailing slash |
| `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET` | Distinct strong production secrets, at least 48 characters |

Production startup validates core settings, enabled feature credentials, numeric
ports and partial SMTP/VAPID/Cloudinary configurations. Review existing host values
before rollout. Changing auth secrets invalidates existing tokens; V2 does not rotate
secrets automatically. Browser-cookie writes require the exact `WEB_ORIGIN`; CLI
requests without cookies may omit Origin. Signed Razorpay webhooks use raw-body HMAC
instead of browser Origin. Existing cookie paths, SameSite and refresh flow remain.

PDF storage is a separate Azure Blob container, never the public Cloudinary avatar
pipeline. Create a container with **Private (no anonymous access)**, disable anonymous
access at account level, and verify direct unauthenticated blob requests are denied.
The adapter checks the container's access level and refuses a public container.
PDFs have random server keys; URLs/keys are not serialized to public product responses.
The API authorizes each download and returns an attachment with `no-store`, sandbox
CSP and `nosniff`. Production has no local filesystem fallback. Development PDFs
live in the gitignored `.private-assets/` directory. Upload limit is 20 MB with PDF
signature validation. Availability is checked before creating a paid PDF order.

Official references: [Azure anonymous access](https://learn.microsoft.com/en-us/azure/storage/blobs/anonymous-read-access-configure),
[Razorpay integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps),
[Razorpay webhook verification](https://razorpay.com/docs/webhooks/validate-test/).

## Database and operator access

MongoDB must support multi-document transactions: Atlas/replica set, not a standalone
local mongod. Local integration tests start their own isolated replica set.

```powershell
npm run v2:indexes -w @devsangam/api
npm run admin:promote -w @devsangam/api -- existing-user@example.com
```

Run the promotion only as a trusted operator against the intended database. It
validates email, requires an existing account, changes role and records an audit
entry atomically, and is repeatable. No public promotion endpoint exists.
All admin APIs enforce auth, active session and the **current database role**.
The browser guard calls `/admin/session`; cached/local roles do not authorize data.

Startup and the index script use `createIndexes` for V2 collections only. They do
not drop indexes or rewrite existing users/mantras. Confirm database permissions
and inspect duplicate-key failures rather than deleting purchase history.
Missing V1 `accessType` continues to mean free; defaults are additive. Free-to-paid
changes cannot retract text already read/downloaded or previously cached while free.

Models: DigitalProduct, Order, Entitlement, AdminAudit, PaymentEvent, ContactMessage.
Orders uniquely bind external order/payment IDs. Entitlements uniquely bind each
user/resource/source order; separate repeat purchases remain independent. Events
have a unique provider event ID. Collections have publication/user/time indexes.

## Payment/access behavior

1. Client sends only item ID/type. API reads published paid content and integer paise
   from the database, checks existing ownership and PDF availability, records an
   internal order, then creates the Razorpay order.
2. Checkout script loads on demand. Client success, cancellation, failure and pending
   states never grant access themselves.
3. API verifies HMAC against the **stored** Razorpay order ID, then fetches the provider
   payment and checks payment ID/order, amount, currency and captured/refunded state.
4. Payment state and entitlement updates occur in one database transaction. Duplicate
   callbacks/webhooks do not duplicate grants. Admin-revoked grants are not reactivated
   by replay. A verified full refund revokes grants from that order; other independent
   purchases remain valid. Partial refunds are recorded and retain access; this technical
   behavior does not create a business refund promise.
5. Browser order history offers provider reconciliation when confirmation is pending.
   Admin can reconcile with Razorpay; there is no manual “mark paid” control.

Webhook URL: `https://<api-host>/api/v1/payments/webhook`, configured in Razorpay
**Test Mode first**. Enable `payment.captured`, `payment.failed`, `order.paid` and
`refund.processed`. Raw JSON is verified before parsing; supported events are reconciled
against the provider. Event IDs are deduplicated transactionally; fallback is a raw
body hash. Unknown valid events are ignored. Unmapped orders return a retryable 503,
not a fabricated grant. Retain the matching webhook secret for older retries when
rotating provider secrets. Out-of-order events cannot resurrect a refunded order.

Paid mantra text is redacted in list/detail/favorites without an entitlement.
Starting/updating/completing paid practice also checks server access. Revoked users
can still abandon an unfinished session so V1's single-session rule cannot trap them.
Owned-content/history APIs scope records to the active account. Unpublished resources
are unavailable publicly; owners see an unavailable/support state in their library.

Paid PDFs require connectivity and are not cached by the PWA. A downloaded file is
under the user's control; revocation prevents future downloads, not copies already
delivered. Authorized paid mantra responses are `no-store` and excluded from Workbox.
Free responses expose `X-DevSangam-Public: true` via CORS so existing offline caching
continues. Dexie practice records and the V1 sync schema are unchanged.

## Added API endpoints

All routes remain under `/api/v1`. Admin/user routes require active sessions.

| Method/path | Access/behavior |
| --- | --- |
| `POST /contact` | Public; 8 KB parser, strict schema, honeypot, 5/hour, MongoDB receipt |
| `GET /admin/session` | Current DB admin authorization |
| `GET /admin/metrics` | DB aggregates and bounded recent activity |
| `GET /admin/:section` | Paged content/products/users/orders/contact/entitlements/audit; limit max 50 |
| `POST /admin/content`, `POST /admin/products` | Validated create with audit |
| `PUT /admin/content/:id`, `PUT /admin/products/:id` | Validated update with audit |
| `DELETE /admin/content/:id`, `DELETE /admin/products/:id` | Soft unpublish; preserve purchase history |
| `POST /admin/products/:id/file` | Private PDF upload; publish requires a file |
| `POST /admin/contact/:id/review` | Audited message review |
| `POST /admin/entitlements/:id/revoke` | Audited access revocation |
| `POST /admin/orders/:id/reconcile` | Fetch verified provider state |
| `GET /store`, `GET /store/:slug` | Published metadata; paged catalog; `free=true` filter |
| `GET /store/:id/file` | Signed-in free download or server entitlement required |
| `POST /payments/orders` | Server-priced order; 20/min payment limiter |
| `POST /payments/verify` | Signature + provider verification |
| `POST /payments/orders/:id/reconcile` | Own order only |
| `POST /payments/webhook` | Raw signed provider event; 64 KB limit |
| `GET /library/items`, `GET /library/orders` | Own active grants/order history, pagination |

Contact content is stored as plain text and rendered with React escaping. It is not
emailed or logged. User/admin lists exclude password hashes, tokens and push keys.
Sensitive content/price/publication/upload/revocation/review/promotion changes are
audited with safe metadata. Provider/parser errors do not log private payloads.

## Reproduce local checks

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev --audit-level=high
```

Tests use a temporary MongoDB replica set, temporary private storage, a loopback SMTP
fixture and a Razorpay network fixture. No production credentials/database are used.
MongoMemoryServer downloads its local MongoDB binary on first use. Production install
must include API runtime dependencies; test dependencies can be omitted after building.

Playwright is a repository dev dependency; no production app dependency is added:

```powershell
npm ci
npm run build
# Start in another terminal, foreground local QA server:
npm run preview -w @devsangam/web
# Windows uses installed Edge; other platforms install Chromium first:
npm exec playwright -- install chromium
# Run against that preview:
npm run test:public
npm run test:ui
# Sequential: each owns API port 4000; PWA also owns proxy port 4174.
npm run test:ssr
npm run test:offline
npm run test:pwa
npm run test:e2e:built
```

Use a preview built with `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1`
and no production `API_INTERNAL_URL`. `v2-e2e.mjs` uses the preview at
`http://localhost:4173` for same-site real cookies. Do not run another API on port
4000 during these tests; scripts fail rather than kill another process.
Screenshots remain outside the repository. Mock UI tests are separate from actual
Nest/MongoDB browser integration and from real SW/Dexie offline verification.
Browser selection can be set through `V2_QA_BROWSER_CHANNEL`.

The quality-only GitHub workflow runs lint/typecheck/tests/build/audit on PRs and
manual dispatch. It has no deployment or provider secrets and does not change the
Cloudflare/Azure deployment model. Its first hosted run is still unverified.
The migration aligns the root engine with the existing `.nvmrc` family (>=26.7 <27).
Local tests use installed Node 26.10; CI follows `.nvmrc`. See the migration report.

## External verification — BLOCKED until configured

Local API `.env` was checked only for presence: Razorpay key/secret/webhook secret
and Azure connection/container configuration were absent. Host secrets, DNS and
provider dashboards were not changed. Complete these checks before claiming V2 ready
for live sales:

- Configure Razorpay **Test Mode** credentials and a reachable signed webhook URL.
  Configure automatic capture. Complete a test checkout from the real staged web
  app; confirm internal/provider amounts match, one paid order and one active grant.
  Repeat verification/event delivery, decline/cancel payment, simulate delayed capture,
  and refund in Test Mode; confirm history and access follow verified provider state.
- Provision private Azure storage; verify public reads fail, admin upload works,
  authorized download works, another account gets 403, and unavailable storage fails
  safely. Enable private downloads only after the provider is ready. Check blob
  permissions again after any storage-policy change.
- Approve professional Privacy/Terms review and the business license/refund policy.
  Publish final policy text before enabling real purchases. Replace placeholders
  only with approved images. No refund promise or legal certification is invented.
- On the selected Next SSR staging runtime, verify deep links, exact CORS/origin,
  secure cookies, refresh/logout/reset through real Zoho SMTP, real Cloudinary avatar
  upload/delete, settings and push delivery/reminders. Check the proxy hop count before
  enabling forwarded-IP trust. Rate limit stores are per process; use one instance or
  a shared limiter store before horizontally scaling the API.
- On supported installed-PWA devices, verify install/update and push; continue a free
  practice offline, reconnect and verify exactly one server session/history entry.
  Local browser SW/Dexie checks passed but do not certify each device/provider.
- Run the new quality workflow in GitHub. Existing host build/deployment behavior
  must be reviewed on the actual deployment; nothing was deployed by this run.

Known operational follow-up: replacing PDFs retains old random files so an in-flight
authorized download is not broken. Failed DB commits can also leave an unreferenced
file. Review retention/cleanup of unreferenced files separately; no destructive blob
cleanup is performed automatically.
