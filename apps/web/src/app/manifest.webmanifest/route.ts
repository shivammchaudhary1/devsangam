export function GET() {
  return Response.json(
    {
      id: '/',
      name: 'DevSangam',
      short_name: 'DevSangam',
      description: 'A spiritual Sadhana and Digital Japamala practice companion.',
      theme_color: '#070b11',
      background_color: '#070b11',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      orientation: 'portrait-primary',
      categories: ['lifestyle'],
      icons: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        {
          src: '/pwa-maskable-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    {
      headers: {
        'Content-Type': 'application/manifest+json',
        'Cache-Control': 'public, max-age=3600',
      },
    },
  );
}
