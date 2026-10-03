import { PUBLIC_ROUTES } from '../constants/public-routes';
import { Link } from 'react-router';

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-[var(--ds-sidebar)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="ds-gold-text font-display text-lg">DevSangam</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Chant. Connect. Transform.
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-x-6 gap-y-4 text-sm"
        >
          <Link to={PUBLIC_ROUTES.about}>About</Link>
          <Link to={PUBLIC_ROUTES.howItWorks}>How It Works</Link>
          <Link to={PUBLIC_ROUTES.contact}>Contact</Link>
          <Link to={PUBLIC_ROUTES.privacy}>Privacy Policy</Link>
          <Link to={PUBLIC_ROUTES.terms}>Terms &amp; Conditions</Link>
        </nav>
      </div>
    </footer>
  );
}
