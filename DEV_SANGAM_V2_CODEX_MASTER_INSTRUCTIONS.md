# DevSangam V2 — Codex Master Execution Instructions

> **Repository:** `shivammchaudhary1/devsangam`  
> **Target:** DevSangam Version 2  
> **Primary rule:** Build V2 **without breaking, redesigning, or replacing V1 architecture, existing authenticated flows, or the current UI/theme language**.

---

## 0. How Codex Must Use This File

This file is the execution contract for all DevSangam V2 work.

Before making any code change, Codex must:

1. Read this file completely.
2. Inspect the current repository and current branch.
3. Read the existing README, package files, routing, auth/session code, API structure, models, services, PWA/offline practice code, push notification code, deployment workflows, and existing TODOs.
4. Understand the current V1 behavior before touching it.
5. Create or update the V2 task tracker described in this file.
6. Work **one task at a time**.
7. Test each completed task.
8. If a test fails because of code, fix it and retry.
9. Mark a task complete only after its acceptance criteria pass.
10. Never mark externally blocked work as complete.

Codex must treat this document as the source of truth for V2 implementation decisions unless the repository has a stronger existing convention that preserves V1 compatibility.

---

# 1. Product Goal

DevSangam V2 expands the current devotional PWA into a public-facing devotional platform with:

- Public landing website
- Public navigation and footer
- About Us page
- How It Works page
- Contact page
- Privacy Policy
- Terms & Conditions
- Admin panel
- Admin analytics/metrics
- Paid and free mantra/content management
- Razorpay payments
- Content entitlements/access control
- Digital library / lightweight e-commerce
- Primarily PDF-based digital products
- Locked/paid content access
- Order and payment history
- Admin product/content management
- Safe production-ready authorization for paid resources

All of this must be added while preserving the current V1 core:

- Authentication
- Sessions
- Mantra library
- Favorites
- Digital mala/practice
- Offline practice
- IndexedDB/Dexie synchronization
- Dashboard
- Insights/history/streaks
- Profile
- Settings
- Avatar upload
- Theme system
- PWA behavior
- Push notifications/reminders
- Existing production deployment model

---

# 2. Non-Negotiable V1 Protection Rules

## 2.1 Do not rewrite V1

Do not refactor working V1 code merely to make it “cleaner”.

Changes to existing V1 modules must be:

- additive,
- minimal,
- backwards compatible,
- clearly required for V2.

Do not replace:

- current authentication architecture,
- cookie/session flow,
- practice runtime,
- offline practice storage/sync,
- PWA update logic,
- theme provider,
- existing protected application shell,
- existing API response conventions,
- current deployment architecture,

unless a V2 requirement cannot be implemented safely otherwise.

If an existing V1 feature must change, document:

1. why it is required,
2. what behavior changes,
3. what regression tests were performed.

---

## 2.2 Preserve UI/UX language

Use the current DevSangam design system as the visual source of truth.

Before creating new UI, inspect:

- global styles,
- theme CSS,
- reusable cards,
- buttons,
- typography,
- spacing,
- colors,
- borders,
- shadows,
- dark/light mode behavior,
- responsive behavior.

New V2 pages must feel like they were part of the original application.

Do not introduce a visually unrelated design system.

Do not globally replace existing colors, typography, component primitives, or layout conventions.

---

## 2.3 Preserve authenticated V1 behavior at `/`

The existing authenticated experience must not be unnecessarily broken.

Preferred routing behavior:

- unauthenticated visitor on `/` -> public Landing Page
- authenticated user on `/` -> existing authenticated Dashboard/Home behavior

If the current router makes this difficult, implement the smallest routing layer needed to preserve both experiences.

Do not force existing users to adopt a new dashboard route unless absolutely necessary.

---

# 3. V2 Architecture Principles

Use the current monorepo layout.

Expected areas:

```text
apps/
  api/
  web/

packages/
  types/
```

Prefer current conventions:

- feature-based frontend organization
- controllers/services/models/routes on API
- Zod validation
- shared TypeScript contracts where useful
- TanStack Query for remote server state
- existing auth context
- existing error format
- existing protected-route patterns

New API routes should remain compatible with the current API base.

Recommended additions:

```text
/api/v1/admin/*
/api/v1/payments/*
/api/v1/store/*
/api/v1/library/*
/api/v1/contact
```

Do not create `/api/v2` only because the product is called Version 2.

The product version and API version are separate concepts.

