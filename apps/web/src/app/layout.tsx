import '@/index.css';
import { Providers } from './providers';
import { SITE_DESCRIPTION, SITE_URL } from '@/lib/seo';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'DevSangam', template: '%s | DevSangam' },
  description: SITE_DESCRIPTION,
  applicationName: 'DevSangam',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/pwa-192x192.png?v=5',
    shortcut: '/pwa-192x192.png?v=5',
    apple: '/pwa-192x192.png?v=5',
  },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#070b11' };
const themeScript = `(()=>{let p='dark';try{const s=localStorage.getItem('devsangam.theme');if(['dark','light','system'].includes(s))p=s}catch{}const t=p==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p;document.documentElement.classList.remove('dark','light');document.documentElement.classList.add(t);document.documentElement.style.colorScheme=t})()`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <div id="root">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
