import { PublicFooter } from './PublicFooter';
import { PublicNavbar } from './PublicNavbar';
import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';

export function PublicLayout() {
  const { pathname, hash } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, hash]);

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <a href="#public-content" className="sr-only focus:not-sr-only focus:p-4">
        Skip to content
      </a>
      <PublicNavbar />
      <main
        ref={mainRef}
        id="public-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 px-5 py-12 outline-none sm:px-8 sm:py-16"
      >
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
