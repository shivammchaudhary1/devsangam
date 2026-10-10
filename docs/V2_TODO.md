# DevSangam V2 tracker

Next.js/NestJS migration authorized on 10 October 2026 is tracked in
`NEXT_NEST_MIGRATION.md`. Same UI/functionality, native frameworks and SSR/SEO;
deployment is explicitly deferred. MIG-001 through MIG-005 are complete locally:
native Next frontend, native Nest API, public SSR/SEO and compatibility regression.
Final checks and limitations are recorded in `NEXT_NEST_MIGRATION.md`; the complete
file inventory is in `NEXT_NEST_MIGRATION_FILES.md`.
MIG-006 resolves the reproduced local development HMR reload loop using Webpack;
the web README documents stale Vite service-worker recovery without deleting Dexie data.
MIG-007 is complete: removed 18 unused files and obsolete Vite/Express build output;
root checks, 13 API tests and 16 visual comparisons pass. Exact acceptance results
are recorded in the migration report.
Prior implementation records below are historical.

Implementation contract: `../DEV_SANGAM_V2_CODEX_MASTER_INSTRUCTIONS.md`.
Updated: 10 October 2026 (Asia/Calcutta). User authorized the full Next/Nest migration with existing UI/functionality preserved; deployment deferred. Earlier V2 work includes the empty Astro page.

Current implementation: all safe local V2 frontend/backend work exists. Provider/device/business verification remains BLOCKED, not complete. See `V2_DEPLOYMENT.md` for exact steps. Historical first-run notes below describe the earlier foundation-only scope and are superseded where the current run added APIs/commerce.

## Baseline / V2-0

- [x] V2-001 Inspect and protect V1 baseline
  - Scope: Master instructions, repository structure, README files, packages, routes, auth/session, theme/UI, API models/services, Dexie sync, PWA/push and existing TODO.
  - Acceptance criteria: Identify V1 boundaries and record pre-change checks without unrelated fixes.
  - Files likely affected: docs/V2_TODO.md
  - Tests: Root `npm run lint`, `npm run typecheck`, `npm run build`: PASS before code changes; PWA sw.js generated.
  - Notes: Branch `version2`, commit `4a76a48eedb653f03acf2bdad589941581479457`. Initial working tree has only untracked master instructions; preserved. No AGENTS.md or deployment workflows present. Existing newTodo.md explicitly defers CI. Node installed 26.10.0; root engines says 24.0.0 while README/.nvmrc use 26.7.0 (pre-existing discrepancy). No baseline check failures. Existing full V1 manual QA remains open in newTodo.md.

## Public foundation / V2-1

- [x] V2-002 Define public routing and layout strategy
  - Scope: Separate public layout; dual experience at `/`; lazy public pages.
  - Acceptance criteria: Existing users keep Dashboard and AppShell at `/`; guests see landing; `/library` and all other protected V1 routes retain their paths/guards.
  - Files likely affected: apps/web/src/App.tsx, apps/web/src/features/public-site/
  - Tests: Baseline route/auth inspection; subsequent route smoke tests under V2-008.
  - Notes: Root layout waits for existing AuthProvider resolution and chooses PublicLayout or existing AppShell. Root index chooses landing/dashboard. Public `/about`, `/how-it-works`, `/contact`, `/privacy`, `/terms`, `/astro` and `/store` sit outside protected AppShell. V1 `/library` remains the mantra library; authenticated purchases use `/digital-library`. Public navigation now links to the implemented store. Existing auth/theme providers and deployment paths are retained.

- [x] V2-003 Add public layout, accessible navbar and footer
  - Scope: Shared public shell, brand, responsive navigation, guest CTAs and authenticated Open App action.
  - Acceptance criteria: Keyboard/mobile navigation, working links, no duplicate AppShell navigation, existing visual tokens/fonts.
  - Files likely affected: features/public-site/components/, App.tsx
  - Tests: Web lint/typecheck/build; browser navigation/guest/auth checks.
  - Notes: Implemented. Workspace lint/typecheck/build PASS; final browser acceptance recorded under V2-008 before completion.

- [x] V2-004 Add landing and stable devotional placeholder
  - Scope: Mala/library/insights/offline/PWA/reminder introduction and CTA; future premium/digital library clearly labeled.
  - Acceptance criteria: No unsupported guarantees, external image hotlinks or claims that purchases already work; stable artwork aspect ratio.
  - Files likely affected: features/public-site/pages/LandingPage.tsx, components/DevotionalPlaceholder.tsx
  - Tests: Web lint/typecheck/build; landing responsive/theme checks.
  - Notes: Implemented. Workspace lint/typecheck/build PASS. DevotionalPlaceholder uses fixed aspect ratio and no external assets; approved artwork replacement remains future work.

