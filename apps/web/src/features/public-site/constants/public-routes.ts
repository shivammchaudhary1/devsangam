export const PUBLIC_ROUTES = {
  home: '/',
  about: '/about',
  products: '/store',
  // Keep the existing alias for the current commerce and landing components.
  digitalLibrary: '/store',
  astro: '/astro',
  contact: '/contact',
  howItWorks: '/how-it-works',
  privacy: '/privacy',
  terms: '/terms',
} as const;

export const PUBLIC_NAVIGATION = [
  { label: 'Home', path: PUBLIC_ROUTES.home },
  { label: 'About', path: PUBLIC_ROUTES.about },
  { label: 'Products', path: PUBLIC_ROUTES.products },
  { label: 'Astro', path: PUBLIC_ROUTES.astro },
  { label: 'Contact', path: PUBLIC_ROUTES.contact },
] as const;
