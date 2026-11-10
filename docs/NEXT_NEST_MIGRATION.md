# Next.js / NestJS migration

Authorized on 10 October 2026: migrate the complete current `version2` frontend
and API to Next.js and NestJS, add SSR/SEO, preserve UI and behavior, and defer
deployment. This explicit instruction supersedes the master document's framework
and static-host constraints for this migration only. No hosting configuration,
production database, auth secrets or provider credentials will be changed.

Baseline: clean `version2`, commit `9807191`. Root lint, typecheck and build PASS;
13 API/MongoDB/SMTP tests PASS. Existing AdminPage useMemo dependency warning,
Node engine discrepancy and Mongoose `new` deprecation are baseline warnings.
Old browser scripts initially could not run because their temporary Playwright
installation was gone; migrate the test prerequisite to a reproducible dev tool.

Compatibility requirements: same routes, `/api/v1` responses/status/errors,
cookie names/paths/signing/session records, current database schemas/indexes,
`devsangam-practice` Dexie version 1 and sync, theme key/fonts/styles, push worker
and subscriptions, private files, canonical prices and raw signed webhooks.
Public pages must contain content in server HTML and unique canonical metadata;
private screens must not expose account data to search engines or shared caches.

## Implementation and compatibility

`apps/web/src/app` now owns native Next file routes and public/auth/app/admin
layouts. The established feature components, typography, visual tokens and page
markup remain. The small navigation adapter preserves existing component props
using Next Link/router/params; React Router and the Vite bootstrap are removed.
Public HTML is SSR; account screens retain the original authenticated API
bootstrap because session cookies still belong to the existing API origin.
These screens use noindex and generic server HTML, never shared account data.

Anonymous server fetches are allowlisted to published store metadata, timeout in
3 seconds and never forward cookies. React Query caches are request-local. The
sitemap includes static public pages and up to 1,000 published product URLs via
bounded pagination; larger catalogs should adopt a sitemap index. Paid PDF files
and mantra text are never fetched by public SSR. Native product 404s have real
404/noindex responses; Next 16's minimal error HTML recovers the same existing
"Resource unavailable" UI through its Flight/client boundary, tested in a real
browser. Ordinary public pages include their content without running JavaScript.

Nest owns all feature routing, guards, validation pipes, upload interceptors,
exception filters and application lifecycle. Express remains the official Nest
HTTP adapter; established domain handlers/services and Mongoose models are reused
rather than changing authentication/payment/practice policies. No database schema
rewrite or destructive migration occurs. Session/admin guards precede their
existing rate limits. Signed webhooks retain raw-body parsing before JSON parsing.

PWA manifest ID/scope, icon/audio bytes, push worker URL/subscriptions and Dexie
`devsangam-practice` version 1 remain. Workbox caches only anonymous SSR HTML and
explicitly public mantra responses. A precached generic shell resolves unvisited
offline URLs to the same existing pages; all required Next chunks are precached.
Auth routes and documents containing query parameters use NetworkOnly with the
generic offline fallback; reset tokens never enter persistent document caches.
Updates wait for explicit acceptance and are blocked during an active session.
Worker registration remains production-only, matching the previous development
behavior. Standalone packaging removes local .env files from the output only;
source files remain untouched and hosting supplies runtime secrets.

The root Node engine now matches the existing .nvmrc family (>=26.7 <27), replacing
the baseline Node 24 mismatch. Compatible dependency fixes removed audit findings.
Unused shadcn CLI dependencies were removed; its exact 4.18.0 Tailwind utility CSS
is vendored with the original MIT license. No component styles were redesigned.

## Baseline QA drift and visual evidence

Original browser runners depended on a deleted temporary Playwright install and
contained stale selectors after commit 9807191's UI redesign: footer landmark,
public navbar ID, 1280 versus current 1024 mobile breakpoint, case-sensitive Paid
label, and an Escape-focus contract absent in the current UI. Clipped decorative
glows were also counted as visible overflow. Assertions now target the existing
UI, exercise keyboard close and actual visible content, and wait for auth hydration.
These baseline differences did not cause V1 UI fixes. Playwright/pixelmatch are
reproducible dev-only tools; Chromium or installed Windows Edge runs the scripts.

