import type { ReactNode } from 'react';

// Keep the product not-found boundary inside the established public layout.
export default function Layout({ children }: { children: ReactNode }) {
  return children;
}
