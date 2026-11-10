# Admin dashboard

Updated 10 October 2026. The dashboard uses existing Tailwind/Lucide libraries,
gold theme tokens and light/dark settings. Commerce, users, contact,
entitlements and audit sections remain available.

## Access and navigation

Sign in with an existing admin account and open `/admin` or the **Admin dashboard**
link in the user app. `/admin` opens Analytics. The sidebar includes:

- `/admin/analytics`: database totals, verified commerce totals, recent activity
  and an interactive 30-day chart for practice sessions/account registrations.
- `/admin/location`: regional visualization and searchable, paginated timezone
  breakdown with account/session/chant totals. Regions are inferred from saved
  account timezones, never GPS or IP. UTC/missing/unrecognized settings are
  unspecified. This is not verified physical location data.
- `/admin/content`: searchable, paginated mantra CRUD and publication filters.

Admins can return to the standard dashboard. Mobile navigation is a Radix drawer
with a focus trap, Escape handling and focus restoration. Non-admin accounts
cannot access the admin API or UI. Authorization checks the active session and
current database role on every request; browser state cannot grant access.

There is no default admin password. A trusted database operator can promote an
existing registered account using the existing audited command:

```powershell
npm run admin:promote -w @devsangam/api -- existing-user@example.com
```

Choose the intended database before running it. No account was promoted by this work.

## Mantras and compatibility

The editor supports title, Sanskrit, transliteration, meaning/description, deity,
categories, benefits, target counts, estimated chant duration, image URL/upload,
optional HTTPS audio/video links, publication and existing free/paid controls.
Published resources render media links on the mantra detail page. Server-side
paid-content redaction includes audio/video links; payment and entitlement handling
remain server controlled. Artwork is public media, not paid protected content.

Schema additions are optional/defaulted: `audioUrl`, `videoUrl`, server-managed
`imagePublicId`, and `deletedAt`. The last two are excluded from normal projections;
only the admin collection explicitly includes archive state. No migration of
existing mantras/users/practice records is required. Practice fields,
targets, session references and Dexie records keep their formats.

An existing mantra's slug cannot change because practice URLs/history use it.
Delete requires confirmation and removes the mantra from the public library by
archiving/unpublishing it. Practice history, purchase records and entitlements
remain intact. Choose **Archived**, then **Restore draft**, edit and publish when
ready. Permanent database deletion is intentionally not exposed.

Search runs server-side across every page, escapes regex metacharacters and is
bounded to 120 characters. Page sizes are capped at 50. Draft/archived content
cannot be read through public routes. Mutations and image changes are audited.

## Image processing

The browser provides file selection and a local preview. The API validates actual
image content, compresses with `sharp`, then streams compressed bytes to Cloudinary.
It accepts JPEG/PNG/WebP, up to 5 MB and 16 megapixels, rejects animated/invalid
images, honors rotation, fits within 1200×1200 without enlargement and outputs
WebP at quality 82. Output excludes original EXIF metadata.

Existing server-only `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` and
`CLOUDINARY_API_SECRET` are used. They never belong in `NEXT_PUBLIC_*` variables.
Images use random managed IDs. Provider IDs are not serialized to clients;
replacement cleans up the prior managed image. A failed database write cleans up
the new image. Cleanup failure produces a sanitized server warning.

An unavailable provider returns a safe 503. Metadata remains saved; retrying Save
updates the same record and retries its image rather than creating a duplicate.
The previous image stays intact when compression/provider upload fails. Missing
or broken artwork falls back to existing local artwork when available, then to
an inline gold Om placeholder without another network request.

Official implementation references:
[Sharp input validation](https://sharp.pixelplumbing.com/api-constructor/),
[Sharp WebP output](https://sharp.pixelplumbing.com/api-output/#webp),
[Cloudinary upload streams](https://cloudinary.com/documentation/node_image_and_video_upload#the_upload_stream_method).

## Run and verify

Use the existing `.env` setup and a transaction-capable MongoDB replica set, then
`npm run dev` (web port 5173/API 4000). Sign in and follow the routes above.
Never connect fixture suites to production data.

```powershell
npm run lint
npm run typecheck
npm test
npm run build
# Separate terminal; leave running during browser checks:
npm run preview -w @devsangam/web
# Test terminal; no other API may own port 4000:
npm run test:admin
```

The browser suite uses the production Next preview on 4173, compiled Nest on 4000,
an isolated temporary Mongo replica set and a local Cloudinary stream fixture.
It exercises real login, cross-page search, create/edit/archive/restore, history
preservation, compressed upload, provider failure/retry, optional media, image
fallback, charts/regions, normal-user denial, mobile focus/navigation and 14
screenshots across light/dark and 390/1440 px, including the mobile editor and
confirmation dialog. This verifies application behavior,
not the intended live Cloudinary account or hosted deployment.

## Manual Cloudinary verification — BLOCKED

Complete this using the intended staging account and securely configured server
credentials. No live provider mutation or deployment was performed here.

1. As an admin, create a draft mantra and upload JPEG, PNG and WebP artwork,
   including a rotated portrait and a large image within the stated limits.
2. Confirm Cloudinary receives WebP, maximum 1200 px on either side, correct
   orientation and no original metadata; verify the delivered image renders.
3. Replace an upload and confirm the prior managed image is removed. Confirm
   manually entered external URLs are never deleted from their providers.
4. Try unsupported, forged, animated, >5 MB and >16 MP images; rejection must
   leave the existing image intact. Check a normal user receives 403 for upload.
5. With unavailable staging provider configuration, save a new mantra plus image.
   Confirm the failure state, restore configuration and retry: exactly one mantra
   must exist. An existing image must survive failure.
6. Verify responses/browser assets contain no API secrets or managed provider IDs.
   Publish a test mantra; check media links as entitled and locked users, break
   artwork and check the placeholder in both themes.
7. Cancel deletion and confirm focus returns, then archive/restore. Existing
   practice/purchase history must remain intact. Archive staging fixtures afterward.

Existing Razorpay/Azure, real push/device and deployment checks in
`V2_DEPLOYMENT.md` remain independently blocked until their documented checks pass.

## Local acceptance results

Root lint/typecheck/build pass; 16 API tests and 38 admin browser checks pass.
The browser produced 14 screenshots; mobile/light editor, location, confirmation
and desktop/dark analytics/mantra layouts were visually reviewed. Regressions pass:
UI 233, public 274, SSR 190, offline/SW/Dexie 21, PWA update 10 and compiled
Nest/browser commerce 20 checks. Existing public visual parity passes all 16
comparisons (exact geometry/fonts/colors, perceptual differences under 0.1%).
Production dependency audit reports zero vulnerabilities. Existing Mongoose
deprecation warnings remain. The quality workflow includes `test:admin`; the
first hosted CI run and live provider/deployment checks are still unverified.

Changed files: [ADMIN_DASHBOARD_FILES.md](ADMIN_DASHBOARD_FILES.md).
