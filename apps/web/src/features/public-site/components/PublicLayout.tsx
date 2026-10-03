import { PublicFooter } from './PublicFooter';
import { PublicNavbar } from './PublicNavbar';
import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router';

export function PublicLayout() {
  const { pathname, hash } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [pathname, hash]);

  return (
    <div className="min-h-dvh bg-[var(--ds-gradient-page)] text-[var(--ds-cream)]">
      <a
        href="#public-content"
        className="sr-only z-[100] rounded-lg bg-background p-3 focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>
      <PublicNavbar />
      <main
        ref={mainRef}
        id="public-content"
        tabIndex={-1}
        className="min-h-[60dvh] w-full outline-none"
      >
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
