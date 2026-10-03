export const PUBLIC_ROUTES = {
  home: '/',
  about: '/about',
  howItWorks: '/how-it-works',
  contact: '/contact',
  astro: '/astro',
  privacy: '/privacy',
  terms: '/terms',
  digitalLibrary: '/store',
} as const;

export const PUBLIC_NAVIGATION = [
  { label: 'Home', path: PUBLIC_ROUTES.home },
  { label: 'About', path: PUBLIC_ROUTES.about },
  { label: 'How It Works', path: PUBLIC_ROUTES.howItWorks },
  { label: 'Digital Library', path: PUBLIC_ROUTES.digitalLibrary },
  { label: 'Contact', path: PUBLIC_ROUTES.contact },
  { label: 'Astro', path: PUBLIC_ROUTES.astro },
];