- [x] V2-005 Add About and How It Works
  - Scope: Respectful purpose/philosophy and truthful practice walkthrough.
  - Acceptance criteria: No fabricated team claims; offline continuation/sync described accurately; future purchases labeled planned.
  - Files likely affected: features/public-site/pages/AboutPage.tsx, HowItWorksPage.tsx
  - Tests: Web lint/typecheck/build; direct route rendering.
  - Notes: Implemented. Workspace lint/typecheck/build PASS; real offline-start constraints and planned purchases stated explicitly.

- [x] V2-006 Add Contact UI
  - Scope: Name/email/category/message, validation, accessible feedback and safe unavailable state.
  - Acceptance criteria: Invalid input identified; valid input never reports sent before backend exists; documented contact email fallback.
  - Files likely affected: features/public-site/pages/ContactPage.tsx
  - Tests: Web lint/typecheck/build; invalid/valid submit checks and no network submission.
  - Notes: UI implemented with Zod/React Hook Form, accessible field errors and unsent state. Workspace lint/typecheck/build PASS. Endpoint/integration/success state belongs to V2-2; no fake success or local persistence.

- [x] V2-007 Add Privacy and Terms draft routes
  - Scope: Product policy drafts covering master instruction topics.
  - Acceptance criteria: Professional legal review notice, future Razorpay/purchases described conditionally, no fabricated certification/refund promise.
  - Files likely affected: features/public-site/pages/PrivacyPolicyPage.tsx, TermsPage.tsx
  - Tests: Web lint/typecheck/build; legal routes/footer links.
  - Notes: Draft routes implemented; workspace lint/typecheck/build PASS. Finalization remains BLOCKED: external professional legal review/business refund policy. Reviewer must approve actual processor/retention/deletion details, applicable rights, license, termination and refunds before final legal copy or sales.

- [x] V2-008 Verify public foundation and V1 route boundaries
  - Scope: Desktop/mobile, dark/light/system, navigation, forms, guest/authenticated root and protected deep links.
  - Acceptance criteria: Relevant automated/browser checks and root lint/typecheck/build pass; document limits of mocked auth versus real provider verification.
  - Files likely affected: docs/V2_TODO.md, public smoke test
  - Tests: Root lint/typecheck/build, git diff --check, browser smoke suite.
  - Notes: PASS: final Edge/Chromium smoke suite, 241 assertions/checkpoints; focused auth suite 11 checks. Six public routes at five widths in dark/light/system; no off-screen public content or uncaught browser errors. Screenshots visually reviewed for mobile light legal/landing and desktop dark landing. Root lint/typecheck/build and git diff --check PASS. Mocked API limitations and manual release steps below; full V1/provider QA is not claimed complete.

## Remaining phases — current full implementation run

- [x] V2-009 Contact backend (V2-2)
  - Scope: Zod schema, strict body limit, spam resistance/rate limiting, storage or existing SMTP, safe errors and frontend integration.
  - Acceptance criteria: Invalid/oversized/spam requests rejected; no unsafe HTML/internal email details; real successful delivery/storage verified before success UI.
  - Files likely affected: API contact routes/controller/service/model/validator; ContactPage.
  - Tests: Validation, limiting, provider failure and frontend success/error; root checks.
  - Notes: MongoDB contact storage, strict 8kb parser, schema, honeypot, rate limit and frontend send/error states implemented. Real temporary MongoDB integration tests PASS (validation, plaintext storage, 413/429/spam); lint/typecheck passed. Production storage/host smoke remains manual.

- [x] V2-010 Admin authorization (V2-3)
  - Scope: DB role middleware, controlled promotion, admin guard/shell/navigation.
  - Acceptance criteria: Normal users denied, registration cannot assign role, session/DB role enforced server-side.
  - Files likely affected: API middleware/scripts/routes; web admin feature.
  - Tests: Unauthorized/authorized cases, role injection, root checks.
  - Notes: Auth + active session + current DB role middleware, lazy server-checked AdminShell, eight admin sections and audited existing-user promotion CLI implemented. Real MongoDB authorization/role injection/expiry/CLI tests and browser denied/admin screens PASS.

- [x] V2-011 Admin metrics (V2-4)
  - Scope: Aggregations/API/cards/recent activity.
  - Acceptance criteria: Authorized, bounded responses; trusted metrics only.
  - Files likely affected: API admin metrics service; web admin.
  - Tests: Access, aggregation validity, root checks.
  - Notes: DB metrics/cards include users, recent signups, practice/count/duration, free/paid mantras, products, orders, captured revenue and refunds plus bounded recent activity. Captured/refunded orders contribute verified totals. No revenue from client state. API and actual browser/admin integration PASS; responsive/theme UI PASS.

