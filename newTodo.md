# DevSangam v0.1 — Final TODO

Last updated: September 2026

## Current Status

Core DevSangam functionality is implemented and merged into `main`.

Completed:
- [x] Authentication
- [x] Login / Register / Logout
- [x] Forgot password / Reset password
- [x] Session refresh and revocation
- [x] Mantra library
- [x] 14 curated mantra records
- [x] Mantra detail pages
- [x] Favorites
- [x] Digital Mala practice flow
- [x] Local-first counter
- [x] Pause / Resume / Abandon / Complete session
- [x] IndexedDB / Dexie offline practice storage
- [x] Offline → reconnect synchronization
- [x] Dashboard
- [x] Practice history
- [x] Insights and statistics
- [x] Streak tracking
- [x] Profile editing
- [x] Cloudinary profile photo upload/remove
- [x] Cloudinary mantra images
- [x] Dark / Light / System theme
- [x] Sound preference
- [x] Haptic preference
- [x] Default practice target
- [x] User timezone preference
- [x] Password change from Settings
- [x] PWA manifest
- [x] Service worker
- [x] PWA update flow
- [x] Push notification subscription system
- [x] Push notification test
- [x] Daily Sadhana reminder
- [x] Reminder timezone handling
- [x] Reminder duplicate-delivery protection
- [x] Zoho SMTP
- [x] VAPID configuration
- [x] MongoDB index synchronization
- [x] Root lint passes
- [x] Production build passes
- [x] Current feature work merged into `main`

---

# Phase 1 — Development Infrastructure

## 1. Frontend typecheck
- [x] Add `typecheck` script to `apps/web/package.json`
- [x] Confirm root `npm run typecheck` checks API and Web
- [x] `npm run lint` passes
- [x] `npm run typecheck` passes
- [x] `npm run build` passes

## 2. GitHub Actions
- [x] Remove obsolete AWS/EC2 deployment workflow
- [x] Keep GitHub Actions disabled for the current v0.1 finalization workflow
- [ ] Add CI after the release/deployment workflow is finalized

---

# Phase 2 — Codebase Cleanup & Security

## 3. Production security hardening
- [x] Add Helmet/security headers
- [x] Add global API rate limiting
- [x] Add stricter login rate limiting
- [x] Add stricter registration rate limiting
- [x] Add stricter forgot-password rate limiting
- [x] Add stricter reset-password rate limiting
- [x] Review CORS implementation
- [x] Review API error responses for sensitive-data exposure
- [ ] Verify production CORS on the real deployment domain
- [ ] Verify production cookie behavior on the real deployment domain
- [ ] Configure proxy trust only if required by the selected production host

## 4. Code cleanup
- [x] Remove old commented `forgotPassword()` implementation
- [x] Clean active forgot-password controller formatting
- [ ] Review remaining console logging before release
- [ ] Investigate Mongoose deprecation warning if it reappears during final QA

## 5. Repository cleanup
- [x] Confirm stale `README copy.md` is not present
- [x] Standardize project license on MIT
- [x] Align `LICENSE`, README and root package metadata
- [x] Remove committed `cookies.txt`
- [x] Revoke the exposed test authentication session
- [x] Ignore future local cookie-jar files
- [x] Confirm local `.env` files are ignored
- [ ] Run final tracked-secret scan before merge

---

# Phase 3 — Documentation Refresh

## 6. README
- [x] Document Push API routes
- [x] Document push-notification architecture
- [x] Document daily reminder behavior
- [x] Document VAPID variables
- [x] Document Cloudinary variables
- [x] Document profile avatar support
- [x] Document current Settings features
- [x] Update PWA/offline section
- [x] Remove obsolete PRD/workflow references
- [x] Remove already-completed roadmap items
- [x] Update release checklist
- [x] Document current deployment constraints
- [ ] Add provider-specific production deployment details after hosting is selected

## 7. `.env.example`
- [x] Port / CORS variables
- [x] MongoDB variable
- [x] Access and refresh secrets
- [x] Node environment
- [x] Zoho SMTP variables
- [x] Cloudinary variables
- [x] VAPID subject/public/private keys
- [x] No real secret values committed in `.env.example`