---

# 4. Required V2 Public Website

Create a reusable public site layout.

Suggested structure:

```text
features/public-site/
  components/
    PublicNavbar
    PublicFooter
    PublicPageShell
    HeroSection
    FeatureSection
    CTASection
  pages/
    LandingPage
    AboutPage
    HowItWorksPage
    ContactPage
    PrivacyPolicyPage
    TermsPage
```

Exact naming may follow existing project conventions.

---

## 4.1 Navbar

Public navbar should include, where appropriate:

- DevSangam brand/logo
- Home
- About
- How It Works
- Digital Library / Store
- Contact
- Login
- Register / Get Started

For authenticated users, replace guest CTAs with an appropriate “Open App” / Dashboard action.

Requirements:

- responsive,
- keyboard accessible,
- mobile navigation,
- theme consistent,
- no layout shift,
- no duplicate app navigation inside authenticated AppShell.

---

## 4.2 Landing Page

Landing page should communicate:

- what DevSangam is,
- digital mala practice,
- mantra library,
- history/insights,
- offline practice/PWA,
- reminders,
- premium devotional content,
- digital library,
- simple call to action.

Avoid making unsupported health, medical, financial, or spiritual guarantees.

Use tasteful devotional copy consistent with the product.

---

## 4.3 Images and placeholders

If a required image does not exist:

- do not invent external copyrighted assets,
- do not block implementation,
- use a polished placeholder,
- clearly name the placeholder asset/component,
- keep image dimensions/aspect ratios stable,
- leave a TODO comment or task for final asset replacement.

Do not hotlink random external images.

---

## 4.4 About Us

Include:

- DevSangam purpose,
- product philosophy,
- respectful devotional positioning,
- privacy-conscious/product-focused language,
- current features,
- future platform direction.

Do not fabricate founder/team claims not present in repository/project information.

---

## 4.5 How It Works

Explain at a high level:

1. Create/sign into account
2. Choose a mantra
3. Set practice target
4. Use digital mala
5. Continue offline when needed
6. Sync practice later
7. View history and insights
8. Optionally unlock paid digital content
9. Access purchased library items

Use existing real functionality only.

---

## 4.6 Contact

Create:

- contact form,
- name,
- email,
- subject/category,
- message,
- success/error states.

Backend requirements:

- Zod validation,
- strict body limits,
- rate limiting,
- spam-resistant design,
- never reflect unsafe HTML,
- either store contact records safely or send them using the existing email infrastructure,
- avoid exposing administrative email internals in API responses.

If SMTP is unavailable during development, the feature must still fail safely and display a proper error.

---

## 4.7 Privacy Policy and Terms

Add:

- `/privacy`
- `/terms`

These pages must be clearly marked as product legal copy pending professional legal review unless finalized text is explicitly provided later.

Do not claim legal compliance certifications that have not been verified.

Privacy policy should cover at minimum:

- account data,
- authentication/session data,
- practice/history data,
- device/push notification data,
- profile/avatar data,
- payments through Razorpay,
- digital purchases,
- contact form,
- cookies,
- local browser storage/IndexedDB,
- third-party processors such as hosting/email/storage/payment providers,
- deletion/contact mechanism.

Terms should cover at minimum:

- account responsibility,
- permitted use,
- digital purchases,
- payment handling,
- access/license to digital content,
- refund policy placeholder pending business policy,
- intellectual property,
- availability,
- liability disclaimer,
- termination,
- contact.

Do not invent a refund promise.

---

# 5. Admin Panel

The current user model already has a `role` concept. Use it carefully.

## 5.1 Admin authorization

Create server-side admin authorization middleware.

Rules:

- authentication is required,
- active session is required,
- server must read/verify the current user role,
- never trust a frontend `isAdmin` flag,
- never trust role information from request body,
- registration must never be able to set `role`,
- protected admin routes must fail closed.

Recommended middleware:

```text
requireAuth
requireActiveSession
requireAdmin
```

Prefer checking the database-backed user role rather than trusting a stale client value.

---

## 5.2 Admin creation/promotion

Do not expose “make me admin” through the public UI.

Provide one safe administrative path, for example:

- controlled CLI script to promote a specific existing user by email,
- or documented manual DB operation.

Example command concept:

```bash
npm run admin:promote -w @devsangam/api -- user@example.com
```

The exact implementation should follow repository conventions.

The script must:

- validate email,
- require an existing account,
- log only necessary information,
- not display secrets.