- [x] V2-012 Monetization/access model (V2-5)
  - Scope: Offers/entitlements, free defaults, admin controls/server enforcement.
  - Acceptance criteria: Existing mantras accessible; paid content denied without DB entitlement.
  - Files likely affected: API models/services; web mantra access UI.
  - Tests: Legacy/free/paid access, root checks.
  - Notes: Additive mantra free/zero defaults, source-order entitlements, admin access/price controls, redacted list/detail/favorites, locked detail/setup/runtime and server practice checks implemented. Missing V1 fields remain free. Revoked unfinished practice can still be abandoned. Real MongoDB access tests and browser lock state PASS; real SW test confirms free caching and paid-text exclusion.

- [ ] V2-013 Digital products/store (V2-6)
  - Scope: Products/catalog/detail/admin CRUD/publish/placeholder/private PDF abstraction.
  - Acceptance criteria: Unpublished hidden; paid assets private and authorization cannot be bypassed.
  - Files likely affected: API store/private asset feature; web store.
  - Tests: Catalog, publish, free/paid delivery, root checks.
  - Notes: LOCAL IMPLEMENTATION PASS: `/store` catalog/detail, placeholders, paged API, admin structured CRUD, publish/unpublish, PDF upload, dev-private/Azure adapter and authorized download. Actual browser -> Express -> MongoDB -> PDF flow PASS. BLOCKED: external configuration — Azure connection/container absent locally; verify staged private-container/public-read denial and authorized delivery as specified in V2_DEPLOYMENT.md. This task is deliberately not checked complete.

- [ ] V2-014 Razorpay (V2-7)
  - Scope: Config/server-priced orders/checkout/signatures/raw webhook/idempotency/entitlement.
  - Acceptance criteria: Verified successful payment only grants access; integer paise; secrets server-only.
  - Files likely affected: API payments/config/models; web checkout.
  - Tests: Full master payment security matrix and test-mode manual checklist; root checks.
  - Notes: LOCAL IMPLEMENTATION PASS: server prices/integer paise, stored-order HMAC, captured-payment lookup, transactional/idempotent grants, raw signed webhooks, out-of-order refund handling, failure/pending/cancel states, provider reconciliation. Security matrix/integration/browser checkout PASS using provider fixtures. BLOCKED: external configuration — Razorpay key/secret/webhook secret absent locally. Real Razorpay Test Mode checkout/capture/webhook/refund must pass the exact V2_DEPLOYMENT.md checklist; not marked complete.

- [x] V2-015 User digital library (V2-8)
  - Scope: Owned-content API/cards/purchase history/authorized delivery/empty state.
  - Acceptance criteria: Server-derived access; preserve V1 mantra library; document paid PDF offline behavior.
  - Files likely affected: API library; web digital-library.
  - Tests: Ownership/delivery/empty state, root checks.
  - Notes: `/digital-library` and `/digital-library/purchases` preserve V1 `/library`. Own active grants/history, published availability, free reading, authenticated PDF delivery, empty/error/pending states and provider payment checks implemented. Paid PDFs require connectivity and are not stored in PWA cache. API ownership tests and actual browser purchase/download/history/refund integration PASS.

- [x] V2-016 Admin commerce (V2-9)
  - Scope: Orders/payments/revenue/entitlements/audit/contact messages.
  - Acceptance criteria: DB role enforced; bounded queries; audited sensitive actions; no unaudited mark-paid flow.
  - Files likely affected: API admin; web admin commerce.
  - Tests: Authorization/audit/trusted payment states, root checks.
  - Notes: Paged orders with payment IDs/status/amount/refunds, users with safe projections, entitlements/revocation, audit log and contact review UI/API implemented. Sensitive content/file/access/contact/promotion actions audited in transactions. Reconcile fetches trusted Razorpay state; no mark-paid endpoint. Database and browser tests PASS, including admin edit/contact review end-to-end.

