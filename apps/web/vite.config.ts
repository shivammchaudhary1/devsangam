import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: 'prompt',

      includeManifestIcons: false,

      manifest: {
        id: '/',

        name: 'DevSangam',
        short_name: 'DevSangam',

        description:
          'A spiritual Sadhana and Digital Japamala practice companion.',

        theme_color: '#070b11',
        background_color: '#070b11',

        display: 'standalone',

        start_url: '/',
        scope: '/',

        orientation: 'portrait-primary',

        categories: ['lifestyle'],

        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },

          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },

          {
            src: '/pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        cleanupOutdatedCaches: true,

        navigateFallback: '/index.html',

        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,

        globPatterns: ['**/*.{js,css,html,svg,png,webp,jpg,jpeg,woff,woff2}'],

        runtimeCaching: [
          {
            urlPattern: ({ url, request }) =>
              request.method === 'GET' &&
              url.pathname.startsWith('/api/v1/mantras'),

            handler: 'NetworkFirst',

            options: {
              cacheName: 'devsangam-mantras',

              networkTimeoutSeconds: 3,

              expiration: {
                maxEntries: 100,

                maxAgeSeconds: 60 * 60 * 24 * 30,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },

          {
            urlPattern: ({ request }) => request.destination === 'image',

            handler: 'CacheFirst',

            options: {
              cacheName: 'devsangam-images',

              expiration: {
                maxEntries: 80,

                maxAgeSeconds: 60 * 60 * 24 * 30,
              },

              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
