import { generateSW } from 'workbox-build';
import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const { buildId } = { buildId: (await readFile('.next/BUILD_ID', 'utf8')).trim() };
const result = await generateSW({
  globDirectory: '.next/static',
  globPatterns: ['**/*.{js,css,woff,woff2,svg,png,webp,jpg,jpeg}'],
  modifyURLPrefix: { '': '/_next/static/' },
  swDest: 'public/sw.js',
  maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
  additionalManifestEntries: [
    '/pwa-192x192.png', '/pwa-512x512.png', '/pwa-maskable-512x512.png', '/sounds/om.mp3', '/manifest.webmanifest', '/offline',
  ].map(url => ({ url, revision: buildId })),
  importScripts: ['/push-sw.js'],
  cleanupOutdatedCaches: true,
  skipWaiting: false,
  clientsClaim: true,
  runtimeCaching: [
    // Next Flight can serialize URL query values (including reset tokens).
    // Keep auth/query documents out of persistent navigation caches while
    // retaining the anonymous offline fallback and original client URL.
    { urlPattern: ({ url, request }) => request.mode === 'navigate' && (url.pathname.startsWith('/auth/') || Boolean(url.search)), handler: 'NetworkOnly', options: {
      precacheFallback: { fallbackURL: '/offline' },
    } },
    { urlPattern: ({ request }) => request.mode === 'navigate', handler: 'NetworkFirst', options: {
      cacheName: 'devsangam-shells', networkTimeoutSeconds: 3,
      precacheFallback: { fallbackURL: '/offline' },
      cacheableResponse: { statuses: [200], headers: { 'X-DevSangam-Offline-Shell': 'true' } },
      expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
    } },
    { urlPattern: ({ url, request }) => request.method === 'GET' && url.pathname.startsWith('/api/v1/mantras'), handler: 'NetworkFirst', options: {
      cacheName: 'devsangam-mantras', networkTimeoutSeconds: 3,
      cacheableResponse: { statuses: [0, 200], headers: { 'X-DevSangam-Public': 'true' } },
      expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
    } },
    { urlPattern: ({ request }) => request.destination === 'image', handler: 'CacheFirst', options: {
      cacheName: 'devsangam-images', cacheableResponse: { statuses: [0, 200] },
      expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
    } },
  ],
});
if (result.warnings.length) console.warn(result.warnings.join('\n'));
console.log(`Next PWA: ${result.count} assets, ${Math.round(result.size / 1024)} KiB.`);
// Next standalone intentionally excludes public/static: assemble a usable local artifact.
const { cp } = await import('node:fs/promises');
const standalone = path.join(root, '.next/standalone/apps/web');
await mkdir(standalone, { recursive: true });
await cp(path.join(root, 'public'), path.join(standalone, 'public'), { recursive: true });
await cp(path.join(root, '.next/static'), path.join(standalone, '.next/static'), { recursive: true });
// Next can trace local .env files into standalone. Runtime secrets belong in the
// host environment, never in a transferable artifact. Source .env stays untouched.
const artifactRoot = path.resolve(root, '.next/standalone');
if (!artifactRoot.startsWith(path.resolve(root) + path.sep)) throw new Error('Invalid artifact root.');
async function stripEnvironmentFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.resolve(directory, entry.name);
    if (!target.startsWith(artifactRoot + path.sep)) throw new Error('Invalid artifact path.');
    if (entry.isDirectory()) await stripEnvironmentFiles(target);
    else if (entry.isFile() && /^\.env(?:\.|$)/.test(entry.name) && entry.name !== '.env.example') await unlink(target);
  }
}
await stripEnvironmentFiles(artifactRoot);
await writeFile('.next/pwa-report.json', JSON.stringify({ assets: result.count, bytes: result.size, buildId }));