---

## 5.3 Admin frontend

Suggested route:

```text
/admin
/admin/analytics
/admin/content
/admin/products
/admin/orders
/admin/users
/admin/contact
```

Admin UI must reuse the DevSangam visual system.

Do not copy an unrelated “generic SaaS admin template”.

---

## 5.4 Admin metrics

Provide useful initial metrics such as:

- total users
- new users over recent period
- total practice sessions
- completed practice sessions
- total chants
- total practice duration
- total free mantras
- total paid/locked mantras
- total products
- published products
- orders
- successful/captured payments
- total captured revenue
- recent orders
- recent signups
- recent contact messages

Revenue metrics must use only trusted server payment states.

Never calculate revenue from a client-supplied `paid=true`.

---

## 5.5 Admin audit trail

For sensitive admin operations, strongly prefer a lightweight audit model.

Examples:

- content access changed
- product published/unpublished
- price changed
- order manually reviewed
- entitlement granted/revoked

Audit record should include:

- admin user ID
- action
- target type
- target ID
- safe metadata
- timestamp

Do not store secrets, payment signatures, passwords, or full sensitive payloads in audit logs.

---

# 6. Paid Mantras and Content Access

Admin must be able to mark content free or paid.

The safest approach is to avoid deeply coupling payment logic into the existing mantra model.

Prefer an access/offer/entitlement abstraction.

Possible design:

```text
ContentOffer
- _id
- contentType: "mantra" | "digital_product"
- contentId
- accessType: "free" | "paid"
- pricePaise
- currency: "INR"
- active
- createdAt
- updatedAt
```

Or another equivalent design that fits the repository better.

If extending the existing Mantra schema is simpler, the change must be additive and default all existing records to free access.

Example safe default:

```text
accessType = "free"
```

Existing V1 mantra users must not suddenly lose access.

---

## 6.1 Entitlements

Create a server-side entitlement model for purchased access.

Example:

```text
Entitlement
- userId
- sourceOrderId
- resourceType
- resourceId
- status
- grantedAt
- revokedAt
```

Use a compound uniqueness rule where appropriate so the same purchase does not create duplicate access.

Every protected paid-content API must check entitlement server-side.

Do not rely on hiding UI buttons.

---

# 7. Razorpay Payment Architecture

Use Razorpay safely.

## 7.1 Rules

Never:

- expose Razorpay secret key in frontend,
- trust amount sent by the client,
- trust product price sent by client,
- grant access from frontend success callback alone,
- store card details,
- log sensitive payment secrets,
- commit real Razorpay credentials.

Use environment variables.

Suggested:

```env
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
```

Only the public/key ID may be sent to the frontend.

---

## 7.2 Payment flow

Preferred flow:

1. User chooses a paid item.
2. Frontend sends only item/product identifier.
3. Backend loads canonical price from database.
4. Backend creates internal order record in pending state.
5. Backend creates Razorpay order using canonical amount.
6. Frontend opens Razorpay Checkout.
7. Razorpay success callback returns payment/order/signature data.
8. Frontend sends verification data to backend.
9. Backend verifies Razorpay signature.
10. Backend updates internal order/payment state.
11. Webhook provides authoritative asynchronous reconciliation.
12. Entitlement is granted only after verified successful/captured payment according to the chosen Razorpay flow.
13. Duplicate callbacks/webhooks must be idempotent.

---

## 7.3 Webhook

Webhook endpoint must:

- use the raw request body needed for signature verification,
- verify Razorpay webhook signature,
- reject invalid signatures,
- handle event replay safely,
- be idempotent,
- never expose internal failure details publicly,
- update only permitted payment/order fields.

Be careful with Express JSON middleware order. Razorpay webhook verification usually requires access to the raw body.

Do not break normal API JSON parsing while adding webhook raw-body support.

---

## 7.4 Internal order model

Suggested structure:

```text
Order
- userId
- itemType
- itemId
- amountPaise
- currency
- status
- razorpayOrderId
- razorpayPaymentId
- createdAt
- updatedAt
```

Possible states:

```text
created
payment_pending
paid
failed
refunded
cancelled
```

Use the exact minimum states needed.

Add unique indexes for external Razorpay IDs where appropriate.

---

## 7.5 Amount handling

Store INR amounts in integer paise.

Example:

```text
₹499 = 49900 paise
```

Never use floating-point currency storage.

---

## 7.6 Sandbox first