16 before/after screenshots cover home/about/contact/login at 390/1440 in both
themes. Geometry, headings, font families/sizes and colors match exactly. Raw
pixel comparison found a 1-pixel native select text paint difference in mobile
light mode and small browser rasterization differences. Standard pixelmatch
comparison ignores antialiasing with threshold 0.1 and <0.1% differing pixels;
all screenshots pass (12 pixel-exact in the cleanup run; maximum perceptual pixel
difference 0.0831%). Image hashes match.
No pixel-perfect guarantee is claimed for native controls or device rendering.
Screenshots and comparison metrics stay in the OS temporary directory under
`devsangam-framework-visual`; they contain only fixtures/public UI. Capturing the
unchanged original Vite build a second time confirmed the baseline measurements.

## Tasks

- [x] MIG-001 Inspect branch/master/code and run baseline checks
  - Scope: routes/providers/styles, API middleware/services, PWA/Dexie, existing QA.
  - Acceptance criteria: record baseline and boundaries before implementation.
  - Files likely affected: migration docs and V2 tracker.
  - Tests: baseline lint/typecheck/build and 13 integration tests PASS.
  - Notes: authorization above; no deployment in scope.
- [x] MIG-002 Native Nest application/modules/controllers/guards/filter
  - Scope: replace Express routing/bootstrap with Nest, reuse established domain logic.
  - Acceptance criteria: all existing endpoints/security/limits/raw webhooks unchanged.
  - Files likely affected: apps/api/src/, API package/tsconfig, integration runners.
  - Tests: API lint/typecheck/build and real temporary DB/security suite.
  - Notes: PASS. Native feature modules/controllers replace all legacy routers.
    Existing domain services/models, Zod errors, status codes, cookies, guards,
    upload limits and raw signed webhooks retained. Rate limits run after the
    same session/admin policies. Nest shutdown closes HTTP, scheduler and MongoDB.
    13 API/security tests and 20 browser checks against compiled Nest JS PASS.
- [x] MIG-003 Native Next App Router, providers, SSR and SEO
  - Scope: replace Vite/React Router, same page components/styles/assets/URLs.
  - Acceptance criteria: public HTML content/metadata, request-isolated state,
    same root guest/dashboard and interactive private flows.
  - Files likely affected: apps/web/, package/lock, scripts.
  - Tests: lint/typecheck/build, SSR/SEO/security and browser compatibility.
  - Notes: PASS. Native file routes cover every existing URL. Public pages and
    published store metadata render in server HTML; unique titles, descriptions,
    canonical/OG/Twitter, WebSite JSON-LD, robots and public product sitemap added.
    Private screens retain authenticated API bootstrap and noindex. Query clients
    are request-local; anonymous SSR never forwards cookies or entitlement state.
    SSR suite: 190 checks PASS, including 404 status/noindex and browser recovery.
- [x] MIG-004 Preserve service worker/push/offline across Next navigation
  - Scope: Next-compatible worker build/registration, offline prepared practice.
  - Acceptance criteria: no private SSR/API caching, same Dexie and subscriptions,
    offline reload/count/pause/resume/complete/reconnect with one completion.
  - Files likely affected: web PWA integration/build scripts, offline QA.
  - Tests: real SW/Dexie and update/navigation/security regression.
  - Notes: PASS. Workbox precaches Next chunks/fonts/assets and a generic anonymous
    offline shell. Native Next navigation online; offline unvisited URLs use the
    same page components with recovered params. Dexie name/version/data unchanged.
    21 real SW/Dexie checks PASS, including unvisited session/settings, one synced
    completion, paid-text exclusion, auth/query cache exclusion and offline reset
    form recovery. 10 real worker-update checks PASS: update
    waits during practice and reloads only after explicit action outside practice.
- [x] MIG-005 Full regression, visual parity and documentation
  - Scope: real Nest/API/browser integration, public/admin/auth/mobile/themes,
    reproducible commands, runtime examples, tracker and changed-file report.
  - Acceptance criteria: full root checks and relevant suites pass; exact limits recorded.
  - Files likely affected: tests/scripts/docs/README/env examples.
  - Tests: root lint/typecheck/test/build/audit, browser/SSR/offline/visual checks.
  - Notes: PASS. Clean install, root checks, compiled production API/browser,
    public/UI/SSR/offline/PWA suites and visual parity passed. Native Next dev
    startup and standalone startup without source env files were verified.
    Complete changed-file inventory: NEXT_NEST_MIGRATION_FILES.md.
    Deployment and real provider/device configuration remain deferred.