---

# Phase 4 — v0.1 Scope Decisions

## 8. Goals
- [x] Keep persistent daily/weekly Goals out of v0.1
- [x] Keep existing default target and per-session target behavior
- [ ] Revisit persistent Goals after v0.1

## 9. Reminder days
- [x] Keep the current daily reminder model for v0.1
- [x] Do not add weekday selection before the first release
- [ ] Consider weekday selection after v0.1

## 10. Localization
- [x] Keep localization deferred for post-v0.1
- [x] Do not expose a language selector until translations exist

---

# Phase 5 — Full Regression QA

## 11. Authentication
- [ ] Register
- [ ] Login
- [ ] Wrong password handling
- [ ] Session persistence
- [ ] Refresh token flow
- [ ] Logout
- [ ] Protected routes
- [ ] Forgot password
- [ ] Reset email delivery
- [ ] Reset password
- [ ] Expired reset token
- [ ] Reused reset token
- [ ] Change password

## 12. Mantra library
- [ ] All 14 mantras load correctly
- [ ] Search
- [ ] Pagination
- [ ] Mantra details
- [ ] Cloudinary images
- [ ] Local fallback image
- [ ] Favorite
- [ ] Unfavorite
- [ ] Favorites survive refresh

## 13. Practice
- [ ] Start session
- [ ] Custom target
- [ ] Default target
- [ ] Counter
- [ ] Sound
- [ ] Haptics
- [ ] Pause
- [ ] Resume
- [ ] Exit/abandon
- [ ] Complete target
- [ ] Correct duration
- [ ] Correct count
- [ ] No duplicate unfinished sessions

## 14. Offline practice
- [ ] Start online
- [ ] Disconnect internet
- [ ] Continue chanting
- [ ] Refresh/reopen if supported
- [ ] Complete locally
- [ ] Reconnect
- [ ] Automatic synchronization
- [ ] No duplicate session
- [ ] Server state remains authoritative

## 15. Dashboard & Insights
- [ ] Today's activity
- [ ] Total chants
- [ ] Mala calculation
- [ ] Sessions
- [ ] Duration
- [ ] Current streak
- [ ] Longest streak
- [ ] Weekly chart
- [ ] Mantra distribution
- [ ] History pagination
- [ ] History filters
- [ ] Streak calendar
- [ ] Timezone calculations

## 16. Profile
- [ ] Edit name
- [ ] Edit bio
- [ ] Change intention
- [ ] Upload JPEG avatar
- [ ] Upload PNG avatar
- [ ] Upload WebP avatar
- [ ] Reject oversized image
- [ ] Replace avatar
- [ ] Remove avatar
- [ ] Avatar cache refresh works

## 17. Settings
- [ ] Dark theme
- [ ] Light theme
- [ ] System theme
- [ ] Theme survives reload
- [ ] Sound preference
- [ ] Haptic preference
- [ ] Default target
- [ ] Device timezone
- [ ] Password change
- [ ] Logout

## 18. Push notifications
- [ ] Enable Device Notifications
- [ ] Browser subscription created
- [ ] Backend subscription created
- [ ] Test notification appears
- [ ] Notification click opens/focuses Settings
- [ ] Daily reminder appears at configured time
- [ ] Reminder click opens Practice
- [ ] No duplicate daily reminder
- [ ] Disable notifications
- [ ] Browser subscription removed
- [ ] Backend subscription removed
- [ ] Enable again
- [ ] Logout cleans push subscription
- [ ] Login/reconnect reconciles subscription

## 19. PWA
- [ ] Service worker registers
- [ ] Production `sw.js` generated
- [ ] Manifest valid
- [ ] Install prompt / installation
- [ ] Installed application launches
- [ ] Deep routes work
- [ ] Update prompt works
- [ ] New build activates correctly
- [ ] Offline behavior tested

## 20. Responsive UI
Test at minimum:

