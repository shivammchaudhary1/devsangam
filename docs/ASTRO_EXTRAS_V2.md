# DevSangam V2 — Astro page expansion

This is an *incremental addition* to the existing Basic Astrology feature installed
on `feature/v2-basic-astrology`. It does not change your theme, existing account
flow, base birth form, existing charts, or history/delete functionality.

## Features

1. 12-House explorer. Uses already saved `planets/extended` positions and
   `house_number` fields, so it makes **zero extra provider requests**.
   Only the nine traditional grahas are listed in this overview; no houses
   or doshas are invented. Displayed house topics are descriptive labels.
2. Navamsa D9 tab. On first click for a saved reading, calls FreeAstrologyAPI
   `POST /navamsa-chart-info` and saves normalized D9 sign/house placements.
   Docs: https://freeastrologyapi.com/api-reference/navamsa-chart-info
3. Vimshottari Mahadasha tab. On first click for a saved reading, calls
   FreeAstrologyAPI `POST /vimsottari/maha-dasas`. The output is a JSON-encoded
   string at some provider versions; the parser safely handles this and stores
   a normalized, nine-row timeline.
   Docs: https://freeastrologyapi.com/api-reference/vimsottari/maha-dasas

Both optional APIs require the existing **backend-only**
`FREE_ASTROLOGY_API_KEY` in `apps/api/.env`. No new API key is needed and the key
is never transmitted to the browser. Only saved birth date/time and coordinates,
with the historical UTC offset already calculated, are sent to the provider.
Name/gender are never sent. Provider response errors are sanitized.

## Private endpoint

`POST /api/v1/astro/history/:id/extras/navamsa`

`POST /api/v1/astro/history/:id/extras/dasha`

Both require the existing authenticated session guard, validate reading
ownership, enforce `Cache-Control: private, no-store`, and return only normalized
results in `{ success: true, data: { kind, items, cached } }`.

Additional provider calls are **lazy** and limited to 6 uncached attempts per
account per UTC day, recorded in MongoDB. A provider failure uses one attempt.
Individual results are cached inside the owner's chart, so reopening a tab does
not cause another external request. Multiple concurrent clicks are coalesced
inside a single API worker; the database quota covers workers independently.
Deletion of a saved reading removes the attached cached extras. Deleting a
reading does *not* reset the daily quota. `AstroExtraUsage` records expire after
30 days, while optional chart results remain with the saved reading.

Existing charts work unchanged. Each can add D9 and Mahadasha on demand.

## Privacy and limitations

- Astrology is a cultural/traditional interpretive framework, not scientifically
  validated predictions about medical, financial or other life outcomes.
- The D9 sign labels and Mahadasha period dates are returned by the provider;
  the UI does not invent interpretations or remedial claims.
- For provider responses different from the documented formats the API fails
  closed with a safe message; inspect locally with mock fixtures, not logs of
  private birth data or API keys.
- Actual provider access and real data require testing with your personal key;
  do not place it in source control or any NEXT_PUBLIC_ variable.
- FreeAstrologyAPI currently advertises a 200-requests/day free sandbox
  (check the official pricing and your key's individual limits before launch).
- Frontend/offline fallback: saved new extras require an online API call initially;
  the previous offline Astro view and existing pages remain unaffected.
- No `main` or `version2` mutation. Commit/merge later only after review.

## Validation

From the feature branch:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

Sign in, open `/astro`, select an existing saved reading, then open **12 Houses**,
**Navamsa D9**, and **Mahadasha**. Reload the chart and try the two optional
features again; they should return the saved results. Check a second account
cannot fetch the first account's chart. Delete a chart to delete extras.