- [ ] V2-017 Hardening and full regression (V2-10)
  - Scope: Origin/CSRF, env validation, rate limits, webhook/content security, indexes, V1/V2 QA, README/env/deployment docs/CI.
  - Acceptance criteria: Full master regression matrix, root checks; truthful provider blockers.
  - Files likely affected: API infrastructure, docs, workflows, env examples.
  - Tests: Master sections 13/15/22; production smoke checks when configured.
  - Notes: LOCAL IMPLEMENTATION PASS: origin/CSRF checks, prod env validation, rate/body/upload bounds, safe logging, additive createIndexes script, CORS cache header, README/env/deployment docs, quality-only CI and regression suites. Existing Cloudflare/Azure/MongoDB/Zoho/Cloudinary/PWA/push architecture retained. BLOCKED: external configuration/device verification — real Razorpay/Azure, deployed SMTP/avatar/push/PWA update and first hosted CI run must be verified per V2_DEPLOYMENT.md. Legal/business approval remains separate. No production deployment or data mutation performed.

- [x] V2-018 Empty Astro section
  - Scope: Public navbar link and empty `/astro` page.
  - Acceptance criteria: Named Astro link, working direct route, no fabricated content.
  - Files likely affected: public-routes.ts, AstroPage.tsx, App.tsx, PublicNavbar.tsx.
  - Tests: Web checks and V2 UI browser suite.
  - Notes: Implemented; direct Astro route and empty content verified. Public navbar uses mobile mode below 1280px to fit the added link without overflow.