During development:

- use Razorpay Test Mode,
- add env examples,
- never commit keys,
- provide clear manual test steps.

Production payment testing must remain marked incomplete until real production credentials/webhooks are configured.

---

# 8. Digital Library / Lightweight E-Commerce

V2 includes a digital library that behaves like a small e-commerce system.

Primary product type:

- PDF / digital document

Possible future types can be supported by extensible schema, but do not overbuild V2.

---

## 8.1 Digital product model

Suggested model:

```text
DigitalProduct
- title
- slug
- description
- shortDescription
- coverImage
- assetType: "pdf"
- pricePaise
- currency
- accessType: "free" | "paid"
- published
- featured
- fileStorageKey / privateAssetId
- preview metadata
- createdAt
- updatedAt
```

Add reasonable indexes:

- unique slug
- published
- featured
- createdAt

Do not store the actual PDF binary in MongoDB.

---

## 8.2 Product storefront

Public or authenticated storefront should support:

- product grid/list
- cover placeholder if no image
- title
- short description
- price/free label
- product details page
- purchase button for paid products
- open/download/read action for owned/free products

Keep UX simple.

Do not build carts, shipping, addresses, inventory, tax engines, discount systems, or multi-vendor marketplace logic unless explicitly requested later.

This is a **digital goods library**, not a full physical-commerce platform.

---

## 8.3 PDF security

Paid PDFs must not be exposed as permanent public URLs.

Preferred approach:

1. store files privately,
2. verify access on the backend,
3. issue short-lived signed URLs or stream the file through an authorized endpoint,
4. prevent direct asset IDs from bypassing entitlement checks.

If the existing Cloudinary account is used:

- use an appropriate private/authenticated delivery mode for paid assets,
- do not assume normal public image delivery is sufficient for paid PDFs.

If private PDF infrastructure cannot be fully configured without provider credentials, implement the authorization/storage abstraction and use a development placeholder.

Mark external provider verification as blocked until credentials are available.

---

## 8.4 User library

Authenticated users should have:

```text
/library
/library/purchases
```

or equivalent within the current app routing.

Show:

- free accessible items
- purchased items
- purchase date
- open/read/download action where authorized

Never derive access from localStorage.

---

# 9. Backwards-Compatible Data Changes

All schema changes must be additive.

Existing V1 data must continue working.

Examples:

- existing mantra -> free by default
- existing user -> user role by default
- missing monetization field -> treat as free
- missing product/access metadata -> no V1 behavior change

Before introducing a destructive migration:

STOP and find a safer alternative.

If an index or migration is needed:

- create a script,
- make it repeatable/idempotent where possible,
- document how to run it,
- do not automatically destroy production indexes/data.

---

# 10. Security Requirements for V2

In addition to existing V1 security, V2 must add/verify:

## 10.1 Admin security

- DB-backed role authorization
- no client-trusted authorization
- protected admin APIs
- rate limiting where appropriate
- audit sensitive admin actions

## 10.2 Payment security

- Razorpay secret only backend
- signature verification
- webhook signature verification
- idempotency
- server-calculated amount
- entitlement only after verified payment
- integer currency units
- no card storage

## 10.3 Content security

- entitlement checked server-side
- paid asset private
- short-lived delivery access
- no predictable public file URLs for paid PDFs

## 10.4 Contact security

- validation
- body limits
- rate limiting
- safe email/storage
- no HTML injection
- no detailed internal SMTP errors to client

## 10.5 Existing security improvements to include while touching V2 infrastructure

Without rewriting V1, add production hardening where it is naturally relevant:

- production env validation
- exact allowed origin validation
- appropriate proxy trust configuration documentation
- CSRF/origin protection for cookie-authenticated mutation routes
- secure payment webhook raw-body handling
- dependency/security checks in CI when practical

Do not destabilize V1 merely to chase theoretical improvements.

---

# 11. Production Environment Validation

Create a centralized production configuration validation strategy.

At production startup, fail fast when critical variables are missing or invalid.

At minimum validate variables required by enabled features:

```text
NODE_ENV
PORT
WEB_ORIGIN
MONGODB_URI
ACCESS_TOKEN_SECRET
REFRESH_TOKEN_SECRET

EMAIL_*
CLOUDINARY_*
VAPID_*

RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
```

Rules:

- access and refresh secrets must not be equal,
- production secrets must have a reasonable minimum entropy/length policy,
- production WEB_ORIGIN must not silently fall back to localhost,
- do not print secret values.

