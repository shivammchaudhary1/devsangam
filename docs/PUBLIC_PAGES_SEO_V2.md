# DevSangam V2 public-pages refresh

## Navigation and URLs

- Visible header and footer order: Home → About → Products → Astro → Contact.
- Brand/logo routes to `/`.
- Products stays at `/store` to retain existing paid PDF checkout, product detail, entitlements, and search-engine URLs. The name changed; the commerce contract did not.
- `/how-it-works`, `/privacy`, and `/terms` remain accessible (not in the five-item main navigation).
- `/astro` shows public informational content; its authenticated chart actions/history continue to use the existing protected API endpoints.

## Customer experience

- Home and inner pages use the existing DevSangam gold/dark colors, an image-backed hero and responsive layout.
- Shared `PublicPageShell` has a breadcrumb and preserves the global footer in `PublicLayout`.
- Products shows three categories: downloadable mantra PDFs (existing backend), e-pooja bookings (coming soon), and Astro & guidance (existing free Astro experience, additional services not launched).
- No e-pooja booking/payment endpoint or false pricing/availability is created.
- The current `/store/[slug]` purchase/download flow remains unchanged.

## Search discoverability

- Titles, unique descriptions, canonical metadata, Open Graph and Twitter preview image.
- Organization / WebSite JSON-LD on Home; page and breadcrumb JSON-LD on public inner routes.
- `/astro` is included in `robots.txt` allowlist and sitemap solely as a public landing/explainer page. User chart contents and `/api/v1/astro` are NOT indexed.
- Sitemap retains published product detail URLs.
- Existing legal drafts need business/legal review before launching paid e-pooja services.

## Test plan

1. Check main navigation and logo on desktop and mobile, as guest, user and admin.
2. View `/`, `/about`, `/store`, `/astro`, `/contact`; verify hero image, readable text, footer, no horizontal scrolling.
3. Check `/store/[slug]`, free and paid PDF entitlements, owned-library access and existing checkout without new changes.
4. Check logged-out Astro teaser and signed-in Astro charts/history, including extras.
5. Validate contact form; verify honeypot and backend rate limits remain intact.
6. Run `npm run lint && npm run typecheck && npm test && npm run build`.
7. Inspect canonical and structured data on rendered pages; check robots.txt/sitemap.xml, and validate through Search Console after deployment. SEO metadata improves eligibility but cannot guarantee ranking.
