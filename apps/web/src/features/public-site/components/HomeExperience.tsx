import { PublicLayout } from './PublicLayout';
import type { ReactNode } from 'react';

// Home is the landing page for guests and signed-in users alike.
export function HomeExperience({ children }: { children: ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