## Final validation — 10 October 2026

| Check | Result |
| --- | --- |
| Clean npm ci | PASS |
| Root lint | PASS; existing AdminPage dependency warning retained |
| Root typecheck | PASS |
| Root API + Next standalone/PWA build | PASS |
| API/MongoDB/SMTP integration | 13 PASS |
| Compiled Nest browser integration | 20 PASS |
| Public site browser checks | 274 PASS |
| UI/auth/admin/store browser checks | 233 PASS |
| SSR/SEO/security checks | 190 PASS |
| Real service worker/Dexie/offline checks | 21 PASS |
| Real worker update/practice checks | 10 PASS |
| Before/after visual comparison | 16 PASS; exact geometry/fonts/colors |
| npm audit --audit-level=high | PASS; zero vulnerabilities |
| Standalone artifact local-env scan | PASS; no local .env files |
| git diff --check | PASS |

The first clean install encountered EPERM because an obsolete Vite process in
this workspace held a Rolldown DLL. Its executable/module/workspace were verified,
only that obsolete process was stopped, and a clean retry passed. Existing
Mongoose deprecation warnings remain; no unrelated V1 fix was made.

## Remaining manual verification and next task

Deployment is DEFERRED by the user's instruction. The next task is to choose and
configure a staging runtime for Next SSR and Nest, retaining API origins, cookie
settings, existing database records and VAPID keys, then verify deep links,
sessions, offline practice/sync and device push against staging. No deployment,
commit, production database operation or provider credential change occurred.

Live Razorpay test-mode verification, Azure private storage, provider/legal and
device checks retain their existing BLOCKED status and exact manual steps in
V2_DEPLOYMENT.md. Local fixture tests do not certify live provider configuration.
The quality-only CI workflow is updated; hosted CI has not been run.

## Development follow-up — 10 October 2026

- [x] MIG-006 Resolve repeated local development reloads
  - Scope: development bundler and legacy browser service-worker recovery.
  - Acceptance criteria: home/login stay loaded without repeated document requests
    or HMR reload messages; preserve API runtime, UI and saved practice data.
  - Files likely affected: apps/web/package.json and migration/run documentation.
  - Tests: fresh Edge context reproduced 25 document navigations in 5 seconds
    with Turbopack; WebSocket messages reported `HMR hash mismatch`. Webpack
    passed stable home/login navigation (one document per explicit navigation,
    zero page errors and zero HMR reload messages); web lint and diff check PASS.
    API health remained healthy. Existing lint warning remains.
  - Notes: `dev` now explicitly uses `next dev --webpack --port 5173`, matching
    the bundler already used for production builds. The screenshot additionally
    showed stale Vite HTML from an old local service worker; one-time unregister
    and close/reopen instructions are in apps/web/README.md. IndexedDB, cookies,
    production worker behavior and feature components are unchanged.

## Cleanup follow-up — 10 October 2026

- [x] MIG-007 Remove obsolete migration files and unused code
  - Scope: reference-checked dead components/helpers, duplicate audio and unused
    icon sprite, duplicate web ignore file, empty shared workspace, old Vite
    builds and compiled legacy Express routes.
  - Acceptance criteria: no removed file is an app/framework/script entry point;
    root checks pass, published assets and visual layout remain compatible.
  - Files likely affected: unused web components/assets/helpers, old validation
    middleware, packages/shared, lockfile, README and tracker/inventory.
  - Tests: root lint/typecheck/build, 13 API integration tests, visual comparison.
  - Notes: PASS. Removed 18 unused repository files, old web dist/dev-dist
    and old API dist/routes output. Preserved native Next file routes, active
    Nest domain handlers, operational scripts/tests/docs, public practice audio,
    PWA icons/push worker, current Next artifacts, local env and private assets.
    npm regenerated dependencies/lockfile and removed the obsolete shared link;
    no dependency versions or application behavior were intentionally changed.
    Root lint/typecheck/build and all 13 API integration tests PASS. All 16 visual
    comparisons PASS with exact geometry/fonts/colors, 12 pixel-exact and maximum
    perceptual pixel difference 0.0831%. Dependency audit reports zero vulnerabilities.
    Verified obsolete output is absent and env/practice/audio/push files remain.
    Existing AdminPage lint and Mongoose warnings are unchanged.
