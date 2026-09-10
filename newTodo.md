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

## 1. Fix frontend typecheck command
- [ ] Add `typecheck` script to `apps/web/package.json`
- [ ] Confirm root `npm run typecheck` checks both API and Web
- [ ] Run:
  - [ ] `npm run lint`
  - [ ] `npm run typecheck`
  - [ ] `npm run build`

## 2. Replace obsolete AWS deployment workflow
Old AWS/EC2 deployment has been deleted.

- [ ] Remove old automatic EC2 deployment from GitHub Actions
- [ ] Create CI-only workflow for `main`
- [ ] CI should run:
  - [ ] `npm ci`
  - [ ] `npm run lint`
  - [ ] `npm run typecheck`
  - [ ] `npm run build`
- [ ] Confirm GitHub Actions passes on `main`

---

# Phase 2 — Codebase Cleanup & Security

## 3. Production security hardening
- [ ] Add Helmet/security headers
- [ ] Add API rate limiting
- [ ] Apply stricter rate limiting to:
  - [ ] Login
  - [ ] Register
  - [ ] Forgot password
  - [ ] Reset password
- [ ] Verify existing CORS configuration
- [ ] Verify production cookie configuration
- [ ] Review error responses for accidental sensitive-data exposure

## 4. Code cleanup
- [ ] Remove old commented `forgotPassword()` implementation
- [ ] Remove unused/dead code
- [ ] Review console logging before production
- [ ] Fix remaining Mongoose deprecation warnings where applicable

## 5. Repository cleanup
- [ ] Remove `README copy.md`
- [ ] Resolve license mismatch
  - Current `LICENSE` file = MIT
  - README/package metadata currently references ISC
- [ ] Choose one license and make every file consistent
- [ ] Confirm `.env` files remain ignored
- [ ] Check repository for accidentally committed secrets

---

# Phase 3 — Documentation Refresh

## 6. Update README
- [ ] Add Push API documentation
- [ ] Add push-notification architecture
- [ ] Add daily reminder behavior
- [ ] Document VAPID variables
- [ ] Document Cloudinary variables
- [ ] Document profile avatar upload
- [ ] Update Settings features
- [ ] Update PWA section
- [ ] Remove outdated roadmap items already completed
- [ ] Update release checklist
- [ ] Update deployment section after final hosting is selected

## 7. Review `.env.example`
Ensure it contains all required variables:

- [ ] `PORT`
- [ ] `WEB_ORIGIN`
- [ ] `MONGODB_URI`
- [ ] `ACCESS_TOKEN_SECRET`
- [ ] `REFRESH_TOKEN_SECRET`
- [ ] `NODE_ENV`
- [ ] Zoho SMTP variables
- [ ] Cloudinary variables
- [ ] `VAPID_SUBJECT`
- [ ] `VAPID_PUBLIC_KEY`
- [ ] `VAPID_PRIVATE_KEY`

No real secret values should be committed.

---

# Phase 4 — v0.1 Scope Decisions

## 8. Goals feature decision
Current application supports:
- Practice target per session
- Default target preference

But there is no persistent daily/weekly goal system.

Choose one:

- [ ] Option A — Keep Goals out of v0.1
- [ ] Option B — Implement persistent Goals before v0.1

If implementing:
- [ ] Goal model
- [ ] Goal API
- [ ] Daily/weekly goal type
- [ ] Progress calculation
- [ ] Goal UI
- [ ] Dashboard integration

## 9. Reminder days decision
Current reminder works every day at the configured time.

Choose one:

- [ ] Option A — Daily reminder only for v0.1
- [ ] Option B — Add selectable reminder days

If implementing:
- [ ] Store selected weekdays
- [ ] Add weekday selector to Settings
- [ ] Validate reminder days in API
- [ ] Scheduler respects selected days
- [ ] Test timezone + weekday boundaries

## 10. Language preference
Backend currently stores language preference but localization is not implemented.

- [ ] Keep localization deferred for post-v0.1
- [ ] Hide/remove any misleading language controls if necessary

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