- [x] V2-019 Local full-stack and offline acceptance
  - Scope: Real temporary MongoDB/SMTP/API integration, browser states, actual browser/API/DB purchase/download/contact/admin/refund flow and SW/Dexie.
  - Acceptance criteria: Security matrix and V1 regression checks pass without production data/providers; document fixture limits.
  - Files likely affected: apps/api/src/tests/, scripts/*smoke.mjs, scripts/v2-e2e.mjs, docs/.
  - Tests: 13 API integration tests; 274 public browser checks; 233 V2 UI checks; 20 real local browser/API/DB checks; 13 SW/Dexie offline checks. Root lint/typecheck/build and audit; see final results below.
  - Notes: PASS. Temporary MongoDB replica set; loopback SMTP reset; real generated SW offline reload/count/pause/resume/complete/reconnect and one completion. Free cache retained; paid text excluded. Browser fixtures are not represented as real Razorpay/Azure verification.

- [ ] V2-020 Final policies/provider/device release approval
  - Scope: Real provider Test Mode and storage validation, approved legal/business copy, production/device smoke.
  - Acceptance criteria: Complete each manual checklist in V2_DEPLOYMENT.md before live sales and release claim.
  - Files likely affected: approved Privacy/Terms copy, secure host configuration, V2_TODO.md.
  - Tests: Actual Razorpay/Azure/SMTP/Cloudinary/push/installed-PWA/GitHub-hosted CI.
  - Notes: BLOCKED: external configuration/business approval. Secrets must go through secure host settings, not this tracker or browser environment. Existing placeholders are allowed and do not block local implementation.

## Current-run verification record

| Final check | Result |
| --- | --- |
| Root lint / typecheck / build | PASS |
| API integration | 13 tests PASS |
| Public browser suite | 274 checkpoints PASS |
| V2 UI browser suite | 233 checkpoints PASS |
| Actual local browser/API/DB integration | 20 checks PASS |
| Real SW/Dexie offline suite | 13 checks PASS |
| Fresh install / final install dry-run / dependency tree | PASS |
| Root dependency audit | 0 vulnerabilities |
| Diff whitespace / CI YAML structure | PASS |

- Baseline root lint/typecheck/build passed before changes. No unrelated V1 code failures were silently repaired.
- API suite covers plaintext contact validation/413/429/honeypot; auth/session/current role and role injection; production Origin/env; audited CRUD/upload/publish/projections; legacy free access; paid list/detail/favorites/practice locks; canonical amount; invalid/valid signature; ownership/order/payment/amount mismatch; failed/authorized no-grant; duplicate verification/concurrent webhooks; refunds/replay/revocation; free/paid/missing PDFs; catalog/privacy/history; provider errors and no production filesystem fallback; actual V1 auth/profile/settings/favorites/practice/insights; push-subscribe storage and invalid avatar; real reset email through loopback SMTP; controlled admin CLI.
- Browser suites cover public dark/light/system at five widths, admin dark/light at four widths, Astro, normal-user admin denial, admin sections/edit/unpublish, catalog/product placeholders, paid locks, verified download/history, failed verification without unlock, and contact success/error. Screenshots inspected for mobile light store and desktop dark store/admin.
- The end-to-end suite uses actual browser cookies, Express, MongoDB, private file storage and payment HMAC/provider reconciliation. Only Razorpay/Checkout are fixtures. Paid download before purchase returns 403; captured verification grants one entitlement; refund removes access.
- The offline suite enables the real generated service worker and Dexie rather than blocking SW: prepared free practice survives offline reload, count/pause/resume/completion persists, reconnect syncs one completion; free mantra cached and owned paid text not cached. API now exposes the public-cache header through CORS for this cross-origin Workbox check.
- Repaired implementation issues before passing: admin file-picker overflow, nested new-library main landmark, blocked-session abandonment, cache-header CORS exposure. Test fixtures were corrected for existing reset-token length and case-sensitive accessible labels. No tests disabled to hide failures.
- Dependency hardening found pre-existing/introduced-tree advisories. Compatible lock updates resolve Multer/brace-expansion/ip-address/fast-uri/undici; Nodemailer moved to 10.0.13 with loopback SMTP reset regression passing. Explicit web AJV 8/ajv-formats 2 development peers resolve the existing form-tooling optional-peer mismatch; `npm ls --all` PASS. Fresh `npm ci --ignore-scripts` PASS after stopping our own preview (Windows had locked its native Vite DLL); tests downloaded and ran the isolated MongoDB binary successfully. Final lockfile install dry-run PASS. Root audit reports zero vulnerabilities. Pre-existing Node engine warning and Mongoose `new` deprecation warnings remain documented.
- Local configuration presence only was checked; Razorpay and Azure settings were absent. Actual credentials were never printed or committed. All integration database writes/storage occurred in temporary fixtures.
- Current changed-file inventory is in V2_CHANGES.md. Provider steps/endpoints/config are in V2_DEPLOYMENT.md. The first-run notes below are historical, not the present feature status.

## Historical first-run verification and safe scope

- Root lint/typecheck/build passed at baseline and after all public UI changes. Generated PWA manifest, sw.js and Workbox files remain present. No API/model/schema/session/practice/offline/push/theme-provider/deployment or dependency/lockfile changes.
- Targeted workspace lint/typecheck/build ran after layout, landing, informational pages, contact UI and policy drafts. New max-length lint violations were corrected and lint rerun successfully. No baseline failures were silently fixed.
- Browser smoke uses Edge/Chromium, mocked HTTP session/API responses and blocked service workers for deterministic route checks. It is not proof of real authentication, database, SMTP, scheduled push, installed-PWA update or end-to-end offline sync. Those V1 manual checks remain open in newTodo.md.
- Final browser result: PASS, 241 checks. Test-harness issues corrected before final rerun: rebuild during the first preview run invalidated lazy chunks; reset-password form requires a token; Open App selector must be scoped to navbar; focused auth additions needed context lifetime ordering. No V1 source changes were made to accommodate these tests. Screenshot feedback removed the container focus border and reserved navbar session-control space; checks rerun after these UI changes.
- Baseline discrepancy: README/root Node engine versions differ; no CI/deployment workflows exist in this checkout. Existing host behavior/configuration was not modified.
- Final images remain placeholders, as allowed by the contract. Privacy/Terms are explicitly drafts. Contact UI intentionally cannot send until V2-009. No Razorpay/admin/payment code implemented.

### Reproduce first-run/public browser checks (PowerShell)

No repository dependencies are added. Playwright is installed only in a temporary QA directory. The script uses installed Edge; if unavailable, install Edge or adapt the explicit browser channel locally.

```powershell
$qaDir = Join-Path $env:TEMP 'devsangam-v2-qa'
npm install --prefix $qaDir --no-package-lock playwright
npm run build
# Start preview in another terminal:
npm run preview -w @devsangam/web -- --host 127.0.0.1 --port 4173 --strictPort
# Then run in the original terminal:
$env:V2_QA_MODULE_ROOT = $qaDir
node scripts/public-site-smoke.mjs
# Optional focused auth-boundary checks:
node scripts/public-site-smoke.mjs --auth-only
```

Use V2_QA_URL to override preview origin and V2_QA_OUTPUT to choose screenshot directory. The current public suite covers seven routes at 320/390/768/1024/1440px in dark/light/system, horizontal bounds, header/footer/store navigation, keyboard/mobile menu, system theme changes, contact validation/unavailable state, V1 guest-protected deep links, auth pages, authenticated `/` and `/library`, Open App, guest guard, auth expiry, cached offline bootstrap and rejection of stale cache. Screenshots stay outside the repository. V2_DEPLOYMENT.md includes the other three browser suites and their prerequisites.

### Manual release follow-up

On the configured deployment, verify signed-in Dashboard at `/`, refresh/logout and each protected V1 flow; start practice online, continue/count/complete offline, reconnect and confirm one server session; verify PWA install/update and push subscription/reminders. Verify new public deep links through Cloudflare SPA fallback. Review final legal text and approved artwork separately. These provider/device checks are not marked complete in this run.
