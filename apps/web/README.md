# DevSangam Next frontend

Native Next.js App Router with React 19, existing feature components, Tailwind/Radix
styles, React Query, Dexie and Workbox. Public pages and published store metadata
are server-rendered. Private screens bootstrap through the original cookie API;
no account/entitlement data enters shared HTML caches.

From the repository root:

- Install: `npm ci`
- Develop on port 5173: `npm run dev:web`
- Build Next standalone + PWA: `npm run build -w @devsangam/web`
- Start on port 5173 (or PORT): `npm run start -w @devsangam/web`
- QA preview on port 4173: `npm run preview -w @devsangam/web`

Use `.env.example` for the public API/canonical URL and optional server API base.
`start`/`preview` load the local ignored `.env`; hosting must supply runtime server
variables. NEXT_PUBLIC variables are embedded at build time. The build copies
public/static into `.next/standalone/apps/web`; generated worker/build artifacts
stay ignored. Local .env files are stripped from the standalone output; source
files remain untouched. Auth routes and query-bearing HTML use network-only
fetches with a generic offline fallback, preventing persistent reset-token caches.
No static HTML export is used.

[Migration and checks](../../docs/NEXT_NEST_MIGRATION.md).
Deployment selection and live provider/device verification are deferred.

## Development reload loop and old Vite cache

Development explicitly uses Webpack. On this Windows setup, Turbopack repeatedly
reported `HMR hash mismatch` and reloaded even a fresh browser context. Webpack
was verified with stable home/login navigation and no page errors or reloads.

An existing browser profile may still have the Vite service worker from the old
app. Requests for `/src/main.tsx`, `/@react-refresh` or
`/@vite-plugin-pwa/pwa-entry-point-loaded` indicate stale Vite HTML. For
`http://localhost:5173` only, open DevTools > Application > Service Workers and
unregister the old worker. Close all tabs for that local origin, then reopen it.
Do not use Clear site data: IndexedDB contains saved/unsynced practice sessions.
The unregistered worker's caches no longer control navigation; deleting practice
data or changing production workers is unnecessary.