---

# 12. Deployment Compatibility

Current deployment is expected to remain:

```text
Frontend: Cloudflare Pages
Backend: Azure App Service
Database: MongoDB
```

Do not move hosting providers as part of V2.

Ensure new functionality works in this model.

---

## 12.1 Frontend CI

Deployment should at minimum run:

```bash
npm ci
npm run lint -w @devsangam/web
npm run typecheck -w @devsangam/web
npm run build -w @devsangam/web
```

Then deploy.

---

## 12.2 Backend CI

Keep or improve:

```bash
npm ci
npm run lint -w @devsangam/api
npm run typecheck -w @devsangam/api
npm run build -w @devsangam/api
```

Add relevant tests before deploy once test infrastructure exists.

---

## 12.3 Post-deploy smoke checks

Where practical, CI/deployment should verify:

- frontend reachable
- API `/api/v1/health`
- no obvious 5xx on startup

Do not expose secrets in workflow logs.

---

# 13. Testing Strategy

Codex must not consider “build passed” equal to “feature tested”.

Use layered testing.

## 13.1 Mandatory checks after every meaningful task

At minimum, run relevant commands:

```bash
npm run lint
npm run typecheck
npm run build
```

For small tasks, targeted workspace commands are acceptable during iteration, but the full root checks must run at phase boundaries.

---

## 13.2 Required V2 test areas

### Public website

- landing renders
- navbar works
- mobile menu works
- footer links work
- legal routes work
- contact validation works
- dark/light/system theme does not break layout

### Admin

- normal user cannot access admin API
- normal user cannot access admin UI
- admin can access admin API/UI
- role cannot be self-assigned
- metrics return valid values
- admin content updates validate payloads

### Paid content

- free content remains accessible
- paid content is denied without entitlement
- paid content works with entitlement
- frontend lock state matches server state

### Payment

- amount comes from server product record
- invalid payment signature rejected
- valid signature accepted
- duplicate verification is idempotent
- duplicate webhook is idempotent
- wrong order/payment mapping rejected
- entitlement not created for failed/unverified payment

### Digital library

- free PDF accessible
- paid PDF denied before purchase
- authorized paid PDF accessible
- unpublished product hidden from public listing
- admin can publish/unpublish
- image placeholder works
- missing paid file fails safely

### V1 regression

Re-test:

- register
- login
- refresh
- logout
- forgot/reset password
- protected routes
- mantra list/details
- favorites
- start practice
- count
- pause/resume
- abandon
- complete
- history
- insights
- profile
- avatar
- settings
- push subscription
- PWA build
- offline practice path

V2 must not ship if a V1 regression is introduced.

---

# 14. Codex Task Execution Loop

Create a tracker:

```text
docs/V2_TODO.md
```

If a similar V2 tracker already exists, reuse it.

Use this task format:

```md
- [ ] V2-001 Task title
  - Scope:
  - Acceptance criteria:
  - Files likely affected:
  - Tests:
  - Notes:
```

---

## 14.1 Work one task at a time

For each task:

### Step A — Inspect

Before editing:

- inspect relevant files,
- inspect related existing patterns,
- identify regression risk.

### Step B — Implement

Make the smallest coherent change.

### Step C — Validate

Run:

- targeted tests/checks,
- lint/typecheck/build as appropriate.

### Step D — Failure handling

If code/test fails:

1. inspect error,
2. fix the root cause,
3. rerun,
4. repeat until passing.

Do not skip the failing test to make the task “green”.

Do not disable lint/type rules to hide a bug.

### Step E — External blocker

If blocked only by:

- Razorpay credentials,
- production webhook URL,
- private file provider configuration,
- production DNS,
- production email credentials,

then:

- finish all local/code work possible,
- add test-mode or mock/dev path when safe,
- document exact manual verification,
- mark the task as `BLOCKED: external configuration`,
- do not mark it `[x]`.

### Step F — Complete

Only after acceptance criteria pass:

```md
- [x]
```

Then move to the next task.

---

# 15. Recommended Implementation Phases

Codex should follow this order unless the repository reveals a safer dependency order.

---

## Phase V2-0 — Baseline and protection

- [ ] Read repository and this instruction file
- [ ] Record current branch/commit
- [ ] Create `docs/V2_TODO.md`
- [ ] Run baseline lint
- [ ] Run baseline typecheck
- [ ] Run baseline build
- [ ] Record existing failures before V2 changes
- [ ] Identify current public/auth/protected route behavior
- [ ] Identify reusable design components
- [ ] Do not begin major feature coding until baseline is known