- [ ] Desktop Chrome
- [ ] Mobile Chrome
- [ ] Android installed PWA
- [ ] Tablet-sized viewport
- [ ] Light mode
- [ ] Dark mode

Check:
- [ ] No horizontal overflow
- [ ] Navigation
- [ ] Dialogs
- [ ] Forms
- [ ] Practice counter
- [ ] Settings
- [ ] Profile
- [ ] Insights charts

---

# Phase 6 — Production Preparation

## 21. Decide deployment architecture
Frontend needs:
- Static Vite hosting
- HTTPS
- SPA fallback
- PWA/service-worker support

Backend needs:
- Long-running Node.js process
- MongoDB access
- SMTP outbound access
- Cloudinary access
- Web Push outbound access

Important:
Daily reminders currently use an in-process 30-second scheduler.

Therefore:
- [ ] Choose backend hosting that stays running continuously

OR

- [ ] Move reminder scheduling to a dedicated cron/queue/scheduler before using serverless hosting

## 22. Production environment
Configure:

- [ ] Production MongoDB Atlas
- [ ] Strong access-token secret
- [ ] Strong refresh-token secret
- [ ] Production `WEB_ORIGIN`
- [ ] `NODE_ENV=production`
- [ ] Zoho SMTP
- [ ] Cloudinary
- [ ] VAPID keys
- [ ] Domain/DNS
- [ ] HTTPS

## 23. Production data preparation
- [ ] Run mantra seed
- [ ] Confirm 14 published mantra records
- [ ] Run index synchronization
- [ ] Verify indexes
- [ ] Verify Cloudinary assets

---

# Phase 7 — Deployment

## 24. Deploy backend
- [ ] Build API
- [ ] Configure environment
- [ ] Start production process
- [ ] Configure process restart/monitoring
- [ ] Verify `/api/v1/health`

## 25. Deploy frontend
- [ ] Production build
- [ ] Configure production API URL
- [ ] Deploy `dist`
- [ ] Configure SPA fallback
- [ ] Verify service worker
- [ ] Verify manifest

## 26. Domain
- [ ] Configure `devsangam.me`
- [ ] Configure API subdomain if required
- [ ] Cloudflare DNS
- [ ] HTTPS certificates
- [ ] Verify redirects/canonical domain

---

# Phase 8 — Production Smoke Test

On the real production domain:

- [ ] Register
- [ ] Login
- [ ] Logout
- [ ] Password reset email
- [ ] Change password
- [ ] Mantra library
- [ ] Favorites
- [ ] Start practice
- [ ] Complete practice
- [ ] Dashboard updates
- [ ] Insights updates
- [ ] Profile update
- [ ] Avatar upload
- [ ] Theme
- [ ] PWA install
- [ ] Push permission
- [ ] Push test
- [ ] Scheduled reminder
- [ ] Notification click navigation
- [ ] Mobile test
- [ ] Desktop test
- [ ] HTTPS
- [ ] Cookies
- [ ] CORS

---

# Phase 9 — Final Release Checks

Run from repository root:

- [ ] `npm ci`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] `git diff --check`
- [ ] `git status`

Expected:
- [ ] No lint errors
- [ ] No TypeScript errors
- [ ] Production build passes
- [ ] Clean Git working tree
- [ ] GitHub CI passes

Then:

- [ ] Tag/release `v0.1.0`
- [ ] Final README review
- [ ] Production monitoring
- [ ] Mark DevSangam v0.1 complete

---

# Deferred — Post v0.1

Do NOT block the first release for these unless scope changes:

- [ ] Google login
- [ ] Apple login
- [ ] Two-factor authentication
- [ ] Logged-in device management UI
- [ ] Full onboarding flow
- [ ] Achievements
- [ ] Social/community features
- [ ] Leaderboards
- [ ] Payments
- [ ] Full localization
- [ ] Native mobile application
- [ ] AI spiritual assistant
- [ ] Advanced notification campaigns
- [ ] Advanced analytics
- [ ] Additional mantra expansion
- [ ] Dedicated automated E2E test suite