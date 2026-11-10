# DevSangam V2 — Basic Vedic astrology

## Provider

- FreeAstrologyAPI (https://freeastrologyapi.com/)
- Geolocation: POST https://json.freeastrologyapi.com/geo-details
- Planetary placements: POST https://json.freeastrologyapi.com/planets/extended
- Header: x-api-key: <private server key>
- Docs: https://freeastrologyapi.com/api-reference/geo-location/geo-details
- Docs: https://freeastrologyapi.com/api-reference/planets/extended

Name and gender are **not** sent to the external provider. The provider receives
birth date/time and latitude/longitude with timezone offset to calculate the
chart. The server resolves a birthplace query via geo-details; users choose
one of the returned matching locations. Historical UTC offset is computed from
that location's IANA time zone, not the current geo-details timezone_offset.

## Configuration

Add to `apps/api/.env`:

```
FREE_ASTROLOGY_API_KEY=
```

Fill in your account key. Never add this variable with a `NEXT_PUBLIC_`
prefix, commit `.env`, or ship it to the Next.js frontend.

This module is not enabled for live calls until a key is configured; an empty
key produces a safe 503 response rather than invented chart data. Confirm your
free plan's monthly/daily request allocation and production licensing.

## API (all require an active authenticated session)

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/v1/astro/places?q=Lucknow` | Place lookup |
| POST | `/api/v1/astro/chart` | Compute and save the chart |
| GET | `/api/v1/astro/history?page=1&limit=8` | Private paginated list |
| GET | `/api/v1/astro/history/:id` | Single saved chart |
| DELETE | `/api/v1/astro/history/:id` | Delete own saved chart |

Chart input:

```json
{
  "name": "Example Person",
  "gender": "prefer_not_to_say",
  "birthDate": "1996-05-15",
  "birthTime": "14:35",
  "birthplace": {
    "name": "Lucknow, Uttar Pradesh, India",
    "latitude": 26.8467,
    "longitude": 80.9462,
    "timezone": "Asia/Kolkata"
  },
  "consent": true
}
```

The provider receives only `year`, `month`, `date`, `hours`, `minutes`,
`seconds`, `latitude`, `longitude`, `timezone`, and fixed `config`.

## Data handling

- Requires sign-in before birthplace lookup, chart generation, or history.
- Client-side form gathers affirmative consent before transmitting birth data.
- Server validates names, gender, date, time, place and timezone.
- Birth date/time and location are personal data; store only the normalized
  chart summary and safe placements, not the raw provider response.
- Every history query and delete is scoped to the current session's user ID.
- History pages are capped at 50; chart generation capped at 10/user/day,
  plus per-IP API rate limits.
- No provider response body or API key is logged or forwarded on failure.
- Users can remove saved charts one-by-one.
- Provider requests timeout after ten seconds.
- Results are a cultural/interpretive tool and must never be presented as
  scientific predictions, health advice or financial advice.

## Validation & known limitations

- An offline user cannot calculate a new birth chart or retrieve server history.
- Live provider integration must be tested after adding your actual key.
- DST gaps are rejected; ambiguous repeated civil times may require manual
  confirmation by the user. Time accuracy matters for Lagna.
- Historic timezone rules and provider ayanamsha conventions may differ for
  some birthplaces or dates; do not claim exact scientific certainty.
- Geo-results may be unavailable if the provider account plan restricts the
  geolocation endpoint. Errors should be shown, not silently simulated.
- Test on a phone, tablet and desktop before merging into `version2`.
- Never merge or push to `main` as part of this feature.

The installer adds draft disclosures to Privacy Policy and Terms. Have the
final disclosures, legal basis and retention/deletion policy reviewed before
production release. Do not describe this as a medical or scientific service.