---

## Phase V2-1 — Public site foundation

- [ ] Public site route strategy
- [ ] Public layout
- [ ] Navbar
- [ ] Footer
- [ ] Landing page
- [ ] About page
- [ ] How It Works page
- [ ] Contact page UI
- [ ] Privacy page
- [ ] Terms page
- [ ] Responsive/mobile testing
- [ ] Theme testing
- [ ] Placeholder handling

---

## Phase V2-2 — Contact backend

- [ ] Contact schema/model or email strategy
- [ ] Validation
- [ ] Rate limiter
- [ ] Contact endpoint
- [ ] Safe error responses
- [ ] Frontend integration
- [ ] Admin contact listing if model is used

---

## Phase V2-3 — Admin authorization foundation

- [ ] `requireAdmin`
- [ ] Admin promotion CLI/script
- [ ] Admin route group
- [ ] Admin frontend route guard
- [ ] Admin shell
- [ ] Admin navigation
- [ ] Unauthorized tests

---

## Phase V2-4 — Admin metrics

- [ ] Metrics service
- [ ] Metrics API
- [ ] Metrics cards
- [ ] Basic recent activity
- [ ] No sensitive-data overexposure
- [ ] Aggregation performance review

---

## Phase V2-5 — Monetization model

- [ ] Define content access architecture
- [ ] Add free/paid behavior with backwards-compatible defaults
- [ ] Entitlement model
- [ ] Admin free/paid controls
- [ ] Paid lock states in frontend
- [ ] Server access enforcement

---

## Phase V2-6 — Digital products/store

- [ ] DigitalProduct model
- [ ] Store APIs
- [ ] Store listing
- [ ] Product detail
- [ ] Admin product CRUD
- [ ] Publish/unpublish
- [ ] Cover placeholder
- [ ] Free PDF access architecture
- [ ] Paid PDF authorization architecture

---

## Phase V2-7 — Razorpay

- [ ] Razorpay config
- [ ] env validation
- [ ] create-order endpoint
- [ ] internal order record
- [ ] Razorpay checkout integration
- [ ] payment signature verification
- [ ] webhook raw-body endpoint
- [ ] webhook verification
- [ ] idempotency
- [ ] entitlement grant
- [ ] failure handling
- [ ] test-mode manual checklist

---

## Phase V2-8 — User digital library

- [ ] Purchased/owned content API
- [ ] User library UI
- [ ] Purchased content cards
- [ ] Authorized PDF access
- [ ] Empty state
- [ ] Offline behavior decision/documentation

Paid PDFs do not need to be fully available offline in V2 unless explicitly implemented securely.

---

## Phase V2-9 — Admin commerce management

- [ ] Order list
- [ ] Order details
- [ ] Payment status
- [ ] Revenue metrics
- [ ] Product access state
- [ ] Entitlement view
- [ ] Admin audit log
- [ ] Contact messages

Do not add manual “mark paid” unless there is a strong audited business reason.

If manual entitlement grant is needed, make it an explicit audited entitlement action rather than falsifying Razorpay payment state.

---

## Phase V2-10 — Hardening and regression

- [ ] CSRF/origin hardening
- [ ] production env validation
- [ ] admin abuse/rate limit review
- [ ] webhook security review
- [ ] content URL security review
- [ ] database indexes
- [ ] migration/index scripts
- [ ] V1 regression tests
- [ ] V2 tests
- [ ] root lint
- [ ] root typecheck
- [ ] root build
- [ ] update README
- [ ] update `.env.example`
- [ ] update deployment docs
- [ ] update V2 TODO status

---

# 16. UI/UX Guidelines for New V2 Features

Keep new UI:

- calm,
- devotional,
- modern,
- uncluttered,
- responsive,
- readable,
- accessible.

Use existing fonts and visual tokens.

Admin may be denser than the public experience, but should still look like DevSangam.

Paid UI should be respectful.

Avoid:

- casino-like urgency,
- fake countdown timers,
- aggressive upsells,
- manipulative dark patterns,
- misleading “only today” pricing,
- fake scarcity.

Use clear labels such as:

- Free
- Premium
- Purchased
- Locked
- Included
- Buy / Unlock

---

# 17. Accessibility

New UI should include:

- semantic headings,
- labels,
- visible focus states,
- keyboard navigation,
- button names,
- adequate contrast,
- form error descriptions,
- alt text for real images,
- decorative images marked appropriately,
- responsive touch targets.

Do not rely on color alone for paid/free/status distinctions.

---

# 18. Performance

Avoid turning the landing site into a large bundle.

Continue route-level code splitting.

Admin should load lazily.

Razorpay Checkout script should load only when needed.

Do not load admin code for normal users if avoidable.

Use pagination for:

- users
- orders
- products
- contact messages

Do not return complete unbounded datasets.

---

# 19. Logging and Observability

Production logs may include:

- request failure category
- payment event ID
- order ID
- admin action ID
- provider status code

Do not log:

- passwords
- auth cookies
- JWTs
- Razorpay key secret
- webhook secret
- payment signature
- PDF signed URLs if avoidable
- push encryption keys
- full private user records

---

# 20. Git Rules

Before work:

- confirm clean working tree,
- use a dedicated V2 branch if possible.

Suggested:

```text
feature/v2-platform
```

Do not force-push shared branches.

Commit coherent tasks.

Suggested commit style:

```text
feat(public): add DevSangam landing layout
feat(admin): add server-side admin authorization
feat(store): add digital product model
feat(payments): add Razorpay order verification
test(payments): cover signature verification
docs(v2): update implementation tracker
```

Do not create huge commits containing unrelated phases.

---

# 21. Definition of Done for Any V2 Task

A task is done only when:

- implementation exists,
- errors are handled,
- validation exists where required,
- authorization exists where required,
- UI matches theme,
- dark/light modes still work,
- TypeScript passes,
- relevant lint passes,
- relevant tests/checks pass,
- no known V1 regression was introduced,
- TODO is updated,
- documentation/env examples are updated if required.

---

# 22. Final V2 Definition of Done

V2 is not complete until all of the following are true:

```text
Public landing site works
Public navbar/footer work
About works
How It Works works
Contact works
Privacy works
Terms works

Admin authentication is server-enforced
Admin dashboard works
Admin metrics work
Admin content management works
Normal users cannot access admin resources

Free/paid content states work
Existing V1 mantras remain backwards compatible
Entitlements are server-enforced

Digital product/store listing works
PDF products work
Paid PDFs are private
Authorized users can access purchases

Razorpay Test Mode works end to end
Payment signatures are verified
Webhook signatures are verified
Webhook handling is idempotent
Server controls payment amount
Entitlements are granted safely

V1 authentication still works
V1 practice still works
Offline practice still works
Insights/history still work
Settings/profile still work
PWA still builds
Push notification code still works

Root lint passes
Root typecheck passes
Root build passes
Relevant tests pass
README is updated
.env.example is updated
V2 TODO reflects reality
```

Production-only verification may remain marked external/blocking until production credentials and provider configuration are supplied.

---

# 23. Do Not Do These Things

Codex must not:

- redesign V1 unnecessarily,
- replace auth architecture,
- remove offline practice,
- remove PWA behavior,
- break current dashboard,
- expose payment secrets,
- trust client payment amount,
- grant paid access from client state,
- expose paid PDFs publicly,
- allow users to assign themselves admin,
- add admin role to registration payload,
- hardcode production secrets,
- invent legal certifications,
- invent a refund policy,
- use random copyrighted images,
- mark blocked work complete,
- silence tests/lint to get green output,
- make a destructive DB migration without explicit need,
- build a full marketplace when only digital PDF commerce is required.

---

# 24. Recommended Initial File/Feature Map

This is guidance, not a mandatory exact structure.

## API

```text
apps/api/src/
  config/
    razorpay.ts
    env.ts

  middleware/
    require-admin.ts
    verify-origin.ts

  models/
    digital-product.model.ts
    order.model.ts
    entitlement.model.ts
    admin-audit-log.model.ts
    contact-message.model.ts

  controllers/
    admin.controller.ts
    store.controller.ts
    payment.controller.ts
    library.controller.ts
    contact.controller.ts

  services/
    admin-metrics.service.ts
    payment.service.ts
    entitlement.service.ts
    digital-product.service.ts
    private-asset.service.ts
    admin-audit.service.ts

  routes/
    admin.routes.ts
    store.routes.ts
    payment.routes.ts
    library.routes.ts
    contact.routes.ts

  validators/
    admin/
    store/
    payments/
    contact/
```

## Web

```text
apps/web/src/features/
  public-site/
  admin/
  store/
  payments/
  digital-library/
```

Reuse shared UI components whenever possible.

---

# 25. First Codex Session — Exact Start Procedure

When Codex starts V2 work, it must **not immediately start adding Razorpay/admin code**.

The first session should do only:

1. inspect repository,
2. verify baseline,
3. create V2 task tracker,
4. decide the safest route/layout strategy,
5. implement the public-site foundation first,
6. run tests/checks,
7. update TODO.

This creates a stable base before sensitive commerce/admin changes.

---

# 26. START PROMPT FOR CODEX

Copy the prompt below into Codex after placing this file in the repository.

---

## Codex Start Prompt

```text
You are working on DevSangam Version 2.

Repository:
shivammchaudhary1/devsangam

Before doing anything else, locate and read the DevSangam V2 master instruction Markdown file in the repository completely.

Treat that file as the implementation contract.

Important constraints:
- Do not disturb or redesign working V1 architecture.
- Do not break the existing UI/theme.
- Preserve authentication, sessions, practice, offline/Dexie sync, PWA, insights, profile, settings, push notifications, and current deployment behavior.
- V2 must be additive and backward compatible.
- Existing mantras/users must continue working.
- Do not start with payment/admin implementation before completing the V2 baseline inspection and tracker setup.

Execution process:
1. Inspect the full current repository structure and current git status/branch.
2. Read the relevant README, package files, route structure, auth/session implementation, UI/theme files, models, services, offline practice implementation, deployment workflows, and existing TODO files.
3. Run baseline lint, typecheck, and build before changing code.
4. Create or update docs/V2_TODO.md using the task format defined in the master instructions.
5. Record any existing baseline failures instead of silently fixing unrelated V1 code.
6. Begin with Phase V2-1 public-site foundation.
7. Work one task at a time.
8. After each task, run relevant tests/checks.
9. If a check fails because of your code, fix it and retry until it passes.
10. Only then mark the task complete and move to the next task.
11. If blocked by external credentials/provider configuration, complete all safe local work, mark it BLOCKED rather than complete, and document the exact manual verification required.
12. Use placeholders where final images/assets are unavailable.
13. Never commit secrets.
14. Never trust client-side admin/payment/access state.
15. Keep Razorpay payment verification and paid-content authorization server-side.

For this first run, stop after:
- baseline inspection,
- docs/V2_TODO.md creation/update,
- public route/layout strategy,
- implementation of the public-site foundation requested by Phase V2-1,
- relevant lint/typecheck/build checks,
- TODO status update.

At the end, give me:
- files changed,
- tasks completed,
- tests/checks run and results,
- any blockers,
- next task Codex should execute.

Do not skip ahead to Razorpay or the admin panel during the first run unless the master instruction file explicitly requires a dependency change.
```

---

# 27. Suggested Follow-Up Prompt After Each Codex Run

Use this after Codex completes a batch:

```text
Continue DevSangam V2 using the master V2 instruction file and docs/V2_TODO.md as the source of truth.

First:
- inspect the current git diff,
- confirm previously completed tasks still satisfy their acceptance criteria,
- find the next unchecked non-blocked task in dependency order.

Then:
- implement only that task or one tightly coupled task group,
- preserve all V1 behavior and UI/theme,
- run the required tests/checks,
- if anything fails because of your changes, fix and retry,
- do not mark the task complete until it passes,
- update docs/V2_TODO.md truthfully.

At the end report:
- completed task IDs,
- files changed,
- checks executed,
- results,
- blockers,
- next recommended task.
```

---

# 28. Priority Reminder

The priority order for DevSangam V2 is:

```text
V1 stability
    ↓
Public website
    ↓
Admin authorization
    ↓
Admin metrics
    ↓
Monetization/access model
    ↓
Digital products
    ↓
Razorpay
    ↓
User library
    ↓
Admin commerce management
    ↓
Security hardening + regression
```

Do not reverse this order without a concrete technical dependency.

---

# 29. Final Principle

DevSangam V2 should feel like an expansion of DevSangam V1, not a replacement.

The best V2 implementation is one where:

- an existing user can continue using V1 features normally,
- a new visitor sees a polished public website,
- admins have controlled management tools,
- paid access is enforced on the server,
- digital products are delivered securely,
- payment handling is verifiable and idempotent,
- and the current devotional visual identity remains intact.